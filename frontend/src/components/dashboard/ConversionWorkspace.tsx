import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X, ArrowRight, Check, Loader2, Download, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { api, Job } from '../../lib/api';

interface UploadedFile {
  file: File;
  id: string;
}

const outputFormatsByCategory: Record<string, string[]> = {
  image: ['png', 'jpg', 'webp', 'gif', 'svg'],
  video: ['mp4', 'avi', 'mov', 'mkv', 'webm'],
  audio: ['mp3', 'wav', 'flac', 'aac', 'ogg'],
  document: ['pdf', 'docx', 'txt', 'rtf', 'odt'],
  archive: ['zip', 'rar', '7z', 'tar', 'gzip'],
  default: ['pdf', 'png', 'jpg', 'mp3', 'mp4'],
};

const mimeCategoryMap: Record<string, keyof typeof outputFormatsByCategory> = {
  // Images
  'image/png': 'image',
  'image/jpeg': 'image',
  'image/webp': 'image',
  'image/gif': 'image',
  'image/svg+xml': 'image',

  // Videos
  'video/mp4': 'video',
  'video/x-msvideo': 'video',
  'video/quicktime': 'video',
  'video/x-matroska': 'video',
  'video/webm': 'video',

  // Audio
  'audio/mpeg': 'audio',
  'audio/wav': 'audio',
  'audio/flac': 'audio',
  'audio/aac': 'audio',
  'audio/ogg': 'audio',

  // Documents
  'application/pdf': 'document',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'document',
  'text/plain': 'document',
  'application/rtf': 'document',
  'application/vnd.oasis.opendocument.text': 'document',

  // Archives
  'application/zip': 'archive',
  'application/x-rar-compressed': 'archive',
  'application/vnd.rar': 'archive',
  'application/x-7z-compressed': 'archive',
  'application/x-tar': 'archive',
  'application/gzip': 'archive',
};

const extCategoryMap: Record<string, keyof typeof outputFormatsByCategory> = {
  png: 'image',
  jpg: 'image',
  webp: 'image',
  gif: 'image',
  svg: 'image',
  mp4: 'video',
  avi: 'video',
  mov: 'video',
  mkv: 'video',
  webm: 'video',
  mp3: 'audio',
  wav: 'audio',
  flac: 'audio',
  aac: 'audio',
  ogg: 'audio',
  pdf: 'document',
  docx: 'document',
  txt: 'document',
  rtf: 'document',
  odt: 'document',
  zip: 'archive',
  rar: 'archive',
  '7z': 'archive',
  tar: 'archive',
  gzip: 'archive',
};

type ConversionState = 'idle' | 'uploading' | 'converting' | 'complete' | 'error';

export function ConversionWorkspace() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [selectedFormat, setSelectedFormat] = useState<string>('');
  const [conversionState, setConversionState] = useState<ConversionState>('idle');
  const [error, setError] = useState('');
  const [currentJob, setCurrentJob] = useState<Job | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // For simplicity, only allow one file at a time (matching backend)
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setUploadedFiles([{
        file,
        id: Math.random().toString(36).substr(2, 9),
      }]);
      setConversionState('idle');
      setError('');
      setCurrentJob(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    maxSize: 30 * 1024 * 1024, // 30MB limit
  });

  const removeFile = (id: string) => {
    setUploadedFiles([]);
    setSelectedFormat('');
    setConversionState('idle');
    setError('');
    setCurrentJob(null);
  };

  const getAvailableFormats = () => {
    if (uploadedFiles.length === 0) return outputFormatsByCategory.default;
    const firstFile = uploadedFiles[0].file;
    const ext = firstFile.name.split('.').pop()?.toLowerCase() || '';
    const category = mimeCategoryMap[firstFile.type] || extCategoryMap[ext] || 'default';
    return outputFormatsByCategory[category] || outputFormatsByCategory.default;
  };

  const handleConvert = async () => {
    if (!selectedFormat || uploadedFiles.length === 0) return;
    
    const file = uploadedFiles[0].file;
    setConversionState('uploading');
    setError('');

    try {
      const job = await api.uploadFile(file, selectedFormat);
      setCurrentJob(job);
      setConversionState('converting');
      
      // Poll for job status
      pollJobStatus(job.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setConversionState('error');
    }
  };

  const pollJobStatus = async (jobId: string) => {
    const interval = setInterval(async () => {
      try {
        const job = await api.getJob(jobId);
        setCurrentJob(job);

        if (job.status === 'completed') {
          clearInterval(interval);
          setConversionState('complete');
        } else if (job.status === 'failed') {
          clearInterval(interval);
          setConversionState('error');
          setError(job.error_message || 'Conversion failed');
        }
      } catch (err) {
        clearInterval(interval);
        setConversionState('error');
        setError('Failed to fetch job status');
      }
    }, 2000); // Poll every 2 seconds
  };

  const handleDownload = async () => {
    if (!currentJob) return;

    try {
      const { download_url } = await api.getDownloadUrl(currentJob.id);
      window.open(download_url, '_blank');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Download failed');
    }
  };

  const resetWorkspace = () => {
    setUploadedFiles([]);
    setSelectedFormat('');
    setConversionState('idle');
    setError('');
    setCurrentJob(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="premium-card-elevated p-8 rounded-2xl flex-1"
    >
      <h2 className="text-xl font-semibold mb-6">Convert Your Files</h2>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-2 text-sm text-destructive"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </motion.div>
      )}

      {/* Upload Zone */}
      <div
        {...getRootProps()}
        className={`upload-zone p-10 rounded-xl cursor-pointer transition-all duration-300 ${
          isDragActive ? 'dragging border-primary/50 bg-primary/5' : ''
        }`}
      >
        <input {...getInputProps()} />
        <div className="text-center">
          <div className="inline-flex p-5 rounded-2xl bg-secondary/80 mb-5">
            <Upload className="w-8 h-8 text-primary" />
          </div>
          <p className="text-foreground font-medium text-lg mb-2">
            {isDragActive ? 'Drop your files here' : 'Drag & drop files here'}
          </p>
          <p className="text-sm text-muted-foreground">
            or <span className="text-primary font-medium">browse</span> to select files
          </p>
        </div>
      </div>

      {/* Uploaded Files List */}
      <AnimatePresence>
        {uploadedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 space-y-3"
          >
            {uploadedFiles.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 border border-border"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <File className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <span className="text-sm font-medium truncate max-w-[200px] block">
                      {item.file.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {(item.file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(item.id)}
                  className="p-2 hover:bg-secondary rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Format Selection */}
      {uploadedFiles.length > 0 && conversionState === 'idle' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 space-y-4"
        >
          <div className="flex-1">
            <label className="text-sm text-muted-foreground mb-2 block font-medium">
              Convert to:
            </label>
            <Select value={selectedFormat} onValueChange={setSelectedFormat}>
              <SelectTrigger className="bg-secondary/50 border-border h-12">
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {getAvailableFormats().map((format) => (
                  <SelectItem key={format} value={format}>
                    {format.toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          
          <Button
            onClick={handleConvert}
            disabled={!selectedFormat}
            className="w-full h-12 px-8 btn-premium glow-primary"
          >
            Convert Now
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </motion.div>
      )}

      {/* Uploading/Converting State */}
      {(conversionState === 'uploading' || conversionState === 'converting') && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
              <span className="text-sm font-medium">
                {conversionState === 'uploading' ? 'Uploading...' : 'Converting...'}
              </span>
            </div>
            <span className="text-sm font-semibold text-primary">
              {currentJob?.status || 'Processing'}
            </span>
          </div>
          <div className="progress-bar h-2 rounded-full overflow-hidden">
            <motion.div
              className="progress-bar-fill"
              initial={{ width: 0 }}
              animate={{ width: conversionState === 'converting' ? '75%' : '100%' }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </motion.div>
      )}

      {/* Complete State */}
      {conversionState === 'complete' && currentJob && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-8 text-center py-6"
        >
          <div className="inline-flex p-4 rounded-full bg-glow-success/20 mb-4">
            <Check className="w-8 h-8 text-glow-success" />
          </div>
          <p className="text-xl font-semibold mb-2">Conversion Complete!</p>
          <p className="text-sm text-muted-foreground mb-8">
            Your file has been converted to {selectedFormat.toUpperCase()}
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={handleDownload} className="btn-premium glow-primary h-11 px-6">
              <Download className="mr-2 w-4 h-4" />
              Download File
            </Button>
            <Button variant="outline" onClick={resetWorkspace} className="h-11 px-6 border-border">
              Convert More
            </Button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
