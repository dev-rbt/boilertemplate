'use client'

import { Card } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { Loader2, Store, MapPin, Clock, Users, Star, Phone, Globe, Navigation } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import Link from "next/link"

// Yeme-içme mekanı türleri
const FOOD_PLACE_TYPES = [
  'restaurant',
  'cafe',
  'bar',
  'bakery',
  'meal_takeaway',
  'meal_delivery'
];

interface Place {
  placeId: string
  name: string
  type: string
  vicinity: string
  rating?: number
  userRatingsTotal?: number
  openNow?: boolean
  priceLevel?: number
  phoneNumber?: string
  website?: string
  photos?: google.maps.places.PlacePhoto[]
  reviews?: google.maps.places.PlaceReview[]
  openingHours?: string[]
  distance?: number
  location?: google.maps.LatLng
}

interface PlaceDetails extends Place {
  url?: string
}

interface NearbyPlacesCardProps {
  location: {
    lat: number
    lng: number
  }
}

export default function NearbyPlacesCard({ location }: NearbyPlacesCardProps) {
  const [loading, setLoading] = useState(false)
  const [places, setPlaces] = useState<Place[]>([])
  const [error, setError] = useState<string | null>(null)
  const [selectedPlace, setSelectedPlace] = useState<PlaceDetails | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  const getPlaceDetails = async (placeId: string): Promise<PlaceDetails | null> => {
    if (!window.google) return null

    const service = new google.maps.places.PlacesService(
      new google.maps.Map(document.createElement('div'))
    )

    return new Promise((resolve, reject) => {
      service.getDetails(
        {
          placeId,
          fields: [
            'name',
            'vicinity',
            'rating',
            'user_ratings_total',
            'opening_hours',
            'types',
            'price_level',
            'formatted_phone_number',
            'website',
            'photos',
            'reviews',
            'url'
          ]
        },
        (result, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && result) {
            const details: PlaceDetails = {
              placeId,
              name: result.name || '',
              type: result.types?.find(t => FOOD_PLACE_TYPES.includes(t)) || 'restaurant',
              vicinity: result.vicinity || '',
              rating: result.rating,
              userRatingsTotal: result.user_ratings_total,
              openNow: result.opening_hours?.isOpen(),
              priceLevel: result.price_level,
              phoneNumber: result.formatted_phone_number,
              website: result.website,
              photos: result.photos,
              reviews: result.reviews,
              openingHours: result.opening_hours?.weekday_text,
              url: result.url
            }
            resolve(details)
          } else {
            reject(status)
          }
        }
      )
    })
  }

  const calculateDistance = (placeLocation: google.maps.LatLng) => {
    try {
      if (!window.google?.maps?.geometry?.spherical) {
        console.warn('Google Maps Geometry kütüphanesi yüklenemedi');
        return undefined;
      }

      const origin = new google.maps.LatLng(location.lat, location.lng);
      return google.maps.geometry.spherical.computeDistanceBetween(origin, placeLocation);
    } catch (error) {
      console.error('Mesafe hesaplanırken hata oluştu:', error);
      return undefined;
    }
  }

  useEffect(() => {
    const fetchNearbyPlaces = async () => {
      if (!window.google) return
      
      setLoading(true)
      setError(null)

      try {
        const service = new google.maps.places.PlacesService(
          new google.maps.Map(document.createElement('div'))
        )

        const searchPromise = (request: google.maps.places.PlaceSearchRequest) => {
          return new Promise<google.maps.places.PlaceResult[]>((resolve, reject) => {
            service.nearbySearch(request, (results, status) => {
              if (status === google.maps.places.PlacesServiceStatus.OK && results) {
                resolve(results)
              } else {
                reject(status)
              }
            })
          })
        }

        // Tüm yeme-içme mekanı türleri için arama yap
        const allResults = await Promise.all(
          FOOD_PLACE_TYPES.map(type =>
            searchPromise({
              location: new google.maps.LatLng(location.lat, location.lng),
              radius: 1000, // 1km yarıçap
              type: type as google.maps.places.PlaceType
            }).catch(() => []) // Hata durumunda boş array dön
          )
        )

        // Sonuçları düzleştir ve tekrar edenleri kaldır
        const uniqueResults = Array.from(new Set(
          allResults.flat().map(place => place.place_id)
        )).map(placeId =>
          allResults.flat().find(place => place.place_id === placeId)
        ).filter(Boolean)

        // Her yer için detaylı bilgi al
        const detailedPlaces = await Promise.all(
          uniqueResults.slice(0, 15).map(async place => {
            try {
              if (!place?.geometry?.location) {
                console.warn('Mekan konumu bulunamadı:', place);
                return null;
              }

              const placeLocation = place.geometry.location;
              const distance = calculateDistance(placeLocation);
              
              const details = await getPlaceDetails(place.place_id!)
              return details ? {
                ...details,
                distance,
                location: placeLocation
              } : null;
            } catch (error) {
              console.error('Error fetching place details:', error)
              return null
            }
          })
        )

        // Mesafeye göre sırala (mesafesi olmayanlar sona gelsin)
        const sortedPlaces = detailedPlaces
          .filter(Boolean)
          .sort((a, b) => {
            if (a!.distance === undefined) return 1;
            if (b!.distance === undefined) return -1;
            return a!.distance - b!.distance;
          }) as Place[];

        setPlaces(sortedPlaces)
      } catch (err) {
        setError("Yakındaki mekanlar yüklenirken bir hata oluştu")
        console.error("Error fetching nearby places:", err)
      } finally {
        setLoading(false)
      }
    }

    if (location.lat && location.lng) {
      fetchNearbyPlaces()
    }
  }, [location])

  const handlePlaceClick = async (place: Place) => {
    try {
      const details = await getPlaceDetails(place.placeId)
      if (details) {
        setSelectedPlace(details)
        setShowDetails(true)
      }
    } catch (error) {
      console.error('Error fetching place details:', error)
    }
  }

  const formatDistance = (meters?: number) => {
    if (meters === undefined) return '';
    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    }
    return `${(meters / 1000).toFixed(1)} km`;
  }

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      restaurant: 'Restoran',
      cafe: 'Kafe',
      bar: 'Bar',
      bakery: 'Fırın/Pastane',
      meal_takeaway: 'Paket Servis',
      meal_delivery: 'Eve Teslimat'
    }
    return labels[type] || 'Restoran'
  }

  const getPriceLevel = (level?: number) => {
    if (level === undefined) return null
    return '₺'.repeat(level + 1)
  }

  if (loading) {
    return (
      <Card className="p-4">
        <div className="flex items-center justify-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Yakındaki mekanlar yükleniyor...</span>
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

  if (!places.length) {
    return (
      <Card className="p-4 text-center text-muted-foreground">
        Bu bölgede yeme-içme mekanı bulunamadı
      </Card>
    )
  }

  return (
    <>
      <Card className="p-4">
        <h3 className="font-semibold text-lg mb-4">Yakındaki Yeme-İçme Mekanları</h3>
        
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-4">
            {places.map((place, index) => (
              <div
                key={index}
                className="border rounded-lg p-3 space-y-2 hover:bg-accent cursor-pointer transition-colors"
                onClick={() => handlePlaceClick(place)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{place.name}</h4>
                      {place.priceLevel !== undefined && (
                        <span className="text-sm text-muted-foreground">
                          {getPriceLevel(place.priceLevel)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <p className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {place.vicinity}
                      </p>
                      {place.distance !== undefined && (
                        <span className="flex items-center gap-1">
                          <Navigation className="h-3 w-3" />
                          {formatDistance(place.distance)}
                        </span>
                      )}
                    </div>
                  </div>
                  {place.openNow !== undefined && (
                    <Badge variant={place.openNow ? "success" : "secondary"}>
                      {place.openNow ? "Açık" : "Kapalı"}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <Badge variant="outline">
                    {getTypeLabel(place.type)}
                  </Badge>
                  
                  {place.rating && (
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      {place.rating.toFixed(1)}
                      {place.userRatingsTotal && (
                        <span className="text-muted-foreground">
                          ({place.userRatingsTotal})
                        </span>
                      )}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </Card>

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl">
          {selectedPlace && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span>{selectedPlace.name}</span>
                  {selectedPlace.priceLevel !== undefined && (
                    <span className="text-muted-foreground">
                      {getPriceLevel(selectedPlace.priceLevel)}
                    </span>
                  )}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                {/* Fotoğraflar */}
                {selectedPlace.photos && selectedPlace.photos.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {selectedPlace.photos.slice(0, 5).map((photo, index) => (
                      <img
                        key={index}
                        src={photo.getUrl()}
                        alt={`${selectedPlace.name} - ${index + 1}`}
                        className="h-32 w-auto rounded-md object-cover"
                      />
                    ))}
                  </div>
                )}

                {/* İletişim Bilgileri */}
                <div className="space-y-2">
                  <p className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {selectedPlace.vicinity}
                  </p>
                  
                  {selectedPlace.phoneNumber && (
                    <p className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <a href={`tel:${selectedPlace.phoneNumber}`} className="text-primary hover:underline">
                        {selectedPlace.phoneNumber}
                      </a>
                    </p>
                  )}

                  {selectedPlace.website && (
                    <p className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      <a href={selectedPlace.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        Website
                      </a>
                    </p>
                  )}
                </div>

                {/* Çalışma Saatleri */}
                {selectedPlace.openingHours && (
                  <div className="space-y-1">
                    <h4 className="font-medium">Çalışma Saatleri</h4>
                    <div className="text-sm space-y-1">
                      {selectedPlace.openingHours.map((hours, index) => (
                        <p key={index} className="text-muted-foreground">{hours}</p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Değerlendirmeler */}
                {selectedPlace.reviews && selectedPlace.reviews.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Son Değerlendirmeler</h4>
                    <div className="space-y-3">
                      {selectedPlace.reviews.slice(0, 3).map((review, index) => (
                        <div key={index} className="space-y-1">
                          <div className="flex items-center gap-2">
                            <img
                              src={review.profile_photo_url}
                              alt={review.author_name}
                              className="h-6 w-6 rounded-full"
                            />
                            <span className="font-medium">{review.author_name}</span>
                            <div className="flex items-center">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              <span className="ml-1 text-sm">{review.rating}</span>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">{review.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Aksiyon Butonları */}
                <div className="flex justify-end gap-2 pt-4">
                  {selectedPlace.url && (
                    <Button asChild>
                      <a href={selectedPlace.url} target="_blank" rel="noopener noreferrer">
                        <Navigation className="mr-2 h-4 w-4" />
                        Google Maps'te Aç
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
