"use client";

import { useState } from "react";
import { Chapter, FixtureBadge } from "../chapter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { previewEvent } from "@/lib/preview/fixtures";
import { CheckCircle2 } from "lucide-react";

const steps = ["Event & division", "Fighter details", "Review"];

export function RegistrationFlow() {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [division, setDivision] = useState("");
  const [touched, setTouched] = useState(false);
  const canAdvance = step === 0 ? !!division : step === 1 ? name.trim().length > 1 : true;

  return (
    <Chapter id="registration" title="Fighter Registration" subtitle="Interactive multi-step form, moves through example stages locally — no registration is actually created.">
      <div className="manga-panel p-8 max-w-xl">
        <div className="flex items-center gap-2 mb-6 text-xs text-muted-foreground">
          {steps.map((s, i) => (
            <span key={s} className={`flex items-center gap-1 ${i === step ? "text-foreground font-medium" : ""}`}>
              {i > 0 && <span className="mx-1">/</span>}
              {s}
            </span>
          ))}
        </div>

        {step === 0 && (
          <div className="space-y-4">
            <p className="font-semibold">{previewEvent.name}</p>
            <div>
              <Label className="mb-1.5 block">Division</Label>
              <Select value={division} onValueChange={setDivision}>
                <SelectTrigger><SelectValue placeholder="Select a division" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Lightweight">Lightweight</SelectItem>
                  <SelectItem value="Welterweight">Welterweight</SelectItem>
                  <SelectItem value="Featherweight">Featherweight</SelectItem>
                </SelectContent>
              </Select>
              {touched && !division && <p className="text-xs text-primary mt-1">Select a division to continue.</p>}
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <Label className="mb-1.5 block">Display name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="As it should appear publicly" />
              {touched && name.trim().length <= 1 && <p className="text-xs text-primary mt-1">Enter your display name.</p>}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-brand-cyan mb-3"><CheckCircle2 className="size-4" /> Ready to submit</div>
            <p><span className="text-muted-foreground">Event:</span> {previewEvent.name}</p>
            <p><span className="text-muted-foreground">Division:</span> {division}</p>
            <p><span className="text-muted-foreground">Name:</span> {name}</p>
            <p className="text-muted-foreground mt-3">Next step after submission: QR payment (Chapter 11) — no payment occurs yet.</p>
          </div>
        )}

        <div className="flex justify-between mt-8">
          <Button variant="ghost" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>Back</Button>
          {step < 2 ? (
            <Button onClick={() => (canAdvance ? setStep((s) => s + 1) : setTouched(true))}>Continue</Button>
          ) : (
            <Button onClick={() => setStep(0)}>Restart demo</Button>
          )}
        </div>
      </div>
      <FixtureBadge>Validation feedback is simulated — no registration record is created</FixtureBadge>
    </Chapter>
  );
}
