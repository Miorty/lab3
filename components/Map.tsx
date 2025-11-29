import React from 'react';
import MapView, { Circle, Marker as MapMarker, Region } from 'react-native-maps';
import { MapProps, Marker } from '../types';

export const Map: React.FC<MapProps> = ({
  markers,
  onMapLongPress,
  onMarkerPress,
  userLocation,
}) => {
  const initialRegion: Region = {
    latitude: 58.010455,
    longitude: 56.229443,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  const handleMapLongPress = (event: any) => {
    const { coordinate } = event.nativeEvent;
    onMapLongPress(coordinate.latitude, coordinate.longitude);
  };

  const handleMarkerPress = (marker: Marker) => {
    onMarkerPress(marker);
  };

  return (
    <MapView
      style={{ flex: 1 }}
      initialRegion={initialRegion}
      onLongPress={handleMapLongPress}
      showsUserLocation={true}
      showsMyLocationButton={true}
    >
      {/* Отображаем текущее местоположение пользователя */}
      {userLocation && (
        <Circle
          center={{
            latitude: userLocation.coords.latitude,
            longitude: userLocation.coords.longitude,
          }}
          radius={50}
          strokeColor="rgba(0, 122, 255, 0.5)"
          fillColor="rgba(0, 122, 255, 0.2)"
        />
      )}

      {markers.map((marker) => (
        <MapMarker
          key={marker.id}
          coordinate={{
            latitude: marker.latitude,
            longitude: marker.longitude,
          }}
          title={marker.title}
          description={marker.description}
          onPress={() => handleMarkerPress(marker)}
        />
      ))}
    </MapView>
  );
};