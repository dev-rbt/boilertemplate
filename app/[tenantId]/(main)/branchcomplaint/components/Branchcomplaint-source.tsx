"use client"

import { Store, Mail, Phone, MessageSquare, Users, MessageCircle, LucideIcon } from "lucide-react"
import { ComplaintSource, complaintSourceMap } from "../branch-complaint-types"
import { cn } from "@/lib/utils"

const sourceIcons: Record<ComplaintSource, LucideIcon> = {
  branch_portal: Store,      // Bayi portalı için mağaza ikonu
  email: Mail,              // Email için mail ikonu
  phone: Phone,             // Telefon için telefon ikonu
  whatsapp: MessageCircle,  // WhatsApp için mesaj ikonu
  meeting: Users,           // Toplantı için kullanıcılar ikonu
}

interface ComplaintSourceBadgeProps {
  source: ComplaintSource
  className?: string
}

export function ComplaintSourceBadge({ source, className }: ComplaintSourceBadgeProps) {
  const Icon = sourceIcons[source as ComplaintSource] || MessageSquare;
  
  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium",
      "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
      className
    )}>
      <Icon className="h-3.5 w-3.5" />
      <span>{complaintSourceMap[source as ComplaintSource] || source}</span>
    </div>
  )
}
