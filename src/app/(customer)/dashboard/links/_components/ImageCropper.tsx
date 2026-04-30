import React, { useState, useRef } from 'react';
import Cropper from 'react-easy-crop';
import { useImageCrop } from '@/hooks/useImageCrop';
import { Button } from '@/components/ui/button';
import { Upload, Crop as CropIcon, ImageIcon, X } from 'lucide-react';

interface ImageCropperProps {
  onImageCropped: (croppedImageUrl: string) => void;
  initialImage?: string;
}

export default function ImageCropper({ onImageCropped, initialImage }: ImageCropperProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(initialImage || null);
  const [isOpen, setIsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { crop, setCrop, zoom, setZoom, onCropComplete, generateCroppedImage } = useImageCrop();

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const imageDataUrl = await readFile(file);
      setImageSrc(imageDataUrl);
      setIsOpen(true);
    }
  };

  const handleCropSave = async () => {
    if (imageSrc) {
      const croppedImg = await generateCroppedImage(imageSrc);
      if (croppedImg) {
        onImageCropped(croppedImg);
        setIsOpen(false);
      }
    }
  };

  return (
    <div className="w-full">
      <input 
        type="file" 
        accept="image/*" 
        ref={fileInputRef} 
        onChange={onFileChange} 
        className="hidden" 
      />
      
      <div className="flex items-center gap-3 mt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 border-dashed border-2 hover:border-slate-400"
        >
          <Upload size={16} />
          Upload custom image
        </Button>
        
        {imageSrc && !isOpen && (
          <Button 
            type="button" 
            variant="secondary" 
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2"
          >
            <CropIcon size={16} />
            Adjust crop
          </Button>
        )}
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-xl flex flex-col overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">Crop your image</h3>
              <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            
            <div className="relative w-full h-[400px] bg-slate-900">
              {imageSrc ? (
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={1.91 / 1} // Standard Open Graph aspect ratio
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-white/50 flex-col gap-2">
                  <ImageIcon size={48} />
                  <p>No image selected</p>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t bg-gray-50">
              <div className="flex items-center gap-4 mb-4">
                <span className="text-sm font-medium">Zoom</span>
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  aria-labelledby="Zoom"
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCropSave} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  Apply Crop
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function readFile(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => resolve(reader.result as string), false);
    reader.readAsDataURL(file);
  });
}
