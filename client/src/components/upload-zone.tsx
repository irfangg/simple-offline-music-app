import { useCallback, useState } from 'react';
import { Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { musicDB } from '@/lib/db';
import { useQueryClient } from '@tanstack/react-query';

export function UploadZone() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [totalFiles, setTotalFiles] = useState(0);
  const [processedFiles, setProcessedFiles] = useState(0);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files?.length) return;

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

          await musicDB.addSong({
            title: file.name.replace(/\.[^/.]+$/, ""),
            artist: "Unknown",
            duration: Math.floor(audio.duration),
            fileName: file.name,
            fileType: file.type,
            fileData: base64Data
          });

          setProcessedFiles(prev => prev + 1);
          setProgress((processedFiles + 1) * 100 / totalFiles);

          toast({
            title: "Success",
            description: `Uploaded ${file.name}`
          });

          // Invalidate the songs query to refresh the playlist
          queryClient.invalidateQueries({ queryKey: ['songs'] });
        };

        reader.readAsDataURL(file);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Upload failed",
          description: "Failed to upload audio file"
        });
        setProcessedFiles(prev => prev + 1);
      }
    }

    // Reset the upload state when all files are processed
    if (processedFiles === totalFiles) {
      setIsUploading(false);
      setProgress(0);
      setTotalFiles(0);
      setProcessedFiles(0);
    }
  }, [toast, queryClient, totalFiles, processedFiles]);

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
      <label 
        htmlFor="file-upload" 
        className={`cursor-pointer ${isUploading ? 'pointer-events-none opacity-50' : ''}`}
      >
        <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <div className="text-lg font-medium">
          {isUploading ? 'Processing files...' : 'Drop audio files here'}
        </div>
        <div className="text-sm text-muted-foreground mt-1">
          {isUploading 
            ? `${processedFiles} of ${totalFiles} files processed`
            : 'or click to upload'}
        </div>
        {isUploading ? (
          <div className="mt-4 w-full max-w-xs mx-auto">
            <Progress value={progress} className="h-2" />
          </div>
        ) : (
          <Button variant="outline" className="mt-4" disabled={isUploading}>
            Select Files
          </Button>
        )}
      </label>
    </div>
  );
}