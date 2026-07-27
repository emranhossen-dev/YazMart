"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, X, ImageIcon, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

interface ImageUploaderProps {
  label?: string;
  value?: string | string[];
  onChange: (value: any) => void;
  multiple?: boolean;
  maxFiles?: number;
  className?: string;
}

export default function ImageUploader({
  label = "Upload Image",
  value,
  onChange,
  multiple = false,
  maxFiles = 10,
  className = "",
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Normalize image list
  const imageList: string[] = multiple
    ? Array.isArray(value)
      ? value
      : value
      ? [value]
      : []
    : typeof value === "string" && value
    ? [value]
    : [];

  const uploadFileWithProgress = (file: File, fileIndex: number, totalFiles: number): Promise<string> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      formData.append("file", file);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const filePercent = Math.round((event.loaded / event.total) * 100);
          // Calculate overall progress across files
          const overallPercent = Math.round(
            ((fileIndex + event.loaded / event.total) / totalFiles) * 100
          );
          setProgress(overallPercent);
          setStatusMessage(
            `Uploading file ${fileIndex + 1} of ${totalFiles} (${filePercent}%)...`
          );
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const res = JSON.parse(xhr.responseText);
            if (res.url) {
              resolve(res.url);
            } else {
              reject(new Error(res.error || "Upload failed"));
            }
          } catch (e) {
            reject(new Error("Invalid response server format"));
          }
        } else {
          reject(new Error(`Server error: ${xhr.status}`));
        }
      };

      xhr.onerror = () => reject(new Error("Network error during upload"));
      xhr.open("POST", "/api/upload", true);
      xhr.send(formData);
    });
  };

  const handleFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    setUploading(true);
    setProgress(0);
    setStatusMessage(`Preparing ${fileArray.length} file(s)...`);

    const uploadedUrls: string[] = [];
    let successCount = 0;

    for (let i = 0; i < fileArray.length; i++) {
      try {
        const url = await uploadFileWithProgress(fileArray[i], i, fileArray.length);
        uploadedUrls.push(url);
        successCount++;
      } catch (err: any) {
        toast.error(`Failed to upload ${fileArray[i].name}: ${err.message}`);
      }
    }

    if (uploadedUrls.length > 0) {
      if (multiple) {
        onChange([...imageList, ...uploadedUrls].slice(0, maxFiles));
        toast.success(`Successfully uploaded ${successCount} image(s)!`);
      } else {
        onChange(uploadedUrls[0]);
        toast.success("Image uploaded successfully!");
      }
    }

    setProgress(100);
    setTimeout(() => {
      setUploading(false);
      setProgress(0);
      setStatusMessage("");
    }, 400);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    if (multiple) {
      const updated = imageList.filter((_, i) => i !== indexToRemove);
      onChange(updated);
    } else {
      onChange("");
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {label && <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">{label}</label>}

      {/* Upload Zone */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-5 text-center transition-all cursor-pointer select-none flex flex-col items-center justify-center ${
          dragActive
            ? "border-amber-500 bg-amber-500/10 scale-[0.99]"
            : "border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 bg-zinc-50/50 dark:bg-zinc-900/50"
        } ${uploading ? "pointer-events-none opacity-80" : ""}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple={multiple}
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          className="hidden"
        />

        {uploading ? (
          <div className="w-full max-w-xs space-y-2.5 py-2">
            <div className="flex items-center justify-between text-xs font-bold text-zinc-800 dark:text-zinc-200">
              <span className="flex items-center gap-1.5">
                <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
                <span>Uploading Image...</span>
              </span>
              <span className="font-mono text-amber-600 dark:text-amber-400">{progress}%</span>
            </div>

            {/* Visual Progress Bar */}
            <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-2.5 rounded-full overflow-hidden shadow-inner">
              <div
                className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full transition-all duration-200 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>

            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium truncate">
              {statusMessage}
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1.5">
            <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-full text-zinc-600 dark:text-zinc-300">
              <UploadCloud className="h-6 w-6" />
            </div>
            <div className="text-xs">
              <span className="font-bold text-amber-600 dark:text-amber-400 hover:underline">
                Click to upload
              </span>{" "}
              or drag & drop
            </div>
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500">
              SVG, PNG, JPG, WEBP (Max {maxFiles} files)
            </p>
          </div>
        )}
      </div>

      {/* Uploaded Thumbnails Display */}
      {imageList.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5 pt-1">
          {imageList.map((url, idx) => (
            <div
              key={idx}
              className="relative group aspect-square rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 overflow-hidden shadow-xs"
            >
              <img
                src={url}
                alt={`Uploaded image ${idx + 1}`}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveImage(idx);
                }}
                className="absolute top-1 right-1 p-1 bg-rose-600/90 text-white rounded-full opacity-90 group-hover:opacity-100 hover:bg-rose-700 transition-all cursor-pointer shadow-md"
                title="Remove Image"
              >
                <X className="h-3 w-3" />
              </button>

              {idx === 0 && !multiple && (
                <span className="absolute bottom-1 left-1 bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                  Active
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
