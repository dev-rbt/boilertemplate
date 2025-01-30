"use client"

import { useState, useCallback } from "react"
import { Upload, X, FileIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { BranchComplaintAttachment } from "../branch-complaint-types"

interface FileUploadProps {
  onFilesChange: (files: File[]) => void
  existingFiles: BranchComplaintAttachment[]
  onFileRemove: (file: string | File) => void
}

export function FileUpload({ onFilesChange, existingFiles, onFileRemove }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const { toast } = useToast()

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (!isDragging) {
      setIsDragging(true)
    }
  }, [isDragging])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (isDragging) {
      setIsDragging(false)
    }
  }, [isDragging])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileUpload(files)
    }
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      handleFileUpload(files)
    }
  }, [])

  const handleFileUpload = useCallback((files: File[]) => {
    // Dosya boyutu kontrolü (10MB)
    const MAX_FILE_SIZE = 20 * 1024 * 1024 // 10MB
    const validFiles = files.filter(file => {
      if (file.size > MAX_FILE_SIZE) {
        toast({
          variant: "destructive",
          title: "Hata",
          description: `${file.name} dosyası çok büyük. Maksimum dosya boyutu 10MB olmalıdır.`
        })
        return false
      }
      return true
    })

    if (validFiles.length > 0) {
      onFilesChange(validFiles)
    }
  }, [onFilesChange, toast])

  return (
    <div className="space-y-4">
      {/* Dosya yükleme alanı */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-4 text-center transition-colors duration-200 ${
          isDragging
            ? "border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20"
            : "border-gray-200 dark:border-gray-700"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleFileSelect}
          multiple
        />
        <div className="space-y-2">
          <div className="mx-auto w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
            <Upload className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Dosya yüklemek için tıklayın veya sürükleyip bırakın
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Maksimum dosya boyutu: 10MB
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
