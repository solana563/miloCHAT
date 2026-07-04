import { Music, FolderPlus } from "lucide-react";

export function EmptyLibrary({ onAddFolder, scanning }: { onAddFolder: () => void; scanning: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: "#1c1c1c" }}>
        <Music size={28} style={{ color: "#444" }} />
      </div>
      <h2 style={{ fontSize: "16px", fontWeight: 600, color: "#fff", marginBottom: 8 }}>Your library is empty</h2>
      <p style={{ fontSize: "12px", color: "#777", marginBottom: 20, maxWidth: 320 }}>
        Add a folder of music files (MP3, FLAC, M4A, AAC, WAV, OGG, OPUS) to get started. Everything stays on this device.
      </p>
      <button
        onClick={onAddFolder}
        disabled={scanning}
        className="flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-all hover:scale-105"
        style={{ background: "#1db954", color: "#000", fontSize: "13px" }}
      >
        <FolderPlus size={14} /> Add Music Folder
      </button>
    </div>
  );
}
