import { FolderOpen, FolderPlus } from "lucide-react";

export function FoldersView({ folders, onAddFolder, onRescan, scanning }: {
  folders: { id: number; handle: FileSystemDirectoryHandle; name: string }[];
  onAddFolder: () => void; onRescan: (h: FileSystemDirectoryHandle) => void; scanning: boolean;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 style={{ fontSize: "15px", fontWeight: 600, color: "#fff" }}>Watched Folders</h2>
        <button onClick={onAddFolder} disabled={scanning} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs" style={{ background: "#1db954", color: "#000" }}>
          <FolderPlus size={12} /> Add Folder
        </button>
      </div>
      {folders.length === 0 ? (
        <div style={{ fontSize: "12px", color: "#666" }}>No folders added yet.</div>
      ) : (
        <div className="space-y-2">
          {folders.map(f => (
            <div key={f.id} className="flex items-center justify-between px-4 py-3 rounded-lg" style={{ background: "#1a1a1a" }}>
              <div className="flex items-center gap-3">
                <FolderOpen size={16} style={{ color: "#1db954" }} />
                <span style={{ fontSize: "13px", color: "#ddd" }}>{f.name}</span>
              </div>
              <button onClick={() => onRescan(f.handle)} disabled={scanning} className="px-3 py-1 rounded-full text-xs" style={{ background: "rgba(255,255,255,0.1)", color: "#ccc" }}>
                Rescan
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
