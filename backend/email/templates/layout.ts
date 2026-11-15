import { CONTACT_EMAIL, getPublicSiteUrl, publicAbsoluteUrl } from "./site";
import { escapeHtml } from "./escape";

const PAGE_BG = "#f3efe8";
const ACCENT = "#c8102e";

export type LayoutChromeInput = {
  title: string;
  preheader?: string;
  /** Inner HTML for the white card body (between header and footer). */
  bodyHtml: string;
};

function siteHostLabel(origin: string): string {
  try {
    return new URL(origin).host;
  } catch {
    return origin.replace(/^https?:\/\//, "");
  }
}

/** Shared cream page, red brand bar, logo header, and footer. */
export function wrapEmailLayout(input: LayoutChromeInput): string {
  const siteUrl = getPublicSiteUrl();
  const logoUrl = publicAbsoluteUrl("/logo-wordmark.png");
  const host = siteHostLabel(siteUrl);
  const title = escapeHtml(input.title);
  const preheader = input.preheader ? escapeHtml(input.preheader) : "";
  const contact = escapeHtml(CONTACT_EMAIL);

  return `<!DOCTYPE html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="color-scheme" content="light"><meta name="supported-color-schemes" content="light"><title>${title}</title>
<!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml><![endif]-->
<style>body,table,td,a{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}table,td{mso-table-lspace:0pt;mso-table-rspace:0pt}table{border-collapse:collapse}img{border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic}body{margin:0;padding:0;width:100%!important}a[x-apple-data-detectors]{color:inherit!important;text-decoration:none!important}@media screen and (max-width:620px){.outer{padding:16px 10px!important}.pad{padding-left:24px!important;padding-right:24px!important}.headline{font-size:36px!important;line-height:39px!important}.brand{width:180px!important;height:auto!important}.detail-label{width:100px!important}.brand-note{font-size:9px!important;letter-spacing:1px!important}}</style></head>
<body style="margin:0;padding:0;background-color:${PAGE_BG};font-family:Arial,Helvetica,sans-serif;color:#171717;">
${preheader ? `<div style="display:none;font-size:1px;color:${PAGE_BG};line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">${preheader}</div>` : ""}
<table role="presentation" width="100%" bgcolor="${PAGE_BG}"><tr><td class="outer" align="center" style="padding:40px 16px;">
<!--[if mso]><table role="presentation" width="600" align="center"><tr><td><![endif]-->
<table role="presentation" width="100%" style="max-width:600px;background-color:#ffffff;" bgcolor="#ffffff">
<tr><td height="5" bgcolor="${ACCENT}" style="height:5px;font-size:0;line-height:0;">&nbsp;</td></tr>
<tr><td class="pad" style="padding:29px 40px;background-color:#ffffff;"><table role="presentation" width="100%"><tr><td><a href="${escapeHtml(siteUrl)}/" style="text-decoration:none;"><img class="brand" src="${escapeHtml(logoUrl)}" alt="Up 'n Roll" width="210" height="54" style="display:block;width:210px;height:54px;color:#171717;font-size:24px;font-weight:bold;"></a></td><td class="brand-note" align="right" style="font-size:10px;line-height:16px;letter-spacing:1.5px;color:#666666;">ATHLETE<br>UPDATES</td></tr></table></td></tr>
${input.bodyHtml}
<tr><td class="pad" style="padding:23px 40px 27px;border-top:1px solid #e8e3db;">
<p style="margin:0 0 8px;font-size:12px;line-height:20px;color:#666666;">Need a hand? <a href="mailto:${contact}" style="color:#171717;text-decoration:underline;">Contact the organising team</a>.</p>
<p style="margin:0 0 16px;font-size:11px;line-height:18px;color:#777777;">You received this email from Up &#x27;n Roll.</p>
<table role="presentation" width="100%"><tr><td style="font-size:11px;line-height:18px;font-weight:bold;letter-spacing:1px;">UP 'N ROLL</td><td align="right"><a href="${escapeHtml(siteUrl)}/" style="font-size:11px;line-height:18px;color:#666666;text-decoration:none;">${escapeHtml(host)}</a></td></tr></table>
</td></tr></table>
<!--[if mso]></td></tr></table><![endif]-->
</td></tr></table></body></html>`;
}
