"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useState } from 'react';

interface ComplaintCommentCardProps {
  comment: string
  onCommentChange: (value: string) => void
  onAddComment: () => void
  handleAddComment: () => Promise<void>
}

export function ComplaintCommentCard({
  comment,
  onCommentChange,
  handleAddComment,
}: ComplaintCommentCardProps) {
  const [newComment, setNewComment] = useState(comment);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCommentChange = (value: string) => {
    setNewComment(value);
    onCommentChange(value);
  };

  const handleAddCommentClick = async () => {
    if (!newComment.trim()) return;
    
    setIsSubmitting(true);
    try {
      await handleAddComment();
      setNewComment(''); // Yorum eklendikten sonra input'u temizle
      onCommentChange(''); // Parent component'teki state'i de temizle
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="shadow-sm">
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
          </svg>
          Yorum Ekle
        </h3>
        <div className="space-y-3">
          <div className="relative">
            <Textarea
              value={newComment}
              onChange={(e) => handleCommentChange(e.target.value)}
              placeholder="Yorumunuzu yazın..."
              className="min-h-[80px] resize-none bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
            <div className="absolute bottom-2 right-2 flex items-center gap-2">
              <span className="text-xs text-gray-400">
                {newComment.length} / 1000
              </span>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button
              onClick={handleAddCommentClick}
              disabled={isSubmitting || !newComment.trim()}
              className="relative overflow-hidden group bg-purple-600 hover:bg-indigo-600 text-white rounded-lg px-6 py-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="relative z-10 flex items-center gap-2">
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Ekleniyor...</span>
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                    </svg>
                    <span>Yorum Ekle</span>
                  </>
                )}
              </span>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}
