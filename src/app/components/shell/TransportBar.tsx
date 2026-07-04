import {
  Play, Pause, Shuffle, SkipBack, SkipForward, Repeat, Repeat1,
  Volume2, VolumeX, Heart, Loader2,
} from "lucide-react";
import type { Track } from "../../db/database";
import { TrackArtwork } from "../shared/TrackArtwork";
import { formatTime } from "../../utils/format";

export function TransportBar({
  current,
  isPlaying,
  buffering,
  shuffle,
  repeat,
  position,
  duration,
  volume,
  muted,
  liked,
  onToggle,
  onPrev,
  onNext,
  onSetShuffle,
  onCycleRepeat,
  onSetMuted,
  onToggleLike,
  onProgressClick,
  onVolumeClick,
}: {
  current: Track | null;
  isPlaying: boolean;
  buffering: boolean;
  shuffle: boolean;
  repeat: "off" | "one" | "all";
  position: number;
  duration: number;
  volume: number;
  muted: boolean;
  liked: Set<string>;
  onToggle: () => void;
  onPrev: () => void;
  onNext: () => void;
  onSetShuffle: (v: boolean) => void;
  onCycleRepeat: () => void;
  onSetMuted: (v: boolean) => void;
  onToggleLike: (id: string) => void;
  onProgressClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  onVolumeClick: (e: React.MouseEvent<HTMLDivElement>) => void;
}) {
  const progressPct = duration > 0 ? (position / duration) * 100 : 0;
  const volumePct = muted ? 0 : volume * 100;
  const repeatIcon = repeat === "one" ? <Repeat1 size={15} /> : <Repeat size={15} />;

  return (
    <div
      className="shrink-0 flex items-center gap-4 px-6 py-3 border-t"
      style={{ background: "#0d0d0d", borderColor: "rgba(255,255,255,0.06)", minHeight: 72 }}
    >
      <div className="flex items-center gap-3 w-48 shrink-0">
        {current ? (
          <>
            <TrackArtwork trackId={current.id} className="w-12 h-12 object-cover rounded-lg" />
            <div className="min-w-0">
              <div className="truncate" style={{ fontSize: "12px", fontWeight: 500, color: "#fff" }}>{current.title}</div>
              <div className="truncate" style={{ fontSize: "10px", color: "#888" }}>{current.artist}</div>
            </div>
            <button onClick={() => onToggleLike(current.id)} className="shrink-0">
              <Heart size={14} style={{ color: liked.has(current.id) ? "#1db954" : "#555" }} fill={liked.has(current.id) ? "#1db954" : "none"} />
            </button>
          </>
        ) : (
          <div style={{ fontSize: "11px", color: "#555" }}>Nothing playing</div>
        )}
      </div>

      <div className="flex-1 flex flex-col items-center gap-1.5">
        <div className="flex items-center gap-5">
          <button onClick={() => onSetShuffle(!shuffle)} className="transition-colors">
            <Shuffle size={15} style={{ color: shuffle ? "#1db954" : "#666" }} />
          </button>
          <button onClick={onPrev} className="transition-colors hover:text-white" style={{ color: "#aaa" }}>
            <SkipBack size={18} />
          </button>
          <button
            onClick={onToggle}
            disabled={!current}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-transform hover:scale-105 disabled:opacity-40"
            style={{ background: "#fff" }}
          >
            {buffering ? <Loader2 size={16} color="#000" className="animate-spin" /> : isPlaying ? <Pause size={16} color="#000" /> : <Play size={16} color="#000" />}
          </button>
          <button onClick={onNext} className="transition-colors hover:text-white" style={{ color: "#aaa" }}>
            <SkipForward size={18} />
          </button>
          <button onClick={onCycleRepeat} className="transition-colors">
            <span style={{ color: repeat !== "off" ? "#1db954" : "#666" }}>{repeatIcon}</span>
          </button>
        </div>

        <div className="flex items-center gap-2 w-full max-w-md">
          <span style={{ fontSize: "10px", color: "#666", minWidth: 32, textAlign: "right" }}>{formatTime(position)}</span>
          <div className="flex-1 h-1 rounded-full cursor-pointer relative group" style={{ background: "rgba(255,255,255,0.12)" }} onClick={onProgressClick}>
            <div className="absolute left-0 top-0 h-full rounded-full" style={{ width: `${progressPct}%`, background: "#fff" }} />
            <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" style={{ left: `${progressPct}%`, transform: "translateX(-50%) translateY(-50%)", background: "#fff" }} />
          </div>
          <span style={{ fontSize: "10px", color: "#666", minWidth: 32 }}>{formatTime(duration)}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 w-36 shrink-0 justify-end">
        <button onClick={() => onSetMuted(!muted)} className="transition-colors" style={{ color: "#aaa" }}>
          {muted || volume === 0 ? <VolumeX size={15} /> : <Volume2 size={15} />}
        </button>
        <div className="flex-1 h-1 rounded-full cursor-pointer relative group" style={{ background: "rgba(255,255,255,0.12)" }} onClick={onVolumeClick}>
          <div className="absolute left-0 top-0 h-full rounded-full" style={{ width: `${volumePct}%`, background: "#fff" }} />
        </div>
      </div>
    </div>
  );
}
