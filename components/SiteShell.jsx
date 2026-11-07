import { Link } from "@tanstack/react-router";
import { Coffee, ReceiptText, ClipboardList } from "lucide-react";

const NAV = [
  { to: "/", label: "เมนู", icon: Coffee, exact: true },
  { to: "/queue", label: "เช็กคิว", icon: ReceiptText, exact: false },
  { to: "/shop", label: "หน้าร้าน", icon: ClipboardList, exact: false },
];

export default function SiteShell({ children }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-full bg-primary text-primary-foreground">
              <Coffee className="size-4.5" strokeWidth={1.7} />
            </span>
            <span className="leading-tight">
              <span className="block font-heading text-[17px] font-semibold tracking-tight">
                กาแฟคณะ
              </span>
              <span className="block font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
                Faculty Coffee
              </span>
            </span>
          </Link>

          <nav className="flex items-center gap-1 rounded-full border border-border/80 bg-card/70 p-1">
            {NAV.map(({ to, label, icon: Icon, exact }) => (
              <Link
                key={to}
                to={to}
                activeOptions={{ exact }}
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground sm:px-4 sm:text-sm"
                activeProps={{ className: "bg-foreground text-background hover:text-background" }}
              >
                <Icon className="size-3.5" strokeWidth={1.8} />
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border/70 px-4 py-6 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 text-[12px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>กาแฟคณะ · โรงอาหารคณะ ชั้น 1 · เปิด 08:00–16:00 น.</p>
          <p>สั่งออนไลน์ จ่ายเงินที่หน้าร้าน</p>
        </div>
      </footer>
    </div>
  );
}