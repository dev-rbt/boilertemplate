export type ApplicationStatus = 
  | "pending" // Beklemede
  | "in_review" // İncelemede
  | "approved" // Onaylandı
  | "contract_shared" // Sözleşme Paylaşıldı
  | "contract_signed" // Sözleşme İmzalandı
  | "rejected"; // Reddedildi

export interface ApplicationActivity {
  id: number;
  applicationId: number;
  type: "status_change" | "comment" | "file_upload" | "meeting" | "other";
  description: string;
  oldStatus?: ApplicationStatus;
  newStatus?: ApplicationStatus;
  createdBy: number;
  createdByName: string;
  createdAt: string;
  metadata?: {
    fileUrl?: string;
    meetingDate?: string;
    meetingNotes?: string;
    [key: string]: any;
  };
}
export type ApplicationPriority = "low" | "medium" | "high";

export type ApplicationCategory =
  | "new_branch"
  | "renovation"
  | "relocation"
  | "transfer"
  | "other";

export type ApplicationSource =
  | "branch_portal"
  | "email"
  | "phone"
  | "whatsapp"
  | "meeting";

export interface BranchApplication {
  id: number;
  Title: string;
  Description: string;
  BranchID: number;
  Source: string;
  Status: string;
  Priority: string;
  Category: string;
  Assigned_to_id: number;
  Assigned_to_Name: string;
  Observers: string;
  Observers_id: string;
  ApplicantName: string;
  ApplicantContact: string;
  Created_at: string;
  UpdatedAt: string;
  Last_action_at: string;
  Created_by_id: number;
  BranchName: string;
  CreatedUserName: string;
  propertyOwnership: string;
  desiredLocation: string;
  latitude?: string;
  longitude?: string;
}

export const applicationSourceMap: Record<ApplicationSource, string> = {
  branch_portal: "Bayi Portalı",
  email: "E-posta",
  phone: "Telefon",
  whatsapp: "WhatsApp",
  meeting: "Toplantı",
};

export const applicationCategoryMap: Record<ApplicationCategory, string> = {
  new_branch: "Yeni Şube",
  renovation: "Renovasyon",
  relocation: "Yer Değişikliği",
  transfer: "Devir",
  other: "Diğer",
};

export const statusOptions = [
  { value: "all", label: "Tüm Durumlar" },
  { value: "pending", label: "Beklemede" },
  { value: "in_review", label: "İncelemede" },
  { value: "approved", label: "Onaylandı" },
  { value: "contract_shared", label: "Sözleşme Paylaşıldı" },
  { value: "contract_signed", label: "Sözleşme İmzalandı" },
  { value: "rejected", label: "Reddedildi" }
]

export const statusMap: Record<ApplicationStatus, string> = {
  pending: "Beklemede",
  in_review: "İncelemede",
  approved: "Onaylandı",
  contract_shared: "Sözleşme Paylaşıldı",
  contract_signed: "Sözleşme İmzalandı",
  rejected: "Reddedildi"
}

export function getStatusBadgeVariant(status: ApplicationStatus) {
  switch (status) {
    case "pending":
      return "warning"
    case "in_review":
      return "purple"
    case "approved":
      return "success"
    case "contract_shared":
      return "blue"
    case "contract_signed":
      return "green"
    case "rejected":
      return "destructive"
    default:
      return "default"
  }
}

export const priorityOptions = [
  { value: "all", label: "Tüm Öncelikler" },
  { value: "high", label: "Yüksek" },
  { value: "medium", label: "Orta" },
  { value: "low", label: "Düşük" }
]

export const sourceOptions = [
  { value: "all", label: "Tüm Kaynaklar" },
  { value: "branch_portal", label: "Bayi Portalı" },
  { value: "email", label: "E-posta" },
  { value: "phone", label: "Telefon" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "meeting", label: "Toplantı" }
]

export const categoryOptions = [
  { value: "new_branch", label: "Yeni Şube" },
  { value: "renovation", label: "Renovasyon" },
  { value: "relocation", label: "Yer Değişikliği" },
  { value: "transfer", label: "Devir" },
  { value: "other", label: "Diğer" }
]


export function getStatusLabel(status?: string) {
  if (!status) return "Açık"

  switch (status.toLowerCase()) {
    case "pending":
      return "Beklemede"
    case "in_review":
      return "İncelemede"
    case "approved":
      return "Onaylandı"
    case "rejected":
      return "Reddedildi"
    default:
      return "Beklemede"
  }
}