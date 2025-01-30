import { signIn } from "@/auth";
import { redirect } from "next/navigation";
import { FaGoogle } from "react-icons/fa";

export default function SignIn() {
  return (
    <form
      action={async () => {
        "use server";
        await signIn("google");
        redirect("/");
      }}
    >
      <button
        type="submit"
        className="px-8 py-4 rounded text-xl flex items-center gap-4 bg-gradient text-black/90"
      >
        <FaGoogle />
        <span>Signin with Google</span>
      </button>
    </form>
  );
}
