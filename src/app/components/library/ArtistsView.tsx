import type { ArtistGroup } from "../../services/library";
import { TrackArtwork } from "../shared/TrackArtwork";

export function ArtistsView({ artists, onPlayArtist }: { artists: ArtistGroup[]; onPlayArtist: (a: ArtistGroup) => void }) {
  return (
    <div>
      <h2 style={{ fontSize: "15px", fontWeight: 600, color: "#fff", marginBottom: 16 }}>Artists <span style={{ color: "#666", fontWeight: 400 }}>· {artists.length}</span></h2>
      <div className="grid grid-cols-5 gap-4">
        {artists.map(artist => (
          <button key={artist.artist} onClick={() => onPlayArtist(artist)} className="text-left group">
            <div className="relative overflow-hidden rounded-full mb-2 transition-transform group-hover:scale-105" style={{ aspectRatio: "1/1", background: "#1c1c1c" }}>
              <TrackArtwork trackId={artist.tracks[0]?.id} className="w-full h-full object-cover" />
            </div>
            <div className="truncate text-center" style={{ fontSize: "12px", fontWeight: 500, color: "#fff" }}>{artist.artist}</div>
            <div className="truncate text-center" style={{ fontSize: "11px", color: "#777" }}>{artist.tracks.length} songs</div>
          </button>
        ))}
      </div>
    </div>
  );
}
