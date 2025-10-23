import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Marker } from '../types';

interface MarkerListProps {
  markers: Marker[];
  onMarkerPress: (marker: Marker) => void;
  onDeleteMarker: (markerId: string) => void;
}

export const MarkerList: React.FC<MarkerListProps> = ({
  markers,
  onMarkerPress,
  onDeleteMarker,
}) => {
  const renderMarkerItem = ({ item }: { item: Marker }) => (
    <TouchableOpacity
      style={styles.markerItem}
      onPress={() => onMarkerPress(item)}
    >
      <View style={styles.markerInfo}>
        <Text style={styles.markerTitle}>{item.title}</Text>
        <Text style={styles.markerCoordinates}>
          {item.latitude.toFixed(4)}, 
          {item.longitude.toFixed(4)}
        </Text>
        <Text style={styles.markerImages}>
          Изображений: {item.images?.length || 0}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => onDeleteMarker(item.id)}
      >
        <Text style={styles.deleteButtonText}>×</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Сохраненные маркеры ({markers.length})</Text>
      {markers.length === 0 ? (
        <Text style={styles.emptyText}>Нет сохраненных маркеров</Text>
      ) : (
        <FlatList
          data={markers}
          renderItem={renderMarkerItem}
          keyExtractor={(item) => item.id}
          style={styles.list}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
  },
  list: {
    maxHeight: 300,
  },
  markerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    marginBottom: 8,
  },
  markerInfo: {
    flex: 1,
  },
  markerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  markerCoordinates: {
    fontSize: 14,
    color: '#666',
  },
  markerImages: {
    fontSize: 12,
    color: '#999',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
});