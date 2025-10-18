import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Map } from '../components/Map';
import { Marker } from '../types';

export default function MapScreen() {
  const [markers, setMarkers] = useState<Marker[]>([]);
  const router = useRouter();
// latitude - широта
  const handleMapLongPress = (latitude: number, longitude: number) => {
    const newMarker: Marker = {
      id: Date.now().toString(),
      latitude,
      longitude,
      title: `Маркер ${markers.length + 1}`,
      createdAt: new Date(),
    };

    setMarkers((prev) => [...prev, newMarker]); 
  };

  const handleMarkerPress = (marker: Marker) => { // Переход на экран деталей маркера, просто жмак на маркер
    router.push(`/marker/${marker.id}`);
  };

  return (
    <View style={styles.container}>
      <Map
        markers={markers}
        onMapLongPress={handleMapLongPress}
        onMarkerPress={handleMarkerPress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});