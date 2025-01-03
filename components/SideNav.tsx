"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./Logo";
import { MdOutlineSpaceDashboard } from "react-icons/md";
import { FaMoneyBillTransfer } from "react-icons/fa6";
import { FaMoneyBillTrendUp } from "react-icons/fa6";

const navItems = [
  {
    name: "Dashboard",
    url: "/",
    icon: MdOutlineSpaceDashboard,
  },
  {
    name: "Expense",
    url: "/expense",
    icon: FaMoneyBillTransfer,
  },
  {
    name: "Income",
    url: "/income",
    icon: FaMoneyBillTrendUp,
  },
];

export default function SideNav() {
  const pathname = usePathname();

  return (
    <aside className="hidden h-screen flex-col overflow-auto px-5 py-7 lg:flex lg:w-[280px] bg-white text-black border-black/10 border-r">
      <Link
        href={"/"}
        className="w-full flex items-center justify-center  mb-8 pb-3"
      >
        <Logo Clsname="" />
      </Link>
      <nav className="h5 mt-9 flex flex-col gap-4">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <Link
              href={item.url}
              key={index}
              className="lg:w-full list-none text flex items-center"
            >
              <li
                className={cn(
                  "flex items-center gap-2 text-lg size-full py-2 px-4 rounded-lg text-gray-400",
                  pathname === item.url && "text-teal-600 bg-slate-100"
                )}
              >
                <Icon className="text-2xl" />
                <p className="hidden lg:block">{item.name}</p>
              </li>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
