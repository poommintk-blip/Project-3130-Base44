import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireUser } from "@/lib/auth-middleware";

const BANGKOK_OFFSET = 7 * 60 * 60 * 1000;

function startOfToday() {
  const now = new Date(Date.now() + BANGKOK_OFFSET);
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) - BANGKOK_OFFSET,
  );
}

const mapMenuItem = (item) => ({
  id: item.id,
  name: item.name,
  name_en: item.name_en ?? "",
  price: Number(item.price) || 0,
  category: item.category ?? "other",
  image: item.image ?? "",
});

// บทบาทที่เข้าใช้งานหน้าร้านได้ (admin = เจ้าของร้าน, staff = พนักงาน)
const STAFF_ROLES = ["admin", "staff"];

const assertStaff = (user) => {
  if (!STAFF_ROLES.includes(user?.role)) {
    throw Object.assign(new Error("บัญชีนี้ไม่มีสิทธิ์เข้าหน้าร้าน"), { status: 403 });
  }
};

const NEXT_STATUS = {
  waiting: ["making", "cancelled"],
  making: ["ready", "cancelled"],
  ready: ["picked", "cancelled"],
  picked: [],
  cancelled: [],
};

export const getMenu = createServerFn({ method: "GET" }).handler(async ({ context }) => {
  const page = await context.getBase44().asServiceRole.entities.MenuItem.list({
    sort: "sort_order",
    limit: 50,
  });
  return page.items.map(mapMenuItem);
});

export const createOrder = createServerFn({ method: "POST" })
  .validator(
    z.object({
      menuItemId: z.string().min(1).max(64),
      type: z.enum(["hot", "iced"]),
      qty: z.number().int().min(1).max(9),
      customerName: z.string().trim().min(1).max(20),
    }),
  )
  .handler(async ({ data, context }) => {
    const admin = context.getBase44().asServiceRole;
    const item = await admin.entities.MenuItem.get(data.menuItemId);
    if (!item) throw new Error("ไม่พบเมนูนี้");

    const today = await admin.entities.Order.filter(
      { created_date: { $gte: startOfToday().toISOString() } },
      { sort: "-created_date", limit: 300 },
    );
    const maxNo = today.items.reduce((max, order) => {
      const n = Number(String(order.queue_no ?? "").replace(/\D/g, ""));
      return Number.isFinite(n) && n > max ? n : max;
    }, 0);

    return await admin.entities.Order.create({
      queue_no: `A${String(maxNo + 1).padStart(3, "0")}`,
      customer_name: data.customerName,
      menu_item_id: item.id,
      menu_item_name: item.name,
      price: Number(item.price) || 0,
      type: data.type,
      qty: data.qty,
      status: "waiting",
    });
  });

export const getOrder = createServerFn({ method: "GET" })
  .validator(
    z.object({
      id: z.string().max(64).optional(),
      queueNo: z.string().max(16).optional(),
    }),
  )
  .handler(async ({ data, context }) => {
    const admin = context.getBase44().asServiceRole;

    if (data.id) {
      try {
        return await admin.entities.Order.get(data.id);
      } catch {
        return null;
      }
    }

    const code = (data.queueNo ?? "").trim().toUpperCase();
    if (!code) return null;
    const page = await admin.entities.Order.filter(
      { queue_no: code },
      { sort: "-created_date", limit: 1 },
    );
    return page.items[0] ?? null;
  });

// เฉพาะพนักงานที่เข้าสู่ระบบแล้วเท่านั้น (หน้าร้าน)
export const listActiveOrders = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .handler(async ({ context }) => {
  assertStaff(context.user);
  const page = await context.getBase44().asServiceRole.entities.Order.filter(
    { status: { $in: ["waiting", "making", "ready"] } },
    { sort: "created_date", limit: 100 },
  );
  return page.items;
});

export const updateOrderStatus = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(
    z.object({
      id: z.string().min(1).max(64),
      status: z.enum(["waiting", "making", "ready", "picked", "cancelled"]),
    }),
  )
  .handler(async ({ data, context }) => {
    assertStaff(context.user);
    const admin = context.getBase44().asServiceRole;
    const current = await admin.entities.Order.get(data.id);
    const allowed = NEXT_STATUS[current?.status] ?? [];
    if (!allowed.includes(data.status)) {
      throw new Error("ไม่สามารถเปลี่ยนสถานะนี้ได้");
    }
    return await admin.entities.Order.update(data.id, { status: data.status });
  });