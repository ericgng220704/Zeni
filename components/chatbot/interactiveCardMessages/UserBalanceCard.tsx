import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserMember } from "@/type";
import { Tilt } from "@/components/motion-primitives/tilt";
import { cn, getInitials } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDate } from "date-fns";

export default function UserBalanceCardMessage({
  data,
  subtype,
}: {
  data: any;
  subtype: "SUCCESS" | "ERROR" | "DISPLAY" | "";
}) {
  if (data.dataType !== "userBalances") return null;

  const UserBalanceCard = (user: UserMember) => (
    <Tilt rotationFactor={8} key={user.id}>
      <Card className={cn("min-w-[380px]")}>
        <CardHeader className="flex flex-row justify-between items-center -mb-2">
          <div className="flex flex-col gap-1">
            <CardTitle className="text-lg">{user.name}</CardTitle>
            <span className="text-xs text-gray-600 px-2 py-1 bg-gray-100 rounded-xl">
              {user.email}
            </span>
          </div>
          <div className="flex items-center justify-center p-1">
            <Avatar className="size-10 text-sm border-2 border-white -ml-2">
              <AvatarImage src={`${user.image}`} />
              <AvatarFallback
                style={{ backgroundColor: user.color || undefined }}
              >
                {getInitials(user.name, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Role</span>
            <span>{user.role}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Joined at</span>
            <span>{formatDate(user.joinedAt, "MMM dd, yyyy")}</span>
          </div>
        </CardContent>
      </Card>
    </Tilt>
  );

  return (
    <div className="flex flex-col gap-6">
      {data.userBalances &&
        data.userBalances.map((user: UserMember) => UserBalanceCard(user))}
    </div>
  );
}
