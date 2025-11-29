import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Map } from '../components/Map';
import { MarkerList } from '../components/MarkerList';
import { useDatabase } from '../contexts/DatabaseContext';
import { calculateDistance, requestLocationPermissions, startLocationUpdates } from '../services/location';
import { notificationManager } from '../services/notifications';

export default function MapScreen() {
  const router = useRouter();
  const { markers, addMarker, deleteMarker, isLoading } = useDatabase();
  const [showMarkerList, setShowMarkerList] = useState(false);
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  const [notificationPermission, setNotificationPermission] = useState<boolean>(false);  
  const [showPermissionModal, setShowPermissionModal] = useState<boolean>(false); 

  useEffect(() => {
    initializeLocationTracking();
    showPermissionRequest();
  }, []);

  const showPermissionRequest = () => {
    setShowPermissionModal(true);
  };

  //уведомления
  useEffect(() => {
    if (userLocation && markers.length > 0) {
      checkProximityToMarkers(userLocation, markers);
    }
  }, [userLocation, markers]);

  const initializeLocationTracking = async () => {
    try {
      // Пытаемся получить доступ к геоданным из location
      const hasPermission = await requestLocationPermissions();
      if (!hasPermission) {
        setLocationError('Доступ к местоположению не разрешён');
        return;
      }

      await startLocationUpdates((location) => {
        setUserLocation(location);
        setLocationError(null);
      });

    } catch (error) {
      console.error('Ошибка отслеживания местоположения:', error);
      setLocationError('Не удалось начать отслеживание местоположения');
    }
  };

  const checkProximityToMarkers = (
    userLocation: Location.LocationObject,
    markers: any[]
  ) => {
    if (!notificationPermission) {
      return; // не показываем модальное окно
    }

    const threshold = notificationManager.getProximityThreshold();

    markers.forEach(marker => {
      const distance = calculateDistance(
        userLocation.coords.latitude,
        userLocation.coords.longitude,
        marker.latitude,
        marker.longitude
      );

      if (distance <= threshold) {
        notificationManager.showNotification(marker);
      } else {
        notificationManager.removeNotification(marker.id);
      }
    });
  };

  // const checkProximityToMarkers = (
  //   userLocation: Location.LocationObject,
  //   markers: any[]
  // ) => {
  //   const threshold = notificationManager.getProximityThreshold(); 

  //   markers.forEach(marker => {
  //     const distance = calculateDistance(
  //       userLocation.coords.latitude,
  //       userLocation.coords.longitude,
  //       marker.latitude,
  //       marker.longitude
  //     );

  //     if (distance <= threshold) {
  //       notificationManager.showNotification(marker);}
  //     // } else {
  //     //   notificationManager.removeNotification(marker.id);
  //     // }
  //   });
  // };

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
        userLocation={userLocation}
      />

      {/* Статус местоположения */}
      {locationError && (
        <View style={styles.locationError}>
          <Text style={styles.locationErrorText}>{locationError}</Text>
        </View>
      )}

      {userLocation && (
        <View style={styles.locationInfo}>
          <Text style={styles.locationInfoText}>
            Текущее местоположение: {userLocation.coords.latitude.toFixed(4)}, {userLocation.coords.longitude.toFixed(4)}
          </Text>
        </View>
      )}

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

      <Modal
        visible={showPermissionModal}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.permissionModal}>
          <View style={styles.permissionContent}>
            <Text style={styles.permissionTitle}>Добро пожаловать!</Text>
            <Text style={styles.permissionText}>
              Разрешите отправку уведомлений, чтобы получать оповещения, когда вы находитесь рядом с сохранёнными метками.
            </Text>

            <View style={styles.permissionButtons}>
              <TouchableOpacity
                style={[styles.permissionButton, styles.denyButton]}
                onPress={() => {
                  setShowPermissionModal(false);
                  setNotificationPermission(false);
                  Alert.alert(
                    'Уведомления отключены',
                  );
                }}
              >
                <Text style={styles.denyButtonText}>Пропустить</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.permissionButton, styles.allowButton]}
                onPress={async () => {
                  try {
                    await notificationManager.initialize();
                    setNotificationPermission(true);
                    setShowPermissionModal(false);
                    Alert.alert('Успех', 'Теперь вы будете получать уведомления о близких метках!');
                  } catch (error) {
                    Alert.alert(
                      'Ошибка',
                      'Не удалось включить уведомления. Проверьте настройки устройства.'
                    );
                    setShowPermissionModal(false);
                  }
                }}
              >
                <Text style={styles.allowButtonText}>Разрешить уведомления</Text>
              </TouchableOpacity>
            </View>
          </View>
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
  locationError: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    backgroundColor: '#FF3B30',
    padding: 12,
    borderRadius: 8,
    zIndex: 1000,
  },
  locationErrorText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  locationInfo: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 8,
    borderRadius: 8,
    zIndex: 1000,
  },
  locationInfoText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#666',
  },
  floatingButton: {
    position: 'absolute',
    top: 100,
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
  permissionModal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  permissionContent: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  permissionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  permissionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  permissionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  allowButton: {
    backgroundColor: '#007AFF',
  },
  denyButton: {
    backgroundColor: '#F2F2F7',
  },
  allowButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  denyButtonText: {
    color: '#666',
    textAlign: 'center',
  },
});