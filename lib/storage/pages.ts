import { randomUUID } from "crypto";

import { loadDatabase, saveDatabase } from "./database";
import type { StoredBlock, StoredPage } from "./types";

export async function getPagesByUser(userId: string): Promise<StoredPage[]> {
  const db = await loadDatabase();
  return db.pages
    .filter((page) => page.userId === userId && !page.isArchived)
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
}

export async function getPageById(
  pageId: string
): Promise<StoredPage | undefined> {
  const db = await loadDatabase();
  return db.pages.find((page) => page.id === pageId);
}

export async function createPage(
  userId: string,
  title = "Sin título"
): Promise<StoredPage> {
  const db = await loadDatabase();
  const now = new Date().toISOString();
  const normalizedTitle = title.trim() || "Sin título";

  const newPage: StoredPage = {
    id: randomUUID(),
    userId,
    title: normalizedTitle,
    isArchived: false,
    position: db.pages.filter((page) => page.userId === userId).length,
    createdAt: now,
    updatedAt: now,
  };

  db.pages.push(newPage);
  await saveDatabase(db);

  return newPage;
}

export async function updatePageTitle(
  pageId: string,
  title: string
): Promise<StoredPage | undefined> {
  const db = await loadDatabase();
  const page = db.pages.find((item) => item.id === pageId);

  if (!page) {
    return undefined;
  }

  page.title = title.trim() || "Sin título";
  page.updatedAt = new Date().toISOString();

  await saveDatabase(db);
  return page;
}

export async function deletePage(pageId: string): Promise<void> {
  const db = await loadDatabase();
  db.pages = db.pages.filter((page) => page.id !== pageId);
  db.blocks = db.blocks.filter((block) => block.pageId !== pageId);
  await saveDatabase(db);
}

export async function getBlocksByPage(pageId: string): Promise<StoredBlock[]> {
  const db = await loadDatabase();
  return db.blocks
    .filter((block) => block.pageId === pageId)
    .sort((a, b) => a.position - b.position);
}

export async function replaceBlocks(
  pageId: string,
  userId: string,
  blocks: Array<
    Omit<StoredBlock, "id" | "createdAt" | "updatedAt"> & { id?: string }
  >
) {
  const db = await loadDatabase();
  const now = new Date().toISOString();

  db.blocks = db.blocks.filter((block) => block.pageId !== pageId);

  const normalized = blocks.map((block, index) => ({
    id: block.id ?? randomUUID(),
    pageId,
    userId,
    type: block.type,
    content: block.content,
    position: index,
    properties: block.properties ?? {},
    createdAt: block.createdAt ?? now,
    updatedAt: now,
  }));

  db.blocks.push(...normalized);
  const page = db.pages.find((item) => item.id === pageId);
  if (page) {
    page.updatedAt = now;
  }

  await saveDatabase(db);
}
