import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ImageList } from '../../components/ImageList';
import { useDatabase } from '../../contexts/DatabaseContext';
import { Marker, MarkerImage } from '../../types';

export default function MarkerDetailsScreen() {
  const { id } = useLocalSearchParams();
  
  const router = useRouter();
  const { 
    markers, 
    updateMarker, 
    addImageToMarker, 
    deleteImage 
  } = useDatabase();

  const [marker, setMarker] = useState<Marker | null>(null);
  const [images, setImages] = useState<MarkerImage[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  //буфер редактирования
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');

  useEffect(() => {
    loadMarkerData();
  }, [id, markers]);

  const loadMarkerData = () => {
    const markerId = Array.isArray(id) ? id[0] : id;
    const foundMarker = markers.find(m => m.id === markerId);
    
    if (foundMarker) {
      setMarker(foundMarker);
      setImages(foundMarker.images || []);
      setEditTitle(foundMarker.title);
      setEditDescription(foundMarker.description);
    } else {
      Alert.alert('Ошибка', 'Маркер не найден');
      router.back();
    }
  };

  const handleSave = async () => {
    if (!marker) return;

    const updatedMarker: Marker = {
      ...marker,
      title: editTitle,
      description: editDescription,
    };

    await updateMarker(updatedMarker);
    setMarker(updatedMarker);
    setIsEditing(false);
  };

  const pickImageAsync = async () => {
    if (!marker) return;

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Ошибка', 'Необходимо разрешение для доступа к галерее');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const markerId = Array.isArray(id) ? id[0] : id;
      
      try {
        await addImageToMarker({
          markerId: markerId!,
          uri: result.assets[0].uri,
          createdAt: new Date(),
        });
        Alert.alert('Успех', 'Изображение добавлено');
      } catch (error) {
        console.error('Error adding image:', error);
        Alert.alert('Ошибка', 'Не удалось добавить изображение');
      }
    } else {
      alert('Вы не выбрали изображение');
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    try {
      await deleteImage(imageId);
      Alert.alert('Успех', 'Изображение удалено');
    } catch (error) {
      console.error('Error deleting image:', error);
      Alert.alert('Ошибка', 'Не удалось удалить изображение');
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
        {isEditing ? (
          <>
            <TextInput
              style={[styles.title, styles.editInput]}
              value={editTitle}
              onChangeText={setEditTitle}
              placeholder="Название маркера"
            />
            <TextInput
              style={[styles.description, styles.editInput, styles.multilineInput]}
              value={editDescription}
              onChangeText={setEditDescription}
              placeholder="Описание маркера"
              multiline
              numberOfLines={3}
            />
          </>
        ) : (
          <>
            <Text style={styles.title}>{marker.title}</Text>
            <Text style={styles.description}>{marker.description}</Text>
          </>
        )}
        
        <Text style={styles.coordinates}>
          Координаты: {marker.latitude.toFixed(6)}, {marker.longitude.toFixed(6)}
        </Text>
        <Text style={styles.date}>
          Создан: {marker.createdAt.toLocaleDateString()} в {marker.createdAt.toLocaleTimeString()}
        </Text>

        <View style={styles.editButtons}>
          {isEditing ? (
            <View style={styles.editButtonRow}>
              <TouchableOpacity style={[styles.editButton, styles.saveButton]} onPress={handleSave}>
                <Text style={styles.editButtonText}>Сохранить</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.editButton, styles.cancelButton]} 
                onPress={() => {
                  setIsEditing(false);
                  setEditTitle(marker.title);
                  setEditDescription(marker.description);
                }}
              >
                <Text style={styles.editButtonText}>Отмена</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
              <Text style={styles.editButtonText}>Редактировать</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ImageList
        images={images}
        onAddImage={pickImageAsync}
        onDeleteImage={handleDeleteImage}
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Назад к карте</Text>
        </TouchableOpacity>
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
    marginBottom: 12,
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
  editInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 8,
    backgroundColor: '#f9f9f9',
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  editButtons: {
    marginTop: 16,
  },
  editButtonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  editButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  saveButton: {
    backgroundColor: '#34C759',
  },
  cancelButton: {
    backgroundColor: '#FF3B30',
  },
  editButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
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