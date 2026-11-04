"use client";

import { useActionState } from "react";
import { publishBracketAction, type BracketActionState } from "./actions";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

const initialState: BracketActionState = {};

export function PublishBracketButton({ eventId, bracketId }: { eventId: string; bracketId: string }) {
  const [state, formAction, pending] = useActionState(publishBracketAction, initialState);

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button type="button">Publish bracket</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Publish this bracket?</AlertDialogTitle>
          <AlertDialogDescription>
            This makes the bracket visible to the public and locks in the current matchups. This can&apos;t be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {state.error && <p className="text-sm text-primary">{state.error}</p>}
        <form action={formAction}>
          <input type="hidden" name="eventId" value={eventId} />
          <input type="hidden" name="bracketId" value={bracketId} />
          <AlertDialogFooter>
            <AlertDialogCancel type="button">Cancel</AlertDialogCancel>
            <AlertDialogAction type="submit" disabled={pending}>
              {pending ? "Publishing…" : "Publish"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
