import React from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { MarkerImage } from '../types';

interface ImageListProps {
  images: MarkerImage[];
  onAddImage: () => void;
  onDeleteImage: (imageId: string) => void;
}
//const ImageList: (props: ImageListProps) => React.JSX.Element
export const ImageList: React.FC<ImageListProps> = ({ //React.FC<ImageListProps> - тип компонента, 
                                                      //React.FC = Function Component (функциональный компонент)
  //извлечения значений из объекта props в отдельные переменные.
  images,
  onAddImage,
  onDeleteImage,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Изображения ({images.length})</Text>
        <TouchableOpacity style={styles.addButton} onPress={onAddImage}>
          <Text style={styles.addButtonText}>+ Добавить</Text>
        </TouchableOpacity>
      </View>

      {images.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            Нет изображений. Нажмите "Добавить", чтобы загрузить фото.
          </Text>
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.imagesContainer}>
            {images.map((image) => ( //преобразование массива изображений в массив React-элементов.
              <View key={image.id} style={styles.imageContainer}>
                <Image source={{ uri: image.uri }} style={styles.image} />
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => onDeleteImage(image.id)}
                >
                  <Text style={styles.deleteButtonText}>×</Text>
                </TouchableOpacity>
                <Text style={styles.imageDate}>
                  {image.createdAt.toLocaleDateString()}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
  },
  imagesContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
  },
  imageContainer: {
    marginRight: 12,
    alignItems: 'center',
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 8,
  },
  deleteButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FF3B30',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  imageDate: {
    marginTop: 4,
    fontSize: 12,
    color: '#666',
  },
});