import { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import MenuCard from "./MenuCard";
import OrderSheet from "./OrderSheet";
import QueueReceipt from "./QueueReceipt";
import { CATEGORIES } from "./categories";
import { baht, TYPE_LABEL } from "@/lib/format";

export default function OrderMenu({ items, onPlaceOrder }) {
  const [cat, setCat] = useState("all");
  const [pick, setPick] = useState(null);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState(null);

  const visible = useMemo(
    () => (cat === "all" ? items : items.filter((item) => item.category === cat)),
    [items, cat],
  );

  const choose = (item) => {
    setError("");
    setPick({ item, type: "iced", qty: 1 });
    setOpen(true);
  };

  const submit = async ({ customerName }) => {
    setSubmitting(true);
    setError("");
    try {
      const order = await onPlaceOrder({
        menuItemId: pick.item.id,
        type: pick.type,
        qty: pick.qty,
        customerName,
        menuItemName: pick.item.name,
        total: pick.item.price * pick.qty,
      });
      setReceipt(order);
      setOpen(false);
      setPick(null);
    } catch (e) {
      setError("สั่งไม่สำเร็จ กรุณาลองอีกครั้ง");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="omu-section">
      <div className={`omu-screen${pick ? " has-order" : ""}`}>
        <div className="omu-stage">
          <div className="omu-scroll">
            <header className="omu-head">
              <h2>เมนูวันนี้</h2>
              <p>ร้อน / เย็น · จ่ายที่หน้าร้าน</p>
            </header>

            <div className="omu-tabs" role="tablist" aria-label="หมวดเมนู">
              {CATEGORIES.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  role="tab"
                  aria-selected={cat === c.key}
                  className="omu-tab"
                  onClick={() => setCat(c.key)}
                >
                  <span className="omu-tab-en">{c.label}</span>
                  <span className="omu-tab-sub">{c.sub}</span>
                </button>
              ))}
            </div>

            {visible.length > 0 ? (
              <ul className="omu-grid" key={cat} data-swapped="">
                {visible.map((item) => (
                  <MenuCard
                    key={item.id}
                    item={item}
                    qty={pick && pick.item.id === item.id ? pick.qty : 0}
                    onAdd={choose}
                  />
                ))}
              </ul>
            ) : (
              <p className="omu-empty">ยังไม่มีเมนูในหมวดนี้</p>
            )}
          </div>
        </div>

        <span className="omu-sr" role="status" aria-live="polite">
          {pick ? `เลือก ${pick.item.name} ${pick.qty} แก้ว` : ""}
        </span>

        <footer className="omu-bar">
          <div className="omu-total">
            <p className="omu-total-label">
              {pick ? `${pick.item.name} · ${TYPE_LABEL[pick.type]}` : ""}
            </p>
            <p className="omu-total-val">
              <span>{pick?.qty ?? 0} แก้ว</span>
              <span className="omu-dot" aria-hidden="true" />
              <span className="omu-sum">{baht((pick?.item.price ?? 0) * (pick?.qty ?? 0))}</span>
            </p>
          </div>
          <button type="button" className="omu-cta" onClick={() => setOpen(true)}>
            สั่งเลย
            <ArrowRight strokeWidth={1.7} />
          </button>
        </footer>

        {receipt && <QueueReceipt order={receipt} onClose={() => setReceipt(null)} />}
      </div>

      <OrderSheet
        pick={pick}
        open={open}
        onOpenChange={setOpen}
        onQty={(qty) => setPick((p) => (p ? { ...p, qty } : p))}
        onType={(type) => setPick((p) => (p ? { ...p, type } : p))}
        onSubmit={submit}
        submitting={submitting}
        error={error}
      />
    </section>
  );
}