'use client';

import { useState } from 'react';

interface ResumeUploadProps {
  onFileSelect: (file: File, base64: string) => void;
  maxSize?: number; // in MB
}

export function ResumeUpload({ onFileSelect, maxSize = 5 }: ResumeUploadProps) {
  const [fileName, setFileName] = useState<string>('');
  const [fileSize, setFileSize] = useState<number>(0);
  const [error, setError] = useState<string>('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError('');

    if (!file) {
      setFileName('');
      setFileSize(0);
      return;
    }

    // Validate file type
    if (file.type !== 'application/pdf') {
      setError('Only PDF files are allowed');
      e.target.value = '';
      return;
    }

    // Validate file size (max 5MB)
    const sizeInMB = file.size / (1024 * 1024);
    if (sizeInMB > maxSize) {
      setError(`File too large. Maximum size is ${maxSize}MB`);
      e.target.value = '';
      return;
    }

    // Convert to base64
    try {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        // Remove the data:application/pdf;base64, prefix
        const base64Data = base64.split(',')[1];
        setFileName(file.name);
        setFileSize(file.size);
        onFileSelect(file, base64Data);
      };
      reader.onerror = () => {
        setError('Failed to read file');
        e.target.value = '';
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError('Failed to process file');
      e.target.value = '';
    }
  };

  const handleClear = () => {
    setFileName('');
    setFileSize(0);
    setError('');
    const input = document.getElementById('resume-upload') as HTMLInputElement;
    if (input) input.value = '';
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-2">
      <label htmlFor="resume-upload" className="block text-sm font-medium">
        Upload Resume (PDF only)
      </label>

      <input
        id="resume-upload"
        type="file"
        accept=".pdf"
        onChange={handleFileChange}
        className="block w-full text-sm border-2 border-black bg-white
                   file:mr-4 file:py-2 file:px-4
                   file:border-0 file:bg-black file:text-white
                   file:font-mono file:text-sm
                   hover:file:bg-gray-800 cursor-pointer"
      />

      {error && (
        <div className="text-sm text-red-600 font-mono">
          {error}
        </div>
      )}

      {fileName && !error && (
        <div className="flex items-center justify-between p-3 border-2 border-black bg-white">
          <div className="flex-1">
            <div className="text-sm font-mono font-semibold">{fileName}</div>
            <div className="text-xs font-mono text-gray-600">{formatFileSize(fileSize)}</div>
          </div>
          <button
            onClick={handleClear}
            className="px-3 py-1 border-2 border-black bg-white hover:bg-black hover:text-white font-mono text-sm transition-colors"
          >
            Clear
          </button>
        </div>
      )}

      <div className="text-xs font-mono text-gray-600">
        Maximum file size: {maxSize}MB
      </div>
    </div>
  );
}
