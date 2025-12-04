import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getImageSource } from './imageUtils';
import { RootStackParamList } from './AppNavigatorProduct';
import {
  Product,
  Category,
  fetchAllCategories,
  fetchProductsByCategory,
  addToCart,
} from './database';
import CategorySelector from './CategorySelector';
import theme from './theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Định nghĩa kiểu navigation cho stack
type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'ProductsByCategory'
>;
type RouteProps = RouteProp<RootStackParamList, 'ProductsByCategory'>;

export default function ProductsByCategoryScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();

  // Lấy categoryId và categoryName từ params
  const { categoryId, categoryName } = route.params;

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(categoryId);

  useEffect(() => {
    fetchAllCategories().then(setCategories);
  }, []);

  useEffect(() => {
    fetchProductsByCategory(selectedCategoryId).then(setProducts);
  }, [selectedCategoryId]);

  const handleAddToCart = async (product: Product) => {
    try {
      const userData = await AsyncStorage.getItem('loggedInUser');
      if (!userData) {
        Alert.alert(
          'Thông báo',
          'Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng',
        );
        return;
      }

      const user = JSON.parse(userData);
      await addToCart(user.id, product.id, 1);
      Alert.alert('Thành công', `${product.name} đã được thêm vào giỏ hàng`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      Alert.alert('Lỗi', 'Không thể thêm sản phẩm vào giỏ hàng');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{categoryName}</Text>
      </View>

      <FlatList
        data={products}
        keyExtractor={item => item.id.toString()}
        ListHeaderComponent={
          <View style={styles.selectorWrapper}>
            <CategorySelector
              categories={categories}
              selectedId={selectedCategoryId}
              onSelect={id => setSelectedCategoryId(id)}
            />
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.imageWrapper}
              onPress={() =>
                navigation.navigate('ProductDetail', { product: item })
              }
              activeOpacity={0.7}
            >
              <Image source={getImageSource(item.img)} style={styles.image} />
            </TouchableOpacity>
            <View style={styles.info}>
              <Text style={styles.name} numberOfLines={2}>
                {item.name}
              </Text>
              <Text style={styles.price}>{item.price.toLocaleString()} đ</Text>
              <TouchableOpacity
                style={styles.addCartBtn}
                onPress={() => handleAddToCart(item)}
              >
                <Text style={styles.addCartBtnText}>🛒 Thêm giỏ</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Không có sản phẩm nào</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    backgroundColor: theme.colors.card,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    ...theme.shadows.sm,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.primary,
    textAlign: 'center',
  },
  card: {
    flexDirection: 'row',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.card,
    ...theme.shadows.sm,
  },
  imageWrapper: {
    width: 100,
    height: 100,
    borderRadius: theme.borderRadius.md,
    marginRight: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background,
  },
  info: {
    justifyContent: 'space-between',
    flex: 1,
  },
  name: {
    fontWeight: '600',
    fontSize: 14,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  price: {
    fontSize: 13,
    color: theme.colors.secondary,
    fontWeight: '700',
    marginBottom: theme.spacing.sm,
  },
  addCartBtn: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  addCartBtnText: {
    color: theme.colors.textOnPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  listContainer: {
    paddingVertical: theme.spacing.md,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: theme.spacing.xl,
    fontSize: 15,
    color: theme.colors.muted,
  },
  selectorWrapper: {
    width: '100%',
    backgroundColor: theme.colors.card,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    marginBottom: theme.spacing.md,
  },
});
