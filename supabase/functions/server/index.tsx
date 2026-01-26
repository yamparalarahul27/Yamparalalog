/**
 * supabase/functions/server/index.tsx (Backend)
 * The main server-side logic for the application (Supabase Edge Function).
 * 
 * CORE RESPONSIBILITIES:
 * - Request Routing: Uses Hono.js to route API calls (GET, POST, PUT, DELETE).
 * - Middleware: Implements CORS and logging.
 * - Persistent Storage: Manages data in Supabase KV store (via `kv_store.tsx`).
 * - Media Management: Handles image uploads to Supabase Storage buckets.
 * - Data Initialization: Seeds default users (including Admin and Design Team) on startup.
 * 
 * LINKAGE:
 * - Frontend Connection: Called by `src/app/api/*` services in the frontend.
 * - Storage: Interacts directly with Supabase Storage and KV.
 */

import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { createClient } from "npm:@supabase/supabase-js@2";

const app = new Hono();

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

// Create storage bucket on startup
const bucketName = "make-e66bfe94-design-logs";
const { data: buckets } = await supabase.storage.listBuckets();
const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
if (!bucketExists) {
  await supabase.storage.createBucket(bucketName, { public: false });
}

// Initialize default users
const initializeUsers = async () => {
  // Define default users
  const defaultUsers = [
    {
      id: "admin",
      name: "Yamparala Rahul",
      role: "Lead Design Engineer",
      pin: "2703",
      requiresPin: true,
      accessibleTabs: ["wiki", "logs", "resources"]
    },
    {
      id: "guest",
      name: "Guest User",
      role: "Guest",
      pin: "",
      requiresPin: false,
      accessibleTabs: ["resources"]
    }
  ];

  // Users to explicitly remove (cleanup)
  const legacyUsers = ["praveen", "shaina", "newjoin"];

  // Cleanup legacy users
  for (const userId of legacyUsers) {
    const existing = await kv.get(`user:${userId}`);
    if (existing) {
      console.log(`Removing legacy user: ${userId}`);
      await kv.del(`user:${userId}`);
    }
  }

  // Check and add each user individually (preserves existing users)
  for (const user of defaultUsers) {
    const existingUser = await kv.get(`user:${user.id}`);
    if (!existingUser) {
      console.log(`Creating default user: ${user.name} (${user.id})`);
      await kv.set(`user:${user.id}`, user);
    } else {
      console.log(`User already exists: ${user.name} (${user.id})`);

      // Migrate existing users to add new fields if they don't have them
      if (existingUser.requiresPin === undefined || !existingUser.accessibleTabs) {
        console.log(`Migrating user to new schema: ${user.name} (${user.id})`);
        const migratedUser = {
          ...existingUser,
          requiresPin: user.requiresPin,
          accessibleTabs: user.accessibleTabs
        };
        await kv.set(`user:${user.id}`, migratedUser);
      }
    }
  }
};

await initializeUsers();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-e66bfe94/health", (c) => {
  return c.json({ status: "ok" });
});

// Get all design logs
app.get("/make-server-e66bfe94/logs", async (c) => {
  try {
    const logs = await kv.getByPrefix("log:");
    return c.json({ logs: logs || [] });
  } catch (error) {
    console.log(`Error fetching logs: ${error}`);
    return c.json({ error: "Failed to fetch logs", details: String(error) }, 500);
  }
});

// Create a new design log
app.post("/make-server-e66bfe94/logs", async (c) => {
  try {
    const log = await c.req.json();
    const logId = Date.now().toString();
    const logWithId = { ...log, id: logId };

    await kv.set(`log:${logId}`, logWithId);
    return c.json({ log: logWithId }, 201);
  } catch (error) {
    console.log(`Error creating log: ${error}`);
    return c.json({ error: "Failed to create log", details: String(error) }, 500);
  }
});

// Update a design log
app.put("/make-server-e66bfe94/logs/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const updates = await c.req.json();

    const existing = await kv.get(`log:${id}`);
    if (!existing) {
      return c.json({ error: "Log not found" }, 404);
    }

    const updatedLog = { ...existing, ...updates, id };
    await kv.set(`log:${id}`, updatedLog);
    return c.json({ log: updatedLog });
  } catch (error) {
    console.log(`Error updating log: ${error}`);
    return c.json({ error: "Failed to update log", details: String(error) }, 500);
  }
});

// Delete a design log (soft delete)
app.delete("/make-server-e66bfe94/logs/:id", async (c) => {
  try {
    const id = c.req.param("id");

    const existing = await kv.get(`log:${id}`);
    if (!existing) {
      return c.json({ error: "Log not found" }, 404);
    }

    // Soft delete - mark as deleted
    const deletedLog = {
      ...existing,
      deleted: true,
      deletedAt: new Date().toISOString(),
    };

    await kv.set(`log:${id}`, deletedLog);
    return c.json({ success: true });
  } catch (error) {
    console.log(`Error deleting log: ${error}`);
    return c.json({ error: "Failed to delete log", details: String(error) }, 500);
  }
});

// Restore a deleted log
app.post("/make-server-e66bfe94/logs/:id/restore", async (c) => {
  try {
    const id = c.req.param("id");

    const existing = await kv.get(`log:${id}`);
    if (!existing) {
      return c.json({ error: "Log not found" }, 404);
    }

    // Remove deleted flags
    const restoredLog = {
      ...existing,
      deleted: false,
      deletedAt: undefined,
    };

    await kv.set(`log:${id}`, restoredLog);
    return c.json({ log: restoredLog });
  } catch (error) {
    console.log(`Error restoring log: ${error}`);
    return c.json({ error: "Failed to restore log", details: String(error) }, 500);
  }
});

// Permanently delete a log
app.delete("/make-server-e66bfe94/logs/:id/permanent", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(`log:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.log(`Error permanently deleting log: ${error}`);
    return c.json({ error: "Failed to permanently delete log", details: String(error) }, 500);
  }
});

// Upload image for a design log
app.post("/make-server-e66bfe94/upload-image", async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return c.json({ error: "No file provided" }, 400);
    }

    // Create a unique filename
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${crypto.randomUUID()}.${fileExt}`;
    const filePath = `images/${fileName}`;

    // Upload to Supabase Storage
    const arrayBuffer = await file.arrayBuffer();
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, arrayBuffer, {
        contentType: file.type,
      });

    if (error) {
      console.log(`Error uploading image: ${error}`);
      return c.json({ error: "Failed to upload image", details: String(error) }, 500);
    }

    // Create a signed URL (valid for 1 year)
    const { data: signedUrlData } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(filePath, 31536000); // 1 year in seconds

    return c.json({ imageUrl: signedUrlData?.signedUrl });
  } catch (error) {
    console.log(`Error in upload-image endpoint: ${error}`);
    return c.json({ error: "Failed to upload image", details: String(error) }, 500);
  }
});

// Get all users
app.get("/make-server-e66bfe94/users", async (c) => {
  try {
    const users = await kv.getByPrefix("user:");
    return c.json({ users: users || [] });
  } catch (error) {
    console.log(`Error fetching users: ${error}`);
    return c.json({ error: "Failed to fetch users", details: String(error) }, 500);
  }
});

// Update user PIN
app.put("/make-server-e66bfe94/users/:id/pin", async (c) => {
  try {
    const id = c.req.param("id");
    const { pin } = await c.req.json();

    const existing = await kv.get(`user:${id}`);
    if (!existing) {
      return c.json({ error: "User not found" }, 404);
    }

    const updatedUser = { ...existing, pin };
    await kv.set(`user:${id}`, updatedUser);
    return c.json({ user: updatedUser });
  } catch (error) {
    console.log(`Error updating user PIN: ${error}`);
    return c.json({ error: "Failed to update user PIN", details: String(error) }, 500);
  }
});

// Create a new user
app.post("/make-server-e66bfe94/users", async (c) => {
  try {
    const { name, role } = await c.req.json();
    const userId = name.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now();
    const newUser = { id: userId, name, role, pin: "" };

    await kv.set(`user:${userId}`, newUser);
    return c.json({ user: newUser }, 201);
  } catch (error) {
    console.log(`Error creating user: ${error}`);
    return c.json({ error: "Failed to create user", details: String(error) }, 500);
  }
});

// Delete a user
app.delete("/make-server-e66bfe94/users/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(`user:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.log(`Error deleting user: ${error}`);
    return c.json({ error: "Failed to delete user", details: String(error) }, 500);
  }
});

// Add comment to a design log
app.post("/make-server-e66bfe94/logs/:id/comments", async (c) => {
  try {
    const logId = c.req.param("id");
    const commentData = await c.req.json();

    const existing = await kv.get(`log:${logId}`);
    if (!existing) {
      return c.json({ error: "Log not found" }, 404);
    }

    // Create new comment with unique ID and timestamp
    const newComment = {
      id: Date.now().toString(),
      ...commentData,
      date: new Date().toISOString().split("T")[0],
    };

    // Add comment to log
    const updatedLog = {
      ...existing,
      comments: [...(existing.comments || []), newComment],
    };

    await kv.set(`log:${logId}`, updatedLog);
    return c.json({ log: updatedLog });
  } catch (error) {
    console.log(`Error adding comment: ${error}`);
    return c.json({ error: "Failed to add comment", details: String(error) }, 500);
  }
});

// Get all wiki pages
app.get("/make-server-e66bfe94/wiki", async (c) => {
  try {
    const pages = await kv.getByPrefix("wiki:");
    return c.json({ pages: pages || [] });
  } catch (error) {
    console.log(`Error fetching wiki pages: ${error}`);
    return c.json({ error: "Failed to fetch wiki pages", details: String(error) }, 500);
  }
});

// Create a new wiki page
app.post("/make-server-e66bfe94/wiki", async (c) => {
  try {
    const page = await c.req.json();
    const pageId = Date.now().toString();
    const pageWithId = { ...page, id: pageId };

    await kv.set(`wiki:${pageId}`, pageWithId);
    return c.json({ page: pageWithId }, 201);
  } catch (error) {
    console.log(`Error creating wiki page: ${error}`);
    return c.json({ error: "Failed to create wiki page", details: String(error) }, 500);
  }
});

// Update a wiki page
app.put("/make-server-e66bfe94/wiki/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const updates = await c.req.json();

    const existing = await kv.get(`wiki:${id}`);
    if (!existing) {
      return c.json({ error: "Wiki page not found" }, 404);
    }

    const updatedPage = { ...existing, ...updates, id };
    await kv.set(`wiki:${id}`, updatedPage);
    return c.json({ page: updatedPage });
  } catch (error) {
    console.log(`Error updating wiki page: ${error}`);
    return c.json({ error: "Failed to update wiki page", details: String(error) }, 500);
  }
});

// Delete a wiki page
app.delete("/make-server-e66bfe94/wiki/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(`wiki:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.log(`Error deleting wiki page: ${error}`);
    return c.json({ error: "Failed to delete wiki page", details: String(error) }, 500);
  }
});

// Get all resources
app.get("/make-server-e66bfe94/resources", async (c) => {
  try {
    const resources = await kv.getByPrefix("resource:");
    return c.json({ resources: resources || [] });
  } catch (error) {
    console.log(`Error fetching resources: ${error}`);
    return c.json({ error: "Failed to fetch resources", details: String(error) }, 500);
  }
});

// Create a new resource
app.post("/make-server-e66bfe94/resources", async (c) => {
  try {
    const resource = await c.req.json();
    const resourceId = Date.now().toString();
    const resourceWithId = { ...resource, id: resourceId };

    await kv.set(`resource:${resourceId}`, resourceWithId);
    return c.json({ resource: resourceWithId }, 201);
  } catch (error) {
    console.log(`Error creating resource: ${error}`);
    return c.json({ error: "Failed to create resource", details: String(error) }, 500);
  }
});

// Update a resource
app.put("/make-server-e66bfe94/resources/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const updates = await c.req.json();

    const existing = await kv.get(`resource:${id}`);
    if (!existing) {
      return c.json({ error: "Resource not found" }, 404);
    }

    const updatedResource = { ...existing, ...updates, id };
    await kv.set(`resource:${id}`, updatedResource);
    return c.json({ resource: updatedResource });
  } catch (error) {
    console.log(`Error updating resource: ${error}`);
    return c.json({ error: "Failed to update resource", details: String(error) }, 500);
  }
});

// Delete a resource
app.delete("/make-server-e66bfe94/resources/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(`resource:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.log(`Error deleting resource: ${error}`);
    return c.json({ error: "Failed to delete resource", details: String(error) }, 500);
  }
});

Deno.serve(app.fetch);