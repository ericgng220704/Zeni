import { cn } from "@/lib/utils";
import { TbTargetArrow } from "react-icons/tb";

export default function Logo({ Clsname }: { Clsname: string }) {
  return (
    <div
      className={cn(
        "flex gap-2 items-center text-3xl md:text-4xl lg:text-5xl text-teal-500 font-bold",
        Clsname
      )}
    >
      <TbTargetArrow /> <span className="text-black/70 font-bold">Zeni</span>
    </div>
  );
}
