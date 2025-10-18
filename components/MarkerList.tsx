import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { MarkerImage } from '../types';

const PlaceholderImage = require('../assets/images/placeholder-image.png');

type Props = {
  images: MarkerImage[];
};

export default function ImageList({ images }: Props) {
  const imageSource = images.length > 0 ? { uri: images[0].uri } : PlaceholderImage;

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image source={imageSource} style={styles.image} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 20,
  },
  imageContainer: {
    marginBottom: 20,
  },
  image: {
    width: 320,
    height: 440,
    borderRadius: 18,
  },
});