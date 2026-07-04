import { Search, X } from "lucide-react";

export function TopBar({
  searchQuery,
  onSearchChange,
  onClear,
}: {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onClear: () => void;
}) {
  return (
    <div
      className="sticky top-0 z-10 px-6 py-3 flex items-center gap-3"
      style={{ background: "rgba(17,17,17,0.9)", backdropFilter: "blur(8px)" }}
    >
      <div className="flex items-center gap-2 flex-1 rounded-full px-4 py-2" style={{ background: "#1e1e1e", maxWidth: 380 }}>
        <Search size={14} style={{ color: "#666" }} />
        <input
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          placeholder="Search for artists, songs or albums"
          className="flex-1 bg-transparent outline-none"
          style={{ fontSize: "12px", color: "#ccc" }}
        />
        {searchQuery && (
          <button onClick={onClear}>
            <X size={13} style={{ color: "#666" }} />
          </button>
        )}
      </div>
    </div>
  );
}
