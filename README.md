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

## Demo sign-in

The password is `Trust@123` for all three. Any other email or password shows
the error state.

| Email | Role | What is different |
| --- | --- | --- |
| `ravi.kumar@trustlab.in` | User | Sees only the Quality department |
| `admin@trustlab.in` | Admin | Can switch department and reopen locked submissions |
| `cmd@trustlab.in` | Super Admin (CMD) | Same as Admin in this app |

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
