"use client"

import { useState } from "react"
import { Upload, Image as ImageIcon, X } from "lucide-react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { FileUpload } from "@/app/[tenantId]/(main)/branchcomplaint/components/BranchFileUpload"

interface FileUploadCardProps {
  data: any
  setData: (data: any) => void
  onFilesChange: (files: File[]) => void
  onFileRemove: (file: string | File) => void
}

export function FileUploadCard({
  data,
  setData,
  onFilesChange,
  onFileRemove,
}: FileUploadCardProps) {
  const [previews, setPreviews] = useState<{ [key: string]: string }>({})

  const handleFilesChange = (files: File[]) => {
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onloadend = () => {
          setPreviews(prev => ({
            ...prev,
            [file.name]: reader.result as string
          }))
        }

        reader.readAsDataURL(file)
      }
    })
    onFilesChange(files)
  }

  const handleFileRemove = (file: string | File) => {
    const fileName = typeof file === 'string' ? file : file.name
    setPreviews(prev => {
      const newPreviews = { ...prev }
      delete newPreviews[fileName]
      return newPreviews
    })
    onFileRemove(file)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.3 }}
    >
      <Card className="overflow-hidden group hover:shadow-xl transition-all duration-300 p-8 bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-900/20 dark:to-gray-900/50 backdrop-blur-sm border-2 border-indigo-100/50 dark:border-indigo-900/20 shadow-lg shadow-indigo-100/30 dark:shadow-indigo-900/20 rounded-xl">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center shadow-inner transform group-hover:scale-110 transition-transform duration-300">
            <Upload className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h3 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-indigo-900 dark:from-indigo-400 dark:to-indigo-200">
              Dosya Yükleme
            </h3>
            <p className="text-sm text-indigo-600/80 dark:text-indigo-400/80">
              Şikayetle ilgili dosyaları ekleyin
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Preview Grid - Updated with responsive design and fixed square dimensions */}
          {Object.keys(previews).length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 w-full">
              {Object.entries(previews).map(([fileName, preview]) => (
                <div key={fileName} className="relative aspect-square w-full max-w-xs">
                  <div className="absolute inset-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                    <Image
                      src={preview}
                      alt={fileName}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-white hover:text-red-500"
                        onClick={() => handleFileRemove(fileName)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <FileUpload
            onFilesChange={handleFilesChange}
            existingFiles={[]}
            onFileRemove={handleFileRemove}
          />
        </div>
      </Card>
    </motion.div>
  )
}