import { Link } from "@tanstack/react-router";
import { Check, ArrowRight } from "lucide-react";
import { baht, TYPE_LABEL } from "@/lib/format";

export default function QueueReceipt({ order, onClose }) {
  return (
    <div className="omu-receipt">
      <div className="omu-ticket">
        <span className="mx-auto grid size-10 place-items-center rounded-full bg-accent/12 text-accent">
          <Check className="size-5" strokeWidth={2.2} />
        </span>
        <p className="mt-3 text-[13px] text-muted-foreground">สั่งเรียบร้อยแล้ว</p>
        <p className="mt-1 font-heading text-sm font-medium">คิวของคุณ</p>
        <p className="my-1 font-mono text-[clamp(44px,11cqi,68px)] font-medium leading-none tracking-tight text-primary">
          {order.queue_no}
        </p>
        <p className="mx-auto max-w-[26ch] text-[13px] leading-relaxed text-muted-foreground">
          {order.menu_item_name} · {TYPE_LABEL[order.type] ?? order.type} · {order.qty} แก้ว
          <br />
          รวม {baht(order.total)}
        </p>
        <p className="mt-3 rounded-xl bg-secondary px-3 py-2 text-[12px] leading-relaxed text-secondary-foreground">
          ระบบจะเปลี่ยนสถานะให้เห็นในหน้าเช็กคิว กดรีเฟรชเพื่อตรวจสอบอีกครั้ง
        </p>
        <div className="mt-4 flex flex-col gap-2">
          <Link
            to="/queue"
            search={{ q: order.queue_no }}
            className="flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-[#a03e22]"
          >
            ดูสถานะคิวนี้
            <ArrowRight className="size-4" strokeWidth={1.8} />
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-5 py-2 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
          >
            สั่งอีกแก้ว
          </button>
        </div>
      </div>
    </div>
  );
}