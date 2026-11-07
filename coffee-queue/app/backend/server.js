// Backend API ของ Coffee Queue (Node.js + Express 5: error ใน async route ส่งไปที่ error handler ให้เอง)
// ค่าเชื่อมต่อ DB อ่านจาก environment variable: PGHOST, PGUSER, PGPASSWORD, PGDATABASE
// PIN ของพนักงานอ่านจาก STAFF_PIN
const express = require('express');
const os = require('os');
const { Pool } = require('pg');

const app = express();
const db = new Pool();
const PIN = process.env.STAFF_PIN || '1234';
const STATUSES = ['waiting', 'making', 'ready', 'done'];   // รอคิว -> กำลังทำ -> พร้อมรับ -> รับแล้ว
const MAX_QTY = 20;

app.use(express.json());

// ใส่ชื่อ pod/container ไว้ใน header ทุก response เพื่อดูว่า Load Balance กระจายจริง
app.use((req, res, next) => { res.set('X-Served-By', os.hostname()); next(); });

// ---------- ตัวช่วย ----------
const queueNo = (id) => 'A' + String(id).padStart(3, '0');           // 15 -> "A015"
const idOf = (q) => {                                                  // "A015" หรือ "15" -> 15
  const n = parseInt(String(q).replace(/\D/g, ''), 10);
  return Number.isInteger(n) && n > 0 ? n : null;
};

// อ่านออร์เดอร์พร้อมรายการเครื่องดื่ม แล้วจัดรูปแบบให้หน้าเว็บใช้ได้ทันที
async function loadOrders(whereSql, params) {
  const { rows } = await db.query(
    `SELECT o.id, o.customer_name, o.status, o.created_at,
            i.temp, i.quantity, m.name AS drink, m.price
       FROM orders o
       JOIN order_items i ON i.order_id = o.id
       JOIN menu_items m  ON m.id = i.menu_item_id
      ${whereSql}
      ORDER BY o.id, i.id`, params);
  const map = new Map();
  for (const r of rows) {
    if (!map.has(r.id)) {
      map.set(r.id, { id: r.id, queue: queueNo(r.id), name: r.customer_name,
                      status: r.status, created_at: r.created_at, items: [], total: 0 });
    }
    const o = map.get(r.id);
    o.items.push({ drink: r.drink, temp: r.temp, quantity: r.quantity });
    o.total += r.price * r.quantity;
  }
  return [...map.values()];
}

// ---------- Health check (ให้ Kubernetes ใช้) ----------
let dbReady = false;
app.get('/healthz', (req, res) => res.send('ok'));                     // แอปยังทำงานอยู่
app.get('/readyz', async (req, res) => {                               // ต่อ DB ได้ไหม
  if (!dbReady) return res.status(503).send('db not ready');
  try { await db.query('SELECT 1'); res.send('ready'); }
  catch { res.status(503).send('db not ready'); }
});

// ---------- API ฝั่งลูกค้า ----------
app.get('/api/whoami', (req, res) => res.json({ servedBy: os.hostname() }));

// เมนูทั้งหมด
app.get('/api/menu', async (req, res) => {
  const { rows } = await db.query('SELECT id, name, price FROM menu_items ORDER BY id');
  res.json(rows);
});

// สั่งเครื่องดื่ม: { name, items: [{ drink, temp, quantity }] } -> ได้เลขคิว
app.post('/api/orders', async (req, res) => {
  const name = String((req.body || {}).name || '').trim().slice(0, 40);
  const items = Array.isArray((req.body || {}).items) ? req.body.items : [];
  if (!name) return res.status(400).json({ error: 'Enter your name so the barista can call you.' });
  if (!items.length) return res.status(400).json({ error: 'Pick at least one drink.' });

  const { rows: menu } = await db.query('SELECT id, name FROM menu_items');
  const byName = new Map(menu.map((m) => [m.name, m.id]));
  const clean = [];
  for (const it of items) {
    const menuId = byName.get(String(it.drink));
    if (!menuId) return res.status(400).json({ error: 'Unknown drink: ' + it.drink });
    clean.push({ menuId, temp: it.temp === 'iced' ? 'iced' : 'hot',
                 qty: Math.min(MAX_QTY, Math.max(1, parseInt(it.quantity, 10) || 1)) });
  }

  // บันทึกออร์เดอร์และทุกรายการใน transaction เดียว (สำเร็จทั้งหมดหรือไม่บันทึกเลย)
  const client = await db.connect();
  let orderId;
  try {
    await client.query('BEGIN');
    const r = await client.query('INSERT INTO orders (customer_name) VALUES ($1) RETURNING id', [name]);
    orderId = r.rows[0].id;
    for (const c of clean) {
      await client.query(
        'INSERT INTO order_items (order_id, menu_item_id, temp, quantity) VALUES ($1, $2, $3, $4)',
        [orderId, c.menuId, c.temp, c.qty]);
    }
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
  const [order] = await loadOrders('WHERE o.id = $1', [orderId]);
  res.status(201).json(order);
});

// ดูสถานะคิว: /api/orders/A015 หรือ /api/orders/15
app.get('/api/orders/:q', async (req, res) => {
  const id = idOf(req.params.q);
  const [order] = id ? await loadOrders('WHERE o.id = $1', [id]) : [];
  if (!order) return res.status(404).json({ error: 'Queue number not found' });
  res.json(order);
});

// ---------- API ฝั่งร้าน (ต้องส่ง PIN ใน header X-Staff-PIN) ----------
const staffOnly = (req, res, next) =>
  req.get('X-Staff-PIN') === PIN ? next() : res.status(401).json({ error: 'Wrong PIN. Please try again.' });

// ออร์เดอร์ 100 รายการล่าสุด (หน้าร้านแยกแท็บตามสถานะเอง)
app.get('/api/staff/orders', staffOnly, async (req, res) => {
  res.json(await loadOrders('WHERE o.id IN (SELECT id FROM orders ORDER BY id DESC LIMIT 100)', []));
});

// เปลี่ยนสถานะ: { status: "making" }
app.patch('/api/orders/:q/status', staffOnly, async (req, res) => {
  const id = idOf(req.params.q);
  const status = (req.body || {}).status;
  if (!STATUSES.includes(status)) return res.status(400).json({ error: 'Invalid status' });
  const r = await db.query('UPDATE orders SET status = $1 WHERE id = $2', [status, id]);
  if (!r.rowCount) return res.status(404).json({ error: 'Queue number not found' });
  res.json({ ok: true, queue: queueNo(id), status });
});

// error ที่ไม่ได้คาดไว้ เช่น DB หลุดกลางคัน
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong. Please try again.' });
});

// ---------- สร้างตารางและเมนูตัวอย่างตอนเริ่ม ----------
async function initDb() {
  await db.query(`CREATE TABLE IF NOT EXISTS menu_items (
    id SERIAL PRIMARY KEY, name TEXT NOT NULL UNIQUE, price INT NOT NULL)`);
  await db.query(`CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY, customer_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'waiting', created_at TIMESTAMP DEFAULT now())`);
  await db.query(`CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id INT NOT NULL REFERENCES menu_items(id),
    temp TEXT NOT NULL, quantity INT NOT NULL)`);
  const { rows } = await db.query('SELECT COUNT(*)::int AS n FROM menu_items');
  if (rows[0].n === 0) {
    await db.query(`INSERT INTO menu_items (name, price) VALUES
      ('Latte', 60), ('Americano', 50), ('Cappuccino', 60), ('Mocha', 65),
      ('Thai Tea', 45), ('Green Tea Latte', 55), ('Cocoa', 50), ('Chocolate', 55)`);
  }
}

// เปิดรับ request ทันที แล้วค่อยเตรียม DB อยู่เบื้องหลัง
// ระหว่างนี้ /healthz ตอบ ok แต่ /readyz ตอบ 503 จน DB พร้อม (Kubernetes จะยังไม่ส่ง traffic มา)
app.listen(3000, () => console.log('Backend พร้อมที่พอร์ต 3000'));
(async function waitForDb() {
  for (;;) {
    try { await initDb(); dbReady = true; console.log('Database พร้อมแล้ว'); break; }
    catch (e) { console.log('รอ database...', e.message); await new Promise((r) => setTimeout(r, 2000)); }
  }
})();
