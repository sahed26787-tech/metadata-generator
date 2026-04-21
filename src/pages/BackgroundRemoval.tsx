import React, { useState, useRef, useCallback } from 'react';
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

// Types
interface RemovalTask {
  id: string;
  file: File;
  preview: string;
  status: 'pending' | 'processing' | 'done' | 'failed';
  resultUrl?: string;
  error?: string;
}

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
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const batchFileInputRef = useRef<HTMLInputElement>(null);

  // Handle single file upload
  const handleSingleUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
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

  // Handle batch file upload
  const handleBatchUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
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

  // Remove a task
  const removeTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  // Clear all tasks
  const clearAll = () => {
    setTasks([]);
    setCurrentTaskIndex(0);
  };

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

  // Status badge component
  const StatusBadge = ({ status }: { status: RemovalTask['status'] }) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-500 border-yellow-500">Pending</Badge>;
      case 'processing':
        return <Badge className="bg-blue-600"><Loader2 className="w-3 h-3 mr-1 animate-spin" />Processing</Badge>;
      case 'done':
        return <Badge className="bg-green-600"><CheckCircle2 className="w-3 h-3 mr-1" />Done</Badge>;
      case 'failed':
        return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Failed</Badge>;
    }
  };

  const doneCount = tasks.filter(t => t.status === 'done').length;
  const totalCount = tasks.length;
  const progress = totalCount > 0 ? (doneCount / totalCount) * 100 : 0;

  return (
    <div className="w-full h-full p-6">
          {mode === 'single' && (
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Upload Area */}
              {tasks.length === 0 && (
                <div 
                  className="border-2 border-dashed border-primary/60 rounded-xl p-16 text-center hover:border-primary transition-all duration-300 cursor-pointer bg-card shadow-sm hover:shadow-md group"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                    <Upload className="w-8 h-8 text-primary" />
                  </div>
                  <p className="text-xl font-semibold text-foreground mb-2">Click to upload an image</p>
                  <p className="text-sm text-muted-foreground">JPG, PNG, WEBP supported</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleSingleUpload}
                    className="hidden"
                  />
                </div>
              )}

              {/* Preview & Result */}
              {tasks.length > 0 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Left: Always show original */}
                    <Card className="bg-card border-border overflow-hidden">
                      <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground mb-2">Original</p>
                        <img 
                          src={tasks[0].preview}
                          alt="Original"
                          className="w-full h-64 object-contain bg-background rounded"
                        />
                      </CardContent>
                    </Card>

                    {/* Right: show result/placeholder */}
                    <Card className="bg-card border-border overflow-hidden">
                      <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground mb-2">Result</p>
                        {tasks[0].status === 'done' && tasks[0].resultUrl ? (
                          <img 
                            src={tasks[0].resultUrl}
                            alt="Result"
                            className="w-full h-64 object-contain bg-background rounded"
                          />
                        ) : tasks[0].status === 'processing' ? (
                          <div className="w-full h-64 flex items-center justify-center bg-background rounded">
                            <Loader2 className="w-8 h-8 text-primary animate-spin" />
                          </div>
                        ) : (
                          <div className="w-full h-64 flex items-center justify-center bg-background rounded text-muted-foreground">
                            {tasks[0].status === 'failed' ? 'Failed to process' : 'Click Remove Background to start'}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-center gap-4">
                    <Button
                      onClick={processSingle}
                      disabled={tasks[0].status === 'processing' || tasks[0].status === 'done'}
                      className="bg-primary hover:bg-primary/90"
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
                        className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download PNG
                      </Button>
                    )}

                    <Button
                      onClick={() => setTasks([])}
                      variant="outline"
                      className="border-border text-muted-foreground"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Clear
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {mode === 'batch' && (
            <div className="space-y-6">
              {/* Upload & Progress Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <input
                    ref={batchFileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    onChange={handleBatchUpload}
                    className="hidden"
                  />

                  {tasks.length > 0 && (
                    <Button
                      onClick={processBatch}
                      disabled={isProcessing || tasks.filter(t => t.status === 'pending').length === 0}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      {isProcessing ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processing...</>
                      ) : (
                        <><ImageIcon className="w-4 h-4 mr-2" />Process All</>
                      )}
                    </Button>
                  )}

                  {tasks.length > 0 && !isProcessing && (
                    <Button
                      onClick={clearAll}
                      variant="outline"
                      className="border-border text-muted-foreground"
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
                    className="border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white"
                  >
                    <FileArchive className="w-4 h-4 mr-2" />
                    Download All as ZIP
                  </Button>
                )}
              </div>

              {/* Progress Bar */}
              {tasks.length > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="text-foreground">{doneCount} / {totalCount} completed</span>
                  </div>
                  <Progress value={progress} className="h-2 bg-secondary" />
                </div>
              )}

              {/* Empty State */}
              {tasks.length === 0 && (
                <div 
                  className="border-2 border-dashed border-primary/60 rounded-xl p-20 text-center hover:border-primary transition-all duration-300 cursor-pointer bg-card shadow-sm hover:shadow-md group"
                  onClick={() => batchFileInputRef.current?.click()}
                >
                  <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/20 transition-colors">
                    <Images className="w-10 h-10 text-primary" />
                  </div>
                  <p className="text-2xl font-bold text-foreground mb-3">Upload multiple images</p>
                  <p className="text-sm text-muted-foreground mb-4">Select multiple JPG, PNG, or WEBP files</p>
                  <p className="text-foreground text-sm font-medium">Process 500 images in a Single Action</p>
                </div>
              )}

              {/* Grid of Cards */}
              {tasks.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {tasks.map((task, index) => (
                    <Card 
                      key={task.id} 
                      className={`bg-card border-border overflow-hidden ${
                        isProcessing && currentTaskIndex === index ? 'ring-2 ring-primary' : ''
                      }`}
                    >
                      <div className="relative aspect-square">
                        <img 
                          src={task.status === 'done' && task.resultUrl ? task.resultUrl : task.preview} 
                          alt={task.file.name}
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => removeTask(task.id)}
                          disabled={isProcessing}
                          className="absolute top-2 right-2 p-1 bg-red-600 rounded text-white opacity-0 hover:opacity-100 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                          {task.status === 'done' && task.resultUrl && (
                            <Button
                              size="sm"
                              onClick={() => downloadImage(task.resultUrl!, `bg-removed-${task.file.name}`)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                      <CardContent className="p-3">
                        <p className="text-xs text-muted-foreground truncate mb-2" title={task.file.name}>
                          {task.file.name}
                        </p>
                        <div className="flex items-center justify-between">
                          <StatusBadge status={task.status} />
                          {task.status === 'failed' && (
                            <button
                              onClick={() => toast.error(task.error || 'Unknown error')}
                              className="text-red-400 hover:text-red-300"
                            >
                              <AlertCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
    </div>
  );
};

export default BackgroundRemoval;
