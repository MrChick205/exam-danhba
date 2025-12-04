import React, { useEffect, useState } from 'react';
import {
  Alert,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  FlatList,
} from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import { launchImageLibrary } from 'react-native-image-picker';
import {
  fetchAllCategories,
  fetchProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  Product,
  Category,
  searchProductsByNameOrCategory,
} from './database';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../buoi 13/AppNavigatorProduct';
import { useNavigation } from '@react-navigation/native';
import { getImageSource } from './imageUtils';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Sanpham3Sqlite'
>;

const AdminProduct = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formVisible, setFormVisible] = useState(false); // ẩn form mặc định
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState<number>(1);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterCategoryId, setFilterCategoryId] = useState<number | null>(null);

  const navigation = useNavigation<NavigationProp>();

  useFocusEffect(
    useCallback(() => {
      loadData(); // reload categories + products
    }, [])
  );

  const loadData = async () => {
    const cats = await fetchAllCategories();
    const prods = await fetchProducts();
    setCategories(cats);
    setProducts(prods.reverse());
  };

  const filteredProducts = products.filter(p => {
    const matchKeyword =
      p.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      categories
        .find(c => c.id === p.categoryId)
        ?.name.toLowerCase()
        .includes(searchKeyword.toLowerCase());
    const matchCategory =
      filterCategoryId === null || p.categoryId === filterCategoryId;
    return matchKeyword && matchCategory;
  });

  const handleAddOrUpdate = async () => {
    if (!name || !price) return;

    const productData = {
      name,
      price: parseFloat(price),
      img: imageUri || 'hinh1.jpg',
      categoryId,
    };

    try {
      if (editingId !== null) {
        await updateProduct({ id: editingId, ...productData });
        setEditingId(null);
      } else {
        await addProduct(productData);
      }
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const resetForm = () => {
    setName('');
    setPrice('');
    setCategoryId(1);
    setImageUri(null);
    setEditingId(null);
    setFormVisible(false);
  };

  const handleEdit = (id: number) => {
    const p = products.find(x => x.id === id);
    if (p) {
      setName(p.name);
      setPrice(p.price.toString());
      setCategoryId(p.categoryId);
      setImageUri(p.img);
      setEditingId(p.id);
      setFormVisible(true);
    }
  };

  const handleDelete = (id: number) => {
    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc chắn muốn xóa sản phẩm này không?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            await deleteProduct(id);
            loadData();
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handlePickImage = () => {
    launchImageLibrary(
      { mediaType: 'photo', includeBase64: false },
      response => {
        if (response.didCancel) return;
        if (response.errorCode) console.error(response.errorMessage);
        if (response.assets && response.assets[0]) {
          setImageUri(response.assets[0].uri ?? null);
        }
      }
    );
  };

  const renderItem = ({ item }: { item: Product }) => (
    <View style={styles.card}>
      <TouchableOpacity
        onPress={() => navigation.navigate('ProductDetail', { product: item })}
      >
        <Image source={getImageSource(item.img)} style={styles.image} />
      </TouchableOpacity>
      <View style={styles.cardInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productPrice}>{item.price.toLocaleString()} đ</Text>
        <View style={styles.iconRow}>
          <TouchableOpacity onPress={() => handleEdit(item.id)}>
            <Text style={styles.icon}>✏️</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(item.id)}>
            <Text style={styles.icon}>❌</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Quản lý sản phẩm</Text>

      {/* Nút hiện form */}
      {!formVisible && (
        <TouchableOpacity
          style={styles.button}
          onPress={() => setFormVisible(true)}
        >
          <Text style={styles.buttonText}>Thêm sản phẩm</Text>
        </TouchableOpacity>
      )}

      {/* Form thêm/cập nhật */}
      {formVisible && (
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Tên sản phẩm"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="Giá sản phẩm"
            keyboardType="numeric"
            value={price}
            onChangeText={setPrice}
          />
          <RNPickerSelect
            onValueChange={value => setCategoryId(value)}
            items={categories.map(c => ({ label: c.name, value: c.id }))}
            value={categoryId}
            style={{
              inputAndroid: styles.input,
              inputIOS: styles.input,
            }}
          />
          <TouchableOpacity style={styles.imagePicker} onPress={handlePickImage}>
            <Text style={styles.buttonText}>
              {imageUri ? 'Chọn lại hình ảnh' : 'Chọn hình ảnh'}
            </Text>
          </TouchableOpacity>
          {imageUri && (
            <Image source={getImageSource(imageUri)} style={styles.selectedImage} />
          )}
          <TouchableOpacity style={styles.button} onPress={handleAddOrUpdate}>
            <Text style={styles.buttonText}>
              {editingId ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={resetForm}>
            <Text style={styles.buttonText}>Hủy</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Lọc và tìm kiếm */}
      <TextInput
        style={styles.input}
        placeholder="Tìm kiếm theo tên hoặc loại"
        value={searchKeyword}
        onChangeText={setSearchKeyword}
      />
      <RNPickerSelect
        onValueChange={value =>
          setFilterCategoryId(value === 0 ? null : value)
        }
        items={[
          { label: 'Tất cả', value: 0 },
          ...categories.map(c => ({ label: c.name, value: c.id })),
        ]}
        value={filterCategoryId ?? 0}
        style={{ inputAndroid: styles.input, inputIOS: styles.input }}
      />

      {/* Danh sách sản phẩm */}
      <FlatList
        data={filteredProducts}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', marginTop: 20 }}>
            Không có sản phẩm nào
          </Text>
        }
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 100 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 6,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#28a',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 20,
  },
  cancelButton: {
    backgroundColor: '#888',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  form: { marginBottom: 20 },
  card: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
  },
  image: { width: 80, height: 80 },
  selectedImage: { width: 100, height: 100, marginVertical: 10 },
  cardInfo: { flex: 1, padding: 10, justifyContent: 'center' },
  productName: { fontWeight: 'bold', fontSize: 16 },
  productPrice: { color: '#000' },
  iconRow: { flexDirection: 'row', marginTop: 10 },
  icon: { fontSize: 20, marginRight: 10 },
  imagePicker: {
    backgroundColor: '#918',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 10,
  },
});

export default AdminProduct;
