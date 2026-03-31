import * as dotenv from 'dotenv';

dotenv.config();

export default () => ({
  database: {
    uri: process.env.MONGO_URL,
  },
  jwt: {
    secret: process.env.JWT_SECRET_KEY,
  },
  Brevo: {
    BREVO_USER: process.env.BREVO_USER,
    BREVO_PASS: process.env.BREVO_PASS,
    BREVO_HOST: process.env.BREVO_HOST,
    BREVO_PORT: process.env.BREVO_PORT,
    sender_email: process.env.sender_email,
  },
  redis: {
    REDIS_HOST: process.env.REDIS_HOST,
    REDIS_PORT: process.env.REDIS_PORT,
    REDIS_PASS: process.env.REDIS_PASS,
  },
});
