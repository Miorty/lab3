import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Modal, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Map } from '../components/Map';
import { MarkerList } from '../components/MarkerList';
import { Marker } from '../types';

// Временное хранилище маркеров
let savedMarkers: Marker[] = [];

export default function MapScreen() {
  const router = useRouter();
  const [markers, setMarkers] = useState<Marker[]>(savedMarkers);
  const [showMarkerList, setShowMarkerList] = useState(false);

  const handleMapLongPress = (latitude: number, longitude: number) => {
    const newMarker: Marker = {
      id: Date.now().toString(),
      latitude,
      longitude,
      title: `Маркер ${savedMarkers.length + 1}`,
      createdAt: new Date(),
      images: [],
    };

    const updatedMarkers = [...markers, newMarker];
    setMarkers(updatedMarkers);
    savedMarkers = updatedMarkers;
  };

  const handleMarkerPress = (marker: Marker) => {
    // Передаем ВСЕ параметры маркера, путь вида /marker/123456789?latitude=56.865868&longitude=307.65866173...
    router.push({
      pathname: '/marker/[id]' as const,
      params: {
        id: marker.id,
        latitude: marker.latitude.toString(),
        longitude: marker.longitude.toString(),
        title: marker.title || 'Маркер',
        createdAt: marker.createdAt.toISOString(),
        // Передаем количество изображений для отображения
        //imagesCount: (marker.images?.length || 0).toString()
      }
    });
  };

  const handleDeleteMarker = (markerId: string) => {
    const updatedMarkers = markers.filter(marker => marker.id !== markerId);
    setMarkers(updatedMarkers);
    savedMarkers = updatedMarkers;
  };

  const toggleMarkerList = () => {
    setShowMarkerList(!showMarkerList);
  };

  return (
    <View style={styles.container}>
      <Map
        markers={markers}
        onMapLongPress={handleMapLongPress}
        onMarkerPress={handleMarkerPress}
      />
      
      <TouchableOpacity 
        style={styles.floatingButton}
        onPress={toggleMarkerList}
      >
        <Text style={styles.buttonText}>
          Список маркеров ({markers.length})
        </Text>
      </TouchableOpacity>

      <Modal
        visible={showMarkerList}
        animationType="slide"
        statusBarTranslucent={true}
        onRequestClose={toggleMarkerList}
      >
        <View style={styles.fullScreenModal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Сохраненные маркеры</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={toggleMarkerList}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <MarkerList
            markers={markers}
            onMarkerPress={(marker) => {
              handleMarkerPress(marker);
              setShowMarkerList(false);
            }}
            onDeleteMarker={handleDeleteMarker}
          />
        </View>
      </Modal>
    </View>
  );
}

// Стили остаются без изменений
const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  floatingButton: {
    position: 'absolute',
    top: 50,
    right: 16,
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  fullScreenModal: {
    flex: 1,
    backgroundColor: 'white',
    marginTop: StatusBar.currentHeight,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: 'white',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
});