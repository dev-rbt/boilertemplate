
import { motion } from "framer-motion";
import { formatDateTime } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { ApplicationActivity } from "@/app/[tenantId]/(main)/branchapplication/branch-application-types";
import { MessageSquare, RefreshCw, Calendar, FileText, Plus } from "lucide-react";

interface ApplicationTimelineCardProps {
  activities: ApplicationActivity[];
}

export function ApplicationTimelineCard({ activities = [] }: ApplicationTimelineCardProps) {
  const getActivityIcon = (type: ApplicationActivity["type"]) => {
    switch (type) {
      case "status_change":
        return <RefreshCw className="h-4 w-4" />
      case "comment":
        return <MessageSquare className="h-4 w-4" />
      case "file_upload":
        return <FileText className="h-4 w-4" />
      case "meeting":
        return <Calendar className="h-4 w-4" />
      default:
        return <Plus className="h-4 w-4" />
    }
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Aktivite Geçmişi</h3>
      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-800" />
        <div className="space-y-6">
          {activities.map((activity) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative pl-10 group"
            >
              <div className="absolute left-0 top-1.5 w-[32px] h-[32px] rounded-full bg-white dark:bg-gray-800 border-4 border-green-500/20 group-hover:border-green-500/40 transition-all duration-300 flex items-center justify-center shadow-lg">
                <div className="w-3 h-3 rounded-full bg-green-500 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <div className="ml-4 rounded-lg p-4 shadow-md transition-shadow duration-600 hover:shadow-lg bg-white dark:bg-gray-800">
                <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed">
                  {activity.description}
                </p>
                <div className="mt-2 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <span className="font-medium">{activity.createdByName}</span>
                  <span>•</span>
                  <time className="font-mono">
                    {formatDateTime(activity.createdAt)}
                  </time>
                </div>
              </div>
            </motion.div>
          ))}
          {activities.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Henüz aktivite bulunmuyor
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
