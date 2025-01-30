import { Client } from "@upstash/workflow";
import config from "./config";
import { Client as QStashClient, resend } from "@upstash/qstash";

export const workflowClient = new Client({
  baseUrl: `${config.qstashUrl}`,
  token: `${config.qstashToken}`,
});

const qstashClient = new QStashClient({
  token: config.qstashToken,
});

export const sendEmail = async ({
  email,
  subject,
  message,
}: {
  email: string;
  subject: string;
  message: string;
}) => {
  await qstashClient.publishJSON({
    api: {
      name: "email",
      provider: resend({ token: config.resendToken }),
    },
    body: {
      from: "Eric Nguyen <contact@ericgng.com>",
      to: [email],
      subject,
      html: message,
    },
  });
};
