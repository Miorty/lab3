import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ImageList } from '../../components/ImageList';
import { Marker, MarkerImage } from '../../types';

let savedMarkers: Marker[] = [];

export default function MarkerDetailsScreen() {

  const { 
    id, 
    latitude, 
    longitude, 
    title, 
    description, 
    createdAt
  } = useLocalSearchParams();
  
  const router = useRouter();

  const [marker, setMarker] = useState<Marker | null>(null);
  const [images, setImages] = useState<MarkerImage[]>([]);

  useEffect(() => {
    loadMarkerData();
  }, [id, latitude, longitude, title, description, createdAt]);

  const loadMarkerData = () => {
    const markerId = Array.isArray(id) ? id[0] : id;
    
    const lat = latitude ? parseFloat(Array.isArray(latitude) ? latitude[0] : latitude) : 55.7558;
    const lng = longitude ? parseFloat(Array.isArray(longitude) ? longitude[0] : longitude) : 37.6173;
    const markerTitle = title ? (Array.isArray(title) ? title[0] : title) : 'Маркер';
    //const markerDescription = description ? (Array.isArray(description) ? description[0] : description) : 'Описание маркера';
    const createdDate = createdAt ? new Date(Array.isArray(createdAt) ? createdAt[0] : createdAt) : new Date();

    const foundMarker = savedMarkers.find(m => m.id === markerId);
    
    if (foundMarker) {
      setMarker(foundMarker);
      setImages(foundMarker.images || []);
    } else {
      // Создаем новый маркер со ВСЕМИ параметрами из URL
      const newMarker: Marker = {
        id: markerId!,
        latitude: lat,
        longitude: lng,
        title: markerTitle,
        createdAt: createdDate,
        images: [],
      };
      setMarker(newMarker);
      savedMarkers.push(newMarker);
    }
  };

  const saveMarker = (updatedMarker: Marker) => {
    const index = savedMarkers.findIndex(m => m.id === updatedMarker.id);
    if (index >= 0) {
      savedMarkers[index] = updatedMarker;
    } else {
      savedMarkers.push(updatedMarker);
    }
    console.log('Маркер сохранен:', updatedMarker);
  };

  const pickImageAsync = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Ошибка', 'Необходимо разрешение для доступа к галерее');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const markerId = Array.isArray(id) ? id[0] : id;
      const newImage: MarkerImage = {
        id: Date.now().toString(),
        markerId: markerId!,
        uri: result.assets[0].uri,
        createdAt: new Date(),
      };

      const updatedImages = [...images, newImage];
      setImages(updatedImages);

      if (marker) {
        const updatedMarker: Marker = { 
          ...marker, 
          images: updatedImages 
        };
        setMarker(updatedMarker);
        saveMarker(updatedMarker);
      }
    } else {
      alert('Вы не выбрали изображение');
    }
  };

  const handleDeleteImage = (imageId: string) => {
    const updatedImages = images.filter(img => img.id !== imageId);
    setImages(updatedImages);

    if (marker) {
      const updatedMarker: Marker = { 
        ...marker, 
        images: updatedImages 
      };
      setMarker(updatedMarker);
      saveMarker(updatedMarker);
    }
  };

  if (!marker) {
    return (
      <View style={styles.container}>
        <Text>Загрузка...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{marker.title}</Text>
        <Text style={styles.coordinates}>
          Координаты: {marker.latitude.toFixed(6)}, {marker.longitude.toFixed(6)}
        </Text>
        <Text style={styles.date}>
          Создан: {marker.createdAt.toLocaleDateString()} в {marker.createdAt.toLocaleTimeString()}
        </Text>
      </View>

      <ImageList
        images={images}
        onAddImage={pickImageAsync}
        onDeleteImage={handleDeleteImage}
      />

      <View style={styles.buttonContainer}>
        <Text style={styles.backButton} onPress={() => router.back()}>
          ← Назад к карте
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#000',
  },
  description: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  coordinates: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: '#999',
    marginBottom: 4,
  },
  imagesCount: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  buttonContainer: {
    padding: 16,
    alignItems: 'center',
  },
  backButton: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: 'bold',
  },
});