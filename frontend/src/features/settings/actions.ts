"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { invalidatePublicTags } from "@/lib/public-tags";
import { requireActor, requireSession } from "@/server/auth/session";
import { updateUserDisplayName } from "@/server/auth/display-name";
import { updateSiteSettings } from "@/server/services/siteSettingsService";
import { toAppError } from "@/server/http/errors";
import { updateSiteSettingsSchema } from "./schemas";

export type SettingsActionState = { error?: string; ok?: boolean; savedName?: string };

const houseNameSchema = z.object({
  displayName: z.string().trim().min(2, "Enter at least 2 characters.").max(80),
});

export async function updateSiteSettingsAction(
  _prev: SettingsActionState,
  formData: FormData
): Promise<SettingsActionState> {
  const actor = await requireActor("ADMIN");
  const parsed = updateSiteSettingsSchema.safeParse({
    instagramHandle: formData.get("instagramHandle"),
    email: formData.get("email") ?? "",
    phoneDisplay: formData.get("phoneDisplay") ?? "",
    phoneTel: formData.get("phoneTel") ?? "",
    city: formData.get("city"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the settings and try again." };
  }

  try {
    await updateSiteSettings(actor, parsed.data);
    invalidatePublicTags(["site-settings"]);
  } catch (err) {
    return { error: toAppError(err).message };
  }

  revalidatePath("/admin/settings");
  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/faq");
  return { ok: true };
}

export async function updateHouseNameAction(
  _prev: SettingsActionState,
  formData: FormData
): Promise<SettingsActionState> {
  const session = await requireSession();
  if (session.user.role !== "ADMIN") {
    return { error: "Only house accounts can set this name." };
  }

  const raw = formData.get("displayName");
  const parsed = houseNameSchema.safeParse({
    displayName: typeof raw === "string" ? raw : "",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check your name and try again." };
  }

  let savedName: string;
  try {
    savedName = await updateUserDisplayName(session.user._id, parsed.data.displayName);
  } catch (err) {
    return { error: toAppError(err).message };
  }

  revalidatePath("/admin", "layout");
  revalidatePath("/admin/settings", "page");
  return { ok: true, savedName };
}
