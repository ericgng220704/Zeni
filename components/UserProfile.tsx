import { truncateText } from "@/lib/utils";

export default function UserProfile({
  name,
  email,
}: {
  name: string;
  email: string;
}) {
  return (
    <div className="flex gap-1 items-center text-sm">
      <div className="h-8 w-8 bg-red-300 rounded-full flex items-center justify-center">
        <p>GN</p>
      </div>
      <div className="flex-col hidden lg:flex">
        <p className="font-bold text-black/80">{name}</p>
        <p className="text-sm text-gray-500">{truncateText(email, 15)}</p>
      </div>
    </div>
  );
}
