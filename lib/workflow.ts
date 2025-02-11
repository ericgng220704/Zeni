import { Client } from "@upstash/workflow";
import config from "./config";
import { Client as QStashClient, resend } from "@upstash/qstash";

export const workflowClient = new Client({
  baseUrl: config.qstashUrl,
  token: config.qstashToken,
});

const qstashClient = new QStashClient({
  token: config.qstashToken,
});

export const sendEmail = async ({
  email,
  subject,
  message,
  acceptLink,
  balance,
}: {
  email: string;
  subject: string;
  message: string;
  acceptLink: string;
  balance: any;
}) => {
  const emailHtml = `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8" />
      <title>${subject}</title>
      <style>
        /* Basic styling—some email clients support <style> tags but consider inlining */
        body {
          font-family: Arial, sans-serif;
          background-color: #fff;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 650px;
          margin: 20px auto;
          background: #fafaf9;
          padding: 20px;
          border-radius: 4px;
        }
        /* Replacing Tailwind's text-lg */
        .title {
          color: #333;
          font-size: 1.125rem; /* Approximately 18px */
        }
        /* Base text styling (text-base) */
        .text-base {
          font-size: 1rem; /* 16px */
          line-height: 1.5;
          color: #555;
        }
        /* Footer styling with text-base override */
        .footer {
          margin-top: 10px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1 class="title">Invitation to join Balance</h1>
        <p class="text-base">
          ${message}
        </p>
        <div class="center-flex">
            <a href="${acceptLink}">${acceptLink}</a>
        </div>
        <div class="footer text-base">
          <p>If you did not expect this invitation, you can ignore this email.</p>
          <p>Got a question? Email us at giahaonguyen2207@gmail.com</p>
          <p>Thanks</p>
          <p>Eric Nguyen</p>
        </div>
      </div>
    </body>
  </html>
  `;

  await qstashClient.publishJSON({
    api: {
      name: "email",
      provider: resend({ token: config.resendToken }),
    },
    body: {
      from: "Eric Nguyen <contact@ericgng.com>",
      to: [email],
      subject,
      html: emailHtml,
    },
  });
};
