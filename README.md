# MYLO — My Music. My Way.

MYLO is a browser-based music player built for listening to music stored locally on your device. The app opens with a polished landing experience and then transitions into a responsive player for browsing, searching, queueing, and playing your own library offline.

## What the app does

- Plays audio files directly from a folder you choose on your device
- Scans local music files and reads metadata such as title, artist, album, and artwork
- Lets you search your library by song, artist, album, or genre
- Supports favorites, recently played, most played, and playlists
- Includes queue management with play-next and add-to-queue actions
- Persists your library, playlists, queue state, and preferences in the browser

## Current experience

- A beta-style landing page with animated visuals and quick access to the player
- A full music player UI for desktop, tablet, and mobile screens
- Offline-first behavior with no streaming or cloud dependency
- Browser-based folder selection with fallback support for browsers that do not support the File System Access API

## Tech stack

- Vite, React, and TypeScript
- Dexie with IndexedDB for persistence
- music-metadata-browser for tag and artwork parsing
- HTMLAudioElement-based playback with crossfade and Media Session support

## Getting started

```bash
pnpm install
pnpm dev
```

Then open the app in your browser and choose Add Music Folder to select a local music directory.

## Browser notes

Chromium-based browsers provide the best experience because they support the File System Access API for persistent folder access. Other browsers will still work, but they may need to re-select files after refreshes.

## License

MIT — see [LICENSE](LICENSE).
