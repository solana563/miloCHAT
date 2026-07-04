import { Play, Pause } from "lucide-react";
import type { Track } from "../../db/database";
import type { AlbumGroup } from "../../services/library";
import { TrackArtwork } from "../shared/TrackArtwork";

export function HomeView({ current, isPlaying, onTogglePlay, albums, onPlayAlbum }: {
  current: Track | null; isPlaying: boolean; onTogglePlay: () => void;
  albums: AlbumGroup[]; onPlayAlbum: (a: AlbumGroup) => void;
}) {
  return (
    <>
      <div className="relative overflow-hidden rounded-2xl mb-6" style={{ height: 240, background: "linear-gradient(135deg, #1a0a2e 0%, #2d1255 40%, #0d0d0d 100%)" }}>
        {current && (
          <TrackArtwork trackId={current.id} className="absolute inset-0 w-full h-full object-cover opacity-40" style={{ filter: "blur(2px)" }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
        <div className="absolute inset-0 flex items-end p-7">
          <div>
            <div style={{ fontSize: "10px", color: "#aaa", marginBottom: 4 }}>{current?.artist ?? "Welcome"}</div>
            <h1 style={{ fontSize: "28px", fontWeight: 700, color: "#fff", lineHeight: 1.2, marginBottom: 16 }}>
              {current?.title ?? "Pick something to play"}
            </h1>
            {current && (
              <button onClick={onTogglePlay} className="flex items-center gap-2 px-5 py-2 rounded-full font-medium transition-all hover:scale-105" style={{ background: "#fff", color: "#000", fontSize: "13px" }}>
                {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                {isPlaying ? "Pause" : "Play"}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h2 style={{ fontSize: "15px", fontWeight: 600, color: "#fff", marginBottom: 16 }}>Albums</h2>
        <div className="grid grid-cols-4 gap-3">
          {albums.slice(0, 8).map(album => (
            <button key={`${album.albumArtist}-${album.album}`} onClick={() => onPlayAlbum(album)} className="group relative overflow-hidden rounded-xl transition-transform hover:scale-105" style={{ aspectRatio: "3/4", background: "#1c1c1c" }}>
              <TrackArtwork trackId={album.tracks[0]?.id} className="w-full h-full object-cover opacity-80 group-hover:opacity-90 transition-opacity" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3 text-left">
                <div className="truncate" style={{ fontSize: "12px", fontWeight: 600, color: "#fff" }}>{album.album}</div>
                <div className="truncate" style={{ fontSize: "10px", color: "#aaa" }}>{album.albumArtist}</div>
              </div>
              <div className="absolute top-2 right-2 w-8 h-8 rounded-full items-center justify-center hidden group-hover:flex transition-all" style={{ background: "#1db954" }}>
                <Play size={12} color="#000" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
