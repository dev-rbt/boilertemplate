"use client"

import { useState, useEffect } from "react"
import { Upload, Image as ImageIcon, X } from "lucide-react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileUpload } from "../BranchFileUpload"
import { BranchComplaintAttachment } from "../../branch-complaint-types"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface ComplaintFilesCardProps {
  data: any
  setData: (data: any) => void
  onFilesChange: (files: File[]) => void
  onFileRemove: (file: string | File) => void
  existingFiles?: BranchComplaintAttachment[]
  isEditMode?: boolean
}

export function ComplaintFilesCard({
  onFilesChange,
  onFileRemove,
  existingFiles = [],
  isEditMode = false,
}: ComplaintFilesCardProps) {
  const { toast } = useToast()
  const [previews, setPreviews] = useState<{ [key: string]: string }>({})
  const [newFiles, setNewFiles] = useState<File[]>([])
  const [fileToDelete, setFileToDelete] = useState<BranchComplaintAttachment | File | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  useEffect(() => {
    const initialPreviews: { [key: string]: string } = {}
    existingFiles.forEach(file => {
      initialPreviews[file.File_name] = file.File_path
    })
    setPreviews(initialPreviews)
  }, [existingFiles])

  const handleDeleteClick = (file: BranchComplaintAttachment | File) => {
    setFileToDelete(file)
    setShowDeleteDialog(true)
  }

  const handleConfirmDelete = () => {
    if (fileToDelete) {
      if ('File_path' in fileToDelete) {
        // Mevcut dosya silme
        onFileRemove(fileToDelete.File_path)
        setPreviews(prev => {
          const newPreviews = { ...prev }
          delete newPreviews[fileToDelete.File_name]
          return newPreviews
        })
      } else {
        // Yeni dosya silme
        onFileRemove(fileToDelete)
        setNewFiles(prev => prev.filter(file => file !== fileToDelete))
        setPreviews(prev => {
          const newPreviews = { ...prev }
          delete newPreviews[fileToDelete.name]
          return newPreviews
        })
      }
    }
    setShowDeleteDialog(false)
    setFileToDelete(null)
  }

  const handleCancelDelete = () => {
    setShowDeleteDialog(false)
    setFileToDelete(null)
  }

  const handleFilesChange = (files: File[]) => {
    setNewFiles(prev => [...prev, ...files])
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

  return (
    <>
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Dosya Silme Onayı</AlertDialogTitle>
            <AlertDialogDescription>
              Bu dosyayı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDelete}>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>Sil</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
            {(existingFiles.length > 0 || newFiles.length > 0) && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 w-full">
                {existingFiles.map((file) => (
                  <div key={file.id} className="relative aspect-square w-full max-w-xs group">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-full flex flex-col items-center justify-center gap-4 border-2 border-dashed
                      border-slate-200 dark:border-slate-700 relative overflow-hidden hover:border-indigo-500
                      dark:hover:border-indigo-400 transition-all hover:bg-slate-100/50 dark:hover:bg-slate-800/50"
                    >
                      <img
                        src={file.File_path}
                        alt={file.File_name}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      {isEditMode && (
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 h-8 w-8 bg-red-500/90 hover:bg-red-600 
                          shadow-lg backdrop-blur-sm hover:scale-105 transition-all opacity-0 group-hover:opacity-100"
                          onClick={() => handleDeleteClick(file)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </Button>
                  </div>
                ))}

                {newFiles.map((file) => (
                  <div key={file.name} className="relative aspect-square w-full max-w-xs group">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-full flex flex-col items-center justify-center gap-4 border-2 border-dashed
                      border-slate-200 dark:border-slate-700 relative overflow-hidden hover:border-indigo-500
                      dark:hover:border-indigo-400 transition-all hover:bg-slate-100/50 dark:hover:bg-slate-800/50"
                    >
                      <img
                        src={previews[file.name] || ''}
                        alt={file.name}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      {isEditMode && (
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 h-8 w-8 bg-red-500/90 hover:bg-red-600 
                          shadow-lg backdrop-blur-sm hover:scale-105 transition-all opacity-0 group-hover:opacity-100"
                          onClick={() => handleDeleteClick(file)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {isEditMode && (
              <FileUpload
                onFilesChange={handleFilesChange}
                existingFiles={existingFiles}
                onFileRemove={handleDeleteClick}
              />
            )}  
          </div>
        </Card>
      </motion.div>
    </>
  )
}