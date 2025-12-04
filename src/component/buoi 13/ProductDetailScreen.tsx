import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { Product, fetchAllCategories, addToCart } from './database';
import { Category } from './database';
import { RootStackParamList } from './AppNavigatorProduct';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getImageSource } from './imageUtils';
import theme from './theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

type ProductDetailRouteProp = RouteProp<RootStackParamList, 'ProductDetail'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'ProductsByCategory'>;

const ProductDetailScreen = () => {
  const route = useRoute<ProductDetailRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { product } = route.params;

  const [categories, setCategories] = useState<Category[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const cats = await fetchAllCategories();
        setCategories(cats);

        const userData = await AsyncStorage.getItem('loggedInUser');
        if (userData) {
          setUser(JSON.parse(userData));
        }
      } catch (err) {
        console.error('Load data error:', err);
      }
    };
    loadData();
  }, []);

  const handleAddToCart = async () => {
    try {
      const userData = await AsyncStorage.getItem('loggedInUser');
      if (!userData) {
        Alert.alert('Yêu cầu đăng nhập', 'Vui lòng đăng nhập để thêm vào giỏ hàng');
        return;
      }

      const currentUser = JSON.parse(userData);
      await addToCart(currentUser.id, product.id, 1);
      Alert.alert('Thành công!', `${product.name} đã được thêm vào giỏ hàng`);
    } catch (error) {
      console.error(error);
      Alert.alert('Lỗi', 'Không thể thêm vào giỏ hàng');
    }
  };

  const currentCategory = categories.find(c => c.id === product.categoryId);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hình ảnh sản phẩm */}
        <View style={styles.imageContainer}>
          <Image source={getImageSource(product.img)} style={styles.productImage} />
          <TouchableOpacity style={styles.favoriteButton}>
          </TouchableOpacity>
        </View>

        {/* Nội dung */}
        <View style={styles.content}>
          <Text style={styles.productName}>{product.name}</Text>

          <View style={styles.priceContainer}>
            <Text style={styles.price}>{product.price.toLocaleString('vi-VN')} ₫</Text>
          </View>

          {/* Danh mục hiện tại */}
          {currentCategory && (
            <View style={styles.categoryChip}>
              <Text style={styles.categoryText}> {currentCategory.name}</Text>
            </View>
          )}

          {/* Mô tả (nếu có) */}
          {product.description ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Mô tả sản phẩm</Text>
              <Text style={styles.description}>{product.description}</Text>
            </View>
          ) : null}

          {/* Các danh mục khác */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Khám phá thêm</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryItem,
                    cat.id === product.categoryId && styles.selectedCategoryItem,
                  ]}
                  onPress={() =>
                    navigation.navigate('ProductsByCategory', {
                      categoryId: cat.id,
                      categoryName: cat.name,
                    })
                  }
                >
                  <Text
                    style={
                      cat.id === product.categoryId
                        ? styles.selectedCategoryText
                        : styles.categoryItemText
                    }
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </ScrollView>

      {/* Nút cố định dưới cùng */}
      {user?.role !== 'admin' && (
        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.addToCartBtn} onPress={handleAddToCart}>
            <Text style={styles.addToCartText}>Thêm vào giỏ hàng</Text>
          </TouchableOpacity>
        </View>
      )}

      {user?.role === 'admin' && (
        <View style={styles.adminNotice}>
          <Text style={styles.adminText}>Admin không thể mua hàng</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  imageContainer: {
    position: 'relative',
    backgroundColor: '#f9f9f9',
  },
  productImage: {
    width: width,
    height: width * 1.1,
    resizeMode: 'contain',
  },
  favoriteButton: {
    position: 'absolute',
    top: 40,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 10,
    borderRadius: 30,
  },
  content: {
    padding: 20,
  },
  productName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#222',
    lineHeight: 34,
    marginBottom: 12,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  price: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#e74c3c',
  },
  categoryChip: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  categoryText: {
    color: '#1976d2',
    fontWeight: '600',
    fontSize: 14,
  },
  section: {
    marginTop: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  description: {
    fontSize: 15,
    color: '#555',
    lineHeight: 23,
  },
  categoryItem: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 25,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  selectedCategoryItem: {
    backgroundColor: theme.colors?.primary || '#e74c3c',
    borderColor: theme.colors?.primary || '#e74c3c',
  },
  categoryItemText: {
    color: '#444',
    fontWeight: '600',
  },
  selectedCategoryText: {
    color: '#fff',
    fontWeight: '600',
  },

  // Thanh dưới cùng
  bottomBar: {
    padding: 16,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  addToCartBtn: {
    backgroundColor: theme.colors?.primary || '#e74c3c',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 10,
  },
  addToCartText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  adminNotice: {
    backgroundColor: '#fff3cd',
    padding: 16,
    alignItems: 'center',
  },
  adminText: {
    color: '#856404',
    fontWeight: '600',
    fontSize: 15,
  },
});

export default ProductDetailScreen;