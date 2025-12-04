import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ImageSourcePropType } from 'react-native';

interface ProductCartProps {
  name: string;
  price: string;
  image: ImageSourcePropType;
  onPress?: () => void;
}

const ProductCart = ({ name, price, image, onPress }: ProductCartProps) => {
  return (
    <View style={styles.cell}>
      <Image source={image} style={styles.image} />
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.price}>{price}</Text>

      <TouchableOpacity style={styles.buyButton} onPress={onPress} activeOpacity={0.8}>
        <Text style={styles.buyText}>Mua ngay</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  cell: {
    width: 120,
    height: 190,
    borderWidth: 1,
    borderColor: '#475569',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    backgroundColor: '#1e293b',
    borderRadius: 8,
  },
  image: {
    width: 100,
    height: 80,
    marginBottom: 6,
    borderRadius: 6,
  },
  name: {
    color: 'white',
    fontWeight: '600',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 2,
  },
  price: {
    color: '#38bdf8',
    fontWeight: '500',
    marginBottom: 8,
  },
  buyButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginTop: 4,
  },
  buyText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 13,
  },
});

export default ProductCart;
