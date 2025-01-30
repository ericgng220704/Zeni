import { signOut } from "@/auth";
import { redirect } from "next/navigation";

export default function SignOut() {
  return (
    <form
      action={async () => {
        "use server";
        await signOut();
        redirect("/sign-in");
      }}
    >
      <button type="submit">Sign Out</button>
    </form>
  );
}
