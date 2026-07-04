import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "./ui/sonner";
import { getPrefs, savePrefs, Track } from "../db/database";
import {
  getAllTracks, searchTracks, toggleLike, getFavorites, getRecentlyPlayed,
  getMostPlayed, getAlbums, getArtists, getGenres, getPlaylists,
  createPlaylist, deletePlaylist, addToPlaylist, exportM3U, parseM3U, AlbumGroup, ArtistGroup,
} from "../services/library";
import { scanFolder, scanFiles, ScanProgress } from "../services/libraryScanner";
import {
  isFileSystemAccessSupported, pickFolder, getStoredFolders, requestPermission,
} from "../db/fileSystemManager";
import { usePlayer, restoreQueueFromLastSession } from "../hooks/usePlayer";
import type { View } from "../types/view";
import { Sidebar } from "./shell/Sidebar";
import { TopBar } from "./shell/TopBar";
import { TransportBar } from "./shell/TransportBar";
import { QueuePanel } from "./shell/QueuePanel";
import { EmptyLibrary } from "./library/EmptyLibrary";
import { HomeView } from "./library/HomeView";
import { AlbumsView } from "./library/AlbumsView";
import { ArtistsView } from "./library/ArtistsView";
import { GenresView } from "./library/GenresView";
import { FoldersView } from "./library/FoldersView";
import { PlaylistsView } from "./library/PlaylistsView";
import { TrackListView } from "./library/TrackListView";

export function MusicPlayer() {
  const player = usePlayer();
  const [view, setView] = useState<View>("home");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [allTracks, setAllTracks] = useState<Track[]>([]);
  const [favorites, setFavorites] = useState<Track[]>([]);
  const [recent, setRecent] = useState<Track[]>([]);
  const [mostPlayed, setMostPlayed] = useState<Track[]>([]);
  const [albums, setAlbums] = useState<AlbumGroup[]>([]);
  const [artists, setArtists] = useState<ArtistGroup[]>([]);
  const [genres, setGenres] = useState<{ genre: string; tracks: Track[] }[]>([]);
  const [playlists, setPlaylists] = useState<Awaited<ReturnType<typeof getPlaylists>>>([]);
  const [folders, setFolders] = useState<{ id: number; handle: FileSystemDirectoryHandle; name: string }[]>([]);
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [scanning, setScanning] = useState<ScanProgress | null>(null);
  const [ready, setReady] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const m3uInputRef = useRef<HTMLInputElement>(null);

  const reload = useCallback(async () => {
    const tracks = await getAllTracks();
    setAllTracks(tracks);
    setLiked(new Set(tracks.filter(t => t.liked).map(t => t.id)));
    setFavorites(tracks.filter(t => t.liked));
    setRecent(await getRecentlyPlayed());
    setMostPlayed(await getMostPlayed());
    setAlbums(await getAlbums());
    setArtists(await getArtists());
    setGenres(await getGenres());
    setPlaylists(await getPlaylists());
    setFolders(await getStoredFolders());
  }, []);

  useEffect(() => {
    (async () => {
      const prefs = await getPrefs();
      player.setVolume(prefs.volume);
      player.setCrossfade(prefs.crossfade);
      await reload();
      const tracks = await getAllTracks();
      if (tracks.length > 0) await restoreQueueFromLastSession(tracks);
      setReady(true);
    })();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    const id = setTimeout(async () => {
      setSearchResults(await searchTracks(searchQuery));
    }, 80); // small debounce so 50k-track libraries don't filter on every keystroke
    return () => clearTimeout(id);
  }, [searchQuery]);

  const playTrackInContext = useCallback((track: Track, context: Track[]) => {
    const idx = context.findIndex(t => t.id === track.id);
    player.setQueue(context, idx === -1 ? 0 : idx);
  }, [player]);

  const handleToggleLike = useCallback(async (id: string) => {
    const isLiked = await toggleLike(id);
    setLiked(prev => {
      const next = new Set(prev);
      isLiked ? next.add(id) : next.delete(id);
      return next;
    });
    setFavorites(await getFavorites());
  }, []);

  const runScan = useCallback(async (handle: FileSystemDirectoryHandle) => {
    setScanning({ scanned: 0, total: 0, currentFile: "" });
    try {
      const result = await scanFolder(handle, (p) => setScanning(p));
      toast.success(`Scan complete: ${result.added} added, ${result.removed} removed, ${result.unchanged} unchanged`);
      await reload();
    } catch (err) {
      toast.error("Scan failed: " + (err as Error).message);
    } finally {
      setScanning(null);
    }
  }, [reload]);

  const handleAddFolder = useCallback(async () => {
    if (isFileSystemAccessSupported()) {
      const handle = await pickFolder();
      if (handle) await runScan(handle);
    } else {
      fileInputRef.current?.click();
    }
  }, [runScan]);

  const handleFileInputChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setScanning({ scanned: 0, total: files.length, currentFile: "" });
    try {
      const result = await scanFiles(files, (p) => setScanning(p));
      toast.success(`Added ${result.added} tracks`);
      await reload();
    } finally {
      setScanning(null);
      e.target.value = "";
    }
  }, [reload]);

  const handleRescanFolder = useCallback(async (handle: FileSystemDirectoryHandle) => {
    const ok = await requestPermission(handle);
    if (!ok) { toast.error("Permission denied for this folder"); return; }
    await runScan(handle);
  }, [runScan]);

  const handleImportM3U = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const content = await file.text();
    const entries = parseM3U(content);
    if (entries.length === 0) { toast.error("No tracks found in that M3U file"); return; }

    // M3U file paths rarely resolve across machines, so match by title+artist instead
    const lowerTracks = allTracks.map(t => ({ t, title: t.title.toLowerCase(), artist: t.artist.toLowerCase() }));
    const matched: typeof allTracks = [];
    for (const entry of entries) {
      const found = lowerTracks.find(lt => lt.title === entry.title.toLowerCase() && lt.artist === entry.artist.toLowerCase())
        ?? lowerTracks.find(lt => lt.title === entry.title.toLowerCase());
      if (found) matched.push(found.t);
    }

    const name = file.name.replace(/\.m3u8?$/i, "") || "Imported Playlist";
    const id = await createPlaylist(name);
    for (const t of matched) await addToPlaylist(id, t.id);
    setPlaylists(await getPlaylists());
    toast.success(`Imported "${name}": matched ${matched.length} of ${entries.length} tracks`);
  }, [allTracks]);

  const handleVolumeClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    player.setVolume(ratio);
    player.setMuted(ratio === 0);
    savePrefs({ volume: ratio });
  }, [player]);

  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!player.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    player.seek(ratio * player.duration);
  }, [player]);

  const currentList = useMemo(() => {
    if (view === "search") return searchResults;
    if (view === "favorites") return favorites;
    if (view === "recent") return recent;
    if (view === "most-played") return mostPlayed;
    return allTracks;
  }, [view, searchResults, favorites, recent, mostPlayed, allTracks]);

  return (
    <div className="flex flex-col h-screen" style={{ background: "#0d0d0d", color: "#fff", fontFamily: "Inter, system-ui, sans-serif" }}>
      <Toaster theme="dark" position="top-center" />
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*,.mp3,.flac,.m4a,.aac,.wav,.ogg,.opus"
        multiple
        // @ts-ignore - webkitdirectory enables folder selection where File System Access API is unavailable
        webkitdirectory=""
        style={{ display: "none" }}
        onChange={handleFileInputChange}
      />

      <input
        ref={m3uInputRef}
        type="file"
        accept=".m3u,.m3u8,audio/x-mpegurl"
        style={{ display: "none" }}
        onChange={handleImportM3U}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          view={view}
          onViewChange={setView}
          playlists={playlists}
          onCreatePlaylist={async () => {
            const name = prompt("Playlist name");
            if (name) { await createPlaylist(name); setPlaylists(await getPlaylists()); }
          }}
          onAddFolder={handleAddFolder}
          scanning={scanning}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto" style={{ background: "#111111" }}>
          <TopBar
            searchQuery={searchQuery}
            onSearchChange={(value) => { setSearchQuery(value); if (value) setView("search"); }}
            onClear={() => { setSearchQuery(""); setView("home"); }}
          />

          <div className="px-6 pb-6">
            {!ready ? (
              <div className="flex items-center justify-center py-24" style={{ color: "#666" }}>
                <Loader2 size={20} className="animate-spin mr-2" /> Loading library…
              </div>
            ) : allTracks.length === 0 ? (
              <EmptyLibrary onAddFolder={handleAddFolder} scanning={!!scanning} />
            ) : view === "home" ? (
              <HomeView
                current={player.current}
                isPlaying={player.isPlaying}
                onTogglePlay={player.toggle}
                albums={albums}
                onPlayAlbum={(album) => playTrackInContext(album.tracks[0], album.tracks)}
              />
            ) : view === "albums" ? (
              <AlbumsView albums={albums} onPlayAlbum={(a) => playTrackInContext(a.tracks[0], a.tracks)} />
            ) : view === "artists" ? (
              <ArtistsView artists={artists} onPlayArtist={(a) => playTrackInContext(a.tracks[0], a.tracks)} />
            ) : view === "genres" ? (
              <GenresView genres={genres} onPlayGenre={(g) => playTrackInContext(g.tracks[0], g.tracks)} />
            ) : view === "folders" ? (
              <FoldersView folders={folders} onAddFolder={handleAddFolder} onRescan={handleRescanFolder} scanning={!!scanning} />
            ) : view === "playlists" ? (
              <PlaylistsView
                playlists={playlists}
                allTracks={allTracks}
                onPlayPlaylist={(tracks) => tracks.length > 0 && playTrackInContext(tracks[0], tracks)}
                onDelete={async (id) => { await deletePlaylist(id); setPlaylists(await getPlaylists()); }}
                onImport={() => m3uInputRef.current?.click()}
                onExport={(name, tracks) => {
                  const blob = new Blob([exportM3U(name, tracks)], { type: "audio/x-mpegurl" });
                  const a = document.createElement("a");
                  a.href = URL.createObjectURL(blob);
                  a.download = `${name}.m3u`;
                  a.click();
                }}
              />
            ) : (
              <TrackListView
                tracks={currentList}
                current={player.current}
                isPlaying={player.isPlaying}
                liked={liked}
                playlists={playlists}
                onPlay={(t) => playTrackInContext(t, currentList)}
                onToggleLike={handleToggleLike}
                onAddToQueueNext={(t) => player.addToQueueNext(t)}
                onAddToQueueEnd={(t) => { player.addToQueueEnd(t); toast.success(`Added "${t.title}" to queue`); }}
                onAddToPlaylist={async (trackId, playlistId) => {
                  await addToPlaylist(playlistId, trackId);
                  setPlaylists(await getPlaylists());
                  toast.success("Added to playlist");
                }}
                title={view === "songs" ? "All Songs" : view === "favorites" ? "Favorites" : view === "recent" ? "Recently Played" : view === "most-played" ? "Most Played" : "Search Results"}
              />
            )}
          </div>
        </main>

        <QueuePanel
          favorites={favorites}
          queue={player.queue}
          queueIndex={player.queueIndex}
          isPlaying={player.isPlaying}
          liked={liked}
          onSelectQueueIndex={(i) => player.setQueue(player.queue, i)}
          onToggleLike={handleToggleLike}
        />
      </div>

      <TransportBar
        current={player.current}
        isPlaying={player.isPlaying}
        buffering={player.buffering}
        shuffle={player.shuffle}
        repeat={player.repeat}
        position={player.position}
        duration={player.duration}
        volume={player.volume}
        muted={player.muted}
        liked={liked}
        onToggle={player.toggle}
        onPrev={player.prev}
        onNext={player.next}
        onSetShuffle={player.setShuffle}
        onCycleRepeat={() => player.setRepeat(player.repeat === "off" ? "all" : player.repeat === "all" ? "one" : "off")}
        onSetMuted={player.setMuted}
        onToggleLike={handleToggleLike}
        onProgressClick={handleProgressClick}
        onVolumeClick={handleVolumeClick}
      />
    </div>
  );
}

