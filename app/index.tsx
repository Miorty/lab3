import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Modal, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Map } from '../components/Map';
import { MarkerList } from '../components/MarkerList';
import { useDatabase } from '../contexts/DatabaseContext';

export default function MapScreen() {
  const router = useRouter();
  const { markers, addMarker, deleteMarker, isLoading } = useDatabase();
  const [showMarkerList, setShowMarkerList] = useState(false);

  const handleMapLongPress = async (latitude: number, longitude: number) => {
    try {
      console.log('Маркер с координатами:', latitude, longitude);
      const markerId = await addMarker({
        latitude,
        longitude,
        title: `Маркер ${markers.length + 1}`,
        description: 'Описание маркера',
        createdAt: new Date(),
      });

      console.log('Создан новый маркер: ', markerId);
      
      router.push({
        pathname: '/marker/[id]' as const,
        params: { id: markerId }
      });
    } catch (error) {
      console.error('Ошибка при создании: ', error);
      Alert.alert('Ошибка', 'Не удалось создать маркер');
    }
  };

  const handleMarkerPress = (marker: any) => {
    router.push({
      pathname: '/marker/[id]' as const,
      params: { id: marker.id }
    });
  };

  const handleDeleteMarker = async (markerId: string) => {
    try {
      await deleteMarker(markerId);
      Alert.alert('Успех', 'Маркер удален');
    } catch (error) {
      console.error('Error deleting marker:', error);
      Alert.alert('Ошибка', 'Не удалось удалить маркер');
    }
  };

  const toggleMarkerList = () => {
    setShowMarkerList(!showMarkerList);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Загрузка данных...</Text>
      </View>
    );
  }

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

      {markers.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            Нажмите и удерживайте на карте, чтобы создать маркер
          </Text>
        </View>
      )}

      <Modal
        visible={showMarkerList}
        animationType="slide"
        statusBarTranslucent={true}
        onRequestClose={toggleMarkerList}
      >
        <View style={styles.fullScreenModal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Сохраненные маркеры ({markers.length})</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
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
  emptyState: {
    position: 'absolute',
    bottom: 100,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  emptyStateText: {
    textAlign: 'center',
    color: '#666',
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