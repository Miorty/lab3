import React from 'react';
import MapView, { Marker as MapMarker, Region } from 'react-native-maps';
import { Marker } from '../types';

interface MapProps { //MapProps - определяет что компонент принимает
  markers: Marker[];
  onMapLongPress: (latitude: number, longitude: number) => void;
  onMarkerPress: (marker: Marker) => void;
}

export const Map: React.FC<MapProps> = ({
  markers,
  onMapLongPress,
  onMarkerPress,
}) => {
  const initialRegion: Region = {
    latitude: 58.010455,
    longitude: 56.229443,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  const handleMapLongPress = (event: any) => {
    const { coordinate } = event.nativeEvent;
    onMapLongPress(coordinate.latitude, coordinate.longitude); //Вызывает колбэк из пропсов передавая координаты
  };

  const handleMarkerPress = (marker: Marker) => {
    onMarkerPress(marker);
  };

  return (
    <MapView
      style={{ flex: 1 }}
      initialRegion={initialRegion}
      onLongPress={handleMapLongPress}
    >
      {markers.map((marker) => (
        <MapMarker
          key={marker.id}
          coordinate={{
            latitude: marker.latitude,
            longitude: marker.longitude,
          }}
          title={marker.title}
          onPress={() => handleMarkerPress(marker)}
        />
      ))}
    </MapView>
  );
};
