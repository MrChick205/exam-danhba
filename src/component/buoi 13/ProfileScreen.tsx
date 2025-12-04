import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect, CommonActions } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HomeStackParamList } from './types';

type ProfileScreenNavigationProp = NativeStackNavigationProp<HomeStackParamList, 'Profile'>;

const ProfileScreen = () => {
  const [user, setUser] = useState<{ username: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false); // thêm loading khi logout
  const navigation = useNavigation<ProfileScreenNavigationProp>();

  // Load user khi vào màn hình
  useFocusEffect(
    useCallback(() => {
      const loadUser = async () => {
        try {
          const data = await AsyncStorage.getItem('loggedInUser');
          setUser(data ? JSON.parse(data) : null);
        } catch (err) {
          console.error('Lỗi load user:', err);
        } finally {
          setLoading(false);
        }
      };
      loadUser();
    }, [])
  );

  // ĐĂNG XUẤT HOÀN CHỈNH
  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất khỏi tài khoản này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: async () => {
            setLoggingOut(true);
            try {
              // Xóa tất cả key liên quan
              await AsyncStorage.multiRemove([
                'loggedInUser',
                'access_token',
                'refresh_token',
              ]);

              setUser(null);

              // Reset stack về tab Home
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{ name: 'HomeTab' }], // Chuyển về HomeTab
                })
              );
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Lỗi', 'Đăng xuất thất bại, vui lòng thử lại.');
            } finally {
              setLoggingOut(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };
  // Loading ban đầu
  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#00d4ff" />
      </View>
    );
  }

  // Chưa đăng nhập
  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.noUser}>Chưa đăng nhập</Text>
        <TouchableOpacity
          style={styles.bigLoginBtn}
          onPress={() => navigation.navigate('LoginSqlite' as any)}
        >
          <Text style={styles.bigLoginText}>Đăng nhập ngay</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isAdmin = user.role === 'admin';

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 60 }}>
      {/* Hero */}
      <View style={styles.hero}>
        <View style={styles.avatarWrapper}>
          <View style={styles.avatar}>
            <Text style={styles.avatarLetter}>
              {user.username.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.onlineRing} />
        </View>

        <Text style={styles.username}>{user.username}</Text>
        <View style={[styles.roleBadge, isAdmin && styles.roleBadgeAdmin]}>
          <Text style={styles.roleText}>
            {isAdmin ? 'QUẢN TRỊ VIÊN' : 'THÀNH VIÊN'}
          </Text>
        </View>
      </View>

      {/* Thông tin tài khoản */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Thông tin tài khoản</Text>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Tên đăng nhập</Text>
          <Text style={styles.value}>{user.username}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Text style={styles.label}>Vai trò</Text>
          <Text style={[styles.value, isAdmin ? styles.adminValue : styles.userValue]}>
            {isAdmin ? 'Admin – Toàn quyền' : 'Thành viên'}
          </Text>
        </View>
      </View>

      {/* Nút hành động */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => navigation.navigate('EditProfile' as any)}
        >
          <Text style={styles.actionText}>Chỉnh sửa thông tin</Text>
        </TouchableOpacity>

        {isAdmin && (
          <TouchableOpacity
            style={[styles.actionBtn, styles.adminBtn]}
            onPress={() => navigation.navigate('AdminDashboard' as any)}
          >
            <Text style={styles.actionText}>Bảng điều khiển Admin</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.actionBtn, styles.logoutBtn]}
          onPress={handleLogout}
          disabled={loggingOut}
        >
          {loggingOut ? (
            <ActivityIndicator color="#ff6b6b" />
          ) : (
            <Text style={styles.logoutText}>Đăng xuất</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Hỗ trợ */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Hỗ trợ</Text>
        {['Liên hệ hỗ trợ', 'Điều khoản dịch vụ', 'Chính sách bảo mật'].map((item) => (
          <TouchableOpacity key={item} style={styles.supportRow}>
            <Text style={styles.supportText}>{item}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.version}>Gundam Store v2.5 • 2025</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0d1a' },
  loading: { flex: 1, backgroundColor: '#0d0d1a', justifyContent: 'center', alignItems: 'center' },

  // Chưa đăng nhập
  noUser: { fontSize: 22, color: '#fff', fontWeight: '700', textAlign: 'center', marginTop: 120 },
  bigLoginBtn: { marginTop: 32, backgroundColor: '#00d4ff', paddingHorizontal: 44, paddingVertical: 18, borderRadius: 32, alignSelf: 'center' },
  bigLoginText: { color: '#000', fontSize: 18, fontWeight: '800' },

  // Hero
  hero: { alignItems: 'center', paddingVertical: 50 },
  avatarWrapper: { position: 'relative', marginBottom: 20 },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#00d4ff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 5,
    borderColor: '#0d0d1a',
  },
  avatarLetter: { fontSize: 48, fontWeight: '900', color: '#000' },
  onlineRing: {
    position: 'absolute',
    top: -6, left: -6, right: -6, bottom: -6,
    borderRadius: 66,
    borderWidth: 4,
    borderColor: '#00d4ff',
    opacity: 0.4,
  },
  username: { fontSize: 30, fontWeight: '900', color: '#fff', marginBottom: 10 },
  roleBadge: { paddingHorizontal: 22, paddingVertical: 9, borderRadius: 30, backgroundColor: 'rgba(255,255,255,0.12)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' },
  roleBadgeAdmin: { backgroundColor: 'rgba(255, 71, 87, 0.18)', borderColor: '#ff4757' },
  roleText: { color: '#fff', fontSize: 14, fontWeight: '800' },

  // Card chung
  card: { marginHorizontal: 18, marginTop: 28, backgroundColor: '#161623', borderRadius: 22, padding: 22, borderWidth: 1, borderColor: '#2a2a3a' },
  cardTitle: { fontSize: 19, fontWeight: '800', color: '#fff', marginBottom: 18 },

  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12 },
  divider: { height: 1, backgroundColor: '#333344', marginVertical: 10 },
  label: { fontSize: 16, color: '#aaaaaa' },
  value: { fontSize: 16.5, fontWeight: '700', color: '#ffffff' },
  adminValue: { color: '#ff6b6b' },
  userValue: { color: '#4ecdc4' },

  // Nút hành động
  actions: { marginHorizontal: 18, marginTop: 32, gap: 14 },
  actionBtn: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    paddingVertical: 20,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#333344',
  },
  adminBtn: {
    backgroundColor: 'rgba(255, 71, 87, 0.12)',
    borderColor: '#ff4757',
  },
  logoutBtn: {
    borderColor: '#ff4757',
  },
  actionText: {
    fontSize: 17.5,
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: 0.2,
  },
  logoutText: {
    color: '#ff6b6b',
    fontWeight: '700',
    fontSize: 17.5,
  },

  // Hỗ trợ
  supportRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a3a',
  },
  supportText: { fontSize: 16.5, color: '#e0e0e0' },

  version: { textAlign: 'center', marginTop: 50, color: '#666680', fontSize: 13.5, fontWeight: '600' },
});

export default ProfileScreen;