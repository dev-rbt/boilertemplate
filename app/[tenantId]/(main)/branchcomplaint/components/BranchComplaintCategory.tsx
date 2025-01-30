"use client"

import { Truck, Wrench, Coffee, Users, GraduationCap, MonitorSmartphone, Laptop, HelpCircle, LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { getCategoryLabel } from "../branch-complaint-types"

const categoryIcons: Record<string, LucideIcon> = {
  supply_chain: Truck,         // Tedarik zinciri için kamyon ikonu
  equipment: Wrench,          // Ekipman için anahtar ikonu
  menu: Coffee,              // Menü için kahve/yemek ikonu
  staff: Users,              // Personel için kullanıcılar ikonu
  training: GraduationCap,   // Eğitim için mezuniyet şapkası ikonu
  software: MonitorSmartphone, // Yazılım için monitör ikonu
  hardware: Laptop,          // Donanım için laptop ikonu
  other: HelpCircle         // Diğer için yardım ikonu
}

interface ComplaintCategoryBadgeProps {
  category: string
  className?: string
}

export function ComplaintCategoryBadge({ category, className }: ComplaintCategoryBadgeProps) {
  const Icon = categoryIcons[category.toLowerCase()] || HelpCircle;
  
  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium",
      "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400",
      className
    )}>
      <Icon className="h-3.5 w-3.5" />
      <span>{getCategoryLabel(category)}</span>
    </div>
  )
}
