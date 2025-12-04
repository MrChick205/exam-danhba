import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
} from 'react-native';
import {
  fetchAllCategories,
  fetchProductsByCategory,
  addToCart,
} from './database'; // Đảm bảo import đúng
import theme from './theme';
import { getImageSource } from './imageUtils';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HomeStackParamList } from './types';
import AsyncStorage from '@react-native-async-storage/async-storage';

type CategoriesNavProp = NativeStackNavigationProp<
  HomeStackParamList,
  'Categories'
>;

const Categories = ({ navigation }: { navigation: CategoriesNavProp }) => {
  const [categories, setCategories] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      const fetchedCategories = await fetchAllCategories();

      // Với mỗi category, tải tối đa các sản phẩm (hoặc tất cả), sau đó set 1 lần
      const categoriesWithProducts = await Promise.all(
        fetchedCategories.map(async (cat: any) => {
          const products = await fetchProductsByCategory(cat.id);
          return { ...cat, products };
        }),
      );

      setCategories(categoriesWithProducts);

      // Load user info
      const userData = await AsyncStorage.getItem('loggedInUser');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    };

    loadData();
  }, []);

  const handleViewAll = (categoryId: number, categoryName: string) => {
    navigation.navigate('ProductsByCategory', { categoryId, categoryName });
  };

  const handleAddToCart = async (product: any) => {
    try {
      const userData = await AsyncStorage.getItem('loggedInUser');
      if (!userData) {
        Alert.alert(
          'Thông báo',
          'Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng',
        );
        return;
      }

      const currentUser = JSON.parse(userData);

      if (currentUser.role === 'admin') {
        Alert.alert('Thông báo', 'Admin không thể thêm sản phẩm vào giỏ hàng');
        return;
      }

      await addToCart(currentUser.id, product.id, 1);
      Alert.alert('Thành công', `${product.name} đã được thêm vào giỏ hàng`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      Alert.alert('Lỗi', 'Không thể thêm sản phẩm vào giỏ hàng');
    }
  };

  // Using centralized getImageSource from imageUtils

  const renderProduct = ({ item }: { item: any }) => (
    <View style={styles.productCard}>
      <Image source={getImageSource(item.img)} style={styles.productImage} />
      <Text style={styles.productName} numberOfLines={1}>
        {item.name}
      </Text>
      <Text style={styles.productPrice}>
        {(item.price ?? 0).toLocaleString()} đ
      </Text>
      {user?.role !== 'admin' && (
        <TouchableOpacity
          style={styles.addToCartBtn}
          onPress={() => handleAddToCart(item)}
        >
          <Text style={styles.addToCartBtnText}>🛒</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderCategory = ({ item }: { item: any }) => {
    const productsToShow = (item.products || []).slice(0, 4); // 4 sản phẩm trên 1 hàng
    return (
      <View style={styles.categoryContainer}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Text style={styles.categoryName}>{item.name}</Text>
          <TouchableOpacity onPress={() => handleViewAll(item.id, item.name)}>
            <Text style={{ color: theme.colors.primary }}>Xem Tất Cả</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={productsToShow}
          renderItem={renderProduct}
          keyExtractor={product => String(product.id)}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.productList}
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Danh Mục Sản Phẩm</Text>
      <FlatList
        data={categories}
        renderItem={renderCategory}
        keyExtractor={item => String(item.id)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.lg,
    backgroundColor: theme.colors.background,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: theme.spacing.xl,
    textAlign: 'center',
    color: theme.colors.primary,
  },
  categoryContainer: {
    marginBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.lg,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.md,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: theme.spacing.md,
    color: theme.colors.primary,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  productList: {
    paddingVertical: theme.spacing.md,
  },
  productCard: {
    marginRight: theme.spacing.md,
    alignItems: 'center',
    width: 110,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
  },
  productImage: {
    width: 90,
    height: 90,
    borderRadius: theme.borderRadius.md,
    backgroundColor: '#f5f5f5',
  },
  productName: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: theme.spacing.sm,
    textAlign: 'center',
    color: theme.colors.textPrimary,
  },
  productPrice: {
    fontSize: 12,
    color: theme.colors.secondary,
    fontWeight: '700',
    marginTop: theme.spacing.xs,
  },
  addToCartBtn: {
    marginTop: theme.spacing.xs,
    backgroundColor: theme.colors.primary,
    width: '100%',
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  addToCartBtnText: {
    color: theme.colors.textOnPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  viewAllButton: {
    marginTop: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    alignSelf: 'flex-start',
    ...theme.shadows.sm,
  },
  viewAllText: {
    color: theme.colors.textOnPrimary,
    fontWeight: '600',
    fontSize: 13,
  },
});

export default Categories;
