
import React from 'react';
import VideoPlayer from './components/VideoPlayer';

const App: React.FC = () => {
  // Прямая ссылка на видео
  const videoSource = "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-10 md:p-12 bg-transparent">
      <header className="w-full max-w-4xl text-center mb-8">
        <h1 className="text-4xl sm:text-6xl md:text-8xl font-black text-white uppercase tracking-tight mb-4 drop-shadow-2xl italic whitespace-nowrap" style={{ fontFamily: 'Georgia, serif' }}>
          С праздником!
        </h1>
        <div className="inline-block px-4 py-1 bg-white/10 backdrop-blur-sm rounded-full">
          <p className="text-red-100 text-xs sm:text-sm md:text-xl font-medium tracking-wide">
            Твое персональное поздравление ✨
          </p>
        </div>
      </header>

      <main className="w-full max-w-3xl flex-grow flex items-center justify-center">
        <VideoPlayer src={videoSource} />
      </main>

      <footer className="w-full mt-10 text-center">
          <p className="text-white/40 text-[11px] font-bold tracking-[0.5em] uppercase">
            2025 • Сделано с любовью
          </p>
      </footer>
    </div>
  );
};

export default App;
