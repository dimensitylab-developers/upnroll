# Backend

This folder is the server side of Up 'n Roll: models, auth, database, and the services that enforce tournament rules.

The connection to the frontend is already in place. It was done by the previous team. Pages and Server Actions in `frontend/` already call these services through the `@/server/*` alias, which points at this folder. Edit the files here. You do not need to wire that up again, and you should not copy the business rules into a second place.

`npm run dev` from the repository root starts the same app as before. Login, registration, payments, brackets, rankings, and the admin tools go through the functions in this folder.

If you add an HTTP route, put the handler in `frontend/src/app/api` and call the existing service. Do not reimplement the rule in the route.
