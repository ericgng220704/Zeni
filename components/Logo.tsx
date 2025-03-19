import { cn } from "@/lib/utils";
import { TbTargetArrow } from "react-icons/tb";

export default function Logo({
  Clsname,
  LogoTxt = "Zeni",
}: {
  Clsname: string;
  LogoTxt?: string;
}) {
  return (
    <div
      className={cn(
        "flex gap-2 items-center text-3xl md:text-4xl lg:text-5xl text-black/80 font-bold",
        Clsname
      )}
    >
      <TbTargetArrow />{" "}
      <span
        className={cn("text-black/80 font-bold rekalgera-regular", Clsname)}
      >
        {LogoTxt}
      </span>
    </div>
  );
}
