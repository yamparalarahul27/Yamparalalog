import { expect, test, type Page } from "@playwright/test";

type ResourceRecord = {
  id: string;
  title: string;
  url: string;
  category: string;
  source: string;
  notes: string;
  saved_at: string;
};

async function mockResourceApi(page: Page, initialResources: ResourceRecord[]) {
  let resources = [...initialResources];

  await page.route("**/rest/v1/resources**", async (route) => {
    const method = route.request().method();
    const url = new URL(route.request().url());

    if (method === "GET") {
      await route.fulfill({ json: resources });
      return;
    }

    if (method === "POST") {
      const payload = route.request().postDataJSON() as Omit<ResourceRecord, "id">;
      const created = { ...payload, id: String(resources.length + 1) };
      resources = [created, ...resources];
      await route.fulfill({ status: 201, json: [created] });
      return;
    }

    if (method === "PATCH") {
      const payload = route.request().postDataJSON() as Omit<ResourceRecord, "id">;
      const filter = url.searchParams.get("id") ?? "";
      const id = filter.replace(/^eq\./, "");
      const updated = { ...payload, id };
      resources = resources.map((resource) => (resource.id === id ? updated : resource));
      await route.fulfill({ json: [updated] });
      return;
    }

    if (method === "DELETE") {
      const filter = url.searchParams.get("id") ?? "";
      const id = filter.replace(/^eq\./, "");
      resources = resources.filter((resource) => resource.id !== id);
      await route.fulfill({ status: 204, body: "" });
      return;
    }

    await route.fallback();
  });
}

test("creates the first saved resource", async ({ page }) => {
  await mockResourceApi(page, []);
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Save every useful link in one place." })).toBeVisible();
  await page.getByRole("button", { name: "Save the first resource" }).click();

  const dialog = page.getByRole("dialog", { name: "Save resource" });
  await dialog.getByLabel("Title *").fill("Radix accessibility guide");
  await dialog.getByLabel("URL *").fill("radix-ui.com/primitives/docs/overview/accessibility");
  await dialog.getByLabel("Source").fill("Radix");
  await dialog.getByLabel("Notes").fill("Good reference for accessible interaction patterns.");
  await dialog.getByRole("button", { name: "Save resource" }).click();

  await expect(page.getByText("Radix accessibility guide")).toBeVisible();
  await expect(page.getByText("Good reference for accessible interaction patterns.")).toBeVisible();
});

test("filters, edits, and deletes resources", async ({ page }) => {
  await mockResourceApi(page, [
    {
      id: "1",
      title: "Aceternity components",
      url: "https://ui.aceternity.com",
      category: "Inspiration",
      source: "Aceternity",
      notes: "Useful visual reference ideas.",
      saved_at: "2026-03-20T10:00:00.000Z",
    },
    {
      id: "2",
      title: "React docs",
      url: "https://react.dev",
      category: "Docs",
      source: "React",
      notes: "Official docs and API references.",
      saved_at: "2026-03-19T10:00:00.000Z",
    },
  ]);

  await page.goto("/");

  await page.getByLabel("Search resources").fill("Aceternity");
  await expect(page.getByText("Aceternity components")).toBeVisible();
  await expect(page.getByText("React docs")).not.toBeVisible();

  await page.getByLabel("Search resources").fill("");
  await page.getByLabel("Edit Aceternity components").click();
  const dialog = page.getByRole("dialog", { name: "Edit resource" });
  await dialog.getByLabel("Title *").fill("Aceternity UI");
  await dialog.getByRole("button", { name: "Update resource" }).click();
  await expect(page.getByText("Aceternity UI")).toBeVisible();

  await page.getByLabel("Delete Aceternity UI").click();
  await page.getByRole("button", { name: "Delete resource" }).click();
  await expect(page.getByText("Aceternity UI")).not.toBeVisible();
  await expect(page.getByText("React docs")).toBeVisible();
});
