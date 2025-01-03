"use client";

import { RiArrowRightDoubleFill } from "react-icons/ri";
import { FaBell } from "react-icons/fa6";
import UserProfile from "./UserProfile";
import { FaCaretDown } from "react-icons/fa";
import Logo from "./Logo";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { capitalizeFirstLetter, cn } from "@/lib/utils";
import { MdOutlineSpaceDashboard } from "react-icons/md";
import { FaMoneyBillTransfer } from "react-icons/fa6";
import { FaMoneyBillTrendUp } from "react-icons/fa6";

const navItems = [
  {
    name: "",
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

export default function TopNav({
  name,
  email,
}: {
  name: string;
  email: string;
}) {
  const pathName = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const filteredNavItems = navItems.filter(
    (item) => item.name !== capitalizeFirstLetter(pathName.slice(1))
  );

  return (
    <div className="flex justify-between items-center w-full h-[70px] px-6 border-b border-black/10 bg-white text-xl">
      <div className="hidden lg:flex items-center gap-2 h-full">
        <p className="font-bold text-teal-600 text-2xl">Hello, Christian</p>{" "}
        <p className="flex items-center gap-2">
          <RiArrowRightDoubleFill />{" "}
          <span className="text-base">July 22, 2024</span>
        </p>
      </div>

      <div className="flex items-center gap-3 lg:hidden">
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger
              className=" flex items-center gap-2"
              onClick={() => setIsOpen((prev) => !prev)}
            >
              <span>
                {pathName.slice(1) === ""
                  ? "Dashboard"
                  : capitalizeFirstLetter(pathName.slice(1))}
              </span>{" "}
              <FaCaretDown />
            </MenubarTrigger>
            <MenubarContent>
              {filteredNavItems.map((item, index) => {
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
        <div>
          <FaBell />
        </div>
        <UserProfile name={name} email={email} />
      </div>
    </div>
  );
}
