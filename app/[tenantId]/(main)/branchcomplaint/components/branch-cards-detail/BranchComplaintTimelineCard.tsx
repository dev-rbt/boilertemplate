"use client"

import { Card } from "@/components/ui/card"
import { motion } from "framer-motion"
import { BranchComplaint, BranchComplaintComment } from "../../branch-complaint-types"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import { useBranchComplaintStore } from "@/stores/branch-complaint-store"
import { useEffect } from "react"
import { formatDateTime } from "@/lib/utils"

interface BranchComplaintTimelineCardProps {
  complaintcomments: BranchComplaintComment[];
  complaint?: BranchComplaint;
}

export function BranchComplaintTimelineCard({ complaintcomments = [], complaint }: BranchComplaintTimelineCardProps) {
  const [timeline, setTimeline] = useBranchComplaintStore(state => [state.timeline, state.setBranchTimeline]);

  useEffect(() => {
    if (complaintcomments?.length > 0) {
      setTimeline(complaintcomments);
    }
  }, [complaintcomments, setTimeline]);

  return (
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-6 px-2 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
          Zaman Çizelgesi
        </h3>
        <div className="space-y-6">
          {timeline?.map((item, index) => (
            <motion.div
              key={item.id || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                delay: index * 0.1,
                ease: [0.4, 0, 0.2, 1]
              }}
              className="relative pl-8 group"
            >
              {/* Timeline line */}
              {index < timeline.length - 1 && (
                <div className="absolute left-[15px] top-7 bottom-0 w-[2px] bg-gradient-to-b from-green-500/30 to-transparent" />
              )}

              {/* Timeline dot */}
              <div className="absolute left-0 top-1.5 w-[32px] h-[32px] rounded-full bg-white dark:bg-gray-800 border-4 border-green-500/20 group-hover:border-green-500/40 transition-all duration-300 flex items-center justify-center shadow-lg">
                <div className="w-3 h-3 rounded-full bg-green-500 group-hover:scale-110 transition-transform duration-300" />
              </div>

              {/* Content */}
              <div className="ml-4   rounded-lg p-4 shadow-md transition-shadow duration-600 hover:shadow-lg bg-white dark:bg-gray-800 ">
                <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed">
                  {item.Content}
                </p>
                <div className="mt-2 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <span className="font-medium">{item.AuthorName || 'Sistem'}</span>
                  <span>•</span>
                  <time className="font-mono">
                    {formatDateTime(item.Created_at)}
                  </time>
                </div>
              </div>
            </motion.div>
          ))}
          
          {timeline?.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Henüz zaman çizelgesi bulunmuyor
            </div>
          )}
        </div>
      </div>
  )
}

export default BranchComplaintTimelineCard