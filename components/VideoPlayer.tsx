
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { PlayIcon, FullscreenIcon, ExitFullscreenIcon, ReplayIcon } from './Icons';

interface VideoPlayerProps {
  src: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<number | null>(null);
  const wakeLockRef = useRef<any>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleProgress = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleUserInteraction = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      window.clearTimeout(controlsTimeoutRef.current);
    }
    if (isPlaying) {
      controlsTimeoutRef.current = window.setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.error('Ошибка полноэкранного режима:', err);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const clickedPercentage = x / rect.width;
    const newTime = clickedPercentage * duration;
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const requestWakeLock = useCallback(async () => {
    if ('wakeLock' in navigator) {
      try {
        wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
      } catch (err) {}
    }
  }, []);

  const releaseWakeLock = useCallback(() => {
    if (wakeLockRef.current) {
      wakeLockRef.current.release().then(() => {
        wakeLockRef.current = null;
      });
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      releaseWakeLock();
    };
  }, [releaseWakeLock]);

  useEffect(() => {
    if (isPlaying) requestWakeLock();
    else releaseWakeLock();
  }, [isPlaying, requestWakeLock, releaseWakeLock]);

  const handleEnded = () => {
    setIsPlaying(false);
    setShowControls(true);
    releaseWakeLock();
  };

  const progressPercentage = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className="w-full flex flex-col items-center">
      <div 
        ref={containerRef}
        className={`relative w-full bg-black overflow-hidden select-none transition-all duration-500
          ${isFullscreen ? 'h-screen rounded-none border-none' : 'aspect-video player-frame'}`}
        onMouseMove={handleUserInteraction}
        onTouchStart={handleUserInteraction}
      >
        <video
          ref={videoRef}
          src={src}
          className="w-full h-full object-contain cursor-pointer"
          playsInline
          onClick={togglePlay}
          onTimeUpdate={handleProgress}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
        />

        {/* Центральная кнопка Play/Replay */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px] pointer-events-none transition-all duration-300">
            <button 
              onClick={(e) => { e.stopPropagation(); togglePlay(); }}
              className="w-24 h-24 md:w-32 md:h-32 bg-red-600 rounded-full flex items-center justify-center text-white 
                shadow-[0_15px_35px_rgba(220,38,38,0.4),inset_0_-6px_10px_rgba(0,0,0,0.2),inset_0_4px_8px_rgba(255,255,255,0.3)] 
                hover:scale-105 active:scale-95 transition-transform pointer-events-auto"
            >
              {currentTime > 0 && currentTime >= duration ? 
                <ReplayIcon className="w-12 h-12 md:w-16 md:h-16" /> : 
                <PlayIcon className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center pl-1" />
              }
            </button>
          </div>
        )}

        {/* Компактная линия прогресса с отступами и скруглениями */}
        <div 
          className={`absolute bottom-0 left-0 right-0 px-4 pb-4 md:px-6 md:pb-6 bg-gradient-to-t from-black/80 to-transparent transition-opacity duration-500 
            ${showControls || !isPlaying ? 'opacity-100' : 'opacity-0'}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div 
            className="w-full h-1.5 bg-white/20 cursor-pointer relative group rounded-full overflow-hidden" 
            onClick={handleSeek}
          >
            <div 
              className="h-full bg-gradient-to-r from-red-600 to-red-400 relative transition-all duration-100 rounded-full"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Кнопка полноэкранного режима ВНЕ плеера */}
      {!isFullscreen && (
        <div className="mt-6 flex justify-center w-full">
          <button 
            onClick={toggleFullscreen} 
            className="flex items-center gap-2 px-6 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white/90 hover:text-white transition-all text-sm font-bold tracking-wider uppercase"
            aria-label="Полноэкранный режим"
          >
            <FullscreenIcon className="w-5 h-5" />
            <span>На весь экран</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
