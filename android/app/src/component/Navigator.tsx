//tạo Navigator để điều hướng
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Sanpham3Sqlite from './buoi 13/Sanpham3Sqlite';
import ProductDetailScreen from './ProductDetailScreen';
import Home from './buoi 13/HomeScreen';
import { Product } from './buoi 13/database';
import DetailScreen from './buoi 13/ProductDetailScreen';
import AppTabs from './buoi 13/AppTabs';
import { HomeStackParamList } from './buoi 13/types';

// Khai báo route + params đúng chuẩn TypeScript cho Stack Navigator
export type RootStackParamList = {
  Sanpham3Sqlite: undefined;
  ProductDetail: { product: Product };
  Home: undefined;
  Details: { product: Product };
};

// const Stack = createNativeStackNavigator<RootStackParamList>();
const Stack = createNativeStackNavigator<HomeStackParamList>();

export default function AppNavigatorProduct() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="Sanpham3Sqlite" component={Sanpham3Sqlite} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
      <Stack.Screen name="Details" component={DetailScreen} />
      <AppTabs />
    </Stack.Navigator>
  );
}
