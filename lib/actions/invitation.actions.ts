"use server";

import { db } from "@/database/drizzle";
import { handleError, parseStringify } from "../utils";
import { invitations } from "@/database/schema";
import { and, eq } from "drizzle-orm";
import { workflowClient } from "../workflow";
import config from "../config";
import { after } from "next/server";
import { logActivity } from "./activityLog.actions";

export async function handleInviteBack({
  email,
  balanceId,
  inviterName,
  balance,
}: {
  email: string;
  balanceId: string;
  inviterName: string;
  balance: any;
}) {
  try {
    const response = await workflowClient
      .trigger({
        url: `${config.baseUrl}/api/workflows/invite`,
        body: {
          email: email,
          balanceId,
          inviterName: inviterName,
          balance,
        },
      })
      .then((response) => {
        console.log("Workflow Trigger Response:", response);
        return {
          success: true,
          message: `Invitation was sent successfully to ${email}`,
        };
      })
      .catch((error) => {
        console.error("Error triggering workflow:", error);
        return {
          success: false,
          message: `Oops something went wrong with the invitaion, please try again!`,
        };
      });

    return parseStringify(response);
  } catch (e) {
    handleError(e, "Failed to handle invitation");
  }
}

export async function sendInvitation({
  balanceId,
  email,
  inviterId,
  targetId,
}: {
  balanceId: string;
  email: string;
  inviterId: string;
  targetId: string;
}) {
  try {
    const invitation = await db
      .select()
      .from(invitations)
      .where(
        and(
          eq(invitations.balance_id, balanceId),
          eq(invitations.email, email),
          eq(invitations.inviter_id, inviterId),
          eq(invitations.target_id, targetId)
        )
      )
      .limit(1);

    if (invitation.length !== 0) return;

    const newInvitation = await db
      .insert(invitations)
      .values({
        balance_id: balanceId,
        target_id: targetId,
        inviter_id: inviterId,
        email,
        status: "PENDING",
      })
      .returning();

    after(async () => {
      await logActivity(
        "INVITATION_SENT",
        balanceId,
        `Invitation sent to user ${targetId} from ${inviterId}`
      );
    });

    return parseStringify({
      success: true,
      message: "",
      invitation: newInvitation[0],
    });
  } catch (e) {
    handleError(e, "Failed to send Invitation");
    return parseStringify({
      success: false,
      message: "Failed to send Invitation",
    });
  }
}

export async function updateInvitationStatus({
  balanceId,
  email,
  status,
}: {
  balanceId: string;
  email: string;
  status: "ACCEPTED" | "DECLINED" | "PENDING";
}) {
  try {
    const updatedInvitation = await db
      .update(invitations)
      .set({
        status,
      })
      .where(
        and(eq(invitations.email, email), eq(invitations.balance_id, balanceId))
      )
      .returning();

    return parseStringify({
      success: true,
      updatedInvitation: updatedInvitation[0],
    });
  } catch (e) {
    handleError(e, "Failed to update invitation status");
    return parseStringify({
      success: false,
      message: "Failed to update invitation status",
    });
  }
}
