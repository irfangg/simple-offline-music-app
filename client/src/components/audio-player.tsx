import { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';
import type { Song } from '@shared/schema';

interface AudioPlayerProps {
  currentSong?: Song;
  onPrevious: () => void;
  onNext: () => void;
}

export function AudioPlayer({ currentSong, onPrevious, onNext }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Reset state when song changes
  useEffect(() => {
    if (currentSong) {
      if (audioRef.current) {
        audioRef.current.src = currentSong.fileData;
        audioRef.current.load(); // Explicitly load the new source
        if (isPlaying) {
          audioRef.current.play().catch(() => setIsPlaying(false));
        }
      }
      setCurrentTime(0);
    }
  }, [currentSong]);

  // Handle audio events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const handleEnded = () => {
      setIsPlaying(false);
      onNext();
    };
    const handleError = () => {
      setIsPlaying(false);
      console.error('Error playing audio');
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [onNext]);

  const togglePlay = async () => {
    if (!audioRef.current) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        await audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    } catch (error) {
      console.error('Error toggling play state:', error);
      setIsPlaying(false);
    }
  };

  const handleTimeChange = ([value]: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value;
      setCurrentTime(value);
    }
  };

  const handleVolumeChange = ([value]: number[]) => {
    if (audioRef.current) {
      audioRef.current.volume = value;
      setVolume(value);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!currentSong) return null;

  return (
    <Card className="w-full max-w-2xl mx-auto fixed bottom-4 left-1/2 -translate-x-1/2">
      <CardContent className="p-6">
        <audio
          ref={audioRef}
          preload="auto"
        />

        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold">{currentSong.title}</h3>
          <p className="text-sm text-muted-foreground">{currentSong.artist}</p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-sm">{formatTime(currentTime)}</span>
            <Slider
              value={[currentTime]}
              max={currentSong.duration}
              step={1}
              onValueChange={handleTimeChange}
              className="flex-1"
            />
            <span className="text-sm">{formatTime(currentSong.duration)}</span>
          </div>

          <div className="flex justify-center items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onPrevious}
            >
              <SkipBack className="h-6 w-6" />
            </Button>

            <Button
              variant="default"
              size="icon"
              onClick={togglePlay}
              className="h-12 w-12"
            >
              {isPlaying ? (
                <Pause className="h-6 w-6" />
              ) : (
                <Play className="h-6 w-6" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={onNext}
            >
              <SkipForward className="h-6 w-6" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Volume2 className="h-4 w-4" />
            <Slider
              value={[volume]}
              max={1}
              step={0.1}
              onValueChange={handleVolumeChange}
              className="w-24"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}