import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeStackParamList } from './types';
import Header from './Header';
import theme from './theme';
import {
  fetchProducts,
  fetchAllCategories,
  Product,
  addToCart,
  Category,
} from './database';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getImageSource } from './imageUtils';

type Props = NativeStackScreenProps<HomeStackParamList, 'ProductSearch'>;

const SCREEN_WIDTH = Dimensions.get('window').width;
const HORIZONTAL_PADDING = 16;
const ITEM_MARGIN = 8;
const NUM_COLUMNS = 3;
const CARD_WIDTH =
  (SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - ITEM_MARGIN * (NUM_COLUMNS - 1)) /
  NUM_COLUMNS;
const CARD_HEIGHT = 250;
const IMAGE_SIZE = 100;  

const ProductSearchScreen = ({ navigation }: Props) => {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [priceRange, setPriceRange] = useState<'all' | 'low' | 'mid' | 'high'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'newest'>('newest');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [productsData, categoriesData, userData] = await Promise.all([
        fetchProducts(),
        fetchAllCategories(),
        AsyncStorage.getItem('loggedInUser'),
      ]);
      setAllProducts(productsData);
      setFilteredProducts(productsData);
      setCategories(categoriesData as Category[]);
      if (userData) setUser(JSON.parse(userData));
    } catch (e) {
      console.error(e);
      Alert.alert('Lỗi', 'Không thể tải dữ liệu');
    } finally { setLoading(false); }
  };

  const filterAndSort = useCallback((products: Product[], search: string, category: number | null, price: string, sort: string) => {
    let result = [...products];
    if (search.trim()) result = result.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    if (category !== null) result = result.filter(p => p.categoryId === category);
    if (price !== 'all') {
      result = result.filter(p => {
        if (price === 'low') return p.price < 500000;
        if (price === 'mid') return p.price >= 500000 && p.price < 1000000;
        if (price === 'high') return p.price >= 1000000;
        return false;
      });
    }
    if (sort === 'name') result.sort((a,b)=>a.name.localeCompare(b.name));
    else if (sort==='price') result.sort((a,b)=>a.price-b.price);
    return result;
  }, []);

  useEffect(() => {
    const result = filterAndSort(allProducts, searchText, selectedCategory, priceRange, sortBy);
    setFilteredProducts(result);
  }, [searchText, selectedCategory, priceRange, sortBy, allProducts, filterAndSort]);

  const handleAddToCart = async (product: Product) => {
    try {
      const u = await AsyncStorage.getItem('loggedInUser');
      if (!u) return Alert.alert('Thông báo', 'Vui lòng đăng nhập để thêm sản phẩm');
      const currentUser = JSON.parse(u);
      if (currentUser.role === 'admin') return Alert.alert('Thông báo', 'Admin không thể thêm vào giỏ');
      await addToCart(currentUser.id, product.id, 1);
      Alert.alert('Thành công', `${product.name} đã được thêm vào giỏ`);
    } catch (e) { console.error(e); Alert.alert('Lỗi', 'Không thể thêm sản phẩm vào giỏ'); }
  };

  const renderProduct = ({ item, index }: { item: Product, index: number }) => {
    const isLastCol = (index + 1) % NUM_COLUMNS === 0;
    return (
      <TouchableOpacity style={[styles.productCard, !isLastCol && { marginRight: ITEM_MARGIN }]} activeOpacity={0.8} onPress={()=>navigation.navigate('Details' as any, {product:item} as any)}>
        <View style={styles.imgBox}>
          <Image source={getImageSource(item.img)} style={styles.productImg}/>
        </View>
        <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.productPrice}>{(item.price ?? 0).toLocaleString()} đ</Text>
        {user?.role !== 'admin' && (
          <TouchableOpacity style={styles.addBtn} onPress={()=>handleAddToCart(item)}>
            <Text style={styles.addBtnText}>🛒 Thêm</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  if(loading){
    return (
      <View style={[styles.container, {justifyContent:'center'}]}>
        <ActivityIndicator size="large" color={theme.colors.primary}/>
      </View>
    );
  }

  // HEADER COMPONENT cho FlatList
  const renderHeader = () => (
    <View>
      {/* SEARCH */}
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput style={styles.searchInput} placeholder="Tìm kiếm sản phẩm..." value={searchText} onChangeText={setSearchText} placeholderTextColor={theme.colors.muted}/>
        {searchText.length>0 && <TouchableOpacity onPress={()=>setSearchText('')}><Text style={styles.clearIcon}>✕</Text></TouchableOpacity>}
      </View>

      {/* CATEGORY */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
        <FilterChip label="Tất cả" active={selectedCategory===null} onPress={()=>setSelectedCategory(null)}/>
        {categories.map(cat=>(
          <FilterChip key={cat.id} label={cat.name} active={selectedCategory===cat.id} onPress={()=>setSelectedCategory(cat.id)}/>
        ))}
      </ScrollView>

      {/* TOGGLE ADVANCED */}
      <TouchableOpacity style={styles.toggleBtn} onPress={()=>setShowAdvanced(prev=>!prev)}>
        <Text style={styles.toggleBtnText}>{showAdvanced?'Ẩn bộ lọc nâng cao ▲':'Bộ lọc nâng cao ▼'}</Text>
      </TouchableOpacity>

      {showAdvanced && (
        <>
          {/* PRICE */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
            <FilterChip label="Giá: Tất cả" active={priceRange==='all'} onPress={()=>setPriceRange('all')}/>
            <FilterChip label="< 500k" active={priceRange==='low'} onPress={()=>setPriceRange('low')}/>
            <FilterChip label="500k - 1M" active={priceRange==='mid'} onPress={()=>setPriceRange('mid')}/>
            <FilterChip label="> 1M" active={priceRange==='high'} onPress={()=>setPriceRange('high')}/>
          </ScrollView>

          {/* SORT */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
            <FilterChip label="Mới nhất" active={sortBy==='newest'} onPress={()=>setSortBy('newest')}/>
            <FilterChip label="Tên A → Z" active={sortBy==='name'} onPress={()=>setSortBy('name')}/>
            <FilterChip label="Giá thấp → cao" active={sortBy==='price'} onPress={()=>setSortBy('price')}/>
          </ScrollView>
        </>
      )}

      {/* RESULT */}
      <Text style={styles.resultText}>Tìm được {filteredProducts.length} sản phẩm</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header/>
      <FlatList
        data={filteredProducts}
        keyExtractor={item=>String(item.id)}
        renderItem={renderProduct}
        numColumns={NUM_COLUMNS}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={{paddingHorizontal:HORIZONTAL_PADDING, paddingBottom:24}}
        columnWrapperStyle={{justifyContent:'flex-start', marginBottom:ITEM_MARGIN}}
        ListEmptyComponent={<View style={styles.emptyBox}><Text style={styles.emptyText}>Không tìm thấy sản phẩm 😢</Text></View>}
      />
    </View>
  );
};

const FilterChip = ({label,active,onPress}:{label:string,active?:boolean,onPress:()=>void})=>(
  <TouchableOpacity style={[styles.chip,active && styles.chipActive]} onPress={onPress} activeOpacity={0.8}>
    <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container:{flex:1,backgroundColor:theme.colors.background},
  searchBar:{flexDirection:'row',alignItems:'center',margin:12,paddingHorizontal:16,backgroundColor:'#FFFFFF',borderRadius:12,borderWidth:1,borderColor:'#ECECEC'},
  searchIcon:{fontSize:18,marginRight:10},
  searchInput:{flex:1,paddingVertical:10,fontSize:14},
  clearIcon:{fontSize:16,color:theme.colors.muted},

  filterRow:{flexDirection:'row',paddingHorizontal:12,paddingVertical:8},
  toggleBtn:{paddingVertical:6,alignItems:'center'},
  toggleBtnText:{fontSize:13,fontWeight:'600',color:theme.colors.primary},

  chip:{paddingVertical:6,paddingHorizontal:14,backgroundColor:'#FFFFFF',borderRadius:20,borderWidth:1,borderColor:'#E0E0E0',marginRight:8},
  chipActive:{backgroundColor:theme.colors.primary,borderColor:theme.colors.primary},
  chipText:{fontSize:12,color:theme.colors.textPrimary},
  chipTextActive:{color:theme.colors.textOnPrimary,fontWeight:'700'},

  resultText:{paddingHorizontal:14,paddingVertical:6,fontSize:13,color:theme.colors.muted},

  productCard:{width:CARD_WIDTH,height:CARD_HEIGHT,backgroundColor:'#FFFFFF',borderRadius:12,padding:10,alignItems:'center',borderWidth:1,borderColor:'#EFEFEF',shadowColor:'#000',shadowOpacity:0.06,shadowRadius:6,elevation:2},
  imgBox:{width:IMAGE_SIZE,height:IMAGE_SIZE,borderRadius:8,backgroundColor:'#FAFAFA',alignItems:'center',justifyContent:'center',overflow:'hidden'},
  productImg:{width:'85%',height:'100%'},
  productName:{fontSize:13,fontWeight:'600',marginTop:8,textAlign:'center',minHeight:34},
  productPrice:{fontSize:13,fontWeight:'700',color:theme.colors.secondary,marginTop:6,marginBottom:6},
  addBtn:{width:'100%',paddingVertical:8,borderRadius:8,backgroundColor:theme.colors.primary,alignItems:'center',marginTop:'auto'},
  addBtnText:{color:theme.colors.textOnPrimary,fontSize:12,fontWeight:'700'},
  emptyBox:{padding:40,alignItems:'center'},
  emptyText:{fontSize:16,color:theme.colors.muted},
});

export default ProductSearchScreen;
