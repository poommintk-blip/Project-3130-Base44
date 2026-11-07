import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { getOrder } from "@/lib/server-fns";
import QueueStatus from "@/components/queue/QueueStatus";

export const Route = createFileRoute("/queue")({
  validateSearch: (search) => ({ q: typeof search.q === "string" ? search.q : undefined }),
  head: () => ({
    meta: [
      { title: "เช็กคิว · กาแฟคณะ" },
      { name: "description", content: "ใส่เลขคิวเพื่อดูสถานะเครื่องดื่มของคุณ" },
    ],
  }),
  component: QueuePage,
});

function QueuePage() {
  const { q } = Route.useSearch();
  const [code, setCode] = useState(q ?? "");
  const [order, setOrder] = useState(null);
  const [state, setState] = useState("idle");

  const lookup = async (value) => {
    const trimmed = value.trim().toUpperCase();
    if (!trimmed) return;
    setState("loading");
    const found = await getOrder({ data: { queueNo: trimmed } });
    setOrder(found);
    setState(found ? "found" : "notfound");
  };

  useEffect(() => {
    if (q) lookup(q);
  }, [q]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
      <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
        Check your queue
      </p>
      <h1 className="mt-3 font-heading text-[clamp(26px,4.4vw,38px)] font-semibold leading-tight tracking-tight">
        เช็กคิวของคุณ
      </h1>
      <p className="mt-3 text-[14.5px] leading-relaxed text-muted-foreground">
        ใส่เลขคิวที่ได้รับตอนสั่ง (เช่น A015) แล้วกดเช็กสถานะ ระบบจะบอกว่าอยู่ขั้นตอนไหน
      </p>

      <form
        className="mt-6 flex flex-col gap-2 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          lookup(code);
        }}
      >
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            strokeWidth={1.8}
          />
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 8))}
            placeholder="A015"
            className="w-full rounded-full border border-border bg-card py-3 pl-11 pr-4 font-mono text-[15px] tracking-wide outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary"
          />
        </div>
        <button
          type="submit"
          disabled={state === "loading" || !code.trim()}
          className="flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-[#a03e22] disabled:opacity-50"
        >
          {state === "loading" ? <Loader2 className="size-4 animate-spin" /> : "เช็กสถานะ"}
        </button>
      </form>

      <div className="mt-8">
        {state === "notfound" && (
          <p className="rounded-2xl border border-border bg-card px-5 py-4 text-[13.5px] leading-relaxed text-muted-foreground">
            ไม่พบคิว <span className="font-mono font-medium text-foreground">{code}</span> —
            ตรวจสอบเลขคิวอีกครั้ง หรือสอบถามที่เคาน์เตอร์
          </p>
        )}
        {state === "found" && order && (
          <QueueStatus
            order={order}
            refreshing={state === "loading"}
            onRefresh={() => lookup(code)}
          />
        )}
      </div>
    </div>
  );
}