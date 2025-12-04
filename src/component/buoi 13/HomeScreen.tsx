// HomeScreen.tsx - Phiên bản ĐẸP & HIỆN ĐẠI 2025
import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  Dimensions,
  Alert,
  Animated,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeStackParamList } from './types';
import Header from './Header';
import theme from './theme';
import {
  fetchProducts,
  fetchAllCategories,
  fetchProductsByCategory,
  Product,
  addToCart,
} from './database';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getImageSource } from './imageUtils';

type HomeScreenProps = NativeStackScreenProps<HomeStackParamList, 'Home'>;

const { width } = Dimensions.get('window');
const BANNER_HEIGHT = width * 0.55; // Tỷ lệ đẹp cho banner

const HomeScreen = ({ navigation }: HomeScreenProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [helloProducts, setHelloProducts] = useState<Product[]>([]);
  const [helloCategoryId, setHelloCategoryId] = useState<number | null>(null);
  const [astrayCategoryId, setAstrayCategoryId] = useState<number | null>(null);
  const [user, setUser] = useState<any>(null);
  const [bannerIndex, setBannerIndex] = useState(0);

  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<ScrollView>(null);

  const bannerImages = [
    require('../../assets/images/banner_Home.webp'),
    require('../../assets/images/banner_2.jpg'),
    require('../../assets/images/banner_3.webp'),
    require('../../assets/images/banner_4.jpg'),
    require('../../assets/images/banner_5.jpg'),
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [allProducts, cats, userData] = await Promise.all([
        fetchProducts(),
        fetchAllCategories(),
        AsyncStorage.getItem('loggedInUser'),
      ]);

      setProducts(allProducts.reverse().slice(0, 9)); //  // 9 sản phẩm mới nhất

      if (userData) setUser(JSON.parse(userData));

      const helloCat = cats.find(c => c.name.toLowerCase() === 'hello');
      const astrayCat = cats.find(c => c.name.toLowerCase() === 'astray');

      if (helloCat) {
        const prods = await fetchProductsByCategory(helloCat.id);
        setHelloProducts(prods || []);
        setHelloCategoryId(helloCat.id);
      }
      if (astrayCat) setAstrayCategoryId(astrayCat.id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddToCart = async (product: Product) => {
    try {
      const userData = await AsyncStorage.getItem('loggedInUser');
      if (!userData) {
        Alert.alert('Thông báo', 'Vui lòng đăng nhập để thêm vào giỏ hàng');
        return;
      }
      const currentUser = JSON.parse(userData);
      if (currentUser.role === 'admin') {
        Alert.alert('Thông báo', 'Admin không thể thêm sản phẩm vào giỏ hàng');
        return;
      }
      await addToCart(currentUser.id, product.id, 1);
      Alert.alert('Thành công', `${product.name} đã được thêm vào giỏ hàng!`);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể thêm vào giỏ hàng');
    }
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.productCard}
      onPress={() => navigation.navigate('Details' as any, { product: item } as any)}
    >
      <View style={styles.productImageContainer}>
        <Image source={getImageSource(item.img)} style={styles.productImage} />
        <View style={styles.hotBadge}>
          <Text style={styles.hotText}>NEW</Text>
        </View>
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.productPrice}>
          {(item.price ?? 0).toLocaleString('vi-VN')} đ
        </Text>
        {user?.role !== 'admin' && (
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => handleAddToCart(item)}
          >
            <Text style={styles.addBtnText}>+ Thêm</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderHelloItem = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.helloCard}
      onPress={() => navigation.navigate('Details' as any, { product: item } as any)}
    >
      <Image source={getImageSource(item.img)} style={styles.helloImage} />
      <Text style={styles.helloName} numberOfLines={2}>{item.name}</Text>
      <Text style={styles.helloPrice}>{(item.price ?? 0).toLocaleString('vi-VN')} đ</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header />
      <FlatList
        data={products}
        numColumns={3}
        keyExtractor={item => item.id.toString()}
        renderItem={renderProduct}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            {/* Banner Carousel */}
            <View style={styles.bannerContainer}>
              <ScrollView
                ref={scrollRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={Animated.event(
                  [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                  { useNativeDriver: false }
                )}
                onMomentumScrollEnd={(e) => {
                  const index = Math.round(e.nativeEvent.contentOffset.x / width);
                  setBannerIndex(index);
                }}
                scrollEventThrottle={16}
              >
                {bannerImages.map((img, i) => (
                  <Image key={i} source={img} style={styles.bannerImage} />
                ))}
              </ScrollView>

              {/* Dots Indicator */}
              <View style={styles.dotsContainer}>
                {bannerImages.map((_, i) => {
                  const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
                  const dotWidth = scrollX.interpolate({
                    inputRange,
                    outputRange: [8, 20, 8],
                    extrapolate: 'clamp',
                  });
                  const opacity = scrollX.interpolate({
                    inputRange,
                    outputRange: [0.3, 1, 0.3],
                    extrapolate: 'clamp',
                  });
                  return (
                    <Animated.View
                      key={i}
                      style={[
                        styles.dot,
                        { width: dotWidth, opacity },
                        bannerIndex === i && styles.activeDot,
                      ]}
                    />
                  );
                })}
              </View>
            </View>

            {/* Quick Menu */}
            <View style={styles.quickMenu}>
              {[
                { label: 'Trang chủ', screen: 'Home' },
                { label: 'Giới thiệu', screen: 'About' },
                { label: 'Danh mục', screen: 'Categories' },
                { label: 'Tìm kiếm', icon: '🔍', screen: 'ProductSearch' },
              ].map((item, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.quickItem}
                  onPress={() => navigation.navigate(item.screen as any)}
                >
                  <Text style={styles.quickText}>{item.icon || ''} {item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Welcome */}
            <Text style={styles.welcomeTitle}>Chào mừng đến với Gundam Store</Text>
            <Text style={styles.welcomeSubtitle}>Khám phá những mẫu Gundam đẹp nhất 2025</Text>

            {/* History Section */}
            <View style={styles.historySection}>
              <Image
                source={require('../../assets/images/history.webp')}
                style={styles.historyImage}
              />
              <View style={styles.historyContent}>
                <Text style={styles.historyTitle}>Lịch sử Gundam</Text>
                <Text style={styles.historyText}>
                  Từ Mobile Suit Gundam (1979) đến hôm nay, Gundam không chỉ là mô hình – mà là biểu tượng của đam mê, công nghệ và nghệ thuật.
                </Text>
              </View>
            </View>

            {/* Featured: Hello Gundam */}
            {helloProducts.length > 0 && (
              <View style={styles.featuredSection}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Hello Gundam Collection</Text>
                  <TouchableOpacity
                    onPress={() => {
                      if (helloCategoryId) {
                        navigation.navigate('ProductsByCategory' as any, {
                          categoryId: helloCategoryId,
                          categoryName: 'Hello Gundam',
                        });
                      }
                    }}
                  >
                    <Text style={styles.seeAllText}>Xem tất cả →</Text>
                  </TouchableOpacity>
                </View>
                <FlatList
                  horizontal
                  data={helloProducts}
                  keyExtractor={item => item.id.toString()}
                  renderItem={renderHelloItem}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingLeft: theme.spacing.md }}
                />
              </View>
            )}
          </>
        }
        ListFooterComponent={
          <View style={styles.astraySection}>
            <Text style={styles.astrayTitle}>Astray Gundam Series</Text>
            <Image
              source={require('../../assets/images/asray_noname.webp')}
              style={styles.astrayImage}
            />
            <Text style={styles.astrayDesc}>
              Bộ sưu tập Astray – biểu tượng của sự linh hoạt và phong cách riêng biệt trong vũ trụ Gundam.
            </Text>
            <TouchableOpacity
              style={styles.exploreBtn}
              onPress={() => {
                if (astrayCategoryId) {
                  navigation.navigate('ProductsByCategory' as any, {
                    categoryId: astrayCategoryId,
                    categoryName: 'Astray',
                  });
                } else {
                  navigation.navigate('Categories' as any);
                }
              }}
            >
              <Text style={styles.exploreBtnText}>Khám phá ngay</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#0f0f1a' 
  },
  listContainer: { 
    paddingBottom: 40 
  },

  // Banner
  bannerContainer: { 
    height: BANNER_HEIGHT, 
    position: 'relative' 
  },
  bannerImage: { 
    width, 
    height: BANNER_HEIGHT, 
    resizeMode: 'cover' 
  },
  dotsContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
    marginHorizontal: 4,
  },
  activeDot: { 
    backgroundColor: theme.colors.primary 
  },

  // Quick Menu
  quickMenu: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#1a1a2e',
    paddingVertical: 14,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
  },
  quickItem: { 
    alignItems: 'center' 
  },
  quickText: { 
    color: '#aaa', 
    fontSize: 13, 
    fontWeight: '600' 
  },

  welcomeTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    marginTop: 24,
  },
  welcomeSubtitle: {
    fontSize: 15,
    color: '#888',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 20,
  },

  // Product Card
  productCard: {
    flex: 1 / 3,
    margin: 6,
    backgroundColor: '#1e1e2e',
    borderRadius: 16,
    overflow: 'hidden',
    ...theme.shadows.lg,
  },
  productImageContainer: { 
    position: 'relative' 
  },
  productImage: { 
    width: '100%', 
    height: 140, 
    backgroundColor: '#111' 
  },
  hotBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#ff3366',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  hotText: { 
    color: '#fff', 
    fontSize: 10, 
    fontWeight: 'bold' 
  },
  productInfo: { 
    padding: 10 
  },
  productName: { 
    color: '#fff', 
    fontSize: 13, 
    fontWeight: '600', 
    height: 40 
  },
  productPrice: { 
    color: theme.colors.primary, 
    fontSize: 14, 
    fontWeight: 'bold', 
    marginTop: 4 
  },
  addBtn: {
    backgroundColor: theme.colors.primary,
    marginTop: 8,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  addBtnText: { 
    color: '#fff', 
    fontWeight: '600', 
    fontSize: 12 
  },

  // History Section
  historySection: {
    flexDirection: 'row',
    backgroundColor: '#1a1a2e',
    margin: 16,
    borderRadius: 20,
    overflow: 'hidden',
    ...theme.shadows.md,
  },
  historyImage: { 
    width: 130, 
    height: '100%' 
  },
  historyContent: {
    flex: 1,                    // ĐÃ SỬA: chỉ để flex: 1
    padding: 16,
    justifyContent: 'center',
  },
  historyTitle: { 
    color: theme.colors.primary, 
    fontSize: 18, 
    fontWeight: '700' 
  },
  historyText: { 
    color: '#ccc', 
    fontSize: 13, 
    marginTop: 8, 
    lineHeight: 19 
  },

  // Featured Hello Gundam
  featuredSection: { 
    marginTop: 20 
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    marginBottom: 12,
  },
  sectionTitle: { 
    color: '#fff', 
    fontSize: 20, 
    fontWeight: '700' 
  },
  seeAllText: { 
    color: theme.colors.primary, 
    fontSize: 14 
  },
  helloCard: {
    width: 140,
    backgroundColor: '#1e1e2e',
    borderRadius: 16,
    padding: 12,
    marginRight: 12,
    alignItems: 'center',
    ...theme.shadows.md,
  },
  helloImage: { 
    width: 110, 
    height: 110, 
    borderRadius: 12 
  },
  helloName: { 
    color: '#fff', 
    fontSize: 13, 
    textAlign: 'center', 
    marginTop: 8 
  },
  helloPrice: { 
    color: theme.colors.secondary, 
    fontSize: 12, 
    marginTop: 4 
  },

  // Astray Collection
  astraySection: {
    marginTop: 30,
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#16213e',
    borderRadius: 20,
    marginHorizontal: 16,
  },
  astrayTitle: { 
    color: theme.colors.primary, 
    fontSize: 24, 
    fontWeight: '800', 
    marginBottom: 16 
  },
  astrayImage: { 
    width: '100%', 
    height: 220, 
    borderRadius: 20, 
    marginVertical: 16 
  },
  astrayDesc: { 
    color: '#aaa', 
    textAlign: 'center', 
    fontSize: 15, 
    lineHeight: 22, 
    marginBottom: 24 
  },
  exploreBtn: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 30,
  },
  exploreBtnText: { 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 16 
  },
});

export default HomeScreen;