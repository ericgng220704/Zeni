import { updateInvitationStatus } from "@/lib/actions/invitation.actions";
import { redirect } from "next/navigation";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");
  const balanceId = searchParams.get("balanceId");
  console.log(email);
  console.log(balanceId);

  if (!email || !balanceId) {
    return new Response("Invalid invitation link.", { status: 400 });
  }

  // Update the invitation status in the database
  const { success } = await updateInvitationStatus({
    balanceId,
    email,
    status: "ACCEPTED",
  });

  if (success) {
    redirect(`/balances/${balanceId}`);
  } else {
    redirect(`/`);
  }
}
