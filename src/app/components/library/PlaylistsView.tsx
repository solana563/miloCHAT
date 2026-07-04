import { useMemo } from "react";
import { Play, Plus } from "lucide-react";
import type { Track } from "../../db/database";

export function PlaylistsView({ playlists, allTracks, onPlayPlaylist, onDelete, onImport, onExport }: {
  playlists: { id?: number; name: string; trackIds: string[] }[];
  allTracks: Track[];
  onPlayPlaylist: (tracks: Track[]) => void;
  onDelete: (id: number) => void;
  onImport: () => void;
  onExport: (name: string, tracks: Track[]) => void;
}) {
  const byId = useMemo(() => new Map(allTracks.map(t => [t.id, t])), [allTracks]);
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 style={{ fontSize: "15px", fontWeight: 600, color: "#fff" }}>Playlists</h2>
        <button onClick={onImport} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs" style={{ background: "rgba(255,255,255,0.1)", color: "#ccc" }}>
          <Plus size={12} /> Import M3U
        </button>
      </div>
      {playlists.length === 0 ? (
        <div style={{ fontSize: "12px", color: "#666" }}>No playlists yet. Create one from the sidebar.</div>
      ) : (
        <div className="space-y-3">
          {playlists.map(pl => {
            const tracks = pl.trackIds.map(id => byId.get(id)).filter(Boolean) as Track[];
            return (
              <div key={pl.id} className="flex items-center justify-between px-4 py-3 rounded-lg" style={{ background: "#1a1a1a" }}>
                <div className="flex items-center gap-3">
                  <button onClick={() => onPlayPlaylist(tracks)} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "#1db954" }}>
                    <Play size={13} color="#000" />
                  </button>
                  <div>
                    <div style={{ fontSize: "13px", color: "#fff" }}>{pl.name}</div>
                    <div style={{ fontSize: "11px", color: "#777" }}>{tracks.length} songs</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => onExport(pl.name, tracks)} className="px-3 py-1 rounded-full text-xs" style={{ background: "rgba(255,255,255,0.1)", color: "#ccc" }}>Export M3U</button>
                  <button onClick={() => pl.id && onDelete(pl.id)} className="px-3 py-1 rounded-full text-xs" style={{ background: "rgba(255,80,80,0.15)", color: "#ff7a7a" }}>Delete</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
