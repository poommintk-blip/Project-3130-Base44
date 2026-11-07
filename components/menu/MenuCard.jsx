import { Plus } from "lucide-react";
import { Image } from "@/components/ui/image";
import { baht } from "@/lib/format";

export default function MenuCard({ item, qty, onAdd }) {
  return (
    <li className={`omu-card${qty > 0 ? " is-picked" : ""}`} data-cat={item.category}>
      <div className="omu-shot">
        <Image
          src={item.image}
          alt={item.name}
          className="h-full w-full object-cover"
          fittingType="fill"
        />
        {qty > 0 && <span className="omu-chip">{qty}</span>}
        <button
          type="button"
          className="omu-add"
          onClick={() => onAdd(item)}
          aria-label={`เลือก ${item.name}`}
        >
          <Plus strokeWidth={1.6} />
        </button>
      </div>
      <div className="omu-body">
        <div className="omu-names">
          <p className="omu-sub">{item.name_en}</p>
          <h3 className="omu-en">{item.name}</h3>
        </div>
        <p className="omu-price">{baht(item.price)}</p>
      </div>
    </li>
  );
}