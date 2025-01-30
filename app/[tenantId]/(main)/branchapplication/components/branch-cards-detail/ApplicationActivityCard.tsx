
import { Card } from "@/components/ui/card"
import { ApplicationActivity, statusMap } from "@/app/[tenantId]/(main)/branchapplication/branch-application-types"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatDateTime } from "@/lib/utils"
import { FileText, MessageSquare, RefreshCw, Calendar, Plus } from "lucide-react"

interface ApplicationActivityCardProps {
  activities: ApplicationActivity[]
}

export function ApplicationActivityCard({ activities }: ApplicationActivityCardProps) {
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
      <h3 className="text-lg font-semibold mb-4">Aktiviteler</h3>
      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex gap-4 pb-4 border-b last:border-0">
              <div className="mt-1">{getActivityIcon(activity.type)}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{activity.createdByName}</p>
                  <span className="text-sm text-gray-500">
                    {formatDateTime(activity.createdAt)}
                  </span>
                </div>
                <p className="text-sm mt-1">{activity.description}</p>
                {activity.type === "status_change" && activity.oldStatus && activity.newStatus && (
                  <p className="text-sm text-gray-600 mt-1">
                    {statusMap[activity.oldStatus]} → {statusMap[activity.newStatus]}
                  </p>
                )}
                {activity.type === "meeting" && activity.metadata?.meetingDate && (
                  <p className="text-sm text-gray-600 mt-1">
                    Toplantı Tarihi: {formatDateTime(activity.metadata.meetingDate)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  )
}
