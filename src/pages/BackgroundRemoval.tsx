import React, { useState, useRef, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { 
  Upload, Download, 
  Image as ImageIcon, Images, Trash2, AlertCircle,
  CheckCircle2, Loader2, X, FileArchive
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import JSZip from 'jszip';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

// --- Types ---
interface RemovalTask {
  id: string;
  file: File;
  preview: string;
  status: 'pending' | 'processing' | 'done' | 'failed';
  resultUrl?: string;
  error?: string;
}

// --- Memoized Card Component for Performance ---

const RemovalTaskCard = React.memo(({ 
  task, 
  isProcessing, 
  isCurrentTask, 
  onRemove, 
  onDownload 
}: { 
  task: RemovalTask; 
  isProcessing: boolean; 
  isCurrentTask: boolean;
  onRemove: (id: string) => void;
  onDownload: (url: string, filename: string) => void;
}) => {
  const StatusBadge = ({ status }: { status: RemovalTask['status'] }) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-500 border-yellow-500 text-[10px] h-5">Pending</Badge>;
      case 'processing':
        return <Badge className="bg-blue-600 text-[10px] h-5"><Loader2 className="w-3 h-3 mr-1 animate-spin" />Processing</Badge>;
      case 'done':
        return <Badge className="bg-green-600 text-[10px] h-5"><CheckCircle2 className="w-3 h-3 mr-1" />Done</Badge>;
      case 'failed':
        return <Badge variant="destructive" className="text-[10px] h-5"><AlertCircle className="w-3 h-3 mr-1" />Failed</Badge>;
    }
  };

  return (
    <Card className={`bg-card border-border overflow-hidden transition-all duration-200 group ${isCurrentTask ? 'ring-2 ring-primary shadow-lg scale-[1.02]' : ''}`}>
      <div className="relative aspect-square bg-secondary/20">
        <img 
          src={task.status === 'done' && task.resultUrl ? task.resultUrl : task.preview} 
          alt={task.file.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <button
          onClick={() => onRemove(task.id)}
          disabled={isProcessing}
          className="absolute top-2 right-2 p-1 bg-red-600/80 hover:bg-red-600 rounded text-white opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <X className="w-3 h-3" />
        </button>
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          {task.status === 'done' && task.resultUrl && (
            <Button
              size="sm"
              onClick={() => onDownload(task.resultUrl!, `bg-removed-${task.file.name}`)}
              className="bg-green-600 hover:bg-green-700 h-8 w-8 p-0"
            >
              <Download className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
      <CardContent className="p-2.5">
        <p className="text-[10px] text-muted-foreground truncate mb-1.5" title={task.file.name}>
          {task.file.name}
        </p>
        <div className="flex items-center justify-between">
          <StatusBadge status={task.status} />
          {task.status === 'failed' && (
            <button
              onClick={() => toast.error(task.error || 'Unknown error')}
              className="text-red-400 hover:text-red-300"
            >
              <AlertCircle className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

type ProcessingMode = 'single' | 'batch';

// Utility: Convert file to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix to get pure base64
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Utility: Download image from URL
const downloadImage = async (url: string, filename: string) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    toast.error('Failed to download image');
  }
};

// Supabase Edge Function Call
const removeBackground = async (
  base64Image: string, 
  preserveAlpha: boolean = true,
  outputFormat: 'PNG' | 'WEBP' = 'PNG'
): Promise<string> => {
  // Get current session to ensure JWT is available
  const { data: { session } } = await supabase.auth.getSession();
  
  console.log('Session check:', { hasSession: !!session, accessToken: session?.access_token ? 'present' : 'missing' });
  
  if (!session) {
    throw new Error('You must be logged in to use this feature. Please sign in.');
  }

  console.log('Calling edge function with JWT token...');
  
  const { data, error } = await supabase.functions.invoke('remove-background', {
    headers: {
      'Authorization': `Bearer ${session.access_token}`
    },
    body: { 
      image: base64Image, 
      outputFormat, 
      preserveAlpha 
    }
  });

  console.log('Edge function response:', { data, error });

  if (error) {
    console.error('Edge function error:', error);
    throw new Error(error.message || 'Failed to remove background');
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  if (!data?.imageURL) {
    throw new Error('No image URL in response');
  }

  return data.imageURL;
};

interface BackgroundRemovalProps {
  mode: 'single' | 'batch';
  preserveAlpha: boolean;
  outputFormat: 'PNG' | 'WEBP';
}

const BackgroundRemoval: React.FC<BackgroundRemovalProps> = ({ 
  mode, 
  preserveAlpha, 
  outputFormat 
}) => {
  const { user, deductCredits } = useAuth();
  const CREDIT_COST_PER_IMAGE = 5;
  
  // State: Tasks
  const [tasks, setTasks] = useState<RemovalTask[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const batchFileInputRef = useRef<HTMLInputElement>(null);

  // Memoized derived data
  const doneCount = useMemo(() => tasks.filter(t => t.status === 'done').length, [tasks]);
  const totalCount = useMemo(() => tasks.length, [tasks]);
  const progress = useMemo(() => totalCount > 0 ? (doneCount / totalCount) * 100 : 0, [doneCount, totalCount]);

  // Handle single file upload
  const handleSingleFiles = useCallback((files: File[]) => {
    const file = files[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Only JPG, PNG, WEBP files are supported');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const preview = reader.result as string;
      setTasks([{
        id: uuidv4(),
        file,
        preview,
        status: 'pending'
      }]);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleSingleUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleSingleFiles(files);
  }, [handleSingleFiles]);

  // Handle batch file upload
  const handleBatchFiles = useCallback((files: File[]) => {
    if (files.length === 0) return;

    if (files.length > 500) {
      toast.error('Maximum 500 images allowed at once');
      return;
    }

    const validFiles = files.filter(file => 
      ['image/jpeg', 'image/png', 'image/webp'].includes(file.type)
    );

    if (validFiles.length < files.length) {
      toast.warning(`${files.length - validFiles.length} files were skipped (unsupported format)`);
    }

    const newTasks: RemovalTask[] = [];
    let processed = 0;

    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        newTasks.push({
          id: uuidv4(),
          file,
          preview: reader.result as string,
          status: 'pending'
        });
        processed++;
        if (processed === validFiles.length) {
          setTasks(prev => [...prev, ...newTasks]);
        }
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const handleBatchUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleBatchFiles(files);
  }, [handleBatchFiles]);

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x >= rect.right || y < rect.top || y >= rect.bottom) {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (isProcessing) {
      toast.error('Please wait for the current process to finish');
      return;
    }

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      if (mode === 'single') {
        handleSingleFiles(files);
      } else {
        handleBatchFiles(files);
      }
    }
  }, [mode, isProcessing, handleSingleFiles, handleBatchFiles]);

  // Remove a task
  const removeTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  // Clear all tasks
  const clearAll = useCallback(() => {
    setTasks([]);
    setCurrentTaskIndex(0);
  }, []);

  // Process single image
  const processSingle = async () => {
    if (tasks.length === 0) {
      toast.error('Please upload an image first');
      return;
    }

    const task = tasks[0];
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: 'processing' } : t));

    try {
      const base64 = await fileToBase64(task.file);
      const resultUrl = await removeBackground(base64, preserveAlpha, outputFormat);
      
      // Deduct credits only after successful API call
      const creditsDeducted = await deductCredits(CREDIT_COST_PER_IMAGE);
      if (!creditsDeducted) {
        // If credit deduction failed, still show result but warn user
        toast.warning('Background removed but failed to deduct credits');
      }
      
      setTasks(prev => prev.map(t => 
        t.id === task.id ? { ...t, status: 'done', resultUrl } : t
      ));
      toast.success('Background removed successfully!');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to process image';
      setTasks(prev => prev.map(t => 
        t.id === task.id ? { ...t, status: 'failed', error: message } : t
      ));
      toast.error(message);
    }
  };

  // Process all images in batch
  const processBatch = async () => {
    const pendingTasks = tasks.filter(t => t.status === 'pending');
    if (pendingTasks.length === 0) {
      toast.info('No pending images to process');
      return;
    }

    setIsProcessing(true);
    let completed = 0;
    let totalCreditsDeducted = 0;

    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i];
      if (task.status !== 'pending') continue;

      setCurrentTaskIndex(i);
      setTasks(prev => prev.map(t => 
        t.id === task.id ? { ...t, status: 'processing' } : t
      ));

      try {
        const base64 = await fileToBase64(task.file);
        const resultUrl = await removeBackground(base64, preserveAlpha, outputFormat);
        
        // Deduct credits only after successful API call for each image
        const creditsDeducted = await deductCredits(CREDIT_COST_PER_IMAGE);
        if (creditsDeducted) {
          totalCreditsDeducted += CREDIT_COST_PER_IMAGE;
        }
        
        setTasks(prev => prev.map(t => 
          t.id === task.id ? { ...t, status: 'done', resultUrl } : t
        ));
        completed++;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to process image';
        setTasks(prev => prev.map(t => 
          t.id === task.id ? { ...t, status: 'failed', error: message } : t
        ));
        toast.error(`${task.file.name}: ${message}`);
      }
    }

    setIsProcessing(false);
    if (completed > 0) {
      toast.success(`Processed ${completed} images successfully! ${totalCreditsDeducted} credits used.`);
    }
  };

  // Download all results as ZIP
  const downloadAllAsZip = async () => {
    const doneTasks = tasks.filter(t => t.status === 'done' && t.resultUrl);
    if (doneTasks.length === 0) {
      toast.error('No completed images to download');
      return;
    }

    toast.info('Creating ZIP file...');
    const zip = new JSZip();

    for (let i = 0; i < doneTasks.length; i++) {
      const task = doneTasks[i];
      try {
        const response = await fetch(task.resultUrl!);
        const blob = await response.blob();
        const extension = outputFormat.toLowerCase();
        const filename = `bg-removed-${i + 1}.${extension}`;
        zip.file(filename, blob);
      } catch (error) {
        console.error(`Failed to add image ${i + 1} to zip`, error);
      }
    }

    const content = await zip.generateAsync({ type: 'blob' });
    const url = window.URL.createObjectURL(content);
    const link = document.createElement('a');
    link.href = url;
    link.download = `background-removed-${Date.now()}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    toast.success('ZIP file downloaded!');
  };

  const handleDownloadSingle = useCallback(downloadImage, []);

  const handleUploadClick = () => {
    if (mode === 'single') {
      fileInputRef.current?.click();
    } else {
      batchFileInputRef.current?.click();
    }
  };

  return (
    <div 
      className="w-full h-full p-4 md:p-6"
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Visual Overlay for Dragging State */}
      {isDragging && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/10 backdrop-blur-sm border-4 border-dashed border-primary m-4 rounded-2xl pointer-events-none">
          <div className="bg-background/90 p-6 rounded-xl shadow-2xl flex flex-col items-center animate-in zoom-in duration-200">
            <Upload className="w-12 h-12 text-primary mb-4 animate-bounce" />
            <p className="text-xl font-bold text-foreground">Drop images to upload</p>
            <p className="text-sm text-muted-foreground mt-1">JPG, PNG, or WEBP</p>
          </div>
        </div>
      )}

      {/* Hidden Inputs - Moved to top to prevent layout shifts */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleSingleUpload}
        className="hidden"
      />
      <input
        ref={batchFileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={handleBatchUpload}
        className="hidden"
      />

      <div className="space-y-6">
        {/* Common Upload Area */}
        {tasks.length === 0 && (
          <div 
            className={`border-2 border-dashed rounded-xl p-8 md:p-20 text-center transition-all duration-300 cursor-pointer bg-card shadow-sm group max-w-5xl mx-auto ${
              isDragging 
                ? 'border-primary bg-primary/5 scale-[1.02] shadow-lg' 
                : 'border-primary/60 hover:border-primary hover:shadow-md'
            }`}
            onClick={handleUploadClick}
          >
            <div className="bg-primary/15 border border-primary/35 w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6 group-hover:bg-primary/20 transition-colors">
              {mode === 'single' ? (
                <Upload className="w-8 h-8 md:w-10 md:h-10 text-primary" />
              ) : (
                <Images className="w-10 h-10 text-primary" />
              )}
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-foreground mb-4 md:mb-5 font-inter">
              {mode === 'single' ? 'Click to upload an image' : 'Click to upload images'}
            </h3>
            
            <div className="flex items-center justify-center mb-1.5 md:mb-2">
              <AlertCircle className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground mr-1.5 md:mr-2" />
              <span className="text-muted-foreground text-xs md:text-sm">JPG, PNG, WEBP supported</span>
            </div>
            
            <p className="text-muted-foreground text-xs md:text-sm text-center mb-3 md:mb-4 max-w-md mx-auto">
              Drag & drop files here, or browse
            </p>
            
            <p className="text-foreground text-xs md:text-sm font-medium">Process 500 images in a Single Action</p>
          </div>
        )}

        {/* Single Mode Content */}
        {mode === 'single' && tasks.length > 0 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left: Always show original */}
              <Card className="bg-card border-border overflow-hidden">
                <CardContent className="p-3 md:p-4">
                  <p className="text-xs md:text-sm text-muted-foreground mb-2">Original</p>
                  <img 
                    src={tasks[0].preview}
                    alt="Original"
                    className="w-full h-48 md:h-64 object-contain bg-background rounded"
                    loading="lazy"
                  />
                </CardContent>
              </Card>

              {/* Right: show result/placeholder */}
              <Card className="bg-card border-border overflow-hidden">
                <CardContent className="p-3 md:p-4">
                  <p className="text-xs md:text-sm text-muted-foreground mb-2">Result</p>
                  {tasks[0].status === 'done' && tasks[0].resultUrl ? (
                    <img 
                      src={tasks[0].resultUrl}
                      alt="Result"
                      className="w-full h-48 md:h-64 object-contain bg-background rounded"
                      loading="lazy"
                    />
                  ) : tasks[0].status === 'processing' ? (
                    <div className="w-full h-48 md:h-64 flex items-center justify-center bg-background rounded">
                      <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    </div>
                  ) : (
                    <div className="w-full h-48 md:h-64 flex items-center justify-center bg-background rounded text-muted-foreground text-xs md:text-sm text-center px-4">
                      {tasks[0].status === 'failed' ? 'Failed to process' : 'Click Remove Background to start'}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-3 md:gap-4">
              <Button
                onClick={processSingle}
                disabled={tasks[0].status === 'processing' || tasks[0].status === 'done'}
                className="bg-primary hover:bg-primary/90 w-full sm:w-auto"
              >
                {tasks[0].status === 'processing' ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processing...</>
                ) : (
                  <>Remove Background</>
                )}
              </Button>

              {tasks[0].status === 'done' && tasks[0].resultUrl && (
                <Button
                  onClick={() => downloadImage(tasks[0].resultUrl!, `bg-removed-${tasks[0].file.name}`)}
                  variant="outline"
                  className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white w-full sm:w-auto"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download PNG
                </Button>
              )}

              <Button
                onClick={() => setTasks([])}
                variant="outline"
                className="border-border text-muted-foreground w-full sm:w-auto"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear
              </Button>
            </div>
          </div>
        )}

        {/* Batch Mode Content */}
        {mode === 'batch' && tasks.length > 0 && (
          <div className="space-y-6">
            {/* Upload & Progress Header */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 w-full sm:w-auto">
                <Button
                  onClick={processBatch}
                  size="sm"
                  disabled={isProcessing || tasks.filter(t => t.status === 'pending').length === 0}
                  className="bg-green-600 hover:bg-green-700 text-white flex-1 sm:flex-none"
                >
                  {isProcessing ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processing...</>
                  ) : (
                    <><ImageIcon className="w-4 h-4 mr-2" />Generate all</>
                  )}
                </Button>

                {!isProcessing && (
                  <Button
                    onClick={clearAll}
                    variant="outline"
                    size="sm"
                    className="border-border text-muted-foreground flex-1 sm:flex-none"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear All
                  </Button>
                )}
              </div>

              {doneCount > 0 && (
                <Button
                    onClick={downloadAllAsZip}
                    variant="outline"
                    size="sm"
                    className="border-primary text-primary hover:bg-primary hover:text-primary-foreground w-full sm:w-auto"
                  >
                    <FileArchive className="w-4 h-4 mr-2" />
                    Download All as ZIP
                  </Button>
              )}
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs md:text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="text-foreground">{doneCount} / {totalCount} completed</span>
              </div>
              <Progress value={progress} className="h-2 bg-secondary" />
            </div>

            {/* Grid of Cards - Using Memoized Component */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
              {tasks.map((task, index) => (
                <RemovalTaskCard 
                  key={task.id}
                  task={task}
                  isProcessing={isProcessing}
                  isCurrentTask={isProcessing && currentTaskIndex === index}
                  onRemove={removeTask}
                  onDownload={handleDownloadSingle}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BackgroundRemoval;
