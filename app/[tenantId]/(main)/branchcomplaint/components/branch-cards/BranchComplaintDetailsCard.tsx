"use client"

import { FileText, Tag, MessageSquare } from "lucide-react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

interface ComplaintDetailsCardProps {
  data: any
  setData: (data: any) => void
}

export function ComplaintDetailsCard({ data, setData }: ComplaintDetailsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <Card className="overflow-hidden group hover:shadow-xl transition-all duration-300 p-8 bg-gradient-to-br from-orange-50 to-white dark:from-orange-900/20 dark:to-gray-900/50 backdrop-blur-sm border-2 border-orange-100/50 dark:border-orange-900/20 shadow-lg shadow-orange-100/30 dark:shadow-orange-900/20 rounded-xl">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center shadow-inner transform group-hover:scale-110 transition-transform duration-300">
            <FileText className="h-6 w-6 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h3 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-orange-900 dark:from-orange-400 dark:to-orange-200">
              Şikayet Detayları
            </h3>
            <p className="text-sm text-orange-600/80 dark:text-orange-400/80">
              Şikayet başlığı ve açıklaması
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="flex items-center gap-2 text-orange-700 dark:text-orange-300 font-medium mb-2">
              <Tag className="h-4 w-4" />
              Başlık
            </label>
            <Input
              value={data.title}
              onChange={(e) => setData({ ...data, title: e.target.value })}
              className="bg-white/80 dark:bg-gray-800/80 border-2 border-orange-100 dark:border-orange-900/30 focus:border-orange-500 dark:focus:border-orange-400 rounded-xl transition-all duration-200 focus:ring-2 focus:ring-orange-500/20"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-orange-700 dark:text-orange-300 font-medium mb-2">
              <MessageSquare className="h-4 w-4" />
              Açıklama
            </label>
            <Textarea
              value={data.description}
              onChange={(e) => setData({ ...data, description: e.target.value })}
              className="min-h-[120px] bg-white/80 dark:bg-gray-800/80 border-2 border-orange-100 dark:border-orange-900/30 focus:border-orange-500 dark:focus:border-orange-400 rounded-xl transition-all duration-200 focus:ring-2 focus:ring-orange-500/20 resize-none"
            />
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
