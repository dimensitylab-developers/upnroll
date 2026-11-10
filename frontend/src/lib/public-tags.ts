import "server-only";
import { updateTag } from "next/cache";

/** Drop public cache tags after a mutation commits. No-op outside a Server Action. */
export function invalidatePublicTags(tags: string[]) {
  for (const tag of tags) {
    try {
      updateTag(tag);
    } catch (err) {
      if (err instanceof Error && err.message.includes("updateTag can only be called")) continue;
      throw err;
    }
  }
}
