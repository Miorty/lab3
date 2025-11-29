import * as Location from 'expo-location';
export interface Marker {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  description: string;
  createdAt: Date;
  images?: MarkerImage[];
}

export interface MarkerImage {
  id: string;
  markerId: string;
  uri: string;
  createdAt: Date;
}

export interface MarkerWithImagesDB {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  description: string;
  createdAt: string;
  imageId: string;
  imageMarkerId: string;
  imageUri: string;
  imageCreatedAt: string;
}

export interface DatabaseContextType {
  markers: Marker[];
  addMarker: (marker: Omit<Marker, 'id'>) => Promise<string>;
  updateMarker: (marker: Marker) => Promise<void>;
  deleteMarker: (markerId: string) => Promise<void>;
  addImageToMarker: (image: Omit<MarkerImage, 'id'>) => Promise<void>;
  deleteImage: (imageId: string) => Promise<void>;
  isLoading: boolean;
}

export interface MapProps {
  markers: Marker[];
  onMapLongPress: (latitude: number, longitude: number) => void;
  onMarkerPress: (marker: Marker) => void;
  userLocation?: Location.LocationObject | null;
}

// export interface LocationConfig {
//   accuracy: Location.LocationAccuracy;
//   timeInterval: number; // Интервал обновления в мс
//   distanceInterval: number; // Минимальное расстояние для обновления
// }

// export interface LocationState {
//   location: Location.LocationObject | null;
//   errorMsg: string | null;
// }