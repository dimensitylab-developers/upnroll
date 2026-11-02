"use client";

import { useActionState } from "react";
import { publishContentAction, type ContentActionState } from "./actions";
import { Button } from "@/components/ui/button";

const initialState: ContentActionState = {};

export function PublishToggleButton({ entryId, currentState }: { entryId: string; currentState: string }) {
  const [, formAction, pending] = useActionState(publishContentAction, initialState);
  const nextState = currentState === "PUBLISHED" ? "DRAFT" : "PUBLISHED";

  return (
    <form action={formAction}>
      <input type="hidden" name="entryId" value={entryId} />
      <input type="hidden" name="state" value={nextState} />
      <Button type="submit" size="sm" variant="outline" disabled={pending}>
        {currentState === "PUBLISHED" ? "Unpublish" : "Publish"}
      </Button>
    </form>
  );
}
