import * as Location from 'expo-location';

// Разрешить (granted)/запретить (denied) ?
export const requestLocationPermissions = async (): Promise<boolean> => {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === 'granted';
};

// Обновление местоположения
export const startLocationUpdates = async (
  onLocation: (location: Location.LocationObject) => void
): Promise<Location.LocationSubscription> => {
  return await Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.Balanced,
      //timeInterval: 5000, // каждые 5с
      distanceInterval: 5,
    },
    onLocation
  );
};

export const calculateDistance = (
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number => {
  const R = 6371000; 
  const dLat = (lat2 - lat1) * Math.PI / 180; // разницу координат переводим в радианы
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};