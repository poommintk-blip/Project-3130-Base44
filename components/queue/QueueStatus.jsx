import { Check, Coffee, CupSoda } from "lucide-react";
import { TYPE_LABEL, formatTime, STATUS_META } from "@/lib/format";

const STEPS = [
  { key: "waiting", label: "รอคิว" },
  { key: "making", label: "กำลังทำ" },
  { key: "ready", label: "พร้อมรับ" },
  { key: "picked", label: "รับแล้ว" },
];

export default function QueueStatus({ order, onRefresh, refreshing }) {
  const cancelled = order.status === "cancelled";
  const activeIndex = STEPS.findIndex((s) => s.key === order.status);

  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-[0_30px_70px_-55px_rgba(35,24,15,0.9)]">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border/70 p-5 sm:p-6">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            เลขคิว
          </p>
          <p className="mt-1 font-mono text-[clamp(38px,7vw,56px)] font-medium leading-none tracking-tight text-primary">
            {order.queue_no}
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1.5 text-[13px] font-medium ${
            cancelled ? STATUS_META.cancelled.tone : "bg-primary/10 text-primary"
          }`}
        >
          {STATUS_META[order.status]?.label ?? order.status}
        </span>
      </div>

      <div className="p-5 sm:p-6">
        {cancelled ? (
          <p className="rounded-2xl bg-[#f7e2de] px-4 py-3 text-[13.5px] leading-relaxed text-[#8f3323]">
            ออร์เดอร์นี้ถูกยกเลิกแล้ว หากต้องการสั่งใหม่สามารถกลับไปที่หน้าเมนูได้
          </p>
        ) : (
          <ol className="flex items-start gap-1">
            {STEPS.map((step, i) => {
              const done = i <= activeIndex;
              return (
                <li key={step.key} className="flex flex-1 flex-col items-center gap-2 text-center">
                  <div className="flex w-full items-center">
                    <span
                      className={`h-px flex-1 ${i === 0 ? "opacity-0" : done ? "bg-primary" : "bg-border"}`}
                    />
                    <span
                      className={`grid size-7 shrink-0 place-items-center rounded-full border text-[11px] transition-colors ${
                        done
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background text-muted-foreground"
                      }`}
                    >
                      {done ? <Check className="size-3.5" strokeWidth={2.4} /> : i + 1}
                    </span>
                    <span
                      className={`h-px flex-1 ${
                        i === STEPS.length - 1 ? "opacity-0" : i < activeIndex ? "bg-primary" : "bg-border"
                      }`}
                    />
                  </div>
                  <span
                    className={`text-[11.5px] leading-tight ${done ? "font-medium text-foreground" : "text-muted-foreground"}`}
                  >
                    {step.label}
                  </span>
                </li>
              );
            })}
          </ol>
        )}

        <dl className="mt-6 grid gap-3 border-t border-dashed border-border pt-5 text-[13.5px] sm:grid-cols-2">
          <div className="flex items-center justify-between gap-3">
            <dt className="text-muted-foreground">เมนู</dt>
            <dd className="font-medium">{order.menu_item_name}</dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-muted-foreground">แบบ</dt>
            <dd className="flex items-center gap-1.5 font-medium">
              {order.type === "hot" ? (
                <Coffee className="size-3.5" strokeWidth={1.8} />
              ) : (
                <CupSoda className="size-3.5" strokeWidth={1.8} />
              )}
              {TYPE_LABEL[order.type] ?? order.type}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-muted-foreground">จำนวน</dt>
            <dd className="font-medium">{order.qty} แก้ว</dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-muted-foreground">ชื่อ</dt>
            <dd className="font-medium">{order.customer_name}</dd>
          </div>
          <div className="flex items-center justify-between gap-3 sm:col-span-2">
            <dt className="text-muted-foreground">สั่งเมื่อ</dt>
            <dd className="font-mono text-[12.5px]">{formatTime(order.created_date)} น.</dd>
          </div>
        </dl>

        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          className="mt-6 w-full rounded-full border border-border px-5 py-2.5 text-[13.5px] font-medium transition-colors hover:border-primary/40 hover:text-primary disabled:opacity-60"
        >
          {refreshing ? "กำลังอัปเดต…" : "รีเฟรชสถานะ"}
        </button>
      </div>
    </div>
  );
}