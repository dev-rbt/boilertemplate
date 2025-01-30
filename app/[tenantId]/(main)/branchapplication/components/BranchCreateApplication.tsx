"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ApplicationTimelineCard } from "@/app/[tenantId]/(main)/branchapplication/components/branch-cards-detail/ApplicationTimelineCard"
import GoogleMapWrapper from "./GoogleMapWrapper"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { FileUploadCard } from "@/app/[tenantId]/(main)/branchcomplaint/components/branch-cards/BranchFileUploadCard"
import { ApplicationStatus } from "../branch-application-types"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { 
  CheckCircle2, 
  Save, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Briefcase, 
  Building2, 
  DollarSign, 
  Map, 
  Home, 
  FileText, 
  PlusCircle,
  AlertCircle 
} from 'lucide-react'
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useTabStore } from "@/stores/tab-store"
import { useBranchApplicationStore } from "@/stores/branch-application-store"
import { toast } from '@/components/ui/toast/use-toast'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function CreateApplication() {
  const router = useRouter()
  const [files, setFiles] = useState<File[]>([])
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { removeTab, setActiveTab } = useTabStore()
  const { addApplication, addActivity } = useBranchApplicationStore()

  const [newActivity, setNewActivity] = useState({
    type: "comment" as const,
    description: "",
  })

  const [applicationData, setApplicationData] = useState({
    // Kişisel Bilgiler
    applicantName: "",
    applicantPhone: "",
    applicantEmail: "",
    applicantAddress: "",
    
    // İş Tecrübesi
    businessExperience: "",
    currentOccupation: "",
    
    // Finansal Bilgiler
    investmentBudget: "",
    fundingSource: "",
    
    // Lokasyon Tercihi
    preferredCity: "",
    preferredDistrict: "",
    desiredLocation: "",
    propertyOwnership: "own", // own, rent, undefined
    coordinates: {
      lat: 41.0082, // İstanbul'un varsayılan koordinatları
      lng: 28.9784
    },
    
    // Restaurant Detayları
    expectedCapacity: "",
    preferredSize: "",
    
    // Başvuru Durumu
    status: "pending" as ApplicationStatus,
    
    // Ek Bilgiler
    additionalNotes: "",
    status: "pending",
    applicationDate: new Date().toISOString(),
    documents: [] as string[]
  })

  const handleFilesChange = (newFiles: File[]) => {
    setFiles(prevFiles => [...prevFiles, ...newFiles])
  }

  const handleFileRemove = (fileToRemove: string | File) => {
    if (typeof fileToRemove === 'string') {
      setFiles(prev => prev.filter(file => file.name !== fileToRemove))
    } else {
      setFiles(prev => prev.filter(file => file !== fileToRemove))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    try {
      if (!applicationData.applicantName || !applicationData.applicantPhone || !applicationData.applicantEmail) {
        throw new Error('Lütfen zorunlu alanları doldurunuz')
      }

      const imageUrls: string[] = []
      
      if (files.length > 0) {
        for (const file of files) {
          const formData = new FormData()
          formData.append('file', file)
          const uploadResponse = await fetch('/api/upload/image', {
            method: 'POST',
            body: formData
          })
          if (!uploadResponse.ok) throw new Error(`Dosya yükleme hatası: ${uploadResponse.statusText}`)
          const uploadResult = await uploadResponse.json()
          imageUrls.push(uploadResult.Result)
        }
      }

      const requestData = {
        application: {
          ...applicationData,
          documents: imageUrls
        }
      }

      // API call will be implemented here
      
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
              Franchise başvurunuz başarıyla alındı.
            </p>
          </div>
        ),
        className: "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800",
        duration: 5000,
      })

      const tabId = `Yeni Franchise Başvurusu`
      removeTab(tabId)
      setActiveTab('Bayi Başvuru Yönetimi')

    } catch (error) {
      console.error('Error submitting application:', error)
      const errorMessage = error instanceof Error ? error.message : 'Beklenmeyen bir hata oluştu'
      setError(errorMessage)
      toast({
        variant: "destructive",
        title: "Hata!",
        description: errorMessage,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLocationSelect = (lat: number, lng: number) => {
    setApplicationData(prev => ({
      ...prev,
      coordinates: { lat, lng }
    }));
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)]">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="form" className="w-full">
        <TabsList className="w-full justify-start border-b rounded-none px-4">
          <TabsTrigger value="form">Başvuru Formu</TabsTrigger>
          <TabsTrigger value="activities">Aktiviteler</TabsTrigger>
        </TabsList>
        
        <TabsContent value="form">
          <ScrollArea className="h-[calc(100vh-260px)] px-4 overflow-y-auto">
            <div className="space-y-6 pb-24">
              {/* Kişisel Bilgiler */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <Card className="overflow-hidden group hover:shadow-xl transition-all duration-300 p-8 bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/20 dark:to-gray-900/50 backdrop-blur-sm border-2 border-blue-100/50 dark:border-blue-900/20 shadow-lg shadow-blue-100/30 dark:shadow-blue-900/20 rounded-xl">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center shadow-inner transform group-hover:scale-110 transition-transform duration-300">
                      <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-900 dark:from-blue-400 dark:to-blue-200">
                        Kişisel Bilgiler
                      </h3>
                      <p className="text-sm text-blue-600/80 dark:text-blue-400/80">
                        İletişim ve kimlik bilgileriniz
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label>Ad Soyad*</Label>
                      <Input
                        value={applicationData.applicantName}
                        onChange={(e) => setApplicationData(prev => ({...prev, applicantName: e.target.value}))}
                        placeholder="Ad ve soyadınızı giriniz"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Telefon*</Label>
                        <Input
                          value={applicationData.applicantPhone}
                          onChange={(e) => setApplicationData(prev => ({...prev, applicantPhone: e.target.value}))}
                          placeholder="Telefon numaranızı giriniz"
                        />
                      </div>
                      <div>
                        <Label>E-posta*</Label>
                        <Input
                          value={applicationData.applicantEmail}
                          onChange={(e) => setApplicationData(prev => ({...prev, applicantEmail: e.target.value}))}
                          placeholder="E-posta adresinizi giriniz"
                          type="email"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Adres</Label>
                      <Textarea
                        value={applicationData.applicantAddress}
                        onChange={(e) => setApplicationData(prev => ({...prev, applicantAddress: e.target.value}))}
                        placeholder="Adresinizi giriniz"
                      />
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* İş Tecrübesi */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <Card className="overflow-hidden group hover:shadow-xl transition-all duration-300 p-8 bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-900/20 dark:to-gray-900/50 backdrop-blur-sm border-2 border-emerald-100/50 dark:border-emerald-900/20 shadow-lg shadow-emerald-100/30 dark:shadow-emerald-900/20 rounded-xl">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center shadow-inner transform group-hover:scale-110 transition-transform duration-300">
                      <Briefcase className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-emerald-900 dark:from-emerald-400 dark:to-emerald-200">
                        İş Tecrübesi
                      </h3>
                      <p className="text-sm text-emerald-600/80 dark:text-emerald-400/80">
                        Mesleki deneyim ve geçmiş
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label>Mevcut Meslek</Label>
                      <Input
                        value={applicationData.currentOccupation}
                        onChange={(e) => setApplicationData(prev => ({...prev, currentOccupation: e.target.value}))}
                        placeholder="Mevcut mesleğinizi giriniz"
                      />
                    </div>
                    <div>
                      <Label>İş Tecrübesi</Label>
                      <Textarea
                        value={applicationData.businessExperience}
                        onChange={(e) => setApplicationData(prev => ({...prev, businessExperience: e.target.value}))}
                        placeholder="İş tecrübenizi detaylı bir şekilde açıklayınız"
                      />
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* Finansal Bilgiler */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <Card className="overflow-hidden group hover:shadow-xl transition-all duration-300 p-8 bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/20 dark:to-gray-900/50 backdrop-blur-sm border-2 border-purple-100/50 dark:border-purple-900/20 shadow-lg shadow-purple-100/30 dark:shadow-purple-900/20 rounded-xl">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center shadow-inner transform group-hover:scale-110 transition-transform duration-300">
                      <DollarSign className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-purple-900 dark:from-purple-400 dark:to-purple-200">
                        Finansal Bilgiler
                      </h3>
                      <p className="text-sm text-purple-600/80 dark:text-purple-400/80">
                        Yatırım ve finansman detayları
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label>Yatırım Bütçesi</Label>
                      <Input
                        value={applicationData.investmentBudget}
                        onChange={(e) => setApplicationData(prev => ({...prev, investmentBudget: e.target.value}))}
                        placeholder="Planlanan yatırım bütçesini giriniz"
                      />
                    </div>
                    <div>
                      <Label>Finansman Kaynağı</Label>
                      <Select
                        value={applicationData.fundingSource}
                        onValueChange={(value) => setApplicationData(prev => ({...prev, fundingSource: value}))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Finansman kaynağını seçiniz" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="own">Öz Kaynak</SelectItem>
                          <SelectItem value="bank">Banka Kredisi</SelectItem>
                          <SelectItem value="mixed">Karma</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* Lokasyon Bilgileri */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
              >
                <Card className="overflow-hidden group hover:shadow-xl transition-all duration-300 p-8 bg-gradient-to-br from-amber-50 to-white dark:from-amber-900/20 dark:to-gray-900/50 backdrop-blur-sm border-2 border-amber-100/50 dark:border-amber-900/20 shadow-lg shadow-amber-100/30 dark:shadow-amber-900/20 rounded-xl">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center shadow-inner transform group-hover:scale-110 transition-transform duration-300">
                      <MapPin className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-amber-900 dark:from-amber-400 dark:to-amber-200">
                        Lokasyon Bilgileri
                      </h3>
                      <p className="text-sm text-amber-600/80 dark:text-amber-400/80">
                        Tercih edilen konum detayları
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Şehir</Label>
                        <Input
                          placeholder="Şehir giriniz"
                          value={applicationData.preferredCity}
                          onChange={(e) => setApplicationData({ ...applicationData, preferredCity: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>İlçe</Label>
                        <Input
                          placeholder="İlçe giriniz"
                          value={applicationData.preferredDistrict}
                          onChange={(e) => setApplicationData({ ...applicationData, preferredDistrict: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Adres</Label>
                      <Textarea
                        placeholder="Detaylı adres bilgisi giriniz"
                        value={applicationData.desiredLocation}
                        onChange={(e) => setApplicationData({ ...applicationData, desiredLocation: e.target.value })}
                        className="min-h-[100px]"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Koordinatlar</Label>
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          placeholder="Enlem"
                          value={applicationData.coordinates.lat}
                          readOnly
                        />
                        <Input
                          placeholder="Boylam"
                          value={applicationData.coordinates.lng}
                          readOnly
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Harita</Label>
                      <GoogleMapWrapper
                        center={applicationData.coordinates}
                        onLocationSelect={handleLocationSelect}
                        address={applicationData.desiredLocation}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Mülkiyet Durumu</Label>
                      <Select
                        value={applicationData.propertyOwnership}
                        onValueChange={(value) => setApplicationData({ ...applicationData, propertyOwnership: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Mülkiyet durumu seçiniz" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="own">Mülk</SelectItem>
                          <SelectItem value="rent">Kiralık</SelectItem>
                          <SelectItem value="undefined">Belirtilmemiş</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* Restaurant Detayları */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.5 }}
              >
                <Card className="overflow-hidden group hover:shadow-xl transition-all duration-300 p-8 bg-gradient-to-br from-rose-50 to-white dark:from-rose-900/20 dark:to-gray-900/50 backdrop-blur-sm border-2 border-rose-100/50 dark:border-rose-900/20 shadow-lg shadow-rose-100/30 dark:shadow-rose-900/20 rounded-xl">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center shadow-inner transform group-hover:scale-110 transition-transform duration-300">
                      <Building2 className="h-6 w-6 text-rose-600 dark:text-rose-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-rose-600 to-rose-900 dark:from-rose-400 dark:to-rose-200">
                        Restaurant Detayları
                      </h3>
                      <p className="text-sm text-rose-600/80 dark:text-rose-400/80">
                        Kapasite ve alan bilgileri
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Beklenen Kapasite (Kişi)</Label>
                        <Input
                          type="number"
                          value={applicationData.expectedCapacity}
                          onChange={(e) => setApplicationData(prev => ({...prev, expectedCapacity: e.target.value}))}
                          placeholder="Beklenen müşteri kapasitesi"
                        />
                      </div>
                      <div>
                        <Label>Tercih Edilen Alan (m²)</Label>
                        <Input
                          type="number"
                          value={applicationData.preferredSize}
                          onChange={(e) => setApplicationData(prev => ({...prev, preferredSize: e.target.value}))}
                          placeholder="Tercih edilen alan büyüklüğü"
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* Ek Bilgiler */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.6 }}
              >
                <Card className="overflow-hidden group hover:shadow-xl transition-all duration-300 p-8 bg-gradient-to-br from-teal-50 to-white dark:from-teal-900/20 dark:to-gray-900/50 backdrop-blur-sm border-2 border-teal-100/50 dark:border-teal-900/20 shadow-lg shadow-teal-100/30 dark:shadow-teal-900/20 rounded-xl">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center shadow-inner transform group-hover:scale-110 transition-transform duration-300">
                      <FileText className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-teal-900 dark:from-teal-400 dark:to-teal-200">
                        Ek Bilgiler
                      </h3>
                      <p className="text-sm text-teal-600/80 dark:text-teal-400/80">
                        İlave notlar ve açıklamalar
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label>Notlar</Label>
                      <Textarea
                        value={applicationData.additionalNotes}
                        onChange={(e) => setApplicationData(prev => ({...prev, additionalNotes: e.target.value}))}
                        placeholder="Eklemek istediğiniz diğer bilgileri giriniz"
                      />
                    </div>
                  </div>
                </Card>
              </motion.div>

              <FileUploadCard
                files={files}
                onFilesChange={handleFilesChange}
                onFileRemove={handleFileRemove}
              />
              
              <Card className="p-6 mb-4">
                <h3 className="text-lg font-semibold mb-4">Yeni Aktivite Ekle</h3>
                <div className="space-y-4">
                  <div>
                    <Label>Aktivite Tipi</Label>
                    <Select
                      value={newActivity.type}
                      onValueChange={(value: "comment" | "meeting" | "file_upload" | "other") => 
                        setNewActivity(prev => ({...prev, type: value}))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="comment">Yorum</SelectItem>
                        <SelectItem value="meeting">Toplantı</SelectItem>
                        <SelectItem value="file_upload">Dosya</SelectItem>
                        <SelectItem value="other">Diğer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Açıklama</Label>
                    <Textarea
                      value={newActivity.description}
                      onChange={(e) => setNewActivity(prev => ({...prev, description: e.target.value}))}
                      placeholder="Aktivite açıklaması..."
                    />
                  </div>
                  <Button
                    onClick={() => {
                      if (!newActivity.description) return
                      
                      addActivity(1, {
                        type: newActivity.type,
                        description: newActivity.description,
                        createdBy: 1, // Bu değer dinamik olmalı
                        createdByName: "Test User", // Bu değer dinamik olmalı
                        createdAt: new Date().toISOString(),
                        applicationId: 1 // Bu değer dinamik olmalı
                      })
                      
                      setNewActivity({
                        type: "comment",
                        description: ""
                      })
                    }}
                  >
                    Aktivite Ekle
                  </Button>
                </div>
              </Card>
            </div>
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="activities" className="px-4 mt-4">
          <div className="space-y-4">
            <Card className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Yeni Aktivite Ekle</h3>
              </div>
              <div className="space-y-4">
                <Select
                  value={newActivity.type}
                  onValueChange={(value: "comment" | "meeting" | "file_upload" | "other") => 
                    setNewActivity(prev => ({...prev, type: value}))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Aktivite tipi seçiniz" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="comment">Yorum</SelectItem>
                    <SelectItem value="meeting">Toplantı</SelectItem>
                    <SelectItem value="file_upload">Dosya</SelectItem>
                    <SelectItem value="other">Diğer</SelectItem>
                  </SelectContent>
                </Select>
                <Textarea
                  value={newActivity.description}
                  onChange={(e) => setNewActivity(prev => ({...prev, description: e.target.value}))}
                  placeholder="Aktivite açıklaması..."
                />
                <Button
                  onClick={() => {
                    if (!newActivity.description) return
                    addActivity(1, {
                      type: newActivity.type,
                      description: newActivity.description,
                      createdBy: 1,
                      createdByName: "Test User",
                      createdAt: new Date().toISOString(),
                      applicationId: 1
                    })
                    setNewActivity({
                      type: "comment",
                      description: ""
                    })
                  }}
                >
                  Aktivite Ekle
                </Button>
              </div>
            </Card>
            <ApplicationTimelineCard activities={useBranchApplicationStore(state => state.activities[1] || [])} />
          </div>
        </TabsContent>
      </Tabs>

      <div className="sticky bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-900 border-t mt-auto">
        <div className="flex justify-end max-w-full mx-auto">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700"
          >
            <span className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              {isSubmitting ? "Gönderiliyor..." : "Başvuruyu Gönder"}
            </span>
          </Button>
        </div>
      </div>
    </div>
  )
}
