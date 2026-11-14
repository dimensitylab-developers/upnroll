"use client";

import { useEffect, useState, type ChangeEvent, type ComponentProps, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SectionBanner } from "@/components/home/section-banner";
import { ageFromDob } from "./grappler-schema";
import { WAIVER_CLAUSES, WAIVER_IMPORTANT } from "./waiver";
import { weightBandsForGender } from "./weight-bands";

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
  cityState: string;
  emergencyContactName: string;
  emergencyRelationship: string;
  bloodGroup: string;
  academy: string;
  headCoach: string;
  beltRank: string;
  yearsTraining: string;
  pastRecord: string;
  weightDivision: string;
  instagramHandle: string;
  heardAbout: string;
  hasMedicalCondition: string;
  medicalConditionDetail: string;
  hasAllergies: string;
  allergiesDetail: string;
  takingMedication: string;
  medicallyFit: string;
};

type GrapplerFormProps = {
  id?: string;
  mode: "profile" | "event";
  state: GrapplerFormState;
  formAction: (payload: FormData) => void;
  pending: boolean;
  defaults?: GrapplerDefaults;
  hasPhoto?: boolean;
  photoVersion?: string;
  hasAadhaarImage?: boolean;
  aadhaarImageVersion?: string;
  waiverAcceptedAt?: string | null;
  top?: ReactNode;
  bottom?: ReactNode;
  submitLabel?: string;
  submitDisabled?: boolean;
  onGenderChange?: (gender: string) => void;
};

function FieldError({ name, errors }: { name: string; errors?: GrapplerFormState["fieldErrors"] }) {
  const message = errors?.[name]?.[0];
  if (!message) return null;
  return (
    <p className="mt-1 text-xs text-primary" data-field-error="true">
      {message}
    </p>
  );
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
  onChange,
}: {
  legend: string;
  name: string;
  options: { value: string; label: string }[];
  value?: string;
  errors?: GrapplerFormState["fieldErrors"];
  onChange?: (value: string) => void;
}) {
  return (
    <fieldset>
      <legend className="text-sm font-medium mb-1.5">{legend}</legend>
      <div className="flex flex-wrap gap-4">
        {options.map((option) => (
          <label key={option.value} className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name={name}
              value={option.value}
              required
              defaultChecked={value === option.value}
              onChange={() => onChange?.(option.value)}
            />
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
  id,
  mode,
  state,
  formAction,
  pending,
  defaults,
  hasPhoto = false,
  photoVersion = "",
  hasAadhaarImage = false,
  aadhaarImageVersion = "",
  waiverAcceptedAt,
  top,
  bottom,
  submitLabel,
  submitDisabled = false,
  onGenderChange,
}: GrapplerFormProps) {
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [aadhaarPreviewUrl, setAadhaarPreviewUrl] = useState<string | null>(null);
  const values = defaults;
  const errors = state.fieldErrors;
  const aadhaarRequired = mode === "event" && !hasAadhaarImage;
  const initialAge = (() => {
    if (values?.dateOfBirth) {
      const fromDob = ageFromDob(values.dateOfBirth);
      if (fromDob >= 0) return String(fromDob);
    }
    return values?.age ?? "";
  })();
  const [age, setAge] = useState(initialAge);
  const [gender, setGender] = useState(values?.gender ?? "");
  const weightBands = weightBandsForGender(gender);

  useEffect(() => {
    return () => {
      if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl);
      if (aadhaarPreviewUrl) URL.revokeObjectURL(aadhaarPreviewUrl);
    };
  }, [photoPreviewUrl, aadhaarPreviewUrl]);

  function onPhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setPhotoPreviewUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return file ? URL.createObjectURL(file) : null;
    });
  }

  function onAadhaarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setAadhaarPreviewUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return file ? URL.createObjectURL(file) : null;
    });
  }

  function onDateOfBirthChange(event: ChangeEvent<HTMLInputElement>) {
    const iso = event.target.value;
    const calculated = ageFromDob(iso);
    setAge(calculated >= 0 ? String(calculated) : "");
  }

  const fieldErrorCount = errors ? Object.values(errors).filter((list) => list && list.length > 0).length : 0;

  useEffect(() => {
    if (!fieldErrorCount) return;
    const first = document.querySelector<HTMLElement>("[data-field-error='true']");
    first?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [fieldErrorCount, errors]);

  return (
    <form id={id} action={formAction} className="space-y-8">
      {state.error && <p className="text-sm text-primary">{state.error}</p>}
      {state.success && (
        <p className="border-2 border-black bg-white px-3 py-2 text-sm font-semibold text-brand-cyan shadow-[3px_3px_0_0_#000]">
          Profile saved to your account.
        </p>
      )}
      {fieldErrorCount > 0 && (
        <p className="border-2 border-black bg-white px-3 py-2 text-sm text-primary shadow-[3px_3px_0_0_#000]" role="alert">
          Could not save yet — fix {fieldErrorCount} field{fieldErrorCount === 1 ? "" : "s"} highlighted below
          (medical fitness must be Yes, and required grappler details cannot be blank).
        </p>
      )}
      {top}

      <section className="space-y-4">
        <SectionBanner>1. Personal information</SectionBanner>
        <div className={`grid items-start gap-4 ${mode === "profile" ? "lg:grid-cols-[1fr_9rem]" : ""}`}>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="Full name (as per ID)" name="displayName" errors={errors} defaultValue={values?.displayName} autoComplete="name" />
            <div>
              <Label htmlFor="dateOfBirth" className="mb-1.5 block">
                Date of birth
              </Label>
              <Input
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                required
                defaultValue={values?.dateOfBirth}
                autoComplete="bday"
                onChange={onDateOfBirthChange}
              />
              <FieldError name="dateOfBirth" errors={errors} />
            </div>
            <div>
              <Label htmlFor="age" className="mb-1.5 block">
                Age
              </Label>
              <Input
                id="age"
                name="age"
                type="number"
                min={5}
                max={80}
                required
                readOnly
                value={age}
                aria-describedby="age-hint"
              />
              <p id="age-hint" className="mt-1 text-xs text-muted-foreground">
                Calculated from date of birth.
              </p>
              <FieldError name="age" errors={errors} />
            </div>
            <Choice
              legend="Gender"
              name="gender"
              value={values?.gender}
              errors={errors}
              onChange={(next) => {
                setGender(next);
                onGenderChange?.(next);
              }}
              options={[
                { value: "Male", label: "Male" },
                { value: "Female", label: "Female" },
                { value: "Other", label: "Other" },
              ]}
            />
            <TextField label="Mobile number" name="mobile" type="tel" errors={errors} defaultValue={values?.mobile} autoComplete="tel" />
            <TextField label="Nationality" name="nationality" errors={errors} defaultValue={values?.nationality} autoComplete="country-name" />
            <TextField label="City / State" name="cityState" errors={errors} defaultValue={values?.cityState} />
            <TextField label="Emergency contact name" name="emergencyContactName" errors={errors} defaultValue={values?.emergencyContactName} />
            <TextField label="Relationship" name="emergencyRelationship" errors={errors} defaultValue={values?.emergencyRelationship} />
            <TextField label="Blood group (optional)" name="bloodGroup" required={false} errors={errors} defaultValue={values?.bloodGroup} />
          </div>
          {mode === "profile" && (
            <div>
              <Label htmlFor="photo" className="mb-1.5 block">
                Passport size photograph
              </Label>
              <div className="border-2 border-black bg-white w-full aspect-[3/4] mb-2 overflow-hidden flex items-center justify-center">
                {photoPreviewUrl || hasPhoto ? (
                  // Chosen file shows immediately. Saved photos stay on the signed-in fighter's route.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={photoPreviewUrl ?? `/api/v1/fighter/photo?v=${photoVersion}`}
                    alt="Passport size photograph"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span className="text-[10px] uppercase tracking-wider text-center px-2 text-muted-foreground">Passport size photograph</span>
                )}
              </div>
              <Input id="photo" name="photo" type="file" accept="image/jpeg,image/png,image/webp" onChange={onPhotoChange} />
              <p className="mt-1 text-xs text-muted-foreground">JPG, PNG, or WebP, under 1.5 MB. Shown on your public grappler card.</p>
            </div>
          )}
        </div>

        {mode === "event" && (
          <div className="max-w-md">
            <Label htmlFor="aadhaarImage" className="mb-1.5 block">
              Identity proof image
            </Label>
            <div className="border-2 border-black bg-white w-full aspect-[16/10] mb-2 overflow-hidden flex items-center justify-center">
              {aadhaarPreviewUrl || hasAadhaarImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={aadhaarPreviewUrl ?? `/api/v1/fighter/aadhaar?v=${aadhaarImageVersion}`}
                  alt="Identity proof"
                  className="w-full h-full object-contain"
                />
              ) : (
                <span className="text-[10px] uppercase tracking-wider text-center px-2 text-muted-foreground">Identity proof image</span>
              )}
            </div>
            <Input
              id="aadhaarImage"
              name="aadhaarImage"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              required={aadhaarRequired}
              onChange={onAadhaarChange}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Clear photo of government identity proof. JPG, PNG, or WebP, under 1.5 MB. Private — organizers only; never on public pages.
            </p>
            <FieldError name="aadhaarImage" errors={errors} />
          </div>
        )}

        {mode === "profile" && (
          <div className="max-w-md">
            <Label htmlFor="aadhaarImage" className="mb-1.5 block">
              Identity proof image {hasAadhaarImage ? "(optional replace)" : "(optional)"}
            </Label>
            <div className="border-2 border-black bg-white w-full aspect-[16/10] mb-2 overflow-hidden flex items-center justify-center">
              {aadhaarPreviewUrl || hasAadhaarImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={aadhaarPreviewUrl ?? `/api/v1/fighter/aadhaar?v=${aadhaarImageVersion}`}
                  alt="Identity proof"
                  className="w-full h-full object-contain"
                />
              ) : (
                <span className="text-[10px] uppercase tracking-wider text-center px-2 text-muted-foreground">No identity proof yet</span>
              )}
            </div>
            <Input id="aadhaarImage" name="aadhaarImage" type="file" accept="image/jpeg,image/png,image/webp" onChange={onAadhaarChange} />
            <p className="mt-1 text-xs text-muted-foreground">
              Required when you register for an event. Private — never shown on public pages.
            </p>
            <FieldError name="aadhaarImage" errors={errors} />
          </div>
        )}
      </section>

      <section className="space-y-4">
        <SectionBanner>2. Competition details</SectionBanner>
        <div className="grid sm:grid-cols-2 gap-4">
          <TextField label="Academy / team name" name="academy" errors={errors} defaultValue={values?.academy} />
          <TextField label="Head coach / coach name" name="headCoach" errors={errors} defaultValue={values?.headCoach} />
          <TextField label="Belt rank" name="beltRank" errors={errors} defaultValue={values?.beltRank} />
          <TextField label="Years training" name="yearsTraining" type="number" min={0} max={60} step="0.5" errors={errors} defaultValue={values?.yearsTraining} />
          <TextField
            label="Past record"
            name="pastRecord"
            errors={errors}
            defaultValue={values?.pastRecord}
            hint="e.g. 2–1, first tournament, or club record."
          />
          <div>
            <Label htmlFor="weightDivision" className="mb-1.5 block">
              Weight division
            </Label>
            <select
              key={gender || "weight"}
              id="weightDivision"
              name="weightDivision"
              required
              defaultValue={
                values?.weightDivision && (weightBands as readonly string[]).includes(values.weightDivision)
                  ? values.weightDivision
                  : ""
              }
              className="flex h-10 w-full rounded-none border-2 border-black bg-white px-3 py-2 text-sm"
            >
              <option value="" disabled>
                {gender ? "Select weight class" : "Select gender first"}
              </option>
              {weightBands.map((band) => (
                <option key={band} value={band}>
                  {band}
                </option>
              ))}
            </select>
            <FieldError name="weightDivision" errors={errors} />
          </div>
          <TextField
            label="Instagram handle"
            name="instagramHandle"
            errors={errors}
            defaultValue={values?.instagramHandle}
            autoComplete="username"
            hint="Required. With or without @."
          />
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
          <Choice
            legend="Are you currently taking any medication, steroids, PEDs, or other drugs?"
            name="takingMedication"
            options={YES_NO}
            value={values?.takingMedication}
            errors={errors}
          />
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
        <p className="text-sm text-muted-foreground">
          {waiverAcceptedAt
            ? `You agreed to these terms on ${new Date(waiverAcceptedAt).toLocaleDateString("en-IN")}.`
            : mode === "event"
              ? "Read these terms, then tick Consent and Agreement below before you continue."
              : "These are the terms that come with a grappler account."}
        </p>
      </section>

      {bottom}

      <p className="text-xs text-muted-foreground">Incomplete forms are not accepted. Please fill in all required details.</p>
      <Button type="submit" disabled={pending || submitDisabled}>
        {pending ? "Saving…" : submitLabel ?? (mode === "event" ? "Continue to payment" : "Save profile")}
      </Button>
    </form>
  );
}
