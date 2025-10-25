import { useEffect, useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import type { Place } from '../types';
import PlaceForm from './PlaceForm';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const libraries: ('places')[] = ['places'];

interface MapViewProps {
  places: Place[];
  onAddPlace: (place: Omit<Place, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdatePlace: (id: string, place: Partial<Place>) => void;
  onDeletePlace: (id: string) => void;
}

export default function MapView({ places, onAddPlace, onUpdatePlace, onDeletePlace }: MapViewProps) {
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [clickedPosition, setClickedPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [center, setCenter] = useState({ lat: 25.0330, lng: 121.5654 }); // Taipei default
  const [map, setMap] = useState<google.maps.Map | null>(null);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCenter({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          console.log('Geolocation permission denied');
        }
      );
    }
  }, []);

  const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setClickedPosition({ lat, lng });
      setShowForm(true);
      setSelectedPlace(null);
    }
  }, []);

  const handleMarkerClick = (place: Place) => {
    setSelectedPlace(place);
    setShowForm(true);
    setClickedPosition(null);
  };

  const handleFormSubmit = (data: Omit<Place, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (selectedPlace) {
      onUpdatePlace(selectedPlace.id, data);
    } else {
      onAddPlace(data);
    }
    setShowForm(false);
    setSelectedPlace(null);
    setClickedPosition(null);
  };

  const handleDelete = () => {
    if (selectedPlace) {
      onDeletePlace(selectedPlace.id);
      setSelectedPlace(null);
    }
  };

  if (!isLoaded) {
    return <div className="w-full h-full flex items-center justify-center">載入地圖中...</div>;
  }

  return (
    <>
      <div className="relative w-full h-full">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          zoom={12}
          center={center}
          onClick={handleMapClick}
          onLoad={(map) => setMap(map)}
        >
          {places.map((place) => (
            <Marker
              key={place.id}
              position={{ lat: place.lat, lng: place.lng }}
              onClick={() => handleMarkerClick(place)}
            />
          ))}
        </GoogleMap>
      </div>

      {(showForm || selectedPlace) && (
        <PlaceForm
          place={selectedPlace || undefined}
          initialPosition={clickedPosition}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false);
            setSelectedPlace(null);
            setClickedPosition(null);
          }}
          onDelete={selectedPlace ? handleDelete : undefined}
        />
      )}
    </>
  );
}
