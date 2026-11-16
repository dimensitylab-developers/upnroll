"use client";

import { useEffect, useState, type ChangeEvent, type ComponentProps, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SectionBanner } from "@/components/home/section-banner";
import { ageFromDob, isMinorAge } from "./grappler-schema";
import { PARENTAL_CONSENT_CLAUSES, WAIVER_CLAUSES, WAIVER_IMPORTANT } from "./waiver";
import { normalizeWeightBand, weightBandsForGender } from "./weight-bands";

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
  instagramHandle: string;
  academy: string;
  headCoach: string;
  beltRank: string;
  yearsTraining: string;
  pastRecord: string;
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
  hasParentalConsentImage?: boolean;
  parentalConsentImageVersion?: string;
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
  const controlled = typeof onChange === "function";
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
              {...(controlled
                ? { checked: value === option.value, onChange: () => onChange(option.value) }
                : { defaultChecked: value === option.value })}
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
  hasParentalConsentImage = false,
  parentalConsentImageVersion = "",
  waiverAcceptedAt,
  top,
  bottom,
  submitLabel,
  submitDisabled = false,
  onGenderChange,
}: GrapplerFormProps) {
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [aadhaarPreviewUrl, setAadhaarPreviewUrl] = useState<string | null>(null);
  const [consentPreviewUrl, setConsentPreviewUrl] = useState<string | null>(null);
  const [parentalConsentChecked, setParentalConsentChecked] = useState(false);
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
  const showParentalConsent = isMinorAge(Number(age));
  const parentalConsentRequired = showParentalConsent && !hasParentalConsentImage;

  useEffect(() => {
    return () => {
      if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl);
      if (aadhaarPreviewUrl) URL.revokeObjectURL(aadhaarPreviewUrl);
      if (consentPreviewUrl) URL.revokeObjectURL(consentPreviewUrl);
    };
  }, [photoPreviewUrl, aadhaarPreviewUrl, consentPreviewUrl]);

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

  function onConsentChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setConsentPreviewUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return file ? URL.createObjectURL(file) : null;
    });
  }

  function onDateOfBirthChange(event: ChangeEvent<HTMLInputElement>) {
    const iso = event.target.value;
    const calculated = ageFromDob(iso);
    setAge(calculated >= 0 ? String(calculated) : "");
    if (!isMinorAge(calculated)) setParentalConsentChecked(false);
  }

  const fieldErrorCount = errors ? Object.values(errors).filter((list) => list && list.length > 0).length : 0;

  useEffect(() => {
    if (!fieldErrorCount) return;
    const first = document.querySelector<HTMLElement>("[data-field-error='true']");
    first?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [fieldErrorCount, errors]);

  return (
    <form id={id} action={formAction} className="min-w-0 space-y-8">
      {state.error && <p className="text-sm text-primary">{state.error}</p>}
      {state.success && (
        <p className="border-2 border-black bg-white px-3 py-2 text-sm font-semibold text-brand-cyan shadow-[3px_3px_0_0_#000]">
          Profile saved to your account.
        </p>
      )}
      {fieldErrorCount > 0 && (
        <p className="border-2 border-black bg-white px-3 py-2 text-sm text-primary shadow-[3px_3px_0_0_#000]" role="alert">
          Could not save yet. Fix {fieldErrorCount} field{fieldErrorCount === 1 ? "" : "s"} highlighted below
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
              value={gender}
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
            <TextField label="State" name="cityState" errors={errors} defaultValue={values?.cityState} />
            <TextField label="Emergency contact name" name="emergencyContactName" errors={errors} defaultValue={values?.emergencyContactName} />
            <TextField label="Blood group" name="bloodGroup" errors={errors} defaultValue={values?.bloodGroup} />
            <TextField
              label="Instagram ID"
              name="instagramHandle"
              errors={errors}
              defaultValue={values?.instagramHandle}
              hint="Required. Username only (with or without @)."
              maxLength={60}
            />
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
                    src={photoPreviewUrl ?? `/api/v1/grappler/photo?v=${photoVersion}`}
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
              Any government ID proof
            </Label>
            <div className="border-2 border-black bg-white w-full aspect-[16/10] mb-2 overflow-hidden flex items-center justify-center">
              {aadhaarPreviewUrl || hasAadhaarImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={aadhaarPreviewUrl ?? `/api/v1/grappler/aadhaar?v=${aadhaarImageVersion}`}
                  alt="Government ID proof"
                  className="w-full h-full object-contain"
                />
              ) : (
                <span className="text-[10px] uppercase tracking-wider text-center px-2 text-muted-foreground">Any government ID proof</span>
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
              Clear photo of any government ID proof. JPG, PNG, or WebP, under 1.5 MB. Private to organizers only; never on public pages.
            </p>
            <FieldError name="aadhaarImage" errors={errors} />
          </div>
        )}

        {mode === "profile" && (
          <div className="max-w-md">
            <Label htmlFor="aadhaarImage" className="mb-1.5 block">
              Any government ID proof {hasAadhaarImage ? "(optional replace)" : "(optional)"}
            </Label>
            <div className="border-2 border-black bg-white w-full aspect-[16/10] mb-2 overflow-hidden flex items-center justify-center">
              {aadhaarPreviewUrl || hasAadhaarImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={aadhaarPreviewUrl ?? `/api/v1/grappler/aadhaar?v=${aadhaarImageVersion}`}
                  alt="Government ID proof"
                  className="w-full h-full object-contain"
                />
              ) : (
                <span className="text-[10px] uppercase tracking-wider text-center px-2 text-muted-foreground">No government ID proof yet</span>
              )}
            </div>
            <Input id="aadhaarImage" name="aadhaarImage" type="file" accept="image/jpeg,image/png,image/webp" onChange={onAadhaarChange} />
            <p className="mt-1 text-xs text-muted-foreground">
              Required when you register for an event. Any government ID proof. Private; never shown on public pages.
            </p>
            <FieldError name="aadhaarImage" errors={errors} />
          </div>
        )}
      </section>

      <section className="space-y-4">
        <SectionBanner>2. Competition details</SectionBanner>
        <div className="grid sm:grid-cols-2 gap-4">
          <TextField label="Academy name" name="academy" errors={errors} defaultValue={values?.academy} />
          <TextField label="Coach name" name="headCoach" errors={errors} defaultValue={values?.headCoach} />
          <div>
            <Label htmlFor="beltRank" className="mb-1.5 block">
              Belt
            </Label>
            <select
              id="beltRank"
              name="beltRank"
              required
              defaultValue={values?.beltRank || ""}
              className="flex h-10 w-full border-2 border-black bg-white px-3 text-sm"
            >
              <option value="" disabled>
                Select belt
              </option>
              <option value="White">White (Beginner)</option>
              <option value="Blue">Blue (Intermediate)</option>
              <option value="Purple">Purple (Intermediate)</option>
            </select>
            <p className="mt-1 text-xs text-muted-foreground">Beginner divisions: white only. Intermediate: blue or purple.</p>
            <FieldError name="beltRank" errors={errors} />
          </div>
          <TextField label="Training experience(in years)" name="yearsTraining" type="number" min={0} max={60} step="0.5" errors={errors} defaultValue={values?.yearsTraining} />
          <TextField
            label="Past grappling records"
            name="pastRecord"
            errors={errors}
            defaultValue={values?.pastRecord}
            hint="e.g. 2-1, first tournament, or club record."
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
              defaultValue={(() => {
                const band = normalizeWeightBand(values?.weightDivision ?? "", gender);
                return band && (weightBands as readonly string[]).includes(band) ? band : "";
              })()}
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

      <section className="min-w-0 space-y-4">
        <SectionBanner>4. Terms and conditions</SectionBanner>
        <ol className="w-full min-w-0 space-y-3 overflow-visible border-2 border-black bg-white p-4 text-sm">
          {WAIVER_CLAUSES.map((clause, index) => (
            <li key={clause} className="flex gap-2">
              <span className="w-5 shrink-0 text-right font-semibold tabular-nums">{index + 1}.</span>
              <span className="min-w-0 flex-1 break-words whitespace-normal leading-relaxed">{clause}</span>
            </li>
          ))}
        </ol>
        <p className="min-w-0 break-words border-2 border-black bg-amber-50 px-4 py-3 text-sm leading-relaxed">
          {WAIVER_IMPORTANT}
        </p>
        <p className="text-display uppercase tracking-wider text-brand-red text-sm">Thank you and see you on the mats!</p>
        <p className="text-sm text-muted-foreground">
          {waiverAcceptedAt
            ? `You agreed to these terms on ${new Date(waiverAcceptedAt).toLocaleDateString("en-IN")}.`
            : mode === "event"
              ? "Read these terms, then tick Consent and Agreement below before you continue."
              : "These are the terms that come with a grappler account."}
        </p>
      </section>

      {showParentalConsent && (
        <section className="min-w-0 space-y-4">
          <SectionBanner>5. Parental / guardian consent</SectionBanner>
          <p className="text-sm text-muted-foreground">
            This athlete is under 18. A parent or legal guardian must read the consent below and upload a signed consent form.
          </p>
          <ol className="w-full min-w-0 space-y-3 overflow-visible border-2 border-black bg-white p-4 text-sm">
            {PARENTAL_CONSENT_CLAUSES.map((clause, index) => (
              <li key={clause} className="flex gap-2">
                <span className="w-5 shrink-0 text-right font-semibold tabular-nums">{index + 1}.</span>
                <span className="min-w-0 flex-1 break-words whitespace-normal leading-relaxed">{clause}</span>
              </li>
            ))}
          </ol>
          <div className="max-w-md">
            <Label htmlFor="parentalConsentImage" className="mb-1.5 block">
              Signed parental consent 
            </Label>
            <div className="mb-2 flex aspect-[16/10] w-full items-center justify-center overflow-hidden border-2 border-black bg-white">
              {consentPreviewUrl || hasParentalConsentImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={consentPreviewUrl ?? `/api/v1/grappler/parental-consent?v=${parentalConsentImageVersion}`}
                  alt="Parental consent form"
                  className="h-full w-full object-contain"
                />
              ) : (
                <span className="px-2 text-center text-[10px] uppercase tracking-wider text-muted-foreground">
                  Upload signed consent 
                </span>
              )}
            </div>
            <Input
              id="parentalConsentImage"
              name="parentalConsentImage"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              required={parentalConsentRequired}
              onChange={onConsentChange}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Clear photo of the signed parental consent . JPG, PNG, or WebP, under 1.5 MB. Private to organizers only.
            </p>
            <FieldError name="parentalConsentImage" errors={errors} />
          </div>
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              name="parentalConsent"
              value="yes"
              className="mt-1"
              required={showParentalConsent}
              checked={parentalConsentChecked}
              onChange={(event) => setParentalConsentChecked(event.target.checked)}
            />
            <span>
              I am the parent or legal guardian (or I confirm a parent/guardian has signed) and I consent to this athlete competing.
            </span>
          </label>
          <FieldError name="parentalConsent" errors={errors} />
        </section>
      )}

      {bottom}

      <p className="text-xs text-muted-foreground">Incomplete forms are not accepted. Please fill in all required details.</p>
      <Button type="submit" disabled={pending || submitDisabled}>
        {pending ? "Saving…" : submitLabel ?? (mode === "event" ? "Continue to payment" : "Save profile")}
      </Button>
    </form>
  );
}
