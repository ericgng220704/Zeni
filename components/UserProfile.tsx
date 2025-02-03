import { getInitials, truncateText } from "@/lib/utils";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { AvatarImage } from "@radix-ui/react-avatar";

export default function UserProfile({ user }: { user: any }) {
  return (
    <div className="flex gap-1 items-center text-sm">
      <Avatar className="size-7 text-sm">
        <AvatarImage src={user.image} />
        <AvatarFallback style={{ backgroundColor: user.color }}>
          {getInitials(user.name, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-col hidden lg:flex">
        <p className="font-bold text-black/80">{user.name}</p>
        <p className="text-sm text-gray-500">{truncateText(user.email, 15)}</p>
      </div>
    </div>
  );
}
