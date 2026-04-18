import { useState, useRef } from 'react';
import { ACCEPTED_FILE_TYPES, MAX_FILE_SIZE_MB, extractTextFromFile } from '../utils/fileExtract';

interface ResumeUploadProps {
  value: string;
  onChange: (text: string) => void;
  error?: string;
  onError?: (msg: string) => void;
  rows?: number;
  maxLength?: number;
  accentColor?: 'purple' | 'indigo';
}

const ResumeUpload = ({ value, onChange, onError, rows = 5, maxLength = 15000, accentColor = 'indigo' }: ResumeUploadProps) => {
  const [uploadingFile, setUploadingFile] = useState(false);
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const accent = accentColor === 'purple'
    ? { ring: 'focus:ring-purple-500', border: 'hover:border-purple-400 dark:hover:border-purple-500', text: 'text-purple-600 dark:text-purple-400' }
    : { ring: 'focus:ring-indigo-500', border: 'hover:border-indigo-400 dark:hover:border-indigo-500', text: 'text-indigo-600 dark:text-indigo-400' };

  const handleFileUpload = async (file: File) => {
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      onError?.(`File too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }

    setUploadingFile(true);
    setFileName(file.name);

    try {
      const text = await extractTextFromFile(file);
      const trimmed = text.trim();
      if (trimmed.length < 50) {
        onError?.('Could not extract enough text from the file. Please try pasting instead.');
        setFileName('');
      } else {
        onChange(trimmed.slice(0, maxLength));
      }
    } catch (err) {
      onError?.(err instanceof Error ? err.message : 'Failed to read file. Please try pasting instead.');
      setFileName('');
    } finally {
      setUploadingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileUpload(file);
  };

  return (
    <div>
      {/* File upload area */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className={`mb-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center ${accent.border} transition-colors cursor-pointer`}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_FILE_TYPES}
          onChange={handleFileChange}
          className="hidden"
          aria-label="Upload resume file"
        />
        {uploadingFile ? (
          <div className={`flex items-center justify-center gap-2 ${accent.text}`}>
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
            <span className="text-sm font-medium">Reading {fileName}...</span>
          </div>
        ) : (
          <>
            <svg className="w-8 h-8 mx-auto text-gray-400 dark:text-gray-500 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className={`font-medium ${accent.text}`}>Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">PDF, DOCX, or TXT (max {MAX_FILE_SIZE_MB}MB)</p>
            {fileName && (
              <p className="text-xs text-green-600 dark:text-green-400 mt-1 font-medium">Loaded: {fileName}</p>
            )}
          </>
        )}
      </div>

      <div className="flex items-center gap-3 mb-3">
        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
        <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">OR paste text below</span>
        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
      </div>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder="Paste your resume text here, or upload a file above..."
        className={`w-full px-3.5 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 ${accent.ring} focus:border-transparent text-sm resize-none`}
      />
      <span className="text-xs text-gray-400 dark:text-gray-500">
        {value.trim().length.toLocaleString()} / {maxLength.toLocaleString()}
      </span>
    </div>
  );
};

export default ResumeUpload;
