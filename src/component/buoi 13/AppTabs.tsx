// AppTabs.tsx - BOTTOM TAB SIÊU ĐẸP 2025 - KHÔNG ICON, KHÔNG THƯ VIỆN
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Header from './Header';
import HomeStackScreen from './HomeStackScreen';
import CartScreen from './CartScreen';
import OrderScreen from './OrderScreen';
import RevenueScreen from './RevenueScreen';
import StatsScreen from './StatsScreen';
import UserManagementScreen from './UserManagementScreen';
import LoginSqlite from './LoginSqlite';
import SignupSqlite from './SignupSqlite';
import theme from './theme';

const Tab = createBottomTabNavigator();

const AppTabs = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const data = await AsyncStorage.getItem('loggedInUser');
        setUser(data ? JSON.parse(data) : null);
      } catch (e) { }
      setLoading(false);
    };
    checkUser();
    const id = setInterval(checkUser, 1000);
    return () => clearInterval(id);
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.loading}>
        <Text style={{ color: '#fff', fontSize: 18 }}>Đang tải...</Text>
      </SafeAreaView>
    );
  }

  const isLoggedIn = !!user;
  const isAdmin = user?.role === 'admin';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mainContent}>
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarStyle: {
              height: Platform.OS === 'ios' ? 74 : 62,   // giảm từ 88 → 74/62
              paddingBottom: Platform.OS === 'ios' ? 28 : 16,  // giảm padding
              paddingTop: 10,
              backgroundColor: 'rgba(13, 13, 26, 0.96)',
              borderTopWidth: 0,
              elevation: 0,
              shadowOpacity: 0,
              borderTopColor: 'rgba(255,255,255,0.05)',
            },
            tabBarItemStyle: {
              padding: 0,
              margin: 0,
            },
            tabBarLabelStyle: {
              fontSize: 10.2,
              fontWeight: '700',
              marginTop: 2,
            },
            tabBarActiveTintColor: '#00d4ff',
            tabBarInactiveTintColor: '#555',
          }}
        >
          {/* Các Tab.Screen giữ nguyên như cũ, chỉ thay icon một chút cho gọn */}
          <Tab.Screen
            name="HomeTab"
            component={HomeStackScreen}
            options={{
              tabBarLabel: 'Trang chủ',
            }}
          />

          {/* USER THƯỜNG */}
          {isLoggedIn && !isAdmin && (
            <>
              <Tab.Screen name="Cart" component={CartScreen}
                options={{
                  tabBarLabel: 'Giỏ',
                }}
              />
              <Tab.Screen name="Orders" component={OrderScreen}
                options={{
                  tabBarLabel: 'Đơn',
                }}
              />
            </>
          )}

          {/* ADMIN */}
          {isLoggedIn && isAdmin && (
            <>
              <Tab.Screen name="Revenue" component={RevenueScreen}
                options={{
                  tabBarLabel: 'Thu',
                }}
              />
              <Tab.Screen name="Stats" component={StatsScreen}
                options={{
                  tabBarLabel: 'TKê',
                }}
              />
              <Tab.Screen name="UserManagement" component={UserManagementScreen}
                options={{
                  tabBarLabel: 'User',
                }}
              />
            </>
          )}

          {/* CHƯA LOGIN */}
          {!isLoggedIn && (
            <>
              <Tab.Screen name="SignupSqlite" component={SignupSqlite}
                options={{
                  tabBarLabel: 'Đăng ký',
                }}
              />
              <Tab.Screen name="LoginSqlite" component={LoginSqlite}
                options={{
                  tabBarLabel: 'Login',
                }}
              />
            </>
          )}
        </Tab.Navigator>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1a',
  },
  mainContent: {
    flex: 1,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f0f1a',
  },
  tabIcon: {
    fontSize: 28,
  },
  activeDotContainer: {
    alignItems: 'center',
  },
  activeDot: {
    position: 'absolute',
    top: -12,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00d4ff',
    shadowColor: '#00d4ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 10,
  },
});

export default AppTabs;