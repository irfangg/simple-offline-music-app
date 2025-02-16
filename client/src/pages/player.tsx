import { useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { Song } from '@shared/schema';
import { UploadZone } from '@/components/upload-zone';
import { AudioPlayer } from '@/components/audio-player';
import { Playlist } from '@/components/playlist';
import { musicDB } from '@/lib/db';

export default function Player() {
  const [currentSong, setCurrentSong] = useState<Song>();
  const queryClient = useQueryClient();

  const { data: songs = [], isLoading } = useQuery({
    queryKey: ['songs'],
    queryFn: () => musicDB.getAllSongs()
  });

  const handleSongSelect = useCallback((song: Song) => {
    setCurrentSong(song);
  }, []);

  const handlePrevious = useCallback(() => {
    const currentIndex = songs.findIndex(s => s.id === currentSong?.id);
    if (currentIndex > 0) {
      setCurrentSong(songs[currentIndex - 1]);
    } else if (songs.length > 0) {
      setCurrentSong(songs[songs.length - 1]);
    }
  }, [songs, currentSong]);

  const handleNext = useCallback(() => {
    const currentIndex = songs.findIndex(s => s.id === currentSong?.id);
    if (currentIndex < songs.length - 1) {
      setCurrentSong(songs[currentIndex + 1]);
    } else if (songs.length > 0) {
      setCurrentSong(songs[0]);
    }
  }, [songs, currentSong]);

  const handleDelete = useCallback((id: number) => {
    queryClient.setQueryData(['songs'], (oldSongs: Song[]) => 
      oldSongs.filter(song => song.id !== id)
    );
    if (currentSong?.id === id) {
      setCurrentSong(undefined);
    }
  }, [currentSong, queryClient]);

  return (
    <div className="container mx-auto p-4 pb-32">
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-center mb-8">
          Offline Music Player
        </h1>
        
        <UploadZone />
        
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Playlist</h2>
          {isLoading ? (
            <div className="text-center py-8">Loading songs...</div>
          ) : (
            <Playlist
              songs={songs}
              currentSong={currentSong}
              onSelect={handleSongSelect}
              onDelete={handleDelete}
            />
          )}
        </div>
      </div>

      <AudioPlayer
        currentSong={currentSong}
        onPrevious={handlePrevious}
        onNext={handleNext}
      />
    </div>
  );
}
