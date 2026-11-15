import { escapeHtml } from "./escape";
import { wrapEmailLayout } from "./layout";
import { publicAbsoluteUrl } from "./site";
import type { EmailMessage } from "./tournament-confirmed";

export type SimpleEmailInput = {
  subject: string;
  /** Small red badge above the headline (e.g. "VERIFICATION"). */
  badge: string;
  headline: string;
  /** Plain-text paragraphs; also used as the text/plain body (joined by blank lines). */
  paragraphs: string[];
  /** Optional CTA button. */
  cta?: { label: string; href: string };
  preheader?: string;
  /** Greeting line shown bold at top of body (optional). */
  greeting?: string;
};

/** Generic branded HTML: shared chrome + white body (title + paragraphs + optional CTA). */
export function simpleEmail(input: SimpleEmailInput): EmailMessage {
  const paragraphs = input.paragraphs.map((p) => p.trim()).filter(Boolean);
  const bodyParts: string[] = [];
  if (input.greeting?.trim()) bodyParts.push(input.greeting.trim());
  bodyParts.push(...paragraphs);
  if (input.cta) bodyParts.push(`${input.cta.label}: ${resolveHref(input.cta.href)}`);
  const body = bodyParts.join("\n\n");

  const badge = escapeHtml(input.badge);
  const headline = escapeHtml(input.headline);
  const greetingHtml = input.greeting?.trim()
    ? `<p style="margin:0 0 14px;font-size:16px;line-height:26px;font-weight:bold;">${escapeHtml(input.greeting.trim())}</p>`
    : "";
  const paragraphsHtml = paragraphs
    .map(
      (p) =>
        `<p style="margin:0 0 16px;font-size:15px;line-height:25px;color:#494949;">${escapeHtml(p)}</p>`
    )
    .join("\n");

  let ctaHtml = "";
  if (input.cta) {
    const href = escapeHtml(resolveHref(input.cta.href));
    const label = escapeHtml(input.cta.label);
    ctaHtml = `<table role="presentation" style="margin-top:12px;margin-bottom:8px;"><tr><td bgcolor="#c8102e" align="center" style="background-color:#c8102e;mso-padding-alt:15px 24px;"><a href="${href}" style="display:inline-block;padding:15px 24px;border:1px solid #c8102e;font-size:13px;line-height:18px;font-weight:bold;letter-spacing:0.3px;color:#ffffff;text-decoration:none;">${label} &nbsp; &#8594;</a></td></tr></table>`;
  }

  const bodyHtml = `
<tr><td class="pad" style="padding:32px 40px 30px;">
<table role="presentation"><tr><td bgcolor="#c8102e" style="padding:7px 11px;background-color:#c8102e;color:#ffffff;font-size:10px;line-height:14px;font-weight:bold;letter-spacing:1.5px;">${badge}</td></tr></table>
<h1 style="margin:18px 0 18px;font-family:Arial,Helvetica,sans-serif;font-size:28px;line-height:34px;letter-spacing:-0.6px;font-weight:900;color:#171717;">${headline}</h1>
${greetingHtml}
${paragraphsHtml}
${ctaHtml}
<p style="margin:24px 0 0;font-size:14px;line-height:23px;color:#555555;">Team Up 'n Roll</p>
</td></tr>`;

  const html = wrapEmailLayout({
    title: input.subject,
    preheader: input.preheader ?? paragraphs[0],
    bodyHtml,
  });

  return { subject: input.subject, body, html };
}

function resolveHref(href: string): string {
  if (/^https?:\/\//i.test(href) || href.startsWith("mailto:")) return href;
  return publicAbsoluteUrl(href.startsWith("/") ? href : `/${href}`);
}
