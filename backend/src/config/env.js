const dotenv = require("dotenv");

dotenv.config();

module.exports = {
  PORT: process.env.PORT || 5000,

  NODE_ENV: process.env.NODE_ENV || "development",

  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:3001",

  SUPABASE_URL: process.env.SUPABASE_URL,

  SUPABASE_SERVICE_ROLE_KEY:
    process.env.SUPABASE_SERVICE_ROLE_KEY,

  JWT_SECRET: process.env.JWT_SECRET,

  REDIS_URL: process.env.REDIS_URL,

  CORS_ORIGIN:
    process.env.CORS_ORIGIN || process.env.CLIENT_URL || "http://localhost:3001",
};