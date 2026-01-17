
// ==========================================
// PART 1: KV STORE UTILITIES
// ==========================================
import { createClient } from "npm:@supabase/supabase-js@2";
import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";

// KV Client shared instance
const getSupabaseClient = () => createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

// KV Store implementations
const kv = {
    set: async (key: string, value: any): Promise<void> => {
        const supabase = getSupabaseClient()
        const { error } = await supabase.from("kv_store_e66bfe94").upsert({
            key,
            value
        });
        if (error) throw new Error(error.message);
    },

    get: async (key: string): Promise<any> => {
        const supabase = getSupabaseClient()
        const { data, error } = await supabase.from("kv_store_e66bfe94").select("value").eq("key", key).maybeSingle();
        if (error) throw new Error(error.message);
        return data?.value;
    },

    del: async (key: string): Promise<void> => {
        const supabase = getSupabaseClient()
        const { error } = await supabase.from("kv_store_e66bfe94").delete().eq("key", key);
        if (error) throw new Error(error.message);
    },

    getByPrefix: async (prefix: string): Promise<any[]> => {
        const supabase = getSupabaseClient()
        const { data, error } = await supabase.from("kv_store_e66bfe94").select("key, value").like("key", prefix + "%");
        if (error) throw new Error(error.message);
        return data?.map((d) => d.value) ?? [];
    }
};

// ==========================================
// PART 2: SERVER LOGIC
// ==========================================

const app = new Hono();
const supabase = getSupabaseClient();

// Create storage bucket on startup
const bucketName = "make-e66bfe94-design-logs";
// Note: We wrap this in a try-catch or implicit check to avoid blocking startup if it fails permissions, 
// but for Service Role it should be fine.
try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    if (!bucketExists) {
        await supabase.storage.createBucket(bucketName, { public: false });
    }
} catch (e) {
    console.error("Bucket check failed:", e);
}

// Initialize default users
const initializeUsers = async () => {
    const defaultUsers = [
        { id: "admin", name: "Admin", role: "Admin", pin: "2703", requiresPin: true, accessibleTabs: ["wiki", "logs", "resources"] },
        { id: "praveen", name: "Praveen", role: "UI Designer", pin: "", requiresPin: true, accessibleTabs: ["wiki", "logs", "resources"] },
        { id: "shaina", name: "Shaina Mishra", role: "Graphic Designer", pin: "", requiresPin: true, accessibleTabs: ["wiki", "logs", "resources"] },
        { id: "newjoin", name: "New_Join", role: "Guest", pin: "", requiresPin: false, accessibleTabs: ["wiki"] }
    ];

    for (const user of defaultUsers) {
        const existingUser = await kv.get(`user:${user.id}`);
        if (!existingUser) {
            console.log(`Creating default user: ${user.name} (${user.id})`);
            await kv.set(`user:${user.id}`, user);
        } else {
            // Simple migration if needed
            if (existingUser.requiresPin === undefined) {
                await kv.set(`user:${user.id}`, { ...existingUser, requiresPin: user.requiresPin, accessibleTabs: user.accessibleTabs });
            }
        }
    }
};

await initializeUsers();

// Middleware
app.use('*', logger(console.log));
app.use("/*", cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
}));

// Routes
const ROUTES_PREFIX = "/make-server-e66bfe94";

app.get(`${ROUTES_PREFIX}/health`, (c) => c.json({ status: "ok" }));

app.get(`${ROUTES_PREFIX}/logs`, async (c) => {
    try {
        const logs = await kv.getByPrefix("log:");
        return c.json({ logs: logs || [] });
    } catch (error) {
        return c.json({ error: "Failed to fetch logs", details: String(error) }, 500);
    }
});

app.post(`${ROUTES_PREFIX}/logs`, async (c) => {
    try {
        const log = await c.req.json();
        const logId = Date.now().toString();
        const logWithId = { ...log, id: logId };
        await kv.set(`log:${logId}`, logWithId);
        return c.json({ log: logWithId }, 201);
    } catch (error) {
        return c.json({ error: "Failed to create log", details: String(error) }, 500);
    }
});

app.put(`${ROUTES_PREFIX}/logs/:id`, async (c) => {
    try {
        const id = c.req.param("id");
        const updates = await c.req.json();
        const existing = await kv.get(`log:${id}`);
        if (!existing) return c.json({ error: "Log not found" }, 404);

        const updatedLog = { ...existing, ...updates, id };
        await kv.set(`log:${id}`, updatedLog);
        return c.json({ log: updatedLog });
    } catch (error) {
        return c.json({ error: "Failed to update log", details: String(error) }, 500);
    }
});

app.delete(`${ROUTES_PREFIX}/logs/:id`, async (c) => {
    try {
        const id = c.req.param("id");
        const existing = await kv.get(`log:${id}`);
        if (!existing) return c.json({ error: "Log not found" }, 404);

        const deletedLog = { ...existing, deleted: true, deletedAt: new Date().toISOString() };
        await kv.set(`log:${id}`, deletedLog);
        return c.json({ success: true });
    } catch (error) {
        return c.json({ error: "Failed to delete log", details: String(error) }, 500);
    }
});

app.post(`${ROUTES_PREFIX}/logs/:id/restore`, async (c) => {
    try {
        const id = c.req.param("id");
        const existing = await kv.get(`log:${id}`);
        if (!existing) return c.json({ error: "Log not found" }, 404);

        const restoredLog = { ...existing, deleted: false, deletedAt: undefined };
        await kv.set(`log:${id}`, restoredLog);
        return c.json({ log: restoredLog });
    } catch (error) {
        return c.json({ error: "Failed to restore log", details: String(error) }, 500);
    }
});

app.delete(`${ROUTES_PREFIX}/logs/:id/permanent`, async (c) => {
    try {
        const id = c.req.param("id");
        await kv.del(`log:${id}`);
        return c.json({ success: true });
    } catch (error) {
        return c.json({ error: "Failed to permanently delete log", details: String(error) }, 500);
    }
});

app.post(`${ROUTES_PREFIX}/upload-image`, async (c) => {
    try {
        const formData = await c.req.formData();
        const file = formData.get("file") as File;
        if (!file) return c.json({ error: "No file provided" }, 400);

        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${crypto.randomUUID()}.${fileExt}`;
        const filePath = `images/${fileName}`;

        const arrayBuffer = await file.arrayBuffer();
        const { error } = await supabase.storage.from(bucketName).upload(filePath, arrayBuffer, { contentType: file.type });
        if (error) throw error;

        const { data: signedUrlData } = await supabase.storage.from(bucketName).createSignedUrl(filePath, 31536000);
        return c.json({ imageUrl: signedUrlData?.signedUrl });
    } catch (error) {
        return c.json({ error: "Failed to upload image", details: String(error) }, 500);
    }
});

app.get(`${ROUTES_PREFIX}/users`, async (c) => {
    try {
        const users = await kv.getByPrefix("user:");
        return c.json({ users: users || [] });
    } catch (error) {
        return c.json({ error: "Failed to fetch users", details: String(error) }, 500);
    }
});

app.put(`${ROUTES_PREFIX}/users/:id/pin`, async (c) => {
    try {
        const id = c.req.param("id");
        const { pin } = await c.req.json();
        const existing = await kv.get(`user:${id}`);
        if (!existing) return c.json({ error: "User not found" }, 404);

        const updatedUser = { ...existing, pin };
        await kv.set(`user:${id}`, updatedUser);
        return c.json({ user: updatedUser });
    } catch (error) {
        return c.json({ error: "Failed to update user PIN", details: String(error) }, 500);
    }
});

app.post(`${ROUTES_PREFIX}/users`, async (c) => {
    try {
        const { name, role } = await c.req.json();
        const userId = name.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now();
        const newUser = { id: userId, name, role, pin: "" };
        await kv.set(`user:${userId}`, newUser);
        return c.json({ user: newUser }, 201);
    } catch (error) {
        return c.json({ error: "Failed to create user", details: String(error) }, 500);
    }
});

app.delete(`${ROUTES_PREFIX}/users/:id`, async (c) => {
    try {
        const id = c.req.param("id");
        await kv.del(`user:${id}`);
        return c.json({ success: true });
    } catch (error) {
        return c.json({ error: "Failed to delete user", details: String(error) }, 500);
    }
});

app.post(`${ROUTES_PREFIX}/logs/:id/comments`, async (c) => {
    try {
        const logId = c.req.param("id");
        const commentData = await c.req.json();
        const existing = await kv.get(`log:${logId}`);
        if (!existing) return c.json({ error: "Log not found" }, 404);

        const newComment = { id: Date.now().toString(), ...commentData, date: new Date().toISOString().split("T")[0] };
        const updatedLog = { ...existing, comments: [...(existing.comments || []), newComment] };
        await kv.set(`log:${logId}`, updatedLog);
        return c.json({ log: updatedLog });
    } catch (error) {
        return c.json({ error: "Failed to add comment", details: String(error) }, 500);
    }
});

app.get(`${ROUTES_PREFIX}/wiki`, async (c) => {
    try {
        const pages = await kv.getByPrefix("wiki:");
        return c.json({ pages: pages || [] });
    } catch (error) {
        return c.json({ error: "Failed to fetch wiki pages", details: String(error) }, 500);
    }
});

app.post(`${ROUTES_PREFIX}/wiki`, async (c) => {
    try {
        const page = await c.req.json();
        const pageId = Date.now().toString();
        const pageWithId = { ...page, id: pageId };
        await kv.set(`wiki:${pageId}`, pageWithId);
        return c.json({ page: pageWithId }, 201);
    } catch (error) {
        return c.json({ error: "Failed to create wiki page", details: String(error) }, 500);
    }
});

app.put(`${ROUTES_PREFIX}/wiki/:id`, async (c) => {
    try {
        const id = c.req.param("id");
        const updates = await c.req.json();
        const existing = await kv.get(`wiki:${id}`);
        if (!existing) return c.json({ error: "Wiki page not found" }, 404);

        const updatedPage = { ...existing, ...updates, id };
        await kv.set(`wiki:${id}`, updatedPage);
        return c.json({ page: updatedPage });
    } catch (error) {
        return c.json({ error: "Failed to update wiki page", details: String(error) }, 500);
    }
});

app.delete(`${ROUTES_PREFIX}/wiki/:id`, async (c) => {
    try {
        const id = c.req.param("id");
        await kv.del(`wiki:${id}`);
        return c.json({ success: true });
    } catch (error) {
        return c.json({ error: "Failed to delete wiki page", details: String(error) }, 500);
    }
});

app.get(`${ROUTES_PREFIX}/resources`, async (c) => {
    try {
        const resources = await kv.getByPrefix("resource:");
        return c.json({ resources: resources || [] });
    } catch (error) {
        return c.json({ error: "Failed to fetch resources", details: String(error) }, 500);
    }
});

app.post(`${ROUTES_PREFIX}/resources`, async (c) => {
    try {
        const resource = await c.req.json();
        const resourceId = Date.now().toString();
        const resourceWithId = { ...resource, id: resourceId };
        await kv.set(`resource:${resourceId}`, resourceWithId);
        return c.json({ resource: resourceWithId }, 201);
    } catch (error) {
        return c.json({ error: "Failed to create resource", details: String(error) }, 500);
    }
});

app.put(`${ROUTES_PREFIX}/resources/:id`, async (c) => {
    try {
        const id = c.req.param("id");
        const updates = await c.req.json();
        const existing = await kv.get(`resource:${id}`);
        if (!existing) return c.json({ error: "Resource not found" }, 404);

        const updatedResource = { ...existing, ...updates, id };
        await kv.set(`resource:${id}`, updatedResource);
        return c.json({ resource: updatedResource });
    } catch (error) {
        return c.json({ error: "Failed to update resource", details: String(error) }, 500);
    }
});

app.delete(`${ROUTES_PREFIX}/resources/:id`, async (c) => {
    try {
        const id = c.req.param("id");
        await kv.del(`resource:${id}`);
        return c.json({ success: true });
    } catch (error) {
        return c.json({ error: "Failed to delete resource", details: String(error) }, 500);
    }
});

Deno.serve(app.fetch);
