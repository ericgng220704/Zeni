import Image from "next/image";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import ChatWindow from "./chatbot/ChatWindow";
import { BorderTrail } from "./motion-primitives/border-trail";
import { FaAnglesLeft } from "react-icons/fa6";

export default function ChatBotUniversalWindow({ user }: { user: any }) {
  return (
    <Sheet>
      <SheetTrigger className="relative flex flex-col items-center justify-center w-[190px] bg-zinc-50 rounded-md  px-3 hover:w-[210px]  transition-all !duration-500">
        <BorderTrail
          style={{
            boxShadow:
              "0px 0px 60px 30px rgb(255 255 255 / 50%), 0 0 100px 60px rgb(0 0 0 / 50%), 0 0 140px 90px rgb(0 0 0 / 50%)",
          }}
          size={50}
        />
        <div className="w-full py-2 text-left text-sm flex justify-between items-center">
          <div className="flex items-center gap-2">
            <FaAnglesLeft className="text-gray-600 " />

            <span className="font-semibold text-gray-600">Zeni Chatbot</span>
          </div>
          <div className="flex items-center gap-2">
            <Image
              src={"/chatbot.jpg"}
              alt="chatbot image"
              width={40}
              height={40}
              className="rounded-full object-cover"
            />
          </div>
        </div>
      </SheetTrigger>
      <SheetContent
        className="!w-full !max-w-full md:!w-[650px] md:!max-w-[650px] !px-0 !py-0 !m-0"
        side={"right"}
      >
        <SheetHeader className="hidden">
          <SheetTitle></SheetTitle>
          <SheetDescription></SheetDescription>
        </SheetHeader>
        <ChatWindow user={user} />
      </SheetContent>
    </Sheet>
  );
}
