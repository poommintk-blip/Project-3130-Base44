import { createFileRoute } from "@tanstack/react-router";
import { Clock, Wallet, ArrowDownRight } from "lucide-react";
import OrderMenu from "@/components/menu/OrderMenu";
import { createOrder, getMenu } from "@/lib/server-fns";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "กาแฟคณะ · สั่งเครื่องดื่มแล้วมารับตามคิว" },
      {
        name: "description",
        content:
          "สั่งกาแฟ ชา และโกโก้ของร้านกาแฟคณะ เลือกเมนู ใส่ชื่อเล่น รับเลขคิว แล้วเช็กสถานะได้ทุกเมื่อ",
      },
    ],
  }),
  loader: async () => ({ menu: await getMenu() }),
  component: MenuPage,
});

function MenuPage() {
  const { menu } = Route.useLoaderData();

  const placeOrder = async ({ menuItemId, type, qty, customerName }) => {
    const order = await createOrder({ data: { menuItemId, type, qty, customerName } });
    return { ...order, total: (Number(order.price) || 0) * (Number(order.qty) || 0) };
  };

  return (
    <div>
      <section className="border-b border-border/70">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 pb-8 pt-10 sm:px-6 sm:pb-10 sm:pt-14 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7">
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
              โรงอาหารคณะ · เคาน์เตอร์กาแฟ
            </p>
            <h1 className="mt-4 font-heading text-[clamp(30px,5.4vw,52px)] font-semibold leading-[1.12] tracking-tight">
              สั่งกาแฟตอนพักเที่ยง
              <br />
              <span className="text-primary">ไม่ต้องยืนรอหน้าร้าน</span>
            </h1>
            <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
              เลือกเครื่องดื่ม ใส่ชื่อเล่น แล้วรับเลขคิวของคุณ กลับมารับเมื่อสถานะขึ้นว่าพร้อมรับ
              ไม่ต้องเดาว่าแก้วไหนของใคร
            </p>

            <div className="mt-7 flex flex-wrap gap-2.5">
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3.5 py-1.5 text-[12.5px] text-muted-foreground">
                <Clock className="size-3.5" strokeWidth={1.8} />
                เปิด 08:00–16:00 น.
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3.5 py-1.5 text-[12.5px] text-muted-foreground">
                <Wallet className="size-3.5" strokeWidth={1.8} />
                จ่ายเงินที่หน้าร้าน
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3.5 py-1.5 text-[12.5px] text-muted-foreground">
                <ArrowDownRight className="size-3.5" strokeWidth={1.8} />
                เลือกแค่ร้อน / เย็น
              </span>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-card p-6 shadow-[0_30px_60px_-45px_rgba(35,24,15,0.7)]">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    ตัวอย่างคิว
                  </p>
                  <p className="mt-2 font-mono text-5xl font-medium tracking-tight text-primary">
                    A015
                  </p>
                </div>
                <span className="rounded-full bg-accent/12 px-3 py-1 text-[12px] font-medium text-accent">
                  พร้อมรับ
                </span>
              </div>
              <div className="mt-5 space-y-2.5 border-t border-dashed border-border pt-4 text-[13px]">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">เมนู</span>
                  <span className="font-medium">ลาเต้ · เย็น · 1 แก้ว</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ชื่อ</span>
                  <span className="font-medium">มิน</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">สั่งเมื่อ</span>
                  <span className="font-mono text-[12px]">12:04</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        {menu.length > 0 ? (
          <OrderMenu items={menu} onPlaceOrder={placeOrder} />
        ) : (
          <p className="rounded-3xl border border-border bg-card px-6 py-12 text-center text-sm text-muted-foreground">
            ยังไม่มีเมนูในระบบ
          </p>
        )}
      </div>
    </div>
  );
}