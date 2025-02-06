"use client";
import UserProfile from "./UserProfile";
import { FaCaretDown } from "react-icons/fa";
import Logo from "./Logo";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { capitalizeFirstLetter } from "@/lib/utils";
import { MdOutlineSpaceDashboard } from "react-icons/md";
import { FaMoneyBillTransfer } from "react-icons/fa6";
import { FaMoneyBillTrendUp } from "react-icons/fa6";
import { FaScaleBalanced } from "react-icons/fa6";
// import NotiBell from './Notifications/NotiBell';
import { FaCalculator } from "react-icons/fa6";
import { IoIosArrowBack } from "react-icons/io";
import Link from "next/link";

const navItems = [
  {
    name: "",
    url: "/",
    icon: MdOutlineSpaceDashboard,
  },
  {
    name: "Balances",
    url: "/balances",
    icon: FaScaleBalanced,
  },
  {
    name: "Expense",
    url: "/expenses",
    icon: FaMoneyBillTransfer,
  },
  {
    name: "Income",
    url: "/incomes",
    icon: FaMoneyBillTrendUp,
  },
  {
    name: "Budgets",
    url: "/budgets",
    icon: FaCalculator,
  },
];

export default function TopNav({ user }: { user: any }) {
  const pathName = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const showBackButton = () => {
    const parts = pathName.split("/");
    return parts.length > 2; // Show if the path has more than one slash
  };

  // Determine the back URL
  const getBackUrl = () => {
    const parts = pathName.split("/");
    if (parts[1] === "balances") {
      return "/balances";
    }
    return "/";
  };

  return (
    <div className="flex justify-between items-center w-full h-[70px] lg:h-[50px] px-6 bg-stone-50 text-xl py-4">
      <div className="hidden lg:block">
        {showBackButton() && (
          <Link
            href={getBackUrl()}
            className=" text-sm flex items-center gap-1 border py-1 px-2 border-black/30 rounded-2xl text-gray-700"
          >
            <IoIosArrowBack />
            <span>Back</span>
          </Link>
        )}
      </div>

      <div className="flex items-center gap-3 lg:hidden">
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger
              className={`flex items-center gap-2 ${isOpen}`}
              onClick={() => setIsOpen((prev) => !prev)}
            >
              <span>
                {pathName.slice(1) === ""
                  ? "Dashboard"
                  : capitalizeFirstLetter(pathName.slice(1).split("/")[0])}
              </span>{" "}
              <FaCaretDown />
            </MenubarTrigger>
            <MenubarContent>
              {navItems.map((item, index) => {
                const Icon = item.icon;

                return (
                  <MenubarItem
                    key={index}
                    onClick={() => {
                      router.push(item.url);
                    }}
                    className="flex items-center gap-2 h-10 border-b border-black/10"
                  >
                    <Icon className="text-lg text-black/70" />
                    <span>{item.name === "" ? "Dashboard" : item.name}</span>
                  </MenubarItem>
                );
              })}
            </MenubarContent>
          </MenubarMenu>
        </Menubar>

        <div className="h-full">
          <Logo Clsname="" />
        </div>
      </div>

      <div className="flex items-center h-full gap-4">
        {/* <NotiBell user={user} /> */}
        <div className="hidden lg:flex items-center gap-2 h-full">
          <p className=" text-gray-600 text-sm">Hi, {user.name}!</p>
        </div>
        <UserProfile user={user} />
      </div>
    </div>
  );
}
