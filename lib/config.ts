const config = {
  databaseUrl: process.env.DATABASE_URL!,
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL!,
  qstashUrl: process.env.QSTASH_URL!,
  qstashToken: process.env.QSTASH_TOKEN!,
  resendToken: process.env.RESEND_TOKEN!,
};

export default config;
