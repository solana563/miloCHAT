import { Play } from "lucide-react";
import type { Track } from "../../db/database";

export function GenresView({ genres, onPlayGenre }: { genres: { genre: string; tracks: Track[] }[]; onPlayGenre: (g: { genre: string; tracks: Track[] }) => void }) {
  return (
    <div>
      <h2 style={{ fontSize: "15px", fontWeight: 600, color: "#fff", marginBottom: 16 }}>Genres <span style={{ color: "#666", fontWeight: 400 }}>· {genres.length}</span></h2>
      <div className="grid grid-cols-3 gap-3">
        {genres.map(g => (
          <button key={g.genre} onClick={() => onPlayGenre(g)} className="flex items-center justify-between px-5 py-6 rounded-xl transition-transform hover:scale-[1.02]" style={{ background: "linear-gradient(135deg, #2d1255, #1a0a2e)" }}>
            <div className="text-left">
              <div style={{ fontSize: "14px", fontWeight: 600, color: "#fff" }}>{g.genre}</div>
              <div style={{ fontSize: "11px", color: "#aaa" }}>{g.tracks.length} songs</div>
            </div>
            <Play size={16} color="#fff" />
          </button>
        ))}
      </div>
    </div>
  );
}
