import { Loader2 } from "lucide-react";
import { TYPE_LABEL, formatTime } from "@/lib/format";

const PILL = {
  waiting: "bg-white/10 text-white/70",
  making: "bg-[#5a3f14] text-[#f3cf8f]",
  ready: "bg-[#274a2f] text-[#b6e3b8]",
};

export default function OrderRow({ order, busy, onStatus }) {
  const action =
    order.status === "waiting"
      ? { label: "เริ่มทำ", next: "making" }
      : order.status === "making"
        ? { label: "เสร็จแล้ว", next: "ready" }
        : { label: "รับแล้ว", next: "picked" };

  return (
    <div className="grid gap-2 border-b border-white/10 px-4 py-3.5 last:border-0 md:grid-cols-[74px_minmax(0,1fr)_100px_76px_104px_auto] md:items-center md:gap-3">
      <div className="flex items-center justify-between md:block">
        <span className="font-mono text-[17px] font-medium tracking-tight text-[#f7efe3]">
          {order.queue_no}
        </span>
        <span className={`rounded-full px-2.5 py-1 text-[11px] md:hidden ${PILL[order.status]}`}>
          {order.status === "waiting" ? "รอคิว" : order.status === "making" ? "กำลังทำ" : "พร้อมรับ"}
        </span>
      </div>

      <div className="min-w-0">
        <p className="truncate text-[14px] font-medium text-[#f7efe3]">{order.menu_item_name}</p>
        <p className="font-mono text-[11px] text-white/45">
          {TYPE_LABEL[order.type] ?? order.type} · {order.qty} แก้ว
        </p>
      </div>

      <p className="truncate text-[13px] text-white/70 md:text-center">{order.customer_name}</p>
      <p className="font-mono text-[11.5px] text-white/45 md:text-center">
        {formatTime(order.created_date)}
      </p>

      <span
        className={`hidden justify-center rounded-full px-2.5 py-1 text-center text-[11px] md:inline-flex ${PILL[order.status]}`}
      >
        {order.status === "waiting" ? "รอคิว" : order.status === "making" ? "กำลังทำ" : "พร้อมรับ"}
      </span>

      <div className="flex items-center gap-2 md:justify-end">
        <button
          type="button"
          onClick={() => onStatus(order.id, action.next)}
          disabled={busy}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-[#f7efe3] px-3.5 py-2 text-[12.5px] font-medium text-[#221a14] transition-opacity hover:opacity-90 disabled:opacity-50 md:flex-none"
        >
          {busy && <Loader2 className="size-3.5 animate-spin" />}
          {action.label}
        </button>
        <button
          type="button"
          onClick={() => onStatus(order.id, "cancelled")}
          disabled={busy}
          className="rounded-full border border-white/15 px-3 py-2 text-[12.5px] text-white/60 transition-colors hover:border-white/30 hover:text-white/90 disabled:opacity-50"
        >
          ยกเลิก
        </button>
      </div>
    </div>
  );
}