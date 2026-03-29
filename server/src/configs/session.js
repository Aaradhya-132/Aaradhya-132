import session from "express-session";
import MongoStore from "connect-mongo";
import dotenv from "dotenv";

dotenv.config();

const SESSION_MAX_AGE = 14 * 24 * 60 * 60 * 1000; // 14 days

const configureSession = () => {
  const secret = process.env.SESSION_SECRET || `fallback_secret_${Math.random().toString(36).slice(2, 11)}`;

  if (!process.env.SESSION_SECRET) {
    console.warn("⚠️ Warning: SESSION_SECRET is not set. Using a dynamic fallback secret (non-persistent).");
  }

  return session({
    secret,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      collectionName: "user_sessions",
      ttl: SESSION_MAX_AGE / 1000,
    }),
    cookie: {
      maxAge: SESSION_MAX_AGE,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    },
    name: "explorer.ai_session",
  });
};

export default configureSession;
