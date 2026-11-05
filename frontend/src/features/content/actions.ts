"use server";

import { revalidatePath } from "next/cache";
import { requireActor } from "@/server/auth/session";
import { createContentEntry, setContentPublicationState } from "@/server/services/contentService";
import { toAppError } from "@/server/http/errors";
import { createContentSchema } from "./schemas";

export type ContentActionState = { error?: string };

export async function createContentAction(_prevState: ContentActionState, formData: FormData): Promise<ContentActionState> {
  const actor = await requireActor("ADMIN");

  const parsed = createContentSchema.safeParse({
    type: formData.get("type"),
    title: formData.get("title"),
    body: formData.get("body"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the content fields and try again." };
  }

  try {
    await createContentEntry(actor, parsed.data);
  } catch (err) {
    return { error: toAppError(err).message };
  }

  revalidatePath("/admin/content");
  return {};
}

export async function publishContentAction(_prevState: ContentActionState, formData: FormData): Promise<ContentActionState> {
  const actor = await requireActor("ADMIN");
  const entryId = String(formData.get("entryId") ?? "");
  const state = String(formData.get("state") ?? "PUBLISHED") as "DRAFT" | "PUBLISHED";

  try {
    await setContentPublicationState(actor, entryId, state);
  } catch (err) {
    return { error: toAppError(err).message };
  }

  revalidatePath("/admin/content");
  return {};
}
