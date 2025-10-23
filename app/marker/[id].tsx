import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { ImageList } from '../../components/ImageList';
import { Marker, MarkerImage } from '../../types';

// Временное хранилище (потом через бд!!)
let savedMarkers: Marker[] = [];

export default function MarkerDetailsScreen() {
  const { id } = useLocalSearchParams(); // ID из URL
  const router = useRouter();

  const [marker, setMarker] = useState<Marker | null>(null);
  const [images, setImages] = useState<MarkerImage[]>([]);
  const [title, setTitle] = useState('');

  
  useEffect(() => {
    loadMarkerData();
  }, [id]);
// Загрузка данных маркера
  const loadMarkerData = () => {
    const markerId = Array.isArray(id) ? id[0] : id;
    const foundMarker = savedMarkers.find(m => m.id === markerId);
    
    if (foundMarker) { //
      setMarker(foundMarker);
      setTitle(foundMarker.title || '');
      setImages(foundMarker.images || []);
    } else {
      // Если маркер не найден, создаем временный
      const newMarker: Marker = {
        id: markerId!,
        latitude: 55.7558,
        longitude: 37.6173,
        title: `Маркер ${markerId}`,
        description: 'Описание маркера',
        createdAt: new Date(),
        images: [],
      };
      setMarker(newMarker);
      setTitle(newMarker.title || '');
      // Сохраняем временный маркер
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

  //работа с картинкой
  const pickImageAsync = async () => {
    // разрешение ?
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Ошибка', 'Необходимо разршение для доступа к галерее');
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

      // Сохраняем в маркер
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

    // Обновляем маркер
    if (marker) {
      const updatedMarker: Marker = { 
        ...marker, 
        images: updatedImages 
      };
      setMarker(updatedMarker);
      saveMarker(updatedMarker);
    }
  };

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    if (marker) {
      const updatedMarker: Marker = { 
        ...marker, 
        title: newTitle 
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
        <TextInput
          style={styles.title}
          value={title}
          onChangeText={handleTitleChange}
          placeholder="Название маркера"
        />
        <Text style={styles.coordinates}>
          {marker.latitude.toFixed(4)}, {marker.longitude.toFixed(4)}
        </Text>
        <Text style={styles.date}>
          Создан: {marker.createdAt.toLocaleDateString()}
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
    borderBottomWidth: 1,
    borderBottomColor: '#007AFF',
    paddingVertical: 4,
  },
  coordinates: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: '#999',
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