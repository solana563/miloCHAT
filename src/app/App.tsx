import { useState, useEffect } from "react";
import { MusicPlayer } from "./components/MusicPlayer";
import { LandingPage } from "./components/LandingPage";
import '../styles/mylo-beta.css';

export default function App() {
  const [playerOpen, setPlayerOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Initialize theme preference
    const theme = localStorage.getItem('mylo-theme') || 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    setReady(true);
  }, []);

  if (!ready) return null;

  return (
    <div className="size-full">
      {playerOpen ? (
        <MusicPlayer onClose={() => setPlayerOpen(false)} />
      ) : (
        <LandingPage onOpenPlayer={() => setPlayerOpen(true)} />
      )}
    </div>
  );
}
