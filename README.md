# MyDiary mobile app

React Native app (Android and iPhone) for TrustLab Diagnostics staff.

This is the **UI round**: every screen runs on dummy data kept in memory
(`src/state`). The Laravel APIs are added only after the UI is approved.

## Run

```sh
npm install
npm start                 # keep this running

npm run android           # in a second terminal
# or
cd ios && bundle install && bundle exec pod install && cd ..
npm run ios
```

## Backend

Sign in, change password and Lab Readiness already call the Laravel API.
Everything else still runs on dummy data until its API is wired in.

1. Start MySQL in XAMPP and load the database (see the Laravel project).
2. In `../MyDairy`, run `php artisan serve` (listens on port 8000).
3. The app reaches it at `http://localhost:8000` on the iPhone simulator and
   `http://10.0.2.2:8000` on the Android emulator. For a real phone, put the
   Mac's Wi-Fi address in `LAN_HOST` in `src/config.ts`.

Local test account: `deepak@mytrustlab.com` / `Test@1234` (the password was
set on the local database copy only).

State and API calls use Redux Toolkit with RTK Query (`src/store`). Every API
error carries a `message`, and the app shows that message as it is.

## Layout

| Folder | What is inside |
| --- | --- |
| `src/theme` | Colours, Poppins type scale, spacing, radii, shadows |
| `src/components` | Shared building blocks. Screens are built only from these |
| `src/screens` | One file per screen |
| `src/navigation` | Bottom tabs and the stack of inner screens |
| `src/state` | In-memory data for the UI round |
| `src/data` | Dummy data, and master lists copied from the website |
| `src/utils` | Dates, photos, files, location |
| `docs/website-flow.md` | How the website works |

`src/data/departments.data.json` is exported from the website's
`config/departments.php`. Regenerate it when that list changes.

## Rules

- Every size goes through `s`, `vs`, `ms` or `fs` from `src/theme`
  (react-native-size-matters). No raw numbers in styles.
- Poppins is the only typeface. Text sizes use `fs`.
- Yellow is reserved for the main action on a screen.
- A status colour always comes with an icon and a word.
- Anything used more than twice is a shared component.
- Dropdowns, calendars and time pickers open directly below their field.
- Screens do not bounce when scrolled past the end.
