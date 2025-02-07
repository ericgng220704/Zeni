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
          background: #f5f5f4;
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
          margin-top: 20px;
          font-size: 0.75rem; /* 12px */
          color: #999;
        }
        /* Mimicking Tailwind's w-full, flex, items-center, justify-center */
        .center-flex {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        /* Replacing Tailwind's px-8 py-1, bg-white, flex, items-center, gap-2 */
        .info-box {
          padding: 0.25rem 2rem; /* py-1 = 0.25rem, px-8 = 2rem */
          background: #fff;
          display: flex;
          align-items: center;
          gap: 0.5rem; /* gap-2 */
        }
        /* Replacing Tailwind's button classes */
        .accept-button {
          padding: 0.5rem 1rem; /* py-2 = 0.5rem, px-4 = 1rem */
          border-radius: 0.75rem; /* rounded-xl (approximation) */
          background-color: #16a34a; /* bg-green-600 */
          color: #fff;
          font-size: 1rem; /* text-base */
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          cursor: pointer;
          text-decoration: none;
        }
        /* Ensure the link inside the button inherits the button's styling */
        .accept-button a {
          color: inherit;
          text-decoration: none;
          display: block;
          width: 100%;
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
          <div class="info-box">
            <p>Balance name:</p>
            <p>${balance.name}</p>
          </div>
        </div>
        <div class="center-flex">
          <button class="accept-button">
            <a href="${acceptLink}">Accept</a>
          </button>
        </div>
        <div class="footer">
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
