import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Map } from '../components/Map';
import { MarkerList } from '../components/MarkerList';
import { Marker } from '../types';

// Массив для маркеров
let savedMarkers: Marker[] = [];

export default function MapScreen() {
  const router = useRouter();
  const [markers, setMarkers] = useState<Marker[]>(savedMarkers);

  const handleMapLongPress = (latitude: number, longitude: number) => {
    const newMarker: Marker = {
      id: Date.now().toString(), // uuid&
      latitude, // широта
      longitude,
      title: `Маркер ${savedMarkers.length + 1}`,
      description: 'Новый маркер',
      createdAt: new Date(),
      images: [],
    };

    const updatedMarkers = [...markers, newMarker];
    setMarkers(updatedMarkers);
    savedMarkers = updatedMarkers;
    
    // Alert.alert(
    //   'Маркер добавлен',
    //   'Хотите перейти к редактированию маркера?',
    //   [
    //     { text: 'Позже', style: 'cancel' },
    //     { text: 'Перейти', onPress: () => handleMarkerPress(newMarker) }
    //   ]
    // );
  };

  //Переход на инф о маркере
  const handleMarkerPress = (marker: Marker) => {
    router.push(`/marker/${marker.id}`);
  };

  const handleDeleteMarker = (markerId: string) => {
    const updatedMarkers = markers.filter(marker => marker.id !== markerId);
    setMarkers(updatedMarkers);
    savedMarkers = updatedMarkers;
  };

  return (
    <View style={styles.container}>
      <Map
        markers={markers}
        onMapLongPress={handleMapLongPress}
        onMarkerPress={handleMarkerPress}
      />
      <MarkerList
        markers={markers}
        onMarkerPress={handleMarkerPress}
        onDeleteMarker={handleDeleteMarker}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});