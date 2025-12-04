import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView } from 'react-native';
import { Product } from './buoi 13/database';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

type RootStackParamList = {
  Sanpham3Sqlite: undefined;
  ProductDetail: { product: Product };
};

type Props = NativeStackScreenProps<RootStackParamList, 'ProductDetail'>;

const ProductDetailScreen = ({ route }: Props) => {
  const { product } = route.params;

  const getImageSource = (img: string) => {
    if (img.startsWith('file://')) return { uri: img };
    switch (img) {
      case '../assets/images/gigachad.jpg':
      case '../assets/images/hii.jpg':
      default:
        return require('../assets/images/fat.webp');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={getImageSource(product.img)} style={styles.image} />
      <Text style={styles.name}>{product.name}</Text>
      <Text style={styles.price}>{product.price.toLocaleString()} đ</Text>
      <Text style={styles.category}>Category ID: {product.categoryId}</Text>
      {/* Nếu muốn, có thể thêm description, chi tiết khác */}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, alignItems: 'center' },
  image: { width: 200, height: 200, marginBottom: 16 },
  name: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  price: { fontSize: 18, color: '#28a', marginBottom: 8 },
  category: { fontSize: 16, color: '#555' },
});

export default ProductDetailScreen;
