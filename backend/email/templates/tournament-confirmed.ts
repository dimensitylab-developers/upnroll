import { escapeHtml } from "./escape";
import { wrapEmailLayout } from "./layout";
import { getPublicSiteUrl } from "./site";

export type TournamentConfirmedInput = {
  name: string;
  eventName: string;
  division: string;
  reference: string;
};

export type EmailMessage = {
  subject: string;
  body: string;
  html: string;
};

/** Full GPT tournament confirmation layout for payment APPROVED. */
export function tournamentConfirmedEmail(input: TournamentConfirmedInput): EmailMessage {
  const subject = "Registration verified — you're confirmed";
  const name = input.name.trim() || "fighter";
  const eventName = input.eventName.trim() || "your event";
  const division = input.division.trim() || "your division";
  const reference = input.reference.trim() || "—";
  const siteUrl = getPublicSiteUrl();

  const body = [
    `Hi ${name},`,
    "",
    `An organiser has verified your payment for ${eventName}.`,
    `Division: ${division}`,
    `Reference: ${reference}`,
    "Status: Confirmed",
    "",
    "Your registration is confirmed. See you on the mats.",
    `Visit: ${siteUrl}/`,
  ].join("\n");

  const eName = escapeHtml(name);
  const eEvent = escapeHtml(eventName);
  const eDivision = escapeHtml(division);
  const eRef = escapeHtml(reference);
  const eSite = escapeHtml(siteUrl);

  const bodyHtml = `
<tr><td class="pad" bgcolor="#0a0a0a" style="padding:34px 40px 38px;background-color:#0a0a0a;">
<table role="presentation"><tr><td bgcolor="#c8102e" style="padding:7px 11px;background-color:#c8102e;color:#ffffff;font-size:10px;line-height:14px;font-weight:bold;letter-spacing:1.5px;">REGISTRATION CONFIRMED</td></tr></table>
<h1 class="headline" style="margin:22px 0 14px;font-family:Arial,Helvetica,sans-serif;font-size:44px;line-height:47px;letter-spacing:-1.6px;font-weight:900;color:#ffffff;">You’re on the mats.</h1>
<p style="margin:0;color:#d4d4d4;font-size:15px;line-height:24px;">Payment verified. Registration confirmed.</p>
</td></tr>
<tr><td class="pad" style="padding:32px 40px 0;">
<p style="margin:0 0 14px;font-size:16px;line-height:26px;font-weight:bold;">Hi ${eName},</p>
<p style="margin:0 0 26px;font-size:15px;line-height:25px;color:#494949;">An organiser has verified your payment for the event below. Your registration is now confirmed, and we look forward to seeing you compete.</p>
<table role="presentation" width="100%" bgcolor="#f7f4ef" style="background-color:#f7f4ef;border:1px solid #e8e3db;"><tr><td style="padding:23px 24px;">
<p style="margin:0 0 12px;font-size:10px;line-height:16px;letter-spacing:1.8px;font-weight:bold;color:#c8102e;">YOUR EVENT</p>
<p style="margin:0 0 20px;font-size:20px;line-height:27px;font-weight:bold;color:#171717;">${eEvent}</p>
<table role="presentation" width="100%" style="font-size:13px;line-height:21px;">
<tr><td class="detail-label" width="120" valign="top" style="padding:10px 10px 10px 0;border-top:1px solid #ded9d1;color:#666666;">Division</td><td valign="top" style="padding:10px 0;border-top:1px solid #ded9d1;font-weight:bold;">${eDivision}</td></tr>
<tr><td valign="top" style="padding:10px 10px 10px 0;border-top:1px solid #ded9d1;color:#666666;">Reference</td><td valign="top" style="padding:10px 0;border-top:1px solid #ded9d1;font-family:Consolas,monospace;word-break:break-all;">${eRef}</td></tr>
<tr><td valign="top" style="padding:10px 10px 0 0;border-top:1px solid #ded9d1;color:#666666;">Status</td><td valign="top" style="padding:10px 0 0;border-top:1px solid #ded9d1;font-weight:bold;color:#c8102e;">Confirmed</td></tr>
</table></td></tr></table>
<table role="presentation" width="100%" style="margin-top:24px;"><tr><td style="border-left:3px solid #c8102e;padding:2px 0 2px 17px;">
<p style="margin:0 0 5px;font-size:13px;line-height:20px;font-weight:bold;">You’re confirmed for this division.</p><p style="margin:0;font-size:13px;line-height:22px;color:#555555;">Keep this email for your records and check the website for event information and updates.</p>
</td></tr></table>
<table role="presentation" style="margin-top:28px;"><tr><td bgcolor="#c8102e" align="center" style="background-color:#c8102e;mso-padding-alt:15px 24px;"><a href="${eSite}/" style="display:inline-block;padding:15px 24px;border:1px solid #c8102e;font-size:13px;line-height:18px;font-weight:bold;letter-spacing:0.3px;color:#ffffff;text-decoration:none;">Visit Up &#x27;n Roll &nbsp; &#8594;</a></td></tr></table>
<p style="margin:28px 0 30px;font-size:14px;line-height:23px;">See you on the mats.<br><strong>Team Up 'n Roll</strong></p>
</td></tr>`;

  const html = wrapEmailLayout({
    title: subject,
    preheader: "Your payment has been verified and your registration is confirmed.",
    bodyHtml,
  });

  return { subject, body, html };
}
