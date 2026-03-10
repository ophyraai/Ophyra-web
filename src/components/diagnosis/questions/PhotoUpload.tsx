'use client';

import { useCallback, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Camera, X, Shield, Upload } from 'lucide-react';

interface PhotoUploadProps {
  value: string[];
  onChange: (value: string[]) => void;
}

const MAX_PHOTOS = 3;
const MAX_DIMENSION = 1200;
const JPEG_QUALITY = 0.8;
const SLOT_SIZE = 100;

function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        if (width > height) {
          height = Math.round((height * MAX_DIMENSION) / width);
          width = MAX_DIMENSION;
        } else {
          width = Math.round((width * MAX_DIMENSION) / height);
          height = MAX_DIMENSION;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas context unavailable'));
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('Compression failed'))),
        'image/jpeg',
        JPEG_QUALITY,
      );
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

export default function PhotoUpload({ value, onChange }: PhotoUploadProps) {
  const t = useTranslations('diagnosis.q7b');
  const photos = value || [];
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState<Record<number, number>>({});
  const [dragOver, setDragOver] = useState(false);
  const activeSlotRef = useRef<number>(0);

  const uploadFile = useCallback(
    async (file: File, slotIndex: number) => {
      setUploading((prev) => ({ ...prev, [slotIndex]: 0 }));

      try {
        const compressed = await compressImage(file);

        // Simulate incremental progress during fetch
        const progressInterval = setInterval(() => {
          setUploading((prev) => {
            const current = prev[slotIndex] ?? 0;
            if (current >= 90) return prev;
            return { ...prev, [slotIndex]: current + 10 };
          });
        }, 150);

        const formData = new FormData();
        formData.append('photos', compressed, 'photo.jpg');

        const res = await fetch('/api/diagnosis/upload', {
          method: 'POST',
          body: formData,
        });

        clearInterval(progressInterval);

        if (!res.ok) throw new Error('Upload failed');

        const data: { urls: string[] } = await res.json();
        setUploading((prev) => ({ ...prev, [slotIndex]: 100 }));

        // Small delay to show completed ring before hiding
        await new Promise((r) => setTimeout(r, 300));

        onChange([...photos, ...data.urls]);
      } catch (err) {
        console.error('Upload error:', err);
      } finally {
        setUploading((prev) => {
          const next = { ...prev };
          delete next[slotIndex];
          return next;
        });
      }
    },
    [photos, onChange],
  );

  const handleFiles = useCallback(
    (files: FileList | File[]) => {
      const available = MAX_PHOTOS - photos.length;
      const toUpload = Array.from(files).slice(0, available);
      toUpload.forEach((file, i) => {
        const slotIndex = photos.length + i;
        uploadFile(file, slotIndex);
      });
    },
    [photos, uploadFile],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handleFiles(e.target.files);
    e.target.value = '';
  };

  const openFilePicker = (slotIndex: number) => {
    activeSlotRef.current = slotIndex;
    inputRef.current?.click();
  };

  const removePhoto = (index: number) => {
    const next = photos.filter((_, i) => i !== index);
    onChange(next);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
  };

  const progressCircumference = Math.PI * 2 * 46; // radius 46 for the ring

  const slots = Array.from({ length: MAX_PHOTOS }, (_, i) => i);

  return (
    <div
      className="relative w-full max-w-lg text-center"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag overlay */}
      <AnimatePresence>
        {dragOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-ofira-violet bg-ofira-violet/10 backdrop-blur-sm"
          >
            <Upload className="mb-2 h-10 w-10 text-ofira-violet" />
            <span className="text-lg font-semibold text-ofira-violet">{t('dropHere')}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <h2 className="mb-2 text-3xl font-bold tracking-tight sm:text-4xl">
        {t('title')}
      </h2>
      <p className="mb-10 text-sm text-ofira-text-secondary">
        {t('subtitle')}
      </p>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        className="hidden"
        onChange={handleInputChange}
      />

      {/* Photo slots */}
      <div className="mb-8 flex items-center justify-center gap-5">
        {slots.map((slotIndex) => {
          const photo = photos[slotIndex];
          const progress = uploading[slotIndex];
          const isUploading = progress !== undefined;

          return (
            <div
              key={slotIndex}
              className="relative"
              style={{ width: SLOT_SIZE, height: SLOT_SIZE }}
            >
              <AnimatePresence mode="wait">
                {photo ? (
                  /* Filled slot */
                  <motion.div
                    key={`photo-${slotIndex}`}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    className="relative h-full w-full"
                  >
                    <div
                      className="h-full w-full rounded-full p-[3px]"
                      style={{
                        background: 'linear-gradient(135deg, #0d9488, #ff9e7a)',
                      }}
                    >
                      <img
                        src={photo}
                        alt={`Foto ${slotIndex + 1}`}
                        className="h-full w-full rounded-full object-cover"
                      />
                    </div>
                    <button
                      onClick={() => removePhoto(slotIndex)}
                      className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-ofira-surface2 text-ofira-text shadow-lg transition-colors hover:bg-ofira-peach"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </motion.div>
                ) : (
                  /* Empty slot */
                  <motion.button
                    key={`empty-${slotIndex}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => openFilePicker(slotIndex)}
                    disabled={isUploading || photos.length < slotIndex}
                    className="relative flex h-full w-full items-center justify-center rounded-full border-2 border-dashed border-ofira-violet/30 bg-ofira-card transition-colors hover:border-ofira-violet/60 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Camera className="h-6 w-6 text-ofira-text-secondary" />
                  </motion.button>
                )}
              </AnimatePresence>

              {/* Progress ring */}
              {isUploading && (
                <svg
                  className="pointer-events-none absolute inset-0 -rotate-90"
                  width={SLOT_SIZE}
                  height={SLOT_SIZE}
                >
                  <circle
                    cx={SLOT_SIZE / 2}
                    cy={SLOT_SIZE / 2}
                    r={46}
                    fill="none"
                    stroke="rgba(13,148,136,0.15)"
                    strokeWidth={3}
                  />
                  <circle
                    cx={SLOT_SIZE / 2}
                    cy={SLOT_SIZE / 2}
                    r={46}
                    fill="none"
                    stroke="#0d9488"
                    strokeWidth={3}
                    strokeLinecap="round"
                    strokeDasharray={progressCircumference}
                    strokeDashoffset={
                      progressCircumference - (progressCircumference * (progress ?? 0)) / 100
                    }
                    style={{ transition: 'stroke-dashoffset 0.2s ease' }}
                  />
                </svg>
              )}
            </div>
          );
        })}
      </div>

      {/* Privacy badge */}
      <div className="mb-3 flex items-center justify-center gap-2">
        <Shield className="h-4 w-4 text-ofira-text-secondary" />
        <span className="text-sm text-ofira-text-secondary">
          {t('privacy')}
        </span>
      </div>

      {/* Skip text */}
      <p className="text-xs text-ofira-text-secondary">{t('skip')}</p>
    </div>
  );
}
