import type { Express, RequestHandler } from "express";
import session from "express-session";
import { storage } from "./storage";

// Simple local authentication for development
export function getSession() {
  return session({
    secret: process.env.SESSION_SECRET || 'dev-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // Set to false for development
      maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
    },
  });
}

export async function setupAuth(app: Express) {
  app.use(getSession());

  // Simple login endpoint for development
  app.get("/api/login", (req, res) => {
    // For development, automatically create and login a demo user
    const demoUser = {
      id: "demo-user-123",
      email: "demo@financetracker.com",
      firstName: "Demo",
      lastName: "User",
      profileImageUrl: null
    };
    
    (req.session as any).user = demoUser;
    res.redirect("/");
  });

  app.get("/api/callback", (req, res) => {
    // Callback endpoint (not needed for simple auth but keeping for compatibility)
    res.redirect("/");
  });

  app.get("/api/logout", (req, res) => {
    req.session.destroy(() => {
      res.redirect("/");
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const user = (req.session as any)?.user;

  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Ensure the demo user exists in the database
  try {
    await storage.upsertUser({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImageUrl: user.profileImageUrl,
    });
  } catch (error) {
    console.error("Error upserting user:", error);
  }

  // Add user info to request for compatibility with existing code
  (req as any).user = {
    claims: {
      sub: user.id,
      email: user.email,
      first_name: user.firstName,
      last_name: user.lastName,
      profile_image_url: user.profileImageUrl,
    }
  };

  next();
};