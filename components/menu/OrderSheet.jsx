import { useEffect, useState } from "react";
import { Minus, Plus, Loader2, Coffee, Snowflake } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Image } from "@/components/ui/image";
import { baht } from "@/lib/format";

export default function OrderSheet({
  pick,
  open,
  onOpenChange,
  onQty,
  onType,
  onSubmit,
  submitting,
  error,
}) {
  const [name, setName] = useState("");

  useEffect(() => {
    if (open) setName("");
  }, [open]);

  if (!pick) return null;
  const { item, type, qty } = pick;
  const total = item.price * qty;
  const canSubmit = name.trim().length > 0 && !submitting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md gap-0 overflow-hidden rounded-3xl border-border/70 bg-card p-0">
        <DialogTitle className="sr-only">สั่ง{item.name}</DialogTitle>

        <div className="flex items-center gap-3 border-b border-border/70 p-4">
          <div className="size-14 shrink-0 overflow-hidden rounded-2xl bg-secondary">
            <Image
              src={item.image}
              alt={item.name}
              className="h-full w-full object-cover"
              fittingType="fill"
            />
          </div>
          <div className="min-w-0">
            <p className="font-heading text-lg font-semibold leading-tight">{item.name}</p>
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              {item.name_en} · {baht(item.price)}
            </p>
          </div>
        </div>

        <form
          className="space-y-5 p-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (canSubmit) onSubmit({ customerName: name.trim() });
          }}
        >
          <div>
            <p className="mb-2 text-[13px] font-medium">เลือกแบบ</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: "hot", label: "ร้อน", icon: Coffee },
                { key: "iced", label: "เย็น", icon: Snowflake },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => onType(key)}
                  aria-pressed={type === key}
                  className={`flex items-center justify-center gap-2 rounded-xl border py-2.5 text-sm transition-colors ${
                    type === key
                      ? "border-primary bg-primary/10 font-medium text-primary"
                      : "border-border text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  <Icon className="size-4" strokeWidth={1.7} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-[13px] font-medium">จำนวน</p>
            <div className="flex items-center gap-1 rounded-full border border-border p-1">
              <button
                type="button"
                onClick={() => onQty(Math.max(1, qty - 1))}
                disabled={qty <= 1}
                aria-label="ลดจำนวน"
                className="grid size-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary disabled:opacity-40"
              >
                <Minus className="size-4" strokeWidth={1.8} />
              </button>
              <span className="w-8 text-center font-mono text-sm">{qty}</span>
              <button
                type="button"
                onClick={() => onQty(Math.min(9, qty + 1))}
                disabled={qty >= 9}
                aria-label="เพิ่มจำนวน"
                className="grid size-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary disabled:opacity-40"
              >
                <Plus className="size-4" strokeWidth={1.8} />
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="nickname" className="mb-2 block text-[13px] font-medium">
              ชื่อเล่นสำหรับเรียกคิว
            </label>
            <input
              id="nickname"
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 20))}
              placeholder="เช่น มิน, เบียร์"
              maxLength={20}
              className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary"
            />
          </div>

          {error && <p className="text-[13px] text-destructive">{error}</p>}

          <button
            type="submit"
            disabled={!canSubmit}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-[#a03e22] disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <>ยืนยันสั่ง · {baht(total)}</>
            )}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}