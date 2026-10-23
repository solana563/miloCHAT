# miloCHAT

The chat part of milo., as its own app. It uses the **same Supabase project, accounts, friends and messages as milo.**,
so someone you chat with in miloCHAT sees it in milo. and the other way round. Nothing new to set up in Supabase:
if milo.'s `supabase-setup.sql` has been run, miloCHAT works.

## What's in it
- Home: stories row of friends (amber ring = listening to music in milo.), big "Chats" card, "Listening now" card, floating nav pill
- Chat: live delivery, typing indicator, read ticks, replies, emoji reactions (long-press, right-click or double-tap), unsend, photos, song cards shared from milo.
- Group chats: up to 20 friends, same message types as one-to-one, sender names, members sheet (add, remove, leave, delete)
- Voice notes: tap the mic, tap again to send (up to 60 s)
- Chat search, "vanishes in Xh" hints, a button to send the song you're playing, a what's-new sheet
- Friends: friends list, requests, add by username
- Profiles: your own (photo, name, notifications, sign out, delete account) and a friend's (friends since, now playing)
- Background push notifications (same `milo-push` function as milo.) and deep links `?chat=<id>` / `?friends=1`
- Covers: add a cover photo to your profile (friends see it on your profile)
- Song-art colours: the whole app takes the colour of the song you're playing in milo.; a friend's chat takes the colour of what they're playing
- Light, dark or auto cards (Profile → Cards)
- Installable PWA with its own icon, offline shell

Messages disappear after 24 hours (that rule lives in the database, shared with milo.).

## Putting it online
Upload this folder to your repo next to milo.'s files (it will be served at `/milo-chat/`), or give it its own repo / Vercel project.
All paths are relative, so either way works. Then PWABuilder → enter the miloCHAT URL.

Push: if both apps are installed on the same phone, each one gets its own notification.

## Needs one SQL run
Run the newest `supabase-setup.sql` from milo. once: it adds covers, voice notes and groups (the groups part is also in `groups.sql` here). Until then those features say so and everything else keeps working.

## Not in this version
Live rooms, push notifications for group messages (the push function only covers one-to-one chats for now), and a native Android build.

## Covers need one SQL line
Run the newest `supabase-setup.sql` from milo. once (it adds an optional `cover` column to `profiles`). Without it everything else works; picking a cover just says so.

## Song colours
milo. now publishes the colour of the current song with "now playing" (needs "Share now playing" on in milo.). miloCHAT uses that colour, or reads the cover art, or falls back to a colour made from the title.

## Working on the code
`index.html` is **built** from `src/` (same idea as milo.). Edit a small file, run `node build.mjs`, upload.
- `src/css/NN-*.css` – styles, one area each (header, cards, nav, profile, chat…)
- `src/js/00-core.js` constants and helpers · `01-session` sign-in and API · `02-state` · `03-card-theme` · `04-song-art-tint` · `05-data` loading · `06-views` screens · `07-chat` · `08-realtime` · `09-images` · `10-push` · `11-sheet` · `12-actions` clicks · `13-service-worker-start`
- `src/parts.json` the order files are joined in. `node build.mjs --check` verifies `index.html` is up to date.
- Tests (Playwright + a fake Supabase in `tests/mock.py`): `python3 -m http.server 8771` in this folder, then `python3 tests/e2e.py`, `tests/voice.py`, `tests/groups.py`.
