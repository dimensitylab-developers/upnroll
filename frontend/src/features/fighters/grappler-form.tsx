"use client";

import { useState, type ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SectionBanner } from "@/components/home/section-banner";
import { WAIVER_CLAUSES, WAIVER_IMPORTANT } from "./waiver";

export type GrapplerFormState = {
  error?: string;
  success?: boolean;
  fieldErrors?: Record<string, string[] | undefined>;
};

export type GrapplerDefaults = {
  displayName: string;
  dateOfBirth: string;
  age: string;
  gender: string;
  mobile: string;
  nationality: string;
  aadhaar: string;
  cityState: string;
  emergencyContactName: string;
  emergencyRelationship: string;
  bloodGroup: string;
  academy: string;
  headCoach: string;
  beltRank: string;
  yearsTraining: string;
  weightDivision: string;
  heardAbout: string;
  hasMedicalCondition: string;
  medicalConditionDetail: string;
  hasAllergies: string;
  allergiesDetail: string;
  takingMedication: string;
  medicallyFit: string;
};

type GrapplerFormProps = {
  mode: "register" | "profile";
  state: GrapplerFormState;
  formAction: (payload: FormData) => void;
  pending: boolean;
  defaults?: GrapplerDefaults;
  hasPhoto?: boolean;
  photoVersion?: string;
  waiverAcceptedAt?: string | null;
};

function FieldError({ name, errors }: { name: string; errors?: GrapplerFormState["fieldErrors"] }) {
  const message = errors?.[name]?.[0];
  if (!message) return null;
  return <p className="text-xs text-primary mt-1">{message}</p>;
}

function TextField({
  label,
  name,
  errors,
  defaultValue,
  type = "text",
  required = true,
  autoComplete,
  hint,
  ...rest
}: {
  label: string;
  name: string;
  errors?: GrapplerFormState["fieldErrors"];
  defaultValue?: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  hint?: string;
} & Pick<ComponentProps<"input">, "inputMode" | "maxLength" | "min" | "max" | "step">) {
  return (
    <div>
      <Label htmlFor={name} className="mb-1.5 block">{label}</Label>
      <Input id={name} name={name} type={type} required={required} defaultValue={defaultValue} autoComplete={autoComplete} {...rest} />
      {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
      <FieldError name={name} errors={errors} />
    </div>
  );
}

function Choice({
  legend,
  name,
  options,
  value,
  errors,
}: {
  legend: string;
  name: string;
  options: { value: string; label: string }[];
  value?: string;
  errors?: GrapplerFormState["fieldErrors"];
}) {
  return (
    <fieldset>
      <legend className="text-sm font-medium mb-1.5">{legend}</legend>
      <div className="flex flex-wrap gap-4">
        {options.map((option) => (
          <label key={option.value} className="flex items-center gap-2 text-sm">
            <input type="radio" name={name} value={option.value} required defaultChecked={value === option.value} />
            {option.label}
          </label>
        ))}
      </div>
      <FieldError name={name} errors={errors} />
    </fieldset>
  );
}

const YES_NO = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
];

export function GrapplerForm({
  mode,
  state,
  formAction,
  pending,
  defaults,
  hasPhoto = false,
  photoVersion = "",
  waiverAcceptedAt,
}: GrapplerFormProps) {
  const [agreed, setAgreed] = useState(mode === "profile");
  const values = defaults;
  const errors = state.fieldErrors;

  return (
    <form action={formAction} className="space-y-8">
      {state.error && <p className="text-sm text-primary">{state.error}</p>}
      {state.success && <p className="text-sm text-brand-cyan">Profile updated.</p>}

      <section className="space-y-4">
        <SectionBanner>1. Personal information</SectionBanner>
        <div className="grid lg:grid-cols-[1fr_9rem] gap-4 items-start">
          <div className="grid sm:grid-cols-2 gap-4">
            <TextField label="Full name (as per ID)" name="displayName" errors={errors} defaultValue={values?.displayName} autoComplete="name" />
            <TextField label="Date of birth" name="dateOfBirth" type="date" errors={errors} defaultValue={values?.dateOfBirth} autoComplete="bday" />
            <TextField label="Age" name="age" type="number" min={5} max={80} errors={errors} defaultValue={values?.age} />
            <Choice
              legend="Gender"
              name="gender"
              value={values?.gender}
              errors={errors}
              options={[
                { value: "Male", label: "Male" },
                { value: "Female", label: "Female" },
                { value: "Other", label: "Other" },
              ]}
            />
            <TextField label="Mobile number" name="mobile" type="tel" errors={errors} defaultValue={values?.mobile} autoComplete="tel" />
            {mode === "register" && (
              <TextField label="Email address" name="email" type="email" errors={errors} autoComplete="email" />
            )}
            <TextField label="Nationality" name="nationality" errors={errors} defaultValue={values?.nationality} autoComplete="country-name" />
            <TextField
              label="Aadhaar card number (12 digit)"
              name="aadhaar"
              inputMode="numeric"
              maxLength={12}
              errors={errors}
              defaultValue={values?.aadhaar}
              hint="Shown only on your profile, never on public pages."
            />
            <TextField label="City / State" name="cityState" errors={errors} defaultValue={values?.cityState} />
            <TextField label="Emergency contact name" name="emergencyContactName" errors={errors} defaultValue={values?.emergencyContactName} />
            <TextField label="Relationship" name="emergencyRelationship" errors={errors} defaultValue={values?.emergencyRelationship} />
            <TextField label="Blood group (optional)" name="bloodGroup" required={false} errors={errors} defaultValue={values?.bloodGroup} />
          </div>
          <div>
            <Label htmlFor="photo" className="mb-1.5 block">Passport size photograph</Label>
            <div className="border-2 border-black bg-white w-full aspect-[3/4] mb-2 overflow-hidden flex items-center justify-center">
              {hasPhoto ? (
                // The route only serves the signed-in fighter's own photograph.
                // eslint-disable-next-line @next/next/no-img-element
                <img src={`/api/v1/fighter/photo?v=${photoVersion}`} alt="Passport size photograph" className="w-full h-full object-cover" />
              ) : (
                <span className="text-[10px] uppercase tracking-wider text-center px-2 text-muted-foreground">Passport size photograph</span>
              )}
            </div>
            <Input id="photo" name="photo" type="file" accept="image/jpeg,image/png,image/webp" required={mode === "register"} />
            <p className="text-xs text-muted-foreground mt-1">JPG, PNG, or WebP, under 1.5 MB.</p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <SectionBanner>2. Competition details</SectionBanner>
        <div className="grid sm:grid-cols-2 gap-4">
          <TextField label="Academy / team name" name="academy" errors={errors} defaultValue={values?.academy} />
          <TextField label="Head coach / coach name" name="headCoach" errors={errors} defaultValue={values?.headCoach} />
          <TextField label="Belt rank" name="beltRank" errors={errors} defaultValue={values?.beltRank} />
          <TextField label="Years training" name="yearsTraining" type="number" min={0} max={60} step="0.5" errors={errors} defaultValue={values?.yearsTraining} />
          <TextField label="Weight division" name="weightDivision" errors={errors} defaultValue={values?.weightDivision} />
          <TextField label="How did you hear about Up ’n Roll?" name="heardAbout" errors={errors} defaultValue={values?.heardAbout} />
        </div>
      </section>

      <section className="space-y-4">
        <SectionBanner>3. Medical information</SectionBanner>
        <div className="grid sm:grid-cols-2 gap-4">
          <Choice legend="Do you have any medical condition / injury?" name="hasMedicalCondition" options={YES_NO} value={values?.hasMedicalCondition} errors={errors} />
          <div className="sm:col-span-2">
            <Label htmlFor="medicalConditionDetail" className="mb-1.5 block">If yes, please specify</Label>
            <Textarea id="medicalConditionDetail" name="medicalConditionDetail" defaultValue={values?.medicalConditionDetail} />
            <FieldError name="medicalConditionDetail" errors={errors} />
          </div>
          <Choice legend="Any allergies?" name="hasAllergies" options={YES_NO} value={values?.hasAllergies} errors={errors} />
          <div className="sm:col-span-2">
            <Label htmlFor="allergiesDetail" className="mb-1.5 block">If yes, please specify</Label>
            <Textarea id="allergiesDetail" name="allergiesDetail" defaultValue={values?.allergiesDetail} />
            <FieldError name="allergiesDetail" errors={errors} />
          </div>
          <Choice legend="Are you currently taking any medication?" name="takingMedication" options={YES_NO} value={values?.takingMedication} errors={errors} />
          <Choice legend="Are you medically fit to compete?" name="medicallyFit" options={YES_NO} value={values?.medicallyFit} errors={errors} />
        </div>
      </section>

      <section className="space-y-4">
        <SectionBanner>4. Terms and conditions</SectionBanner>
        <ol className="list-decimal pl-5 space-y-2 text-sm border-2 border-black bg-white p-4">
          {WAIVER_CLAUSES.map((clause) => (
            <li key={clause}>{clause}</li>
          ))}
        </ol>
        <p className="border-2 border-black bg-amber-50 px-4 py-3 text-sm">{WAIVER_IMPORTANT}</p>
        <p className="text-display uppercase tracking-wider text-brand-red text-sm">Thank you and see you on the mats!</p>
        {mode === "register" ? (
          <label className="flex items-start gap-2 text-sm font-medium">
            <input
              type="checkbox"
              name="agree"
              value="yes"
              checked={agreed}
              onChange={(event) => setAgreed(event.target.checked)}
              className="mt-1"
            />
            I agree to all the above terms and conditions.
          </label>
        ) : (
          <p className="text-sm text-muted-foreground">
            {waiverAcceptedAt
              ? `You agreed to these terms on ${new Date(waiverAcceptedAt).toLocaleDateString("en-IN")}.`
              : "These are the terms that come with a fighter account."}
          </p>
        )}
        <FieldError name="agree" errors={errors} />
      </section>

      {mode === "register" && (
        <section className="space-y-4">
          <SectionBanner>Account</SectionBanner>
          <div className="max-w-sm">
            <TextField label="Password" name="password" type="password" errors={errors} autoComplete="new-password" hint="At least 10 characters, with a letter and a number." />
          </div>
        </section>
      )}

      <p className="text-xs text-muted-foreground">Incomplete forms are not accepted. Please fill in all required details.</p>
      <Button type="submit" disabled={pending || !agreed}>
        {pending ? "Saving…" : mode === "register" ? "Create account" : "Save profile"}
      </Button>
    </form>
  );
}
