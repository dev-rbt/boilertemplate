"use client"

import { useState, useEffect } from "react"
import { Button } from "../../../../../components/ui/button"
import { ComplaintInfoCard } from "./branch-cards/BranchComplaintInfoCard"
import { CustomerInfoCard } from "./branch-cards/BranchCustomerInfoCard"
import { FileUploadCard } from "./branch-cards/BranchFileUploadCard"
import { ComplaintDetailsCard } from "./branch-cards/BranchComplaintDetailsCard"
import { Efr_Branches } from "@/types/tables"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useRouter, usePathname } from "next/navigation"
import { CheckCircle2, XCircle, Save } from 'lucide-react'
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { useTabStore } from "@/stores/tab-store"
import { useBranchComplaintStore } from "@/stores/branch-complaint-store"
import { toast } from '@/components/ui/toast/use-toast';

interface CreateComplaintProps {
  filteredBranches?: Efr_Branches[]
  selectedBranch?: string
  onBranchChange?: (branchId: string) => void
}

export default function CreateComplaint({
  filteredBranches = [],
  onBranchChange,
}: CreateComplaintProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([])
  const { removeTab, setActiveTab } = useTabStore();
  const addBranchComplaint = useBranchComplaintStore(state => state.addBranchComplaint);
  const [complaintData, setComplaintData] = useState({
    title: "",
    description: "",
    branchId: "",
    branchName: "",
    source: "",
    status: "open",
    priority: "medium",
    customerName: "",
    customerContact: "",
    assignedToId: "",
    assignedToName: "",
    observers: "",
    observers_id: "",
    createdUserName: "",
    created_by_id: "",
    username: "",
    category: ""
  })

  const [userData, setUserData] = useState<{
    userId: string;
    username: string;
    name: string;
  } | null>(null)

  const [selectedBranch, setSelectedBranch] = useState<any>(null);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError("");
      }, 20000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    const tenantId = pathname?.split('/')[1];
    const userDataStr = localStorage.getItem(`userData_${tenantId}`);
    const localStorageData = userDataStr ? JSON.parse(userDataStr) : null;

    if (localStorageData) {
      setUserData({
        userId: localStorageData.userId,
        username: localStorageData.username,
        name: localStorageData.name
      });

      setComplaintData(prev => ({
        ...prev,
        createdUserName: localStorageData.name,
        created_by_id: localStorageData.userId,
        username: localStorageData.username
      }));
    }
  }, [pathname]);

  const handleFilesChange = (newFiles: File[]) => {
    setFiles(prevFiles => [...prevFiles, ...newFiles]);
  };

  const handleFileRemove = (fileToRemove: string | File) => {
    if (typeof fileToRemove === 'string') {
      setUploadedImageUrls(prev => prev.filter(url => url !== fileToRemove));
    } else {
      setFiles(prev => prev.filter(file => file !== fileToRemove));
    }
  };

  const handleBranchSelect = (branch: any) => {
    setSelectedBranch(branch);
    setComplaintData(prev => ({
      ...prev,
      branchId: branch.BranchID.toString(),
      branchName: branch.BranchName
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    try {
      // Branch seçimi kontrolü
      if (!complaintData.branchId) {
        throw new Error('Lütfen şube seçiniz');
      }

      // Zorunlu alan kontrolleri
      if (!complaintData.title || !complaintData.description) {
        throw new Error('Lütfen başlık ve açıklama alanlarını doldurunuz');
      }

      // Resim yükleme
      const imageUrls: string[] = [];
      
      if (files.length > 0) {
        for (const file of files) {
          try {
            const formData = new FormData();
            formData.append('file', file);

            const uploadResponse = await fetch('/api/upload/image', {
              method: 'POST',
              body: formData
            });

            if (!uploadResponse.ok) {
              throw new Error(`Resim yükleme hatası: ${uploadResponse.statusText}`);
            }

            const uploadResult = await uploadResponse.json();
            if (!uploadResult.Status) {
              throw new Error(uploadResult.Message || 'Resim yüklenirken hata oluştu');
            }

            imageUrls.push(uploadResult.Result);
            console.log(`Uploaded image ${file.name}:`, uploadResult.Result);
          } catch (error) {
            console.error(`Error uploading file ${file.name}:`, error);
            toast({
              variant: "destructive",
              title: "Hata!",
              description: `${file.name} dosyası yüklenirken hata oluştu.`,
            });
          }
        }
      }

      const requestData = {
        complaint: JSON.stringify({
          title: complaintData.title,
          description: complaintData.description,
          branchId: complaintData.branchId,
          branchName: complaintData.branchName,
          source: complaintData.source || 'email',
          status: complaintData.status,
          priority: complaintData.priority,
          customerName: complaintData.customerName,
          customerContact: complaintData.customerContact,
          created_by_id: complaintData.created_by_id,
          createdUserName: userData?.name,
          assigned_to_id: complaintData.assignedToId,
          assigned_to_Name: complaintData.assignedToName,
          observers: complaintData.observers,
          observers_id: complaintData.observers_id,
          category: complaintData.category,
          imageUrls: imageUrls
        })
      };

      const response = await fetch('/api/branchcomplaints/branch-compaints-create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      const result = await response.json();

      if (result.success) {
        // Store'a yeni şikayeti ekle
        addBranchComplaint({
          id: result.complaintId,
          Title : complaintData.title,
          Description: complaintData.description,
          BranchID: complaintData.branchId,
          BranchName: complaintData.branchName,
          Source: complaintData.source,
          Status: complaintData.status,
          Priority: complaintData.priority,
          CustomerName: complaintData.customerName,
          CustomerContact: complaintData.customerContact,
          Assigned_to_id: complaintData.assignedToId,
          Assigned_to_Name: complaintData.assignedToName,
          Observers: complaintData.observers,
          Observers_id: complaintData.observers_id,
          CreatedUserName: userData?.name || 'Sistem',
          Created_by_id: complaintData.created_by_id,
          Username: complaintData.username,
          Category: complaintData.category,
          Attachments: imageUrls,
          Created_at: new Date(new Date().getTime() + (3 * 60 * 60 * 1000)).toISOString(), // +3 saat ekleyerek
        });

        toast({
          title: (
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span className="font-semibold text-emerald-500">Başarılı!</span>
            </div>
          ),
          description: (
            <div className="ml-6">
              <p className="text-gray-600 dark:text-gray-300">
                Şikayet başarıyla kaydedildi. <span className="font-medium">#{result.complaintId}</span>
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {complaintData.branchName} şubesi için yeni şikayet oluşturuldu.
              </p>
            </div>
          ),
          className: "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800",
          duration: 5000,
        });

        const tabId = `Yeni Bayi Şikayet`;
        removeTab(tabId);
        setActiveTab('Bayi Şikayet Yönetimi');
      } else {
        throw new Error(result.message || result.error || 'Bir hata oluştu');
      }
    } catch (error) {
      console.error('Error submitting complaint:', error);
      const errorMessage = error instanceof Error ? error.message : 'Beklenmeyen bir hata oluştu';
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Hata!",
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)]">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <ScrollArea className="flex-1 px-4 overflow-y-auto">
        <div className="space-y-6 pb-24"> {/* pb-24 ile alt kısımda boşluk bırakıyoruz */}
          <div className="grid gap-6">
            <ComplaintDetailsCard data={complaintData} setData={setComplaintData} />
            <CustomerInfoCard
              data={complaintData}
              branches={filteredBranches}
              setData={setComplaintData}
            />

            <ComplaintInfoCard
              data={complaintData}
              setData={setComplaintData}
              users={userData?.userId ? [{ id: userData.userId, name: userData.name }] : []}
            />
            <FileUploadCard
              files={files}
              onFilesChange={handleFilesChange}
              onFileRemove={handleFileRemove}
            />
          </div>
        </div>
      </ScrollArea>

      {/* Kaydet butonu için sabit pozisyonlu container */}
      <div className="sticky bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-900 border-t mt-auto">
        <div className="flex justify-end max-w-full mx-auto">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700"
          >
            <span className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              {isSubmitting ? "Oluşturuluyor..." : "Şikayet Oluştur"}
            </span>
          </Button>
        </div>
      </div>
    </div>
  )
}
