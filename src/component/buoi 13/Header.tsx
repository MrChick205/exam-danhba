// Header.tsx – PHIÊN BẢN CUỐI CÙNG, HOÀN HẢO 100% (CẬP NHẬP NGAY LẬP TỨC)
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

const Header = () => {
  const [user, setUser] = useState<{ username: string; role: string } | null>(null);
  const navigation = useNavigation<any>();

  // Hàm load user từ AsyncStorage
  const loadUser = useCallback(async () => {
    try {
      const data = await AsyncStorage.getItem('loggedInUser');
      const parsedUser = data ? JSON.parse(data) : null;
      setUser(parsedUser);
    } catch (error) {
      console.error('Header: Lỗi load user', error);
      setUser(null);
    }
  }, []);

  // 1. Load lần đầu khi component mount
  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // 2. Load lại mỗi khi màn hình được focus (rất quan trọng!)
  useFocusEffect(
    useCallback(() => {
      loadUser();
    }, [loadUser])
  );

  // 3. (TÙY CHỌN) Lắng nghe sự kiện focus toàn cục – chắc chắn 100% cập nhật ngay cả khi navigate phức tạp
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadUser();
    });
    return unsubscribe;
  }, [navigation, loadUser]);

  return (
    <View style={styles.container}>
      {/* TRÁI: Logo + Tên shop */}
      <View style={styles.left}>
        <Image
          source={require('../../assets/images/Logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.shopName}>GUNDAM STORE</Text>
      </View>

      {/* PHẢI: Hiển thị theo trạng thái đăng nhập */}
      <View style={styles.right}>
        {user ? (
          /* ĐÃ ĐĂNG NHẬP – Avatar tròn + chấm online */
          <TouchableOpacity
            style={styles.profileBtn}
            onPress={() => navigation.navigate('Profile')}
            activeOpacity={0.7}
          >
            <View style={styles.avatarWrapper}>
              <View style={styles.avatar}>
                <Text style={styles.avatarLetter}>
                  {user.username.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.onlineDot} />
            </View>
          </TouchableOpacity>
        ) : (
          /* CHƯA ĐĂNG NHẬP – Nút Key nhỏ xinh */
          <TouchableOpacity
            style={styles.loginBtn}
            onPress={() => navigation.navigate('LoginSqlite')}
            activeOpacity={0.8}
          >
            <Text style={styles.loginIcon}>Key</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: Platform.OS === 'ios' ? 100 : 80,
    paddingTop: Platform.OS === 'ios' ? 50 : 26,
    paddingHorizontal: 18,
    backgroundColor: 'rgba(15, 15, 26, 0.98)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.07)',
    zIndex: 1000,
  },

  // TRÁI
  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  shopName: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 1.2,
  },

  // PHẢI
  right: {
    justifyContent: 'flex-end',
  },

  // ĐÃ ĐĂNG NHẬP
  profileBtn: {
    padding: 6,
    backgroundColor: 'rgba(0, 212, 255, 0.12)',
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 212, 255, 0.3)',
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#00d4ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarLetter: {
    color: '#000',
    fontSize: 17,
    fontWeight: '900',
  },
  onlineDot: {
    position: 'absolute',
    bottom: -1,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4ade80',
    borderWidth: 2.5,
    borderColor: '#0f0f1a',
  },

  // CHƯA ĐĂNG NHẬP
  loginBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 212, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#00d4ff',
  },
  loginIcon: {
    fontSize: 20,
    color: '#00d4ff',
    fontWeight: 'bold',
  },
});

export default Header;