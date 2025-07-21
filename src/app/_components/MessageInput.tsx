'use client';

import { useState, useRef } from 'react';
import { Send, Paperclip, X } from 'lucide-react';

interface MessageInputProps {
  onSendMessage: (text: string) => Promise<void>;
  disabled?: boolean;
  placeholder?: string;
  onDocumentUploaded?: (summary: string, filename: string) => void;
  uploadedFileName?: string | null;
}

export default function MessageInput({ 
  onSendMessage, 
  disabled = false, 
  placeholder = "Type a message...",
  onDocumentUploaded,
  uploadedFileName
}: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [isUploadingDocument, setIsUploadingDocument] = useState(false);
  const [, setCurrentUploadFileName] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled && !isUploadingDocument) {
      await onSendMessage(message);
      setMessage('');
      // Clear upload status after sending message
      setUploadStatus(null);
      setCurrentUploadFileName(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleFileButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset file input for next use
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    setIsUploadingDocument(true);
    setCurrentUploadFileName(file.name);
    setUploadStatus(`Gemini is reading ${file.name}...`);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/analyze-document', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze document');
      }

      if (data.summary) {
        setUploadStatus(`Document analyzed successfully! You can now ask questions about ${file.name}`);
        
        // Call the callback to provide the summary to the parent component
        if (onDocumentUploaded) {
          onDocumentUploaded(data.summary, file.name);
        }
      } else {
        throw new Error('No summary received from document analysis');
      }

    } catch (error) {
      console.error('Document upload error:', error);
      setUploadStatus(`Failed to analyze ${file.name}. Please try again.`);
      setCurrentUploadFileName(null);
    } finally {
      setIsUploadingDocument(false);
    }
  };

  const clearUploadStatus = () => {
    setUploadStatus(null);
    setCurrentUploadFileName(null);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Uploaded Document Indicator */}
      {uploadedFileName && !uploadStatus && (
        <div className="mb-3 p-3 bg-blue-900/30 border border-blue-700 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Paperclip size={16} className="text-blue-400" />
            <p className="text-sm text-blue-300">Document uploaded: {uploadedFileName}</p>
          </div>
          <button
            onClick={() => {/* This will be cleared automatically after sending */}}
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      )}
      
      {/* Upload Status */}
      {uploadStatus && (
        <div className="mb-3 p-3 bg-gray-800 border border-gray-700 rounded-lg flex items-center justify-between">
          <p className="text-sm text-gray-300">{uploadStatus}</p>
          {!isUploadingDocument && (
            <button
              onClick={clearUploadStatus}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        
        <div className="relative flex items-center gap-3">
          <div className="flex-1 relative">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled || isUploadingDocument}
              className="w-full px-4 py-3 pr-12 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none max-h-32 min-h-[48px] disabled:opacity-50 disabled:cursor-not-allowed"
              rows={1}
              style={{
                height: 'auto',
                minHeight: '48px',
                maxHeight: '128px',
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = `${Math.min(target.scrollHeight, 128)}px`;
              }}
            />
          </div>
          
          {/* File upload button */}
          <button
            type="button"
            onClick={handleFileButtonClick}
            disabled={disabled || isUploadingDocument}
            className="h-12 w-12 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center justify-center flex-shrink-0"
            title="Upload document or image"
          >
            {isUploadingDocument ? (
              <div className="w-[18px] h-[18px] border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Paperclip size={18} className="text-gray-300" />
            )}
          </button>
          
          {/* Send button */}
          <button
            type="submit"
            disabled={!message.trim() || disabled || isUploadingDocument}
            className="h-12 w-12 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center justify-center flex-shrink-0"
          >
            {disabled && !isUploadingDocument ? (
              <div className="w-[18px] h-[18px] border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send size={18} className="text-white" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
} 