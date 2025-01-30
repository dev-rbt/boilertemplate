"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { ComplaintInput } from "@/types/complaint-api"
import { ComplaintDetailCard } from "./branch-cards-detail/BranchComplaintDetailCard"
import { ComplaintFilesCard } from "./branch-cards-detail/BranchComplaintFilesCard"
import { ComplaintDescriptionCard } from "./branch-cards-detail/BranchComplaintDescriptionCard"
import { ComplaintCommentCard } from "./branch-cards-detail/BranchComplaintCommentCard"
import BranchComplaintTimelineCard from "./branch-cards-detail/BranchComplaintTimelineCard"
import { statusOptions, getStatusBadgeVariant, getStatusLabel, getPriorityBadgeVariant, getPriorityLabel, BranchComplaint } from "../branch-complaint-types"
import { useToast } from "@/hooks/use-toast"
import { Efr_Branches } from "@/types/tables"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { Form } from "@/components/ui/form"
import { usePathname } from "next/navigation"
import { useBranchComplaintStore } from "@/stores/branch-complaint-store"

const complaintSchema = z.object({
  title: z.string().min(1, "Başlık zorunludur").max(200, "Başlık en fazla 200 karakter olabilir"),
  description: z.string().min(1, "Açıklama zorunludur"),
  branchId: z.string().min(1, "Şube seçimi zorunludur"),
  source: z.string().min(1, "Kaynak seçimi zorunludur"),
  status: z.string().min(1, "Durum seçimi zorunludur"),
  priority: z.string().min(1, "Öncelik seçimi zorunludur"),
  category: z.string().min(1, "Kategori seçimi zorunludur"),
  assignedToId: z.string().min(1, "Atanan kişi seçimi zorunludur"),
  assignedToName: z.string().min(1, "Atanan kişi adı zorunludur"),
  observers: z.string().optional(),
  observers_id: z.string().optional(),
  customerName: z.string().optional(),
  customerContact: z.string().optional(),
  files: z.array(z.string()).optional(),
  existingFiles: z.array(z.string()).optional(),
})

interface ComplaintFormProps {
  filteredBranches?: Efr_Branches[];
  users?: Array<{ id: number; name: string }>;
  complaint?: any;
  complaintId?: number;
  complaintcomments?: any[];
  attachments?: any[];
  selectedBranch?: string;
  onBranchChange?: (branchId: string) => void;
}

export default function ComplaintForm({
  filteredBranches = [],
  users = [],
  complaint,
  complaintId,
  complaintcomments = [],
  attachments = [],
  selectedBranch,
  onBranchChange,
}: ComplaintFormProps) {
  const { toast } = useToast()
  const [newComment, setNewComment] = useState("")
  const [timeline, setTimeline] = useState(complaintcomments)
  const [localFiles, setLocalFiles] = useState(attachments.map(a => a.File_path))
  const [branchPopoverOpen, setBranchPopoverOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [formData, setFormData] = useState(complaint || null)
  const [files, setFiles] = useState<File[]>([])
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [addBranchComplaint, updateBranchComplaint, addBranchTimelineItem] = useBranchComplaintStore(state => [
    state.addBranchComplaint,
    state.updateBranchComplaint,
    state.addBranchTimelineItem
  ])
  const pathname = usePathname();
  const [userData, setUserData] = useState<{
    userId: number;
    username: string;
    name: string;
  }>({
    userId: 0,
    username: '',
    name: ''
  });
  const [attachmentsList, setAttachmentsList] = useState(attachments);

  useEffect(() => {
    setAttachmentsList(attachments);
  }, [attachments]);

  const form = useForm<ComplaintInput & { files: File[], existingFiles: string[] }>({
    resolver: zodResolver(complaintSchema),
    defaultValues: {
      title: complaint?.Title || "",
      description: complaint?.Description || "",
      branchId: complaint?.BranchID?.toString() || "",
      source: complaint?.Source || "",
      status: complaint?.Status || "open",
      priority: complaint?.Priority || "medium",
      category: complaint?.Category || "",
      assignedToId: complaint?.Assigned_to_id?.toString() || "",
      assignedToName: complaint?.Assigned_to_Name || "",
      observers: complaint?.Observers || "",
      observers_id: complaint?.Observers_id || "",
      customerName: complaint?.CustomerName || "",
      customerContact: complaint?.CustomerContact || "",
      files: [],
      existingFiles: attachments?.map(a => a.File_path) || [],
    },
  })

  const handleToggleEditMode = () => {
    console.log('Düzenleme modu değiştirildi:', !isEditMode);
    if (!isEditMode) {
      console.log('Form değerleri sıfırlanıyor:', {
        currentFormData: formData,
        newValues: {
          title: formData?.Title || "",
          description: formData?.Description || "",
          branchId: formData?.BranchID?.toString() || "",
          branchName: formData?.BranchName || "",
          source: formData?.Source || "",
          status: formData?.Status || "open",
          priority: formData?.Priority || "medium",
          category: formData?.Category || "",
          assignedToId: formData?.Assigned_to_id?.toString() || "",
          assignedToName: formData?.Assigned_to_Name || "",
          observers: formData?.Observers || "",
          observers_id: formData?.Observers_id || "",
          customerName: formData?.CustomerName || "",
          customerContact: formData?.CustomerContact || "",
        }
      });
      form.reset({
        title: formData?.Title || "",
        description: formData?.Description || "",
        branchId: formData?.BranchID?.toString() || "",
        source: formData?.Source || "",
        status: formData?.Status || "open",
        priority: formData?.Priority || "medium",
        category: formData?.Category || "",
        assignedToId: formData?.Assigned_to_id?.toString() || "",
        assignedToName: formData?.Assigned_to_Name || "",
        observers: formData?.Observers || "",
        observers_id: formData?.Observers_id || "",
        customerName: formData?.CustomerName || "",
        customerContact: formData?.CustomerContact || "",
        files: [],
        existingFiles: attachments?.map(a => a.File_path) || [],
      });
    }
    setIsEditMode(!isEditMode);
  };

  useEffect(() => {
    try {
      const tenantId = pathname?.split('/')[1];
      const userDataStr = localStorage.getItem(`userData_${tenantId}`);

      if (userDataStr) {
        const parsedData = JSON.parse(userDataStr);
        // Veri yapısını kontrol et
        if (parsedData && typeof parsedData === 'object') {
          setUserData({
            userId: parsedData.userId || 0,
            username: parsedData.username || '',
            name: parsedData.name || ''
          });
        }
      }
    } catch (error) {
      console.error('LocalStorage verisi parse edilirken hata:', error);
      // Varsayılan değerleri kullan
      setUserData({
        userId: 0,
        username: '',
        name: ''
      });
    }
  }, [pathname]);

  const handleFilesChange = (newFiles: File[]) => {
    setFiles(prevFiles => [...prevFiles, ...newFiles]);
  };

  const handleFileRemove = async (fileToRemove: string | File) => {
    if (typeof fileToRemove === 'string') {
      try {
        // Dosyayı bul
        const fileToDelete = attachmentsList.find(a => a.File_path === fileToRemove);

        if (fileToDelete) {
          const response = await fetch('/api/branchcomplaints/branch-complaint-delete-attachment', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              complaintId: complaintId,
              fileToRemove: fileToDelete.File_name
            }),
          });

          if (!response.ok) {
            throw new Error('Dosya silinirken bir hata oluştu');
          }

          // Başarılı silme işleminden sonra state'leri güncelle
          setAttachmentsList(prev => prev.filter(a => a.File_path !== fileToRemove));
          setLocalFiles(prev => prev.filter(file => file !== fileToRemove));

          // Form state'ini güncelle
          const currentFiles = form.getValues('existingFiles') || [];
          form.setValue('existingFiles', currentFiles.filter(f => f !== fileToRemove));

          toast({
            title: "Başarılı",
            description: "Dosya başarıyla silindi"
          });
        }
      } catch (error) {
        console.error('Dosya silme hatası:', error);
        toast({
          variant: "destructive",
          title: "Hata",
          description: "Dosya silinirken bir hata oluştu"
        });
      }
    } else {
      // Yeni yüklenen dosyaları güncelle
      setFiles(prev => prev.filter(file => file !== fileToRemove));
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      const requestData = {
        complaint: JSON.stringify({
          id: complaintId,
          Content: newComment,
          authorId: userData?.userId,
          authorName: userData?.name || 'Sistem',
        })
      };

      console.log('Yorum gönderiliyor:', requestData);

      const response = await fetch('/api/branchcomplaints/branch-complaints-comment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      console.log('API yanıtı:', response);

      if (!response.ok) {
        throw new Error('Yorum eklenirken bir hata oluştu');
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Yorum eklenirken bir hata oluştu');
      }

      // Store'a yeni yorumu ekle
      const newTimelineItem = {
        id: Date.now(),
        Content: newComment,
        Created_at: new Date(new Date().getTime() + (3 * 60 * 60 * 1000)).toISOString(), // +3 saat ekleyerek
        AuthorName: userData?.name || 'Sistem',
        Type: 'comment'
      };
      addBranchTimelineItem(newTimelineItem);
      setNewComment('');

      toast({
        title: 'Başarılı',
        description: 'Yorum eklendi',
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Hata",
        description: error instanceof Error ? error.message : 'Yorum eklenirken bir hata oluştu',
      });
    }
  }

  const handleSave = async () => {
    try {
      setIsSubmitting(true);
      const formValues = form.getValues();

      // Önce yeni dosyaları yükle
      const uploadedFiles = [];
      if (files.length > 0) {
        for (const file of files) {
          const formData = new FormData();
          formData.append("file", file);

          const response = await fetch("/api/upload/image", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            throw new Error("Dosya yüklenirken bir hata oluştu");
          }

          const data = await response.json();
          uploadedFiles.push(data.Result);
        }
      }

      const existingFileUrls = formValues?.existingFiles || [];
      const allFiles = [...new Set([...uploadedFiles, ...existingFileUrls])];

      // API'ye gönderilecek veriyi hazırla
      const requestData = {
        complaint: JSON.stringify({
          ...formValues,
          title: formValues.title,
          description: formValues.description,
          branchId: formValues.branchId,
          branchName: filteredBranches.find(b => b.BranchID == formValues.branchId)?.BranchName,
          source: formValues.source,
          status: formValues.status,
          priority: formValues.priority,
          category: formValues.category,
          customerName: formValues.customerName,
          customerContact: formValues.customerContact,
          assigned_to_id: formValues.assignedToId,
          assigned_to_Name: formValues.assignedToName,
          observers: formValues.observers,
          observers_id: formValues.observers_id,
          files: allFiles,
          authorId: userData?.userId,
          authorName: userData?.name || 'Sistem',
        }),
        id: complaintId
      };

      const response = await fetch(`/api/branchcomplaints/branch-complaints-update?id=${complaintId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Şikayet güncellenirken bir hata oluştu");
      }

      const oldStatus = String(formData?.Status).toLowerCase();
      const newStatus = String(formValues.status).toLowerCase();

      if (oldStatus !== newStatus && oldStatus !== 'undefined' && oldStatus !== 'null') {
        const statusComment = {
          id: Date.now(),
          Content: `Şikayet durumu '${getStatusLabel(formValues.status)}' olarak güncellendi`,
          Created_at: new Date(new Date().getTime() + (3 * 60 * 60 * 1000)).toISOString(), // +3 saat ekleyerek
          AuthorName: userData?.name || 'Sistem',
          Type: 'status'
        };

        addBranchTimelineItem(statusComment);
      }
      // Edit modunu kapat
      setIsEditMode(false);
      // Store'u güncelle
      console.log('💾 [Update] Updating store');
      const selectedBranchData = filteredBranches.find(b => b.BranchID == formValues.branchId);

      const complaintData = {
        id: Number(complaintId),
        Title: formValues.title,
        Description: formValues.description,
        BranchID: formValues.branchId,
        BranchName: selectedBranchData?.BranchName || formData?.BranchName || "",
        Source: formValues.source,
        Status: formValues.status,
        Priority: formValues.priority,
        CustomerName: formValues.customerName || "",
        CustomerContact: formValues.customerContact || "",
        Assigned_to_id: formValues.assignedToId,
        Assigned_to_Name: formValues.assignedToName,
        Observers: formValues.observers || "",
        Observers_id: formValues.observers_id || "",
        CreatedUserName: formData?.CreatedUserName || formValues.assignedToName,
        Created_by_id: formData?.Created_by_id || "56",
        Username: formData?.Username || formValues.assignedToName,
        Attachments: uploadedImageUrls,
        Created_at: formData?.Created_at ||  new Date(new Date().getTime() + (3 * 60 * 60 * 1000)).toISOString(), // +3 saat ekleyerek
        Updated_at: new Date(new Date().getTime() + (3 * 60 * 60 * 1000)).toISOString(), // +3 saat ekleyerek
        Category: formValues.category
      };

      console.log('💾 [Update] Complaint data to store:', complaintData);

      // Store'daki mevcut şikayetleri al ve güncelle
      const currentComplaints = useBranchComplaintStore.getState().complaints;
      const numericId = Number(complaintId);

      // Mevcut şikayetleri filtrele (güncellenen ID'yi çıkar)
      const filteredComplaints = currentComplaints.filter(c => {
        const cId = typeof c.id === 'string' ? parseInt(c.id) : c.id;
        return cId !== numericId;
      });

      // Yeni şikayeti en başa ekle
      useBranchComplaintStore.setState({
        complaints: [complaintData, ...filteredComplaints]
      });

      // formData'yı güncelle
      setFormData({
        ...formData,
        ...complaintData
      });

      console.log('✨ [Update] Process completed successfully');
    } catch (error) {
      console.error('❌ [Update] Error:', error);
      toast({
        variant: "destructive",
        title: "Hata",
        description: error instanceof Error ? error.message : "Şikayet güncellenirken bir hata oluştu",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const [currentStatus, setCurrentStatus] = useState(form.getValues("status"));

  useEffect(() => {
    if (complaint) {
      const newFormData = {
        ...complaint,
        Priority: complaint.Priority || "medium",
        Status: complaint.Status || "open",
        Source: complaint.Source || "website",
        assignedToId: complaint.Assigned_to_id?.toString() || "",
        assignedToName: complaint.Assigned_to_Name || "",
        observers: complaint.Observers || "",
        observers_id: complaint.Observers_id || "",
        branchName: complaint.BranchName?.toString() || "",
        Category: complaint.Category || "",
      };
      setFormData(newFormData);
      form.reset({
        title: newFormData.Title || "",
        description: newFormData.Description || "",
        branchId: newFormData.BranchID?.toString() || "",
        source: newFormData.Source || "",
        status: newFormData.Status || "open",
        priority: newFormData.Priority || "medium",
        category: newFormData.Category || "",
        assignedToId: newFormData.Assigned_to_id?.toString() || "",
        assignedToName: newFormData.Assigned_to_Name || "",
        observers: newFormData.Observers || "",
        observers_id: newFormData.Observers_id || "",
        customerName: newFormData.CustomerName || "",
        customerContact: newFormData.CustomerContact || "",
        files: [],
        existingFiles: attachments?.map(a => a.File_path) || [],
      });
    }
  }, [complaint, attachments, form]);

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const day = date.getUTCDate().toString().padStart(2, '0');
    const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
    const year = date.getUTCFullYear();
    const time = date.toISOString().slice(11, 16);

    return `${day}.${month}.${year} ${time}`;
  };

  return (
    <Form {...form}>
      <div className="relative">
        <div className="min-h-screen">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-6 mb-8 rounded-xl">
            <div className="relative flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold tracking-tight text-white">
                  {formData?.Title || "Yeni Şikayet"}
                </h2>
                {formData?.id && (
                  <p className="text-sm text-purple-100/80">
                    Şikayet #{formData.id}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={handleToggleEditMode}
                  className="bg-white/10 text-white border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-white/20 hover:bg-white/20"
                >
                  {isEditMode ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  )}
                </button>
                {isEditMode ? (
                  <Select
                    value={currentStatus}
                    onValueChange={(value) => {
                      setCurrentStatus(value);
                      form.setValue("status", value, {
                        shouldDirty: true,
                        shouldTouch: true,
                        shouldValidate: true
                      });
                    }}
                  >
                    <SelectTrigger className="bg-white/10 text-white border-white/20 w-[180px] focus:ring-2 focus:ring-white/20 hover:bg-white/20 cursor-pointer">
                      <SelectValue>
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "h-2.5 w-2.5 rounded-full transition-colors",
                            currentStatus === "open" && "bg-blue-500",
                            currentStatus === "in_progress" && "bg-yellow-500",
                            currentStatus === "pending" && "bg-purple-500",
                            currentStatus === "resolved" && "bg-green-500",
                            currentStatus === "closed" && "bg-gray-500"
                          )} />
                          {getStatusLabel(currentStatus)}
                        </div>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="max-h-[var(--radix-select-content-available-height)]">
                      {statusOptions.filter(option => option.value !== "all").map(option => (
                        <SelectItem
                          key={option.value}
                          value={option.value}
                          className="cursor-pointer focus:bg-slate-100 dark:focus:bg-slate-800"
                        >
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "h-2.5 w-2.5 rounded-full transition-colors",
                              option.value === "open" && "bg-blue-500",
                              option.value === "in_progress" && "bg-yellow-500",
                              option.value === "pending" && "bg-purple-500",
                              option.value === "resolved" && "bg-green-500",
                              option.value === "closed" && "bg-gray-500"
                            )} />
                            {option.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="flex items-center gap-2 bg-white/10 text-white px-3 py-2 rounded-md w-[180px]">
                    <span className={cn(
                      "h-2.5 w-2.5 rounded-full",
                      form.getValues("status") === "open" && "bg-blue-500",
                      form.getValues("status") === "in_progress" && "bg-yellow-500",
                      form.getValues("status") === "pending" && "bg-purple-500",
                      form.getValues("status") === "resolved" && "bg-green-500",
                      form.getValues("status") === "closed" && "bg-gray-500"
                    )} />
                    {getStatusLabel(form.getValues("status"))}
                  </div>
                )}
                {isEditMode && (
                  <button
                    onClick={handleSave}
                    disabled={isSubmitting}
                    className="bg-green-500 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500/20 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Kaydediliyor..." : "Kaydet"}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <ScrollArea className="h-[calc(75vh-120px)]">
            <div className="px-8 pb-16">
              <div className="grid gap-8 grid-cols-3">
                {/* Sol Kolon - Detaylar */}
                <div className="col-span-2 space-y-8">
                  <ComplaintDetailCard
                    complaint={formData}
                    formatDate={formatDate}
                    filteredBranches={filteredBranches}
                    branchPopoverOpen={branchPopoverOpen}
                    setBranchPopoverOpen={setBranchPopoverOpen}
                    selectedBranch={selectedBranch}
                    onBranchChange={onBranchChange}
                    isEditMode={isEditMode}
                    form={form}
                    users={users}
                  />
                  <ComplaintDescriptionCard
                    description={form.getValues("description")}
                    isEditMode={isEditMode}
                    form={form}
                  />
                  <ComplaintFilesCard
                    data={formData}
                    setData={setFormData}
                    onFilesChange={handleFilesChange}
                    onFileRemove={handleFileRemove}
                    existingFiles={attachmentsList}
                    isEditMode={isEditMode}
                  />

                </div>

                {/* Sağ Kolon - Timeline */}
                <div className="flex flex-col h-[calc(75vh-120px)] border rounded-lg">
                  <div className="flex-1 overflow-y-auto
                      [&::-webkit-scrollbar]:w-2
                [&::-webkit-scrollbar-thumb]:bg-gray-300/50
                [&::-webkit-scrollbar-thumb]:rounded-full
                [&::-webkit-scrollbar-track]:bg-transparent
                dark:[&::-webkit-scrollbar-thumb]:bg-gray-700/50
                hover:[&::-webkit-scrollbar-thumb]:bg-gray-300/80
                dark:hover:[&::-webkit-scrollbar-thumb]:bg-gray-700/80">
                    <BranchComplaintTimelineCard
                      complaintcomments={complaintcomments}
                      complaint={formData}
                    />
                  </div>
                  <div className=" p-4">
                    <ComplaintCommentCard
                      comment={newComment}
                      onCommentChange={setNewComment}
                      onAddComment={() => { }}
                      handleAddComment={handleAddComment}
                    />
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>
      </div>
    </Form>
  );
}
