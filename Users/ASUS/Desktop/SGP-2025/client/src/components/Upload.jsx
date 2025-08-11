import React, { useState, useCallback } from 'react';
import { uploadPDF } from '../api';

const Upload = ({ onUploadSuccess, onUploadError }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const resetUploadState = useCallback(() => {
    setIsUploading(false);
    setUploadProgress(0);
    setUploadError(null);
    setRetryCount(0);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    const pdfFile = files.find(file => file.type === 'application/pdf');
    if (pdfFile) {
      handleFileUpload(pdfFile);
    } else {
      const errorMsg = 'Please drop a valid PDF file';
      setUploadError(errorMsg);
      onUploadError(errorMsg);
    }
  }, [onUploadError]);

  const handleFileSelect = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileUpload(file);
    }
  }, []);

  const validateFile = useCallback((file) => {
    // Check file type
    if (file.type !== 'application/pdf') {
      return 'Please select a valid PDF file';
    }
    
    // Check file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      return 'File size should be less than 50MB';
    }
    
    // Check if file is empty
    if (file.size === 0) {
      return 'File is empty. Please select a valid PDF file.';
    }
    
    // Check filename
    if (!file.name || file.name.trim() === '') {
      return 'Invalid filename. Please select a valid PDF file.';
    }
    
    return null; // No error
  }, []);

  const handleFileUpload = async (file, isRetry = false) => {
    // Validate file
    const validationError = validateFile(file);
    if (validationError) {
      setUploadError(validationError);
      onUploadError(validationError);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const result = await uploadPDF(file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Success
      setTimeout(() => {
        resetUploadState();
        onUploadSuccess(result);
      }, 500);
      
    } catch (error) {
      clearInterval(progressInterval);
      setIsUploading(false);
      setUploadProgress(0);
      
      let errorMessage = 'Upload failed. Please try again.';
      
      if (error.response) {
        // Server responded with error
        const status = error.response.status;
        const detail = error.response.data?.detail || error.response.data?.message;
        
        switch (status) {
          case 400:
            errorMessage = detail || 'Invalid file format. Please upload a valid PDF.';
            break;
          case 413:
            errorMessage = 'File too large. Please upload a smaller PDF file.';
            break;
          case 500:
            errorMessage = detail || 'Server error. Please try again later.';
            break;
          default:
            errorMessage = detail || `Upload failed (${status}). Please try again.`;
        }
      } else if (error.request) {
        // Network error
        errorMessage = 'Network error. Please check your connection and try again.';
      } else {
        // Other error
        errorMessage = error.message || 'Upload failed. Please try again.';
      }
      
      setUploadError(errorMessage);
      onUploadError(errorMessage);
    }
  };

  const handleRetry = useCallback(() => {
    if (retryCount < 3) {
      setRetryCount(prev => prev + 1);
      // Re-upload the same file
      const fileInput = document.getElementById('file-input');
      if (fileInput && fileInput.files[0]) {
        handleFileUpload(fileInput.files[0], true);
      }
    } else {
      setUploadError('Maximum retry attempts reached. Please try uploading a different file.');
    }
  }, [retryCount]);

  return (
    <div className="w-full max-w-xl mx-auto">
      <div
        className={`border-2 border-dashed rounded-xl p-10 text-center bg-white transition-all duration-300 cursor-pointer relative ${
          isDragOver ? 'border-blue-500 bg-blue-50 scale-105' : 
          uploadError ? 'border-red-500 bg-red-50' :
          isUploading ? 'border-green-500 bg-green-50' : 
          'border-gray-300'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isUploading ? (
          <div className="w-full">
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden mb-4">
              <div 
                className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-300" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-green-700 font-semibold">
              Uploading PDF... {uploadProgress}%
            </p>
            {retryCount > 0 && (
              <p className="text-sm text-gray-500 mt-2">
                Retry attempt: {retryCount}/3
              </p>
            )}
          </div>
        ) : uploadError ? (
          <div className="w-full">
            <div className="flex flex-col items-center justify-center mb-4">
              <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-400 mb-2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
              </svg>
              <h3 className="text-xl font-bold text-red-700 mb-2">Upload Failed</h3>
              <p className="text-red-600 mb-4">{uploadError}</p>
              {retryCount < 3 && (
                <button
                  onClick={handleRetry}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Retry Upload
                </button>
              )}
              <button
                onClick={resetUploadState}
                className="mt-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Try Different File
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center justify-center mb-4">
              <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-400 mb-2" viewBox="0 0 24 24">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7,10 12,15 17,10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              <h3 className="text-xl font-bold text-gray-700 mb-1">Upload PDF Document</h3>
              <p className="text-gray-500 mb-2">Drag and drop your PDF file here, or click to browse</p>
            </div>
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              className="absolute inset-0 opacity-0 cursor-pointer"
              id="file-input"
            />
            <label htmlFor="file-input" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-medium shadow hover:bg-blue-700 transition-colors cursor-pointer mb-2">
              Browse Files
            </label>
            <div className="mt-4 text-sm text-gray-400">
              <p>Supported format: PDF</p>
              <p>Maximum file size: 50MB</p>
              <p>Make sure your PDF is not corrupted or password-protected</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Upload; 