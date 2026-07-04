import type { Track } from "../../db/database";
import { TrackRow } from "./TrackRow";

export function TrackListView({ tracks, current, isPlaying, liked, playlists, onPlay, onToggleLike, onAddToQueueNext, onAddToQueueEnd, onAddToPlaylist, title }: {
  tracks: Track[]; current: Track | null; isPlaying: boolean; liked: Set<string>;
  playlists: { id?: number; name: string }[];
  onPlay: (t: Track) => void; onToggleLike: (id: string) => void;
  onAddToQueueNext: (t: Track) => void; onAddToQueueEnd: (t: Track) => void; onAddToPlaylist: (trackId: string, playlistId: number) => void;
  title: string;
}) {
  return (
    <div>
      <h2 style={{ fontSize: "15px", fontWeight: 600, color: "#fff", marginBottom: 12 }}>{title} <span style={{ color: "#666", fontWeight: 400 }}>· {tracks.length}</span></h2>
      {tracks.length === 0 ? (
        <div style={{ fontSize: "12px", color: "#666" }}>Nothing here yet.</div>
      ) : (
        <div className="space-y-0.5">
          {tracks.map(t => (
            <TrackRow
              key={t.id} track={t} isActive={current?.id === t.id} isPlaying={isPlaying} liked={liked.has(t.id)}
              playlists={playlists} onPlay={() => onPlay(t)} onToggleLike={() => onToggleLike(t.id)}
              onAddToQueueNext={() => onAddToQueueNext(t)} onAddToQueueEnd={() => onAddToQueueEnd(t)}
              onAddToPlaylist={(pid) => onAddToPlaylist(t.id, pid)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
