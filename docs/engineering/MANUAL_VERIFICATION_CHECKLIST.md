# Manual Verification Checklist

Owner: project operator  
Implemented changes are listed as **Implemented**; outcomes below still need human confirmation (**Verify**).

## Auth

- [ ] **Verify** Login with email/password → lands on fighter or admin home
- [ ] **Verify** Logout clears access to `/fighter/*` and `/admin/*`
- [ ] **Verify** Re-login after another browser tab held an old cookie still works; old cookie alone does not stay valid (**Implemented** session rotation)
- [ ] **Verify** Unverified account cannot login; verify code works; bad codes rate-limit (**Implemented** rate limit)
- [ ] **Verify** Resend code rate-limits under rapid clicks

## Authorization

- [ ] **Verify** Admin event detail shows registrations (**Implemented** listRegistrationsForEvent fix)
- [ ] **Verify** Fighter cannot open admin payment screenshot URL (401/403)
- [ ] **Verify** Fighter cannot approve payments / generate brackets
- [ ] **Verify** Fighter A cannot open Fighter B registration payment page

## Registration & payments

- [ ] **Verify** Register into open division; capacity cannot exceed limit under two near-simultaneous submits
- [ ] **Verify** Submit UTR + screenshot; admin sees queue; approve/reject once only
- [ ] **Verify** Duplicate approve attempt conflicts safely
- [ ] **Verify** Rejected fighter can resubmit

## Brackets / matches / rankings

- [ ] **Verify** Generate draft bracket; regenerate draft; publish; cannot double-publish
- [ ] **Verify** Record match result; invalid winner rejected
- [ ] **Verify** Recalculate rankings updates public rankings page

## Files

- [ ] **Verify** Payment screenshot downloads as attachment for admin only (**Implemented** streaming)
- [ ] **Verify** Fighter photo streams for owner; admin can open fighter photo by userId
- [ ] **Verify** With `STORAGE_DRIVER=gridfs`, files land in `privateFiles` bucket

## OAuth / email

- [ ] **Verify** Google login with both env vars set; tampered state fails (**Implemented** cookie binding)
- [ ] **Verify** DISABLED user cannot OAuth login
- [ ] **Verify** Production SMTP delivers one verification or payment email (staging)

## Errors

- [ ] **Verify** Invalid ObjectId in admin URL yields safe validation message, not stack trace (**Implemented** CastError mapping)
- [ ] **Verify** Server logs for route failures are JSON and do not include passwords/session cookies
