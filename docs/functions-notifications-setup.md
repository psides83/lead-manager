# Cloud Functions Notification Backend Setup

This repo now includes Firebase Functions in:

- `/Users/Payton/web-development/lead-manager-1/functions/index.js`

## What runs in Functions

- Firestore trigger: `leads/{leadId}` status updates -> auto-create follow-up task
- Firestore trigger: `tasks/{taskId}` create -> create owner notification
- Scheduler: every 30 minutes -> generate overdue task notifications

All notifications are stored in:

- `users/{uid}/notifications/{notificationId}`

Optional email queue writes use:

- `sentEmails`

## Environment config for Functions

Optional runtime env vars:

1. `ENABLE_EMAIL_NOTIFICATIONS` (`true` by default)
2. `EMAIL_FROM` (optional, defaults to `Lead Manager App<psides.solutions@outlook.com>`)

## Deploy steps

From repo root:

```bash
cd functions
npm install
cd ..
firebase deploy --only functions
```

Then (if needed):

```bash
firebase deploy --only hosting
```
