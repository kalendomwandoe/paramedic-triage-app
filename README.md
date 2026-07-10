# Paramedic Triage Intake App

A React Native (Expo Router + TypeScript) app for paramedics to log critical
patient triage data in the field, designed to work reliably with **no or
unstable network connectivity**.

## Tech stack

- **React Native + Expo Router (TypeScript)**
- **Context API + `useReducer`** for state management
- **`@react-native-async-storage/async-storage`** for local persistence
- **`@react-native-community/netinfo`** for connectivity monitoring
- **Jest** for unit tests

## Architecture & separation of concerns

src/
app/
\_layout.tsx → mounts TriageProvider around the whole app
index.tsx → the single-screen UI - reads/writes only via useTriage()
types.ts → shared TriageRecord / Status / Priority types
storage/storage.ts → local persistence (AsyncStorage) - no UI/network knowledge
api/mockApi.ts → simulated POST /api/v1/triage (2s delay, 30% random failure)
context/TriageContext.tsx → state + sync queue engine (the "brain")
components/PriorityBadge.tsx → hazard-coded priority indicator
tests/ → reducer + storage unit tests

The UI (`index.tsx`) never talks to storage or the network directly — it
only calls `addTriage(...)` from the `useTriage()` hook. All persistence
and sync logic lives in `TriageContext.tsx`, so the UI and the data layer
can be changed independently.

## How the offline-first sync queue works

1. **Submit is always instant.** When a paramedic taps "Submit", the record
   is immediately written to in-memory state (and from there, to
   `AsyncStorage`) and the form clears. This happens regardless of network
   status — there is no `await` on the network in the submit path, so a dead
   connection can never block or fail the UI.
2. **Best-effort immediate sync.** If the device currently appears online,
   the app fires a background (non-blocking) request to the mock API right
   away. Success flags the record `synced: true`; failure (or being offline)
   just leaves it in the queue — no error is shown to the user.
3. **Reconnection listener.** `NetInfo.addEventListener` watches for
   connectivity changes. The instant the device comes back online, the app
   automatically walks every unsynced record and uploads it in sequence.
4. **App lifecycle handling.** An `AppState` listener re-checks the queue
   whenever the app returns to the foreground, in case connectivity changed
   while it was minimized.
5. **A `syncingRef` guard** prevents two sync passes from ever running
   concurrently (e.g. a reconnect event firing while a foreground-triggered
   sync is already in progress).

Every record ends in one of two visible states: **Pending** (saved locally,
waiting for network) or **Synced**. Nothing is ever lost, and nothing ever
blocks on the network.

## Setup instructions

```bash
npm install
npm start
```

Then scan the QR code with Expo Go, or press `w` for web.

## Running tests

```bash
npm test
```

Covers the reducer (add/sync/load/online/syncing transitions) and the
storage layer (persist/retrieve/overwrite), using a mocked AsyncStorage —
8 tests, all passing.

## Testing the offline scenario

1. Submit a record online — it shows "Pending" then flips to "Synced" after
   ~2 seconds (the mock API's simulated delay).
2. Enable Airplane Mode (or, on web, DevTools → Network → Offline).
3. Submit another record — it saves instantly, shows "Pending", no error.
4. Disable Airplane Mode / re-enable network.
5. Within a couple seconds the banner returns to "Online" and the pending
   record automatically flips to "Synced" — no user action required.

## Notes on simplifications (given assessment time constraints)

- Persistence uses a single JSON array in AsyncStorage rather than
  SQLite/WatermelonDB. For triage-form-scale data (a handful of records
  between syncs) this is simpler, has no schema/migrations to maintain, and
  is fully adequate — `storage.ts` could be swapped for a SQLite-backed
  implementation without touching the context or UI layers.
- The mock API simulates `POST /api/v1/triage` with a 2-second delay and a
  30% random failure rate, per the assessment's suggested mock repository
  approach.
