# MyDiary website: how it works

Study of the Laravel website (`../MyDairy`) made on 29 Sep 2026, so the mobile app and its APIs can follow the same rules. Check the code again before relying on a detail; the website may have changed.

## Roles

| Role | `sys_role` value | Lands on | Sees |
| --- | --- | --- | --- |
| Super Admin (CMD) | `ceo` | CMD Dashboard | Everything |
| Admin | `admin` | HOD Reports | Everything except CMD Dashboard, User Management, Operational Framework |
| User (department login) | anything else (`viewer`) | My Diary | Own rows and own department only |

- There is no HOD role. A HOD is a User whose `dept` is set.
- Department access rule: admin/ceo, or `users.dept == department key` (`app/Support/DeptAccess.php`).
- `users.modules` is stored but never checked.

## Login

- Login id is the email. Session cookie + CSRF. No API, no tokens, no Sanctum.
- No forgot password (dead link), no remember me, no 2FA, no lockout.
- `users.active` is not checked at login.
- Change password: current + new (min 8, confirmed, different from current).

## Modules

| Module | What it is | Key rules |
| --- | --- | --- |
| Department page | 4 tabs: KPI Tracker, Pre-Operations, Alerts, Daily Report | One page per department |
| KPI Tracker | Read-only table: previous day, month, quarter, FY averages | Uses submitted daily reports only |
| Pre-Operations | Tick list, remarks, submit | One per department per day; today only; locks on submit; admin reopens |
| Daily Report | Value + status per KPI, remarks | Groups: due today / when it happens / not due today; draft or submit; today only; admin reopens |
| Alerts | red / amber / green | Today only. Escalate: red only. Resolve: red and amber. No notification is sent |
| My Tasks | Personal list with escalation | No assignee on create. Escalate hands it to a colleague; they resolve; it returns as "returned". Recurring tasks reuse one row |
| My Diary | Calendar | Shows own entries, meeting invites, visits, review cadence. Tasks do not appear. Invite answers: accepted / tentative / declined |
| My Meetings | Plan, minutes, PDF | Action items become tasks when the meeting is completed |
| Discussion Logs | Quick log of calls and chats | Dated follow-ups become tasks |
| Visit Observations | Visit report with photos | draft -> submitted -> reviewed. Only drafts can be edited. Max 20 photos |
| Lab Readiness | Opening and closing checklist per unit | Done / Deviation / N/A; remark required for Deviation and N/A; photo required only when Done; selfie at sign-off; reopen needs a reason; any signed-in user, any date |
| Projects | Projects with milestones | Milestone owner gets a task |
| Review Cadence | CMD's weekly and monthly department reviews | 52 weekly + 12 monthly meetings per department per year |
| MLD | Master List of Documents, read-only, from DOMAS | No download |
| CMD Dashboard | Today's health of all departments | ceo only |
| HOD Reports, Pre-Operations overview | Today's submission status of all departments | admin and ceo |

## What creates a task automatically

| Source | When | Syncs back when task is ticked? |
| --- | --- | --- |
| Meeting action item | Meeting completed | Yes |
| Visit action item | Visit submitted | Yes |
| Review Cadence action | Every save | Yes |
| Project milestone | Milestone has an owner | No |
| Discussion follow-up | Follow-up has a due date | No |

## Lab Readiness master list

26 opening and 26 closing activities, in `app/Support/LabReadinessSeed.php`.

- Opening sections: Facility, safety & housekeeping; Environmental monitoring; Equipment start-up; Reagents & consumables; Internal quality control; LIS & pre-analytical readiness; Information systems & stock; Manpower & declaration.
- Closing sections: Workload reconciliation; Sample storage & retention; Equipment shutdown; Waste, stock & data; Information systems & stock; Commercial, security & declaration.
- Units: 8 NRL departments, 4 regional (Anantapur, Noida, Chandigarh, Bangalore), 2 satellite.
- Photo budget: 1280 px, about 110 KB. Selfie: 800 px, about 60 KB. Max 12 photos per activity.

## Things the website says but does not do

- "Auto-escalation to CMD 1 hr after 09:00": no scheduler exists.
- "Hard deadline escalates automatically": not implemented.
- "Tasks appear in the diary": they do not.
- Resolving an escalated task: the endpoint exists, but no button on the website calls it.
- Only two emails exist: task escalated, task returned. No in-app notifications.

## Points to settle before writing the APIs

- Token login is needed (the website has cookies only).
- Task attachments and visit photos are on public URLs with no login check.
- Deactivated users can still log in.
- Review Cadence write endpoints have no role check.
