import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './HomeScreen';
import DetailsScreen from './ProductDetailScreen';
import { HomeStackParamList } from './types';
import AboutScreen from './About';
import AdminDashboard from './AdminDashboard';
import CategoryManagement from './AdminCategory';
import Categories from './categ';
import AdminProduct from './AdminProduct';
import ProductsByCategory from './ProductByCategoryScreen';
import ProductSearchScreen from './ProductSearchScreen';
import ProfileScreen from './ProfileScreen';
import EditProfileScreen from './EditProfileScreen';
import OrderDetailScreen from './OrderDetailScreen';
import UserManagementScreen from './UserManagementScreen';
import AdminOrdersScreen from './AdminOrdersScreen';

const Stack = createNativeStackNavigator<HomeStackParamList>();

const HomeStackScreen = () => {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{ headerShown: true }} // Mặc định hiển thị header
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Trang Chủ' }} // Đặt tiêu đề cho trang Home
      />
      <Stack.Screen
        name="Details"
        component={DetailsScreen}
        options={{ title: 'Chi Tiết Sản Phẩm' }} // Đặt tiêu đề cho trang chi tiết sản phẩm
      />
      <Stack.Screen
        name="About"
        component={AboutScreen}
        options={{ title: 'Giới Thiệu' }} // Tiêu đề cho trang giới thiệu
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Hồ Sơ Cá Nhân' }} // Tiêu đề cho trang profile
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{ title: 'Chỉnh Sửa Thông Tin' }} // Tiêu đề cho trang chỉnh sửa profile
      />
      <Stack.Screen
        name="ProductSearch"
        component={ProductSearchScreen}
        options={{ title: 'Tìm Kiếm Sản Phẩm' }} // Tiêu đề cho trang tìm kiếm
      />
      <Stack.Screen
        name="CategoryManagement"
        component={CategoryManagement}
        options={{ title: 'Quản Lý Danh Mục' }} // Tiêu đề cho trang quản lý danh mục
      />
      <Stack.Screen
        name="AdminDashboard"
        component={AdminDashboard}
        options={{ title: 'Bảng Điều Khiển Quản Trị' }} // Tiêu đề cho admin dashboard
      />
      <Stack.Screen
        name="UserManagement"
        component={UserManagementScreen}
        options={{ title: 'Quản lý người dùng' }}
      />
      <Stack.Screen
        name="AdminOrders"
        component={AdminOrdersScreen}
        options={{ title: 'Đơn hàng người dùng' }}
      />
      <Stack.Screen
        name="AdminProduct"
        component={AdminProduct}
        options={{ title: 'Quản Lý Sản Phẩm' }} // Tiêu đề cho quản lý sản phẩm
      />
      <Stack.Screen
        name="Categories"
        component={Categories}
        options={{ title: 'Danh Mục' }} // Tiêu đề cho trang categories
      />
      <Stack.Screen
        name="ProductsByCategory"
        component={ProductsByCategory}
        options={{ title: 'Sản Phẩm Theo Danh Mục' }} // Tiêu đề cho sản phẩm theo danh mục
      />
      <Stack.Screen
        name="OrderDetail"
        component={OrderDetailScreen}
        options={{ title: 'Chi Tiết Đơn Hàng' }} // Tiêu đề cho chi tiết đơn hàng
      />
    </Stack.Navigator>
  );
};

export default HomeStackScreen;
{
  /* <Stack.Screen name="Categories" component={CategoriesScreen} />
      <Stack.Screen name="Fashion" component={FashionScreen} />
      <Stack.Screen name="Accessory" component={AccessoryScreen} />
      <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
      <Stack.Screen name="UserManagement" component={UserManagement} />
      <Stack.Screen name="ProductManagement" component={ProductManagement} />
      <Stack.Screen name="AddUser" component={AddUser} />
      <Stack.Screen name="EditUser" component={EditUser} /> */
}
