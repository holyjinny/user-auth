import { config } from 'dotenv';

config();

export const DB = process.env.APP_DB;
export const SECRET = process.env.APP_SECRET;
export const DOMAIN = process.env.APP_DOMAIN;
export const PORT = process.env.PORT || process.env.APP_PORT;

// SMTP
export const SMTP_SERVER = process.env.APP_SMTP_SERVER;
export const SMTP_HOST = process.env.APP_SMTP_FROM;
export const SMTP_PW = process.env.APP_SMTP_PASSWORD;
export const SMTP_TEST1 = process.env.APP_SMTP_TOID1;
export const SMTP_TEST2 = process.env.APP_SMTP_TOID2;