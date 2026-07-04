import { useArtwork } from "../../hooks/useArtwork";

export function TrackArtwork({
  trackId,
  className,
  style,
}: {
  trackId?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const url = useArtwork(trackId);
  return <img src={url} alt="" className={className} style={style} />;
}
