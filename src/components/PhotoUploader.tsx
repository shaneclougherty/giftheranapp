'use client'

import { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import { supabase } from '@/lib/supabase'

interface PhotoUploaderProps {
  appId?: string
  photoType: 'her' | 'him' | 'couple'
  displayOrder: number
  currentUrl?: string | null
  onUploaded: (url: string) => void
  onDelete?: () => void
  themeAccent?: string
}

async function getCroppedImg(imageSrc: string, crop: { x: number; y: number; width: number; height: number }): Promise<Blob> {
  const image = new Image()
  image.crossOrigin = 'anonymous'
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve()
    image.onerror = reject
    image.src = imageSrc
  })

  const canvas = document.createElement('canvas')
  const size = 800
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!

  ctx.drawImage(
    image,
    crop.x, crop.y, crop.width, crop.height,
    0, 0, size, size
  )

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error('Canvas toBlob failed'))
    }, 'image/jpeg', 0.85)
  })
}

export default function PhotoUploader({ appId, photoType, displayOrder, currentUrl, onUploaded, onDelete, themeAccent = 'bg-emerald-400' }: PhotoUploaderProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedArea, setCroppedArea] = useState<any>(null)
  const [uploading, setUploading] = useState(false)
  const [showCropper, setShowCropper] = useState(false)
  const [showOverlay, setShowOverlay] = useState(false)


  const onCropComplete = useCallback((_: any, croppedAreaPixels: any) => {
    setCroppedArea(croppedAreaPixels)
  }, [])

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      setSelectedImage(reader.result as string)
      setShowCropper(true)
      setShowOverlay(false)
      setCrop({ x: 0, y: 0 })
      setZoom(1)
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  async function handleCropConfirm() {
    if (!selectedImage || !croppedArea) return

    setUploading(true)
    try {
      const croppedBlob = await getCroppedImg(selectedImage, croppedArea)
      const fileName = `${appId || 'temp'}_${photoType}_${displayOrder}_${Date.now()}.jpg`

      const { data, error } = await supabase.storage
        .from('photos')
        .upload(fileName, croppedBlob, {
          contentType: 'image/jpeg',
          upsert: true,
        })

      if (error) throw error

      const { data: urlData } = supabase.storage
        .from('photos')
        .getPublicUrl(data.path)

      onUploaded(urlData.publicUrl)
      setShowCropper(false)
      setSelectedImage(null)
    } catch (err: any) {
      console.error('Upload failed:', err)
      if (err?.message?.includes('tainted') || err?.name === 'SecurityError') {
        alert('Could not crop this photo. Try deleting and re-uploading.')
      } else {
        alert('Upload failed. Please try again.')
      }
    }
    setUploading(false)
  }

  function handleCancel() {
    setShowCropper(false)
    setSelectedImage(null)
  }

  function handleExistingPhotoTap() {
    setShowOverlay(true)
  }

  function handleCropExisting() {
    if (!currentUrl) return
    setSelectedImage(currentUrl)
    setShowCropper(true)
    setShowOverlay(false)
    setCrop({ x: 0, y: 0 })
    setZoom(1)
  }

  function handleDeletePhoto() {
    setShowOverlay(false)
    if (onDelete) onDelete()
  }

  // Cropper modal — fixed overlay, fits on mobile without scrolling
  if (showCropper && selectedImage) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col" style={{ height: '100dvh' }}>
        {/* Crop area — ~60% of viewport */}
        <div className="relative" style={{ height: '60dvh' }}>
          <Cropper
            image={selectedImage}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            cropShape="rect"
            showGrid={true}
          />
        </div>

        {/* Controls — zoom + buttons packed below crop area */}
        <div className="flex-1 flex flex-col justify-center px-6 gap-3">
          <input
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full accent-white"
          />
          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              className="flex-1 py-3 rounded-xl border border-white/30 text-white font-medium text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleCropConfirm}
              disabled={uploading}
              className={`flex-1 py-3 rounded-xl ${themeAccent} text-white font-medium text-sm disabled:opacity-50`}
            >
              {uploading ? 'Uploading...' : 'Use Photo'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Photo slot — existing photo with tap overlay
  if (currentUrl) {
    return (
      <div className="relative">
        <div
          onClick={handleExistingPhotoTap}
          className="aspect-square rounded-xl overflow-hidden border-2 border-transparent hover:border-gray-300 cursor-pointer flex items-center justify-center"
        >
          <img src={currentUrl} alt="" className="w-full h-full object-cover" />
        </div>

        {/* Overlay with Re-upload & Delete */}
        {showOverlay && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowOverlay(false)} />
            <div className="absolute inset-0 z-50 bg-black/70 rounded-xl flex flex-col items-center justify-center gap-2 p-2">
              <button
                onClick={handleCropExisting}
                className="w-full py-2 rounded-lg bg-white text-gray-900 font-medium text-xs hover:bg-gray-100 transition-colors"
              >
                Crop
              </button>
              {onDelete && (
                <button
                  onClick={handleDeletePhoto}
                  className="w-full py-2 rounded-lg bg-red-500 text-white font-medium text-xs hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              )}
            </div>
          </>
        )}
      </div>
    )
  }

  // Empty slot — file picker
  return (
    <label className="block cursor-pointer">
      <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
      <div className="aspect-square rounded-xl overflow-hidden border-2 border-dashed border-gray-300 hover:border-gray-400 bg-gray-50 flex items-center justify-center">
        <div className="text-center p-2">
          <span className="text-2xl block mb-1">📷</span>
          <span className="text-[10px] text-gray-400">Tap to add</span>
        </div>
      </div>
    </label>
  )
}
