
import React, { useRef, useCallback } from 'react';
import { fileToBase64 } from '../utils/fileUtils';
import { XCircleIcon } from './icons/XCircleIcon';
import type { UploadedImage } from '../types';

interface ImageUploaderProps {
  index: number;
  image: UploadedImage | null;
  onImageUpload: (index: number, image: Omit<UploadedImage, 'id'>) => void;
  onImageRemove: (index: number) => void;
  onDragStart?: (index: number) => void;
  onDragOver?: (event: React.DragEvent) => void;
  onDrop?: (index: number) => void;
  onDragEnd?: () => void;
  isBeingDragged?: boolean;
  label: React.ReactNode;
  icon: React.ReactNode;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  index, 
  image,
  onImageUpload, 
  onImageRemove,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  isBeingDragged,
  label,
  icon,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const base64 = await fileToBase64(file);
        onImageUpload(index, { base64, mimeType: file.type, name: file.name });
      } catch (error) {
        console.error("Error converting file to base64", error);
      }
    }
  }, [index, onImageUpload]);

  const handleRemoveClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    onImageRemove(index);
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  const handleClick = () => {
    if (!image) {
      fileInputRef.current?.click();
    }
  };
  
  const handleDragStartInternal = (e: React.DragEvent) => {
    if (image && onDragStart) {
        onDragStart(index);
        e.dataTransfer.effectAllowed = 'move';
    } else {
        e.preventDefault();
    }
  };

  const handleDropInternal = (e: React.DragEvent) => {
    e.preventDefault();
    if(onDrop) onDrop(index);
  };
  
  const preview = image ? `data:${image.mimeType};base64,${image.base64}` : null;
  const fileName = image ? image.name : null;
  const isDraggable = !!image && !!onDragStart;

  return (
    <div
      ref={dropRef}
      draggable={isDraggable}
      onDragStart={handleDragStartInternal}
      onDragOver={onDragOver}
      onDrop={handleDropInternal}
      onDragEnd={onDragEnd}
      onClick={handleClick}
      className={`relative aspect-square w-full bg-gray-700 rounded-lg border-2 border-dashed  transition-all duration-300 flex flex-col items-center justify-center text-center p-2 group ${
        isDraggable ? 'cursor-grab' : 'cursor-pointer'
      } ${
        isBeingDragged ? 'opacity-30 border-cyan-400' : 'border-gray-500 hover:border-cyan-400'
      }`}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/png, image/jpeg, image/webp"
      />
      {preview ? (
        <>
          <img src={preview} alt={`Preview ${fileName}`} className="absolute inset-0 w-full h-full object-cover rounded-md pointer-events-none" />
          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-2">
             <p className="text-white text-xs font-semibold break-all">{fileName}</p>
          </div>
          <button
            onClick={handleRemoveClick}
            className="absolute top-1 right-1 bg-gray-900 rounded-full text-white hover:text-red-400 transition-colors z-10"
            aria-label="Remove image"
          >
            <XCircleIcon className="w-6 h-6" />
          </button>
        </>
      ) : (
        <div className="flex flex-col items-center text-gray-400 pointer-events-none">
          {icon}
          <span className="text-sm font-semibold">{label}</span>
          <span className="text-xs">Click to upload</span>
        </div>
      )}
    </div>
  );
};
