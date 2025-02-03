// app/api/invite/route.ts
"use server";
import { serve } from "@upstash/workflow/nextjs";
import { sendEmail } from "@/lib/workflow";
import { db } from "@/database/drizzle";
import { invitations } from "@/database/schema";
import { and, eq } from "drizzle-orm";
import config from "@/lib/config";
import { getUserByEmail } from "@/lib/actions/user.actions";
import {
  sendInvitation,
  updateInvitationStatus,
} from "@/lib/actions/invitation.actions";
import { auth } from "@/auth";

// In this workflow:

// Step 1: An invitation email is sent to the user with a link to accept the invitation.
// Step 2: The workflow waits for a specified period (e.g., 7 days) for the user to respond.
// Step 3: After the waiting period, it checks if the user has accepted the invitation.
// Step 4: If the invitation is not accepted, a reminder email is sent.
// Step 5: Wait for 3 days
// Step 6: Turn the invitation to "DECLINED" if not accepted

type InvitationData = {
  email: string;
  balanceId: string;
  inviterName: string;
};

export const { POST } = serve<InvitationData>(async (context) => {
  const { email, balanceId, inviterName } = context.requestPayload;

  const session = await auth();

  if (!session?.user) return;

  console.log("Start workflow!!!");

  // Step 1: Send Invitation Email
  await context.run("send-invitation-email", async () => {
    const invitationLink = `${
      config.baseUrl
    }/accept-invite?balanceId=${balanceId}&email=${encodeURIComponent(email)}`;

    const message = `Hello,

    ${inviterName} has invited you to join their balance. Please click the link below to accept the invitation:

    ${invitationLink}

    If you did not expect this invitation, you can ignore this email.`;

    const { success, user } = await getUserByEmail(email);

    if (!success) return;

    await sendInvitation({
      balanceId,
      email,
      inviterId: session.user?.id || "",
      targetId: user.id,
    });

    await sendEmail({
      email,
      subject: "Invitation to Join Balance",
      message,
    });
  });

  // Step 2: Wait for User Response (e.g., 7 days)
  await context.sleep("wait-for-response", 60 * 60 * 24 * 1);

  // Step 3: Check if User Accepted the Invitation
  const invitation = await context.run("check-invitation-status", async () => {
    return await db
      .select()
      .from(invitations)
      .where(
        and(eq(invitations.balance_id, balanceId), eq(invitations.email, email))
      )
      .limit(1);
  });

  if (invitation.length === 0 || invitation[0].status === "PENDING") {
    // Step 4: Send Reminder Email if Not Accepted
    await context.run("send-reminder-email", async () => {
      const reminderLink = `${
        process.env.NEXT_PUBLIC_BASE_URL
      }/accept-invite?balanceId=${balanceId}&email=${encodeURIComponent(
        email
      )}`;
      const reminderMessage = `Hello,

      This is a reminder that ${inviterName} has invited you to join their balance. Please click the link below to accept the invitation:

      ${reminderLink}

      If you did not expect this invitation, you can ignore this email.`;

      await sendEmail({
        email,
        subject: "Reminder: Invitation to Join Balance",
        message: reminderMessage,
      });
    });
  }

  // Step 5: Wait for User Response again (e.g., 3 days)
  await context.sleep("wait-for-response-again", 60 * 60 * 24 * 3);

  // Step 6: Set the invitation to "DECLINED" if not accepted
  const invitationAgain = await context.run(
    "check-invitation-status",
    async () => {
      return await db
        .select()
        .from(invitations)
        .where(
          and(
            eq(invitations.balance_id, balanceId),
            eq(invitations.email, email)
          )
        )
        .limit(1);
    }
  );

  if (invitationAgain.length === 0 || invitationAgain[0].status === "PENDING") {
    await updateInvitationStatus({
      balanceId,
      email,
      status: "DECLINED",
    });
  }
});
