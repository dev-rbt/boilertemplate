'use client'

import { Card } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"

interface DemographicData {
  population: number
  education: {
    primary: number
    secondary: number
    university: number
  }
  averageIncome: number
  ageDistribution: {
    under18: number
    between18and30: number
    between30and50: number
    above50: number
  }
}

interface DemographicCardProps {
  location: {
    lat: number
    lng: number
  }
  address: string
}

export default function DemographicCard({ location, address }: DemographicCardProps) {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<DemographicData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDemographicData = async () => {
      setLoading(true)
      setError(null)
      
      try {
        // Burada gerçek API çağrısı yapılacak
        // Şimdilik mock data kullanıyoruz
        const mockData: DemographicData = {
          population: 25000,
          education: {
            primary: 30,
            secondary: 40,
            university: 30
          },
          averageIncome: 8500,
          ageDistribution: {
            under18: 20,
            between18and30: 30,
            between30and50: 35,
            above50: 15
          }
        }
        
        // API çağrısı simülasyonu için timeout
        await new Promise(resolve => setTimeout(resolve, 1000))
        setData(mockData)
      } catch (err) {
        setError("Demografik veriler yüklenirken bir hata oluştu")
        console.error("Error fetching demographic data:", err)
      } finally {
        setLoading(false)
      }
    }

    if (location.lat && location.lng) {
      fetchDemographicData()
    }
  }, [location])

  if (loading) {
    return (
      <Card className="p-4">
        <div className="flex items-center justify-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Demografik veriler yükleniyor...</span>
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="p-4 text-red-500">
        {error}
      </Card>
    )
  }

  if (!data) {
    return null
  }

  return (
    <Card className="p-4 space-y-4">
      <h3 className="font-semibold text-lg">Bölge Demografik Bilgileri</h3>
      <p className="text-sm text-muted-foreground">{address}</p>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="font-medium">Nüfus</h4>
          <p className="text-2xl font-semibold">{data.population.toLocaleString()}</p>
        </div>
        
        <div>
          <h4 className="font-medium">Ortalama Gelir</h4>
          <p className="text-2xl font-semibold">{data.averageIncome.toLocaleString()} ₺</p>
        </div>
      </div>

      <div>
        <h4 className="font-medium mb-2">Eğitim Durumu</h4>
        <div className="flex h-4 rounded-full overflow-hidden bg-gray-200">
          <div 
            style={{ width: `${data.education.primary}%` }}
            className="bg-blue-500"
            title="İlköğretim"
          />
          <div 
            style={{ width: `${data.education.secondary}%` }}
            className="bg-blue-600"
            title="Lise"
          />
          <div 
            style={{ width: `${data.education.university}%` }}
            className="bg-blue-700"
            title="Üniversite"
          />
        </div>
        <div className="flex justify-between text-sm mt-1">
          <span>İlköğretim: %{data.education.primary}</span>
          <span>Lise: %{data.education.secondary}</span>
          <span>Üniversite: %{data.education.university}</span>
        </div>
      </div>

      <div>
        <h4 className="font-medium mb-2">Yaş Dağılımı</h4>
        <div className="flex h-4 rounded-full overflow-hidden bg-gray-200">
          <div 
            style={{ width: `${data.ageDistribution.under18}%` }}
            className="bg-green-500"
            title="18 Yaş Altı"
          />
          <div 
            style={{ width: `${data.ageDistribution.between18and30}%` }}
            className="bg-green-600"
            title="18-30 Yaş"
          />
          <div 
            style={{ width: `${data.ageDistribution.between30and50}%` }}
            className="bg-green-700"
            title="30-50 Yaş"
          />
          <div 
            style={{ width: `${data.ageDistribution.above50}%` }}
            className="bg-green-800"
            title="50 Yaş Üstü"
          />
        </div>
        <div className="grid grid-cols-4 text-sm mt-1">
          <span>{"<"}18: %{data.ageDistribution.under18}</span>
          <span>18-30: %{data.ageDistribution.between18and30}</span>
          <span>30-50: %{data.ageDistribution.between30and50}</span>
          <span>{">"}50: %{data.ageDistribution.above50}</span>
        </div>
      </div>
    </Card>
  )
}
