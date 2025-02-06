import { User } from "@/type";
import Logo from "../Logo";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { lightenColor } from "@/lib/utils";

export default function ChatMessage({
  type,
  message,
  user,
  isLoading,
}: {
  type: "left" | "right";
  message: string;
  user: User;
  isLoading?: boolean;
}) {
  if (type === "left") {
    return (
      <div
        className="flex gap-4 mb-12 lg:px-24 md:px-10"
        style={{
          whiteSpace: "pre-wrap",
          lineHeight: "1.6",
        }}
      >
        <div className="">
          <Logo Clsname="!text-sm bg-gray-100 px-1 py-1 !gap-0 rounded-sm" />
        </div>
        {isLoading && (
          <div className="typing-indicator flex gap-1 mt-5">
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
          </div>
        )}
        <p className="">{message}</p>
      </div>
    );
  } else {
    return (
      <div className="text-right  mb-12 flex gap-4 justify-end md:px-10 lg:px-24">
        <p
          className="px-4 py-1 rounded-xl"
          style={{
            backgroundColor: lightenColor(user.color),
          }}
        >
          {message}
        </p>
        <div>
          <Avatar className="h-6 w-6">
            <AvatarImage src={user.image}></AvatarImage>
            <AvatarFallback>{user.name}</AvatarFallback>
          </Avatar>
        </div>
      </div>
    );
  }
}
