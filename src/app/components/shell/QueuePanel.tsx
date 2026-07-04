import { MoreHorizontal, Pause, Heart } from "lucide-react";
import type { Track } from "../../db/database";
import { TrackArtwork } from "../shared/TrackArtwork";

export function QueuePanel({
  favorites,
  queue,
  queueIndex,
  isPlaying,
  liked,
  onSelectQueueIndex,
  onToggleLike,
}: {
  favorites: Track[];
  queue: Track[];
  queueIndex: number;
  isPlaying: boolean;
  liked: Set<string>;
  onSelectQueueIndex: (index: number) => void;
  onToggleLike: (id: string) => void;
}) {
  return (
    <aside className="flex flex-col w-64 shrink-0 overflow-y-auto" style={{ background: "#161616" }}>
      <div className="p-4 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <div className="flex items-center justify-between mb-3">
          <h3 style={{ fontSize: "13px", fontWeight: 600, color: "#fff" }}>Liked Songs</h3>
          <MoreHorizontal size={14} style={{ color: "#666" }} />
        </div>
        <div className="grid grid-cols-2 gap-1.5 mb-2">
          {favorites.slice(0, 4).map(song => (
            <TrackArtwork key={song.id} trackId={song.id} className="w-full aspect-square object-cover rounded-lg" />
          ))}
        </div>
        <div style={{ fontSize: "10px", color: "#666" }}>{favorites.length} liked songs</div>
      </div>

      <div className="flex-1 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 style={{ fontSize: "13px", fontWeight: 600, color: "#fff" }}>Up Next</h3>
          <MoreHorizontal size={14} style={{ color: "#666" }} />
        </div>
        <div className="space-y-1">
          {queue.length === 0 ? (
            <div style={{ fontSize: "11px", color: "#555" }}>Queue is empty — play something to get started.</div>
          ) : (
            queue.map((song, i) => (
              <button
                key={`${song.id}-${i}`}
                onClick={() => onSelectQueueIndex(i)}
                className="flex items-center gap-2.5 w-full px-2 py-2 rounded-lg transition-colors hover:bg-white/5 text-left"
                style={{ background: i === queueIndex ? "rgba(255,255,255,0.08)" : "transparent" }}
              >
                <div className="relative shrink-0">
                  <TrackArtwork trackId={song.id} className="w-9 h-9 object-cover rounded-lg" />
                  {i === queueIndex && isPlaying && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-lg" style={{ background: "rgba(0,0,0,0.5)" }}>
                      <Pause size={10} color="#fff" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="truncate" style={{ fontSize: "11px", fontWeight: 500, color: i === queueIndex ? "#1db954" : "#ddd" }}>
                    {song.title}
                  </div>
                  <div className="truncate" style={{ fontSize: "10px", color: "#666" }}>{song.artist}</div>
                </div>
                <button onClick={e => { e.stopPropagation(); onToggleLike(song.id); }} className="shrink-0">
                  <Heart size={12} style={{ color: liked.has(song.id) ? "#1db954" : "#555" }} fill={liked.has(song.id) ? "#1db954" : "none"} />
                </button>
              </button>
            ))
          )}
        </div>
      </div>
    </aside>
  );
}
