import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { ImageList } from '../../components/ImageList';
import { MarkerImage } from '../../types';

export default function MarkerDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [images, setImages] = useState<MarkerImage[]>([]); // для хранения изображений

  const pickImageAsync = async () => { //Пользователь нажимает "+" в ImageList, вызывается pickImageAsync()
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      const newImage: MarkerImage = {
        id: Date.now().toString(),
        markerId: id as string,
        uri: result.assets[0].uri,
        createdAt: new Date(),
      };

      setImages(prev => [...prev, newImage]);
    } else {
      alert('Вы не выбрали изображение');
    }
  };
//Удаление изображения
  const handleDeleteImage = (imageId: string) => {
    setImages(prev => prev.filter(img => img.id !== imageId));
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TextInput
          style={styles.title}
          defaultValue={`Маркер ${id}`}
        />
        <Text style={styles.coordinates}>
          55.7558, 37.6173
        </Text>
      </View>

      <ImageList //React автоматически перерисовывает компонент
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