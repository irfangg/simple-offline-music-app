import { useCallback, useState } from 'react';
import { Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { musicDB } from '@/lib/db';
import { useQueryClient } from '@tanstack/react-query';
import type { Song } from '@shared/schema';

export function UploadZone() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [totalFiles, setTotalFiles] = useState(0);
  const [processedFiles, setProcessedFiles] = useState(0);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    setIsUploading(true);
    setTotalFiles(files.length);
    setProcessedFiles(0);
    setProgress(0);

    for (const file of files) {
      if (!file.type.startsWith('audio/')) {
        toast({
          variant: "destructive",
          title: "Invalid file type",
          description: "Please upload only audio files"
        });
        continue;
      }

      try {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const base64Data = e.target?.result as string;
          const audio = new Audio();

          audio.src = base64Data;
          await new Promise((resolve) => {
            audio.onloadedmetadata = resolve;
          });

          const newSong = {
            title: file.name.replace(/\.[^/.]+$/, ""),
            artist: "Unknown",
            duration: Math.floor(audio.duration),
            fileName: file.name,
            fileType: file.type,
            fileData: base64Data
          };

          const id = await musicDB.addSong(newSong);

          // Optimistically update the songs list
          queryClient.setQueryData<Song[]>(['songs'], (oldSongs = []) => [
            ...oldSongs,
            { ...newSong, id }
          ]);

          setProcessedFiles(prev => {
            const newProcessed = prev + 1;
            setProgress((newProcessed * 100) / totalFiles);

            // Check if all files are processed
            if (newProcessed === files.length) {
              setIsUploading(false);
              setProgress(0);
              setTotalFiles(0);
              event.target.value = ''; // Reset file input
            }

            return newProcessed;
          });

          toast({
            title: "Success",
            description: `Uploaded ${file.name}`
          });
        };

        reader.readAsDataURL(file);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Upload failed",
          description: "Failed to upload audio file"
        });
        setProcessedFiles(prev => {
          const newProcessed = prev + 1;
          if (newProcessed === files.length) {
            setIsUploading(false);
            setProgress(0);
            setTotalFiles(0);
            event.target.value = ''; // Reset file input
          }
          return newProcessed;
        });
      }
    }
  }, [toast, queryClient, totalFiles]);

  const triggerFileInput = () => {
    document.getElementById('file-upload')?.click();
  };

  return (
    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
      <input
        type="file"
        id="file-upload"
        className="hidden"
        accept="audio/*"
        multiple
        onChange={handleFileUpload}
        disabled={isUploading}
      />

      <div className={`${isUploading ? 'pointer-events-none opacity-50' : ''}`}>
        <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <div className="text-lg font-medium">
          {isUploading ? 'Processing files...' : 'Drop audio files here'}
        </div>
        <div className="text-sm text-muted-foreground mt-1">
          {isUploading 
            ? `${processedFiles} of ${totalFiles} files processed`
            : 'or click button below to upload'}
        </div>

        {isUploading ? (
          <div className="mt-4 w-full max-w-xs mx-auto">
            <Progress value={progress} className="h-2" />
          </div>
        ) : (
          <Button 
            variant="outline" 
            className="mt-4" 
            disabled={isUploading}
            onClick={triggerFileInput}
          >
            Select Files
          </Button>
        )}
      </div>
    </div>
  );
}