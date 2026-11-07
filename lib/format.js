export const baht = (value) =>
  `฿${Number(value || 0).toLocaleString("th-TH", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;

export const TYPE_LABEL = { hot: "ร้อน", iced: "เย็น" };

export const STATUS_META = {
  waiting: { label: "รอคิว", tone: "bg-secondary text-foreground", dot: "bg-[#8c7a68]" },
  making: { label: "กำลังทำ", tone: "bg-[#f6e6cf] text-[#7a4a12]", dot: "bg-[#c98a2e]" },
  ready: { label: "พร้อมรับ", tone: "bg-[#e4ecdf] text-[#3d5c35]", dot: "bg-[#5d8a4b]" },
  picked: { label: "รับแล้ว", tone: "bg-[#eceae5] text-[#6b6156]", dot: "bg-[#9c9184]" },
  cancelled: { label: "ยกเลิก", tone: "bg-[#f7e2de] text-[#8f3323]", dot: "bg-[#b8492a]" },
};

export const ACTIVE_STATUSES = ["waiting", "making", "ready"];

export const statusLabel = (status) => STATUS_META[status]?.label ?? status;

export const formatTime = (iso) => {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Bangkok",
  });
};