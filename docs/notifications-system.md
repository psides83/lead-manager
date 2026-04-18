# Notifications System (Phase 1)

This app now includes Firestore-backed in-app notifications with optional email sends through Firebase Trigger Email extension.

## What it does

- Shows a notification bell in the main app bar with unread count.
- Stores notifications in:
  - `users/{uid}/notifications/{notificationId}`
- Creates notifications for:
  - auto-created status follow-up tasks
  - manually added lead tasks
  - overdue open tasks (synced every 15 minutes while app is open)
- Marks task-related notifications as read when a task is completed.

## Email notifications (optional)

If Firebase Trigger Email extension is installed and Firestore writes to `mail` are allowed:

1. Set env var:

```env
REACT_APP_ENABLE_EMAIL_NOTIFICATIONS="true"
```

2. Restart app.

By default, only high-priority reminders (overdue + auto follow-up) attempt email writes.
This app currently queues these emails in `sentEmails` to match the existing project setup.

## Firestore rules needed

At minimum, authenticated users should be able to read/write their own notifications:

- `users/{uid}/notifications/*`: owner read/write

If using Trigger Email extension from client writes:

- allow create to `sentEmails/*` for authenticated users (or route via Cloud Functions for stricter control)

## Next recommended step (server-side hardening)

Move notification generation into Cloud Functions:

- Firestore trigger on `tasks` writes
- Firestore trigger on `leads` status changes
- Scheduled function for overdue scans

This removes client dependence and guarantees reminders even when the app is closed.
