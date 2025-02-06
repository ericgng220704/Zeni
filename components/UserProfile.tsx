import { getInitials, truncateText } from "@/lib/utils";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { AvatarImage } from "@radix-ui/react-avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ProfileForm } from "./UserProfileForm";
import { Separator } from "@/components/ui/separator";
import { HiLogout } from "react-icons/hi";
import { User } from "@/type";
import { Button } from "./ui/button";
import { SignOut } from "@/lib/actions/user.actions";
import { FaEdit } from "react-icons/fa";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function UserProfile({ user }: { user: User }) {
  async function handleSignOut() {
    await SignOut();
  }

  return (
    <Popover>
      <PopoverTrigger className="flex gap-1 items-center text-sm">
        <Avatar className="size-9 text-sm">
          <AvatarImage src={user.image} />
          <AvatarFallback style={{ backgroundColor: user.color }}>
            {getInitials(user.name, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-4 rounded-lg shadow-md bg-white mr-2">
        <div className="mb-4">
          <Dialog>
            <DialogTrigger>
              <h3 className="text-md font-medium flex items-center gap-2">
                {user.name} <FaEdit className="text-gray-700" />
              </h3>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Profile</DialogTitle>
                <DialogDescription>
                  You can manage your profile here.
                </DialogDescription>
              </DialogHeader>
              <ProfileForm user={user} />
            </DialogContent>
          </Dialog>

          <p className="text-sm text-gray-500">{user.email}</p>
        </div>
        <Separator />

        <div className="my-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium text-gray-600">Color:</span>
            <div className="flex items-center gap-2">
              <span>{user.color}</span>
              <span
                className="rounded-sm h-6 w-6"
                style={{
                  backgroundColor: user.color,
                }}
              ></span>
            </div>
          </div>
          <div>
            <span className="text-xs text-gray-600">
              This color is used for your chart portion & chatbot message.
            </span>
          </div>
        </div>

        {user.default_balance && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-600">
                Default Balance:
              </span>
              <span className="text-gray-900">{user.default_balance}</span>
            </div>
          </div>
        )}
        <Separator />

        <div className="">
          <Button
            onClick={handleSignOut}
            variant={"ghost"}
            className="w-full mt-2 !justify-start p-0 text-gray-700"
          >
            <div className="flex items-center justify-between w-full">
              <span>Sign Out</span>
              <HiLogout />
            </div>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
