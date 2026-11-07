import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { LogOut, RefreshCw, ShieldAlert } from "lucide-react";
import { listActiveOrders, updateOrderStatus } from "@/lib/server-fns";
import OrderRow from "@/components/shop/OrderRow";
import { formatTime } from "@/lib/format";
import { useAuth } from "@/lib/AuthContext";

export const Route = createFileRoute("/_authed/shop")({
  head: () => ({
    meta: [
      { title: "หน้าร้าน · กาแฟคณะ" },
      { name: "description", content: "ออร์เดอร์ที่ยังไม่เสร็จ พร้อมปุ่มเปลี่ยนสถานะ สำหรับพนักงานเท่านั้น" },
    ],
  }),
  component: ShopPage,
});

function ShopPage() {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [updatedAt, setUpdatedAt] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const rows = await listActiveOrders();
    setOrders(rows);
    setUpdatedAt(formatTime(new Date().toISOString()));
    setLoading(false);
  }, []);

  const isStaff = user?.role === "admin" || user?.role === "staff";

  useEffect(() => {
    if (isStaff) load();
  }, [isStaff, load]);

  const change = async (id, status) => {
    setBusyId(id);
    try {
      await updateOrderStatus({ data: { id, status } });
    } finally {
      setBusyId(null);
      await load();
    }
  };

  if (!isStaff) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <div className="rounded-3xl border border-border bg-card p-8 text-center">
          <ShieldAlert className="mx-auto size-7 text-muted-foreground" strokeWidth={1.6} />
          <h1 className="mt-3 font-heading text-xl font-semibold">
            บัญชีนี้ยังไม่ได้รับสิทธิ์พนักงาน
          </h1>
          <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
            หน้าร้านใช้ได้เฉพาะพนักงานที่ได้รับสิทธิ์หรือแอดมินของร้าน
            ติดต่อเจ้าของร้านเพื่อขอสิทธิ์ใช้งาน
          </p>
          <button
            type="button"
            onClick={logout}
            className="mt-5 rounded-full border border-border px-4 py-2 text-[13px] text-foreground transition-colors hover:bg-secondary"
          >
            ออกจากระบบ
          </button>
        </div>
      </div>
    );
  }

  const counts = {
    waiting: orders.filter((o) => o.status === "waiting").length,
    making: orders.filter((o) => o.status === "making").length,
    ready: orders.filter((o) => o.status === "ready").length,
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <div className="overflow-hidden rounded-3xl bg-[#221a14] text-[#f7efe3] shadow-[0_40px_80px_-60px_rgba(35,24,15,1)]">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 p-5 sm:p-6">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/40">
              Counter console
            </p>
            <h1 className="mt-2 font-heading text-[clamp(22px,3.6vw,30px)] font-semibold tracking-tight">
              หน้าร้าน · คิวที่ยังไม่เสร็จ
            </h1>
            <p className="mt-1.5 text-[12.5px] text-white/45">
              {user?.email ? `${user.email} · ` : ""}
              {updatedAt ? `อัปเดตล่าสุด ${updatedAt} น.` : "กำลังโหลด…"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={load}
              disabled={loading}
              className="flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-[12.5px] text-white/80 transition-colors hover:border-white/35 hover:text-white disabled:opacity-50"
            >
              <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} strokeWidth={1.8} />
              รีเฟรช
            </button>
            <button
              type="button"
              onClick={logout}
              className="flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-[12.5px] text-white/60 transition-colors hover:border-white/35 hover:text-white"
            >
              <LogOut className="size-3.5" strokeWidth={1.8} />
              ออกจากระบบ
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 divide-x divide-white/10 border-b border-white/10">
          {[
            { label: "รอคิว", value: counts.waiting },
            { label: "กำลังทำ", value: counts.making },
            { label: "พร้อมรับ", value: counts.ready },
          ].map((item) => (
            <div key={item.label} className="px-4 py-3.5 text-center sm:px-6">
              <p className="font-mono text-[22px] font-medium leading-none">{item.value}</p>
              <p className="mt-1.5 text-[11.5px] text-white/45">{item.label}</p>
            </div>
          ))}
        </div>

        <div className="hidden grid-cols-[74px_minmax(0,1fr)_100px_76px_104px_auto] gap-3 border-b border-white/10 px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.14em] text-white/35 md:grid">
          <span>คิว</span>
          <span>รายการ</span>
          <span className="text-center">ชื่อ</span>
          <span className="text-center">เวลา</span>
          <span className="text-center">สถานะ</span>
          <span className="text-right">จัดการ</span>
        </div>

        {loading && orders.length === 0 ? (
          <p className="px-5 py-10 text-center text-[13px] text-white/45">กำลังโหลดออร์เดอร์…</p>
        ) : orders.length === 0 ? (
          <div className="px-5 py-14 text-center">
            <p className="text-[14px] text-white/70">ยังไม่มีออร์เดอร์ที่ค้างอยู่</p>
            <p className="mt-1.5 text-[12.5px] text-white/40">
              เมื่อมีนักศึกษาสั่งเครื่องดื่ม คิวจะขึ้นที่นี่
            </p>
          </div>
        ) : (
          orders.map((order) => (
            <OrderRow
              key={order.id}
              order={order}
              busy={busyId === order.id}
              onStatus={change}
            />
          ))
        )}
      </div>

      <p className="mt-4 px-1 text-[12px] text-muted-foreground">
        ขั้นตอน: รอคิว → กำลังทำ → พร้อมรับ → รับแล้ว (กดยกเลิกได้หากลูกค้าไม่มารับ)
      </p>
    </div>
  );
}