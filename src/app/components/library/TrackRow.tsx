import { Pause, Heart, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSub,
  DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuPortal,
} from "../ui/dropdown-menu";
import type { Track } from "../../db/database";
import { TrackArtwork } from "../shared/TrackArtwork";
import { formatTime } from "../../utils/format";

export function TrackRow({ track, isActive, isPlaying, liked, playlists, onPlay, onToggleLike, onAddToQueueNext, onAddToQueueEnd, onAddToPlaylist }: {
  track: Track; isActive: boolean; isPlaying: boolean; liked: boolean;
  playlists: { id?: number; name: string }[];
  onPlay: () => void; onToggleLike: () => void;
  onAddToQueueNext: () => void; onAddToQueueEnd: () => void; onAddToPlaylist: (playlistId: number) => void;
}) {
  return (
    <button onClick={onPlay} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg transition-colors hover:bg-white/5 text-left" style={{ background: isActive ? "rgba(255,255,255,0.06)" : "transparent" }}>
      <div className="relative shrink-0">
        <TrackArtwork trackId={track.id} className="w-10 h-10 object-cover rounded-md" />
        {isActive && isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center rounded-md" style={{ background: "rgba(0,0,0,0.5)" }}>
            <Pause size={11} color="#fff" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="truncate" style={{ fontSize: "12px", fontWeight: 500, color: isActive ? "#1db954" : "#ddd" }}>{track.title}</div>
        <div className="truncate" style={{ fontSize: "11px", color: "#777" }}>{track.artist} · {track.album}</div>
      </div>
      <span style={{ fontSize: "11px", color: "#666" }}>{formatTime(track.duration)}</span>
      <button onClick={e => { e.stopPropagation(); onToggleLike(); }} className="shrink-0">
        <Heart size={13} style={{ color: liked ? "#1db954" : "#555" }} fill={liked ? "#1db954" : "none"} />
      </button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button onClick={e => e.stopPropagation()} className="shrink-0">
            <MoreHorizontal size={14} style={{ color: "#666" }} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={onAddToQueueNext}>Play next</DropdownMenuItem>
          <DropdownMenuItem onClick={onAddToQueueEnd}>Add to queue</DropdownMenuItem>
          {playlists.length > 0 && (
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Add to playlist</DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  {playlists.map(pl => (
                    <DropdownMenuItem key={pl.id} onClick={() => pl.id !== undefined && onAddToPlaylist(pl.id)}>{pl.name}</DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </button>
  );
}
