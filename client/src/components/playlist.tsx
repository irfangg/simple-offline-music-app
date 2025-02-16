import { useCallback } from 'react';
import { Music, Trash2 } from 'lucide-react';
import type { Song } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { musicDB } from '@/lib/db';
import { useToast } from '@/hooks/use-toast';

interface PlaylistProps {
  songs: Song[];
  currentSong?: Song;
  onSelect: (song: Song) => void;
  onDelete: (id: number) => void;
}

export function Playlist({ songs, currentSong, onSelect, onDelete }: PlaylistProps) {
  const { toast } = useToast();

  const handleDelete = useCallback(async (id: number) => {
    try {
      await musicDB.deleteSong(id);
      onDelete(id);
      toast({
        title: "Success",
        description: "Song removed from playlist"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove song"
      });
    }
  }, [onDelete, toast]);

  return (
    <ScrollArea className="h-[calc(100vh-24rem)]">
      <div className="space-y-1 p-2">
        {songs.map((song) => (
          <div
            key={song.id}
            className={`flex items-center justify-between p-2 rounded-md hover:bg-accent ${
              currentSong?.id === song.id ? 'bg-accent' : ''
            }`}
          >
            <Button
              variant="ghost"
              className="flex-1 justify-start gap-2"
              onClick={() => onSelect(song)}
            >
              <Music className="h-4 w-4" />
              <span className="font-medium">{song.title}</span>
              <span className="text-muted-foreground">{song.artist}</span>
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(song.id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}

        {songs.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No songs in playlist
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
