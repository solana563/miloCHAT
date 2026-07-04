import {
  Home, Music, Disc3, Mic2, ListMusic, FolderOpen, Heart, Clock,
  TrendingUp, Plus, FolderPlus, Loader2,
} from "lucide-react";
import type { Playlist } from "../../db/database";
import type { ScanProgress } from "../../services/libraryScanner";
import type { View } from "../../types/view";

const NAV_ITEMS: { id: View; label: string; icon: typeof Home }[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "songs", label: "Songs", icon: Music },
  { id: "albums", label: "Albums", icon: Disc3 },
  { id: "artists", label: "Artists", icon: Mic2 },
  { id: "genres", label: "Genres", icon: ListMusic },
  { id: "folders", label: "Folders", icon: FolderOpen },
  { id: "favorites", label: "Favorites", icon: Heart },
  { id: "recent", label: "Recently Played", icon: Clock },
  { id: "most-played", label: "Most Played", icon: TrendingUp },
];

export function Sidebar({
  view,
  onViewChange,
  playlists,
  onCreatePlaylist,
  onAddFolder,
  scanning,
}: {
  view: View;
  onViewChange: (v: View) => void;
  playlists: Playlist[];
  onCreatePlaylist: () => void;
  onAddFolder: () => void;
  scanning: ScanProgress | null;
}) {
  return (
    <aside className="flex flex-col w-56 shrink-0 overflow-y-auto" style={{ background: "#111111" }}>
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "#1db954" }}>
          <Disc3 size={14} color="#000" />
        </div>
        <span style={{ fontSize: "13px", fontWeight: 600, color: "#fff" }}>MYLO Music</span>
      </div>

      <nav className="px-3 space-y-0.5">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onViewChange(id)}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg transition-colors"
            style={{
              background: view === id ? "rgba(255,255,255,0.08)" : "transparent",
              color: view === id ? "#fff" : "#a0a0a0",
              fontSize: "13px",
            }}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </nav>

      <div className="mt-5 px-3">
        <div className="flex items-center justify-between px-3 mb-2">
          <span style={{ fontSize: "11px", fontWeight: 600, color: "#6b6b6b", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Playlists
          </span>
        </div>
        <div className="space-y-0.5">
          {playlists.map(pl => (
            <button
              key={pl.id}
              onClick={() => onViewChange("playlists")}
              className="flex items-center gap-2.5 w-full px-2 py-2 rounded-lg hover:bg-white/5 transition-colors text-left"
            >
              <div className="w-8 h-8 rounded-md bg-violet-600 shrink-0 flex items-center justify-center">
                <ListMusic size={14} color="#fff" />
              </div>
              <div className="min-w-0">
                <div className="truncate" style={{ fontSize: "12px", color: "#ddd" }}>{pl.name}</div>
                <div style={{ fontSize: "10px", color: "#666" }}>{pl.trackIds.length} songs</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-auto px-4 pb-4 space-y-2">
        <button
          onClick={onCreatePlaylist}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg border transition-colors hover:bg-white/5"
          style={{ borderColor: "rgba(255,255,255,0.12)", fontSize: "12px", color: "#aaa" }}
        >
          <Plus size={14} />
          New playlist
        </button>
        <button
          onClick={onAddFolder}
          disabled={!!scanning}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg transition-colors hover:opacity-90"
          style={{ background: "#1db954", fontSize: "12px", color: "#000", fontWeight: 500 }}
        >
          {scanning ? <Loader2 size={14} className="animate-spin" /> : <FolderPlus size={14} />}
          {scanning ? `Scanning… ${scanning.scanned}` : "Add Music Folder"}
        </button>
      </div>
    </aside>
  );
}
