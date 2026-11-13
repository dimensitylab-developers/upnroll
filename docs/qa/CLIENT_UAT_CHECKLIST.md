# Client UAT Checklist — Up 'n Roll

Non-technical checklist for client sign-off before / after a demo.  
Mark each item: ☐ Pass · ☐ Fail · ☐ Blocked · ☐ N/A

**Build under test:** branch `qa/client-demo-readiness-2026-11-12` / commit `eb3c5ed`  
**Environment:** ________________ (local / staging URL)

## Public site

- ☐ Home page loads with Up 'n Roll branding  
- ☐ Events list shows the active card  
- ☐ Event page shows date, venue, divisions, register CTA  
- ☐ Brackets / schedule / results pages open without errors  
- ☐ Rankings board opens; client accepts “3 points per win” as temporary  
- ☐ FAQ answers make sense; chatbot stays within FAQ  
- ☐ Store / Seminars show “coming soon” (no shop expected)  
- ☐ Contact paths (Instagram / published contact) are correct  

## Fighter journey

- ☐ New fighter can register and verify email  
- ☐ Login / logout work  
- ☐ “Do you have a coupon code?” appears on registration  
- ☐ Valid coupon shows discounted amount + correct QR  
- ☐ Invalid / used coupon is refused  
- ☐ Payment screenshot + UTR submit leaves status **pending** (not auto-confirmed)  
- ☐ After admin approve, fighter sees confirmed status  
- ☐ Dashboard shows matches / history after the card runs  

## Admin journey

- ☐ Admin can set normal fee + QR and discounted fee + QR  
- ☐ Admin can create single-use coupons  
- ☐ Payment queue approve / reject works; reject needs a reason  
- ☐ Only verified fighters enter bracket generation as expected  
- ☐ Bracket generate + publish works for the demo division  
- ☐ Judge credentials generate (10-character username and password)  
- ☐ Match result appears on public results / rankings after finalize  

## Judge journey

- ☐ Judge login works only for the assigned match  
- ☐ Scoring controls match the configured rules  
- ☐ Finalizing a match locks further scoring as designed  

## Trust & polish

- ☐ No payment marked verified without an organizer action  
- ☐ Mobile phone width usable for login, register, and scoring  
- ☐ Emails received in the agreed sandbox (if SMTP demo is in scope)  
- ☐ Client accepts open decisions still pending (ranking formula, exact refund policy, etc.)

## Sign-off

| Role | Name | Date | Verdict |
| --- | --- | --- | --- |
| Client | | | Ready / Ready with limitations / Not ready |
| Organizer | | | |
| Engineering | | | |
