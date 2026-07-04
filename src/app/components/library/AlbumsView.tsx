import type { AlbumGroup } from "../../services/library";
import { TrackArtwork } from "../shared/TrackArtwork";

export function AlbumsView({ albums, onPlayAlbum }: { albums: AlbumGroup[]; onPlayAlbum: (a: AlbumGroup) => void }) {
  return (
    <div>
      <h2 style={{ fontSize: "15px", fontWeight: 600, color: "#fff", marginBottom: 16 }}>Albums <span style={{ color: "#666", fontWeight: 400 }}>· {albums.length}</span></h2>
      <div className="grid grid-cols-5 gap-4">
        {albums.map(album => (
          <button key={`${album.albumArtist}-${album.album}`} onClick={() => onPlayAlbum(album)} className="text-left group">
            <div className="relative overflow-hidden rounded-xl mb-2 transition-transform group-hover:scale-105" style={{ aspectRatio: "1/1", background: "#1c1c1c" }}>
              <TrackArtwork trackId={album.tracks[0]?.id} className="w-full h-full object-cover" />
            </div>
            <div className="truncate" style={{ fontSize: "12px", fontWeight: 500, color: "#fff" }}>{album.album}</div>
            <div className="truncate" style={{ fontSize: "11px", color: "#777" }}>{album.albumArtist} {album.year ? `· ${album.year}` : ""}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
