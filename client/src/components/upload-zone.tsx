import { useCallback } from 'react';
import { Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { musicDB } from '@/lib/db';

export function UploadZone() {
  const { toast } = useToast();

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files?.length) return;

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
      }
    }
  }, [toast]);

  return (
    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
      <input
        type="file"
        id="file-upload"
        className="hidden"
        accept="audio/*"
        multiple
        onChange={handleFileUpload}
      />
      <label htmlFor="file-upload" className="cursor-pointer">
        <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <div className="text-lg font-medium">Drop audio files here</div>
        <div className="text-sm text-muted-foreground mt-1">or click to upload</div>
        <Button variant="outline" className="mt-4">
          Select Files
        </Button>
      </label>
    </div>
  );
}
