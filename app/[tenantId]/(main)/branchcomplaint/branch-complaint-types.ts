export type ComplaintStatus = "open" | "in_progress" | "pending" | "resolved" | "closed";
export type ComplaintPriority = "low" | "medium" | "high";

export type ComplaintCategory =
  | "supply_chain"
  | "equipment"
  | "menu"
  | "staff"
  | "training"
  | "software"
  | "hardware"
  | "other";

export type ComplaintSource =
  | "branch_portal"
  | "email"
  | "phone"
  | "whatsapp"
  | "meeting";

export interface BranchComplaint {
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
  CustomerName: string;
  CustomerContact: string;
  Created_at: string;
  UpdatedAt: string;
  Last_action_at: string;
  Created_by_id: number;
  BranchName: string;
  CreatedUserName: string;
}

export interface BranchComplaintComment {
  id: string;
  Complaint_id: string;
  Author_id: string;
  Content: string;
  Created_at: string;
  Updated_at: string;
  AuthorName: string;
  Status: string;
  Type: string;
}

export interface BranchComplaintHistory {
  id: number;
  complaintId: number;
  action: string;
  description: string;
  timestamp: string;
  user: string;
  status: ComplaintStatus;
}

export interface BranchComplaintAttachment  {
  id: string;
  Complaint_id: string;
  File_name: string;
  File_path: string;
  File_type: string;
  File_size: number;
  Uploaded_at: string;
  Uploaded_by_id: string;
}

export const complaintSourceMap: Record<ComplaintSource, string> = {
  branch_portal: "Bayi Portalı",
  email: "E-posta",
  phone: "Telefon",
  whatsapp: "WhatsApp",
  meeting: "Toplantı",
};

export const complaintCategoryMap: Record<ComplaintCategory, string> = {
  supply_chain: "Tedarik Zinciri",
  equipment: "Ekipman",
  menu: "Menü",
  staff: "Personel",
  training: "Eğitim",
  software: "Yazılım",
  hardware: "Donanım",
  other: "Diğer",
};


export interface Manager {
  id: string;
  name: string;
  role: string;
}

export interface Observer {
  id: string;
  name: string;
  role: string;
}

export const statusOptions = [
  { value: "all", label: "Tüm Durumlar" },
  { value: "open", label: "Açık" },
  { value: "in_progress", label: "İşlemde" },
  { value: "pending", label: "Beklemede" },
  { value: "resolved", label: "Çözümlendi" }
]

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
  { value: "all", label: "Tüm Kategoriler" },
  { value: "supply_chain", label: "Tedarik Zinciri" },
  { value: "equipment", label: "Ekipman" },
  { value: "menu", label: "Menü" },
  { value: "staff", label: "Personel" },
  { value: "training", label: "Eğitim" },
  { value: "software", label: "Yazılım" },
  { value: "hardware", label: "Donanım" },
  { value: "other", label: "Diğer" }
]

export function getStatusBadgeVariant(status?: string) {
  if (!status) return "default"
  
  switch (status.toLowerCase()) {
    case "open":
      return "default"
    case "in_progress":
      return "warning"
    case "pending":
      return "purple"
    case "resolved":
      return "success"
    case "closed":
      return "secondary"
    default:
      return "default"
  }
}

export function getStatusLabel(status?: string) {
  if (!status) return "Açık"
  
  switch (status.toLowerCase()) {
    case "open":
      return "Açık"
    case "in_progress":
      return "İşlemde"
    case "pending":
      return "Beklemede"
    case "resolved":
      return "Çözüldü"
    case "closed":
      return "Kapalı"
    default:
      return "Açık"
  }
}

export function getPriorityBadgeVariant(priority?: string) {
  if (!priority) return "default"
  
  switch (priority.toLowerCase()) {
    case "low":
      return "default"
    case "medium":
      return "orange"
    case "high":
      return "destructive"
    default:
      return "default"
  }
}

export function getPriorityLabel(priority?: string) {
  if (!priority) return "Normal"
  
  switch (priority.toLowerCase()) {
    case "low":
      return "Düşük"
    case "medium":
      return "Normal"
    case "high":
      return "Yüksek"
    default:
      return "Normal"
  }
}

export const statusOptionsNew = [
  { value: "open", label: "Açık" },
  { value: "in_progress", label: "İşlemde" },
  { value: "resolved", label: "Çözüldü" },
  { value: "closed", label: "Kapatıldı" }
]

export const getCategoryLabel = (category: string) => {
  switch (category.toLowerCase()) {
      case "supply_chain":
          return "Tedarik Zinciri"
      case "equipment":
          return "Ekipman"
      case "menu":
          return "Menü"
      case "staff":
          return "Personel"
      case "training":
          return "Eğitim"
      case "software":
          return "Yazılım"
      case "hardware":
          return "Donanım"
      case "other":
          return "Diğer"
      default:
          return category
  }
}
