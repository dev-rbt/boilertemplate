import { useLoadScript, GoogleMap, MarkerF } from '@react-google-maps/api';
import { useState, useCallback, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import DemographicCard from './DemographicCard';
import NearbyPlacesCard from './NearbyPlacesCard';

const libraries: ("places" | "geometry")[] = ["places", "geometry"];

interface GoogleMapWrapperProps {
  center: {
    lat: number;
    lng: number;
  };
  onLocationSelect: (lat: number, lng: number) => void;
  address?: string;
}

export default function GoogleMapWrapper({ center, onLocationSelect, address }: GoogleMapWrapperProps) {
  const [marker, setMarker] = useState(center);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [searchAddress, setSearchAddress] = useState(address || "");
  const [formattedAddress, setFormattedAddress] = useState("");
  
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries
  });

  useEffect(() => {
    if (isLoaded) {
      setMapLoaded(true);
    }
  }, [isLoaded]);

  useEffect(() => {
    if (address && address !== searchAddress) {
      setSearchAddress(address);
      geocodeAddress(address);
    }
  }, [address]);

  const geocodeAddress = async (address: string) => {
    if (!isLoaded) return;

    const geocoder = new google.maps.Geocoder();
    try {
      const result = await geocoder.geocode({ address });
      if (result.results[0]) {
        const { lat, lng } = result.results[0].geometry.location;
        const newLocation = { lat: lat(), lng: lng() };
        setMarker(newLocation);
        setFormattedAddress(result.results[0].formatted_address);
        onLocationSelect(newLocation.lat, newLocation.lng);
      }
    } catch (error) {
      console.error("Geocoding error:", error);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchAddress) {
      await geocodeAddress(searchAddress);
    }
  };

  const onClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      const newLocation = { lat, lng };
      setMarker(newLocation);
      onLocationSelect(lat, lng);

      // Reverse geocoding to get address
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ location: newLocation }, (results, status) => {
        if (status === "OK" && results?.[0]) {
          setSearchAddress(results[0].formatted_address);
          setFormattedAddress(results[0].formatted_address);
        }
      });
    }
  }, [onLocationSelect]);

  if (!isLoaded || !mapLoaded) {
    return <Card className="h-[400px] flex items-center justify-center">Harita yükleniyor...</Card>;
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          type="text"
          placeholder="Adres ara..."
          value={searchAddress}
          onChange={(e) => setSearchAddress(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" variant="outline">
          <Search className="h-4 w-4" />
        </Button>
      </form>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Sol Kolon - Harita */}
        <div>
          <div className="h-[600px] w-full">
            <GoogleMap
              zoom={13}
              center={marker}
              mapContainerStyle={{ width: '100%', height: '100%' }}
              mapContainerClassName="rounded-md"
              onClick={onClick}
              options={{
                zoomControl: true,
                streetViewControl: false,
                mapTypeControl: false,
                fullscreenControl: false
              }}
            >
              <MarkerF position={marker} />
            </GoogleMap>
          </div>
        </div>

        {/* Sağ Kolon - Demografik Veriler ve Yakındaki Yerler */}
        <div className="space-y-4">
          <DemographicCard 
            location={marker}
            address={formattedAddress}
          />

          <NearbyPlacesCard 
            location={marker}
          />
        </div>
      </div>
    </div>
  );
}
