import React from 'react';
import { View, StyleSheet, SafeAreaView, FlatList } from 'react-native';
import ProductCart from './CardProduct';
import SQLite, { SQLiteDatabase } from 'react-native-sqlite-storage';

const products = [
  { id: 1, name: 'Áo thun trắng', price: '150.000₫', image: require('../asset/images/hii.jpg') },
  { id: 2, name: 'Áo thun đen', price: '180.000₫', image: require('../asset/images/pnv15.jpg') },
  { id: 3, name: 'Áo hoodie', price: '350.000₫', image: require('../asset/images/z6848560518243_062a4e47c2f58ad80c8700e22a404a52.jpg') },
  { id: 4, name: 'Quần jeans', price: '420.000₫', image: require('../asset/images/z6933605963741_6d0ad5c6bb9c67df89d7e216f9901548.jpg') },
  { id: 5, name: 'Áo sơ mi', price: '250.000₫', image: require('../asset/images/z6992162009849_5cd8937fb666fcbe55b3bc5a71466925.jpg') },
  { id: 6, name: 'Áo khoác', price: '500.000₫', image: require('../asset/images/hii.jpg') },
  { id: 7, name: 'Giày sneaker', price: '800.000₫', image: require('../asset/images/pnv15.jpg') },
  { id: 8, name: 'Mũ lưỡi trai', price: '120.000₫', image: require('../asset/images/z6848560518243_062a4e47c2f58ad80c8700e22a404a52.jpg') },
  { id: 9, name: 'Túi đeo chéo', price: '300.000₫', image: require('../asset/images/z6992162009849_5cd8937fb666fcbe55b3bc5a71466925.jpg') },
];

const NetBackground = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.table}>
        <FlatList
          data={products}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <ProductCart
              name={item.name}
              price={item.price}
              image={item.image}
              onPress={() => console.log('Mua:', item.name)}
            />
          )}
          numColumns={3}
          contentContainerStyle={styles.scroll}
        />
      </View>
    </SafeAreaView>
  );
};

export default NetBackground;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  scroll: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  table: {
    borderWidth: 2,
    borderColor: '#475569',
    borderRadius: 10,
    margin: 10,
    overflow: 'hidden',
  },
});
