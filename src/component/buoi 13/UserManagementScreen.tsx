import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import theme from './theme';
import { HomeStackParamList } from './types';
import { fetchUsers, updateUser, deleteUser } from './database';

type NavigationProp = NativeStackNavigationProp<
  HomeStackParamList,
  'UserManagement'
>;

interface User {
  id: number;
  username: string;
  role: string;
}

const UserManagementScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingIds, setUpdatingIds] = useState<number[]>([]);
  const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'user'>('all'); // thêm state filter

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchUsers();
      setUsers(data as User[]);
    } catch (error) {
      console.error('❌ Error loading users:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const toggleRole = async (user: User) => {
    if (updatingIds.includes(user.id)) return;
    const newRole = user.role === 'admin' ? 'user' : 'admin';

    Alert.alert(
      'Xác nhận',
      `Thay đổi vai trò của ${user.username} thành ${newRole}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xác nhận',
          onPress: async () => {
            setUpdatingIds(prev => [...prev, user.id]);
            try {
              await updateUser({ ...user, role: newRole });
              Alert.alert('Thành công', `${user.username} đã thành ${newRole}`);
              await loadUsers();
            } catch (error) {
              console.error('❌ Error updating role:', error);
              Alert.alert('Lỗi', 'Không thể cập nhật vai trò');
            } finally {
              setUpdatingIds(prev => prev.filter(id => id !== user.id));
            }
          },
        },
      ],
    );
  };

  const handleDeleteUser = (user: User) => {
    Alert.alert('Xác nhận xóa', `Xóa tài khoản ${user.username}?`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteUser(user.id);
            Alert.alert('Thành công', 'Người dùng đã bị xóa');
            await loadUsers();
          } catch (error) {
            console.error('❌ Error deleting user:', error);
            Alert.alert('Lỗi', 'Không thể xóa người dùng');
          }
        },
      },
    ]);
  };

  const filteredUsers = users.filter(user =>
    filterRole === 'all' ? true : user.role === filterRole
  );

  const renderUser = ({ item }: { item: User }) => (
    <View style={styles.userCard}>
      <View style={styles.userInfo}>
        <Text style={styles.username}>{item.username}</Text>
        <Text style={styles.metaText}>
          Vai trò: {item.role === 'admin' ? '👨‍💼 Admin' : '👤 Người dùng'}
        </Text>
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[styles.secondaryButton, updatingIds.includes(item.id) && styles.disabledButton]}
          onPress={() => toggleRole(item)}
          disabled={updatingIds.includes(item.id)}
        >
          <Text style={styles.buttonLabel}>
            {item.role === 'admin' ? 'Hạ xuống' : 'Nâng lên'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteUser(item)}>
          <Text style={styles.deleteButtonText}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Quản lý người dùng</Text>
        <Text style={styles.subtitle}>
          Theo dõi đơn hàng, vai trò và doanh thu từng tài khoản
        </Text>
      </View>

      {/* Filter theo role */}
      <View style={styles.filterRow}>
        {(['all', 'admin', 'user'] as const).map(role => (
          <TouchableOpacity
            key={role}
            style={[
              styles.filterButton,
              filterRole === role && styles.filterButtonActive,
            ]}
            onPress={() => setFilterRole(role)}
          >
            <Text
              style={[
                styles.filterText,
                filterRole === role && styles.filterTextActive,
              ]}
            >
              {role === 'all' ? 'Tất cả' : role === 'admin' ? 'Admin' : 'User'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.emptyState}>
          <Text style={styles.loadingText}>Đang tải người dùng...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          keyExtractor={item => item.id.toString()}
          renderItem={renderUser}
          contentContainerStyle={filteredUsers.length === 0 ? styles.emptyState : undefined}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Chưa có người dùng đăng ký</Text>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: theme.spacing.md, backgroundColor: theme.colors.background },
  header: { marginBottom: theme.spacing.lg },
  title: { fontSize: 24, fontWeight: '700', color: theme.colors.primary },
  subtitle: { fontSize: 13, color: theme.colors.muted, marginTop: theme.spacing.xs },
  filterRow: { flexDirection: 'row', marginBottom: theme.spacing.md, gap: theme.spacing.sm },
  filterButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.card,
    alignItems: 'center',
  },
  filterButtonActive: { backgroundColor: theme.colors.primary },
  filterText: { color: theme.colors.textPrimary, fontWeight: '600' },
  filterTextActive: { color: '#fff' },
  userCard: { backgroundColor: theme.colors.card, borderRadius: theme.borderRadius.lg, padding: theme.spacing.md, marginBottom: theme.spacing.md, ...theme.shadows.sm },
  userInfo: { marginBottom: theme.spacing.md },
  username: { fontSize: 18, fontWeight: '700', color: theme.colors.textPrimary },
  metaText: { fontSize: 12, color: theme.colors.muted, marginTop: theme.spacing.xs / 2 },
  actionsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: theme.spacing.sm },
  deleteButton: { width: 45, height: 45, backgroundColor: theme.colors.accent, borderRadius: theme.borderRadius.md, alignItems: 'center', justifyContent: 'center' },
  deleteButtonText: { fontSize: 20 },
  secondaryButton: { flex: 1, backgroundColor: theme.colors.secondary, borderRadius: theme.borderRadius.md, paddingVertical: theme.spacing.sm, alignItems: 'center' },
  buttonLabel: { color: theme.colors.primary, fontWeight: '600', fontSize: 13 },
  disabledButton: { opacity: 0.6 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: theme.colors.muted },
  emptyText: { color: theme.colors.muted, textAlign: 'center' },
});

export default UserManagementScreen;
