import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HomeStackParamList } from './types';
import { updateUser } from './database';
import theme from './theme';

type EditProfileNavigationProp = NativeStackNavigationProp<
  HomeStackParamList,
  'EditProfile'
>;

interface UserProfile {
  id: number;
  username: string;
  password: string;
  role: string;
}

const EditProfileScreen = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [username, setUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigation = useNavigation<EditProfileNavigationProp>();

  useFocusEffect(
    useCallback(() => {
      const loadUser = async () => {
        try {
          const loggedInUser = await AsyncStorage.getItem('loggedInUser');
          if (loggedInUser) {
            const userData = JSON.parse(loggedInUser);
            setUser(userData);
            setUsername(userData.username);
          }
        } catch (err) {
          console.error('Error loading user:', err);
        } finally {
          setLoading(false);
        }
      };
      loadUser();
    }, []),
  );

  const handleSaveChanges = async () => {
    // Validation
    if (!username.trim()) {
      Alert.alert('Lỗi', 'Tên người dùng không được để trống');
      return;
    }

    if (username.trim().length < 3) {
      Alert.alert('Lỗi', 'Tên người dùng phải có ít nhất 3 ký tự');
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
      return;
    }

    if (newPassword && newPassword.length < 6) {
      Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    setSaving(true);
    try {
      const updatedUser: UserProfile = {
        ...user!,
        username: username.trim(),
        password: newPassword || user!.password,
      };

      await updateUser(updatedUser);

      // Update AsyncStorage
      await AsyncStorage.setItem('loggedInUser', JSON.stringify(updatedUser));

      Alert.alert('Thành công', 'Thông tin cá nhân đã được cập nhật', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật thông tin cá nhân');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.noUserText}>Vui lòng đăng nhập</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>✏️ Chỉnh Sửa Thông Tin</Text>
        <Text style={styles.headerSubtitle}>
          Cập nhật tên hoặc mật khẩu của bạn
        </Text>
      </View>

      {/* Avatar */}
      <View style={styles.avatarSection}>
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarText}>
            {username.charAt(0).toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Form */}
      <View style={[styles.formCard, { backgroundColor: theme.colors.card }]}>
        {/* Username Section */}
        <Text style={styles.sectionTitle}>Tên Người Dùng</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.colors.background }]}
          placeholder="Nhập tên người dùng"
          placeholderTextColor={theme.colors.muted}
          value={username}
          onChangeText={setUsername}
          editable={!saving}
        />
        <Text style={styles.helperText}>Tối thiểu 3 ký tự</Text>

        <View style={styles.divider} />

        {/* Password Section */}
        <Text style={styles.sectionTitle}>Đổi Mật Khẩu (Tùy Chọn)</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.colors.background }]}
          placeholder="Mật khẩu mới"
          placeholderTextColor={theme.colors.muted}
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
          editable={!saving}
        />
        <Text style={styles.helperText}>
          Để trống nếu không muốn đổi mật khẩu
        </Text>

        <TextInput
          style={[styles.input, { backgroundColor: theme.colors.background }]}
          placeholder="Xác nhận mật khẩu"
          placeholderTextColor={theme.colors.muted}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          editable={!saving}
        />
        <Text style={styles.helperText}>Nhập lại mật khẩu để xác nhận</Text>

        <View style={styles.divider} />

        {/* Account Info */}
        <Text style={styles.sectionTitle}>Thông Tin Tài Khoản</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Vai Trò:</Text>
          <Text style={[styles.infoValue, { color: theme.colors.primary }]}>
            {user.role === 'admin' ? '👨‍💼 Admin' : '👤 Người Dùng'}
          </Text>
        </View>
        <Text style={styles.helperText}>Liên hệ admin để thay đổi vai trò</Text>
      </View>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.colors.primary }]}
          onPress={handleSaveChanges}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={[styles.buttonText, { color: 'white' }]}>
              💾 Lưu Thay Đổi
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor: theme.colors.background,
              borderWidth: 1,
              borderColor: theme.colors.border,
            },
          ]}
          onPress={() => navigation.goBack()}
          disabled={saving}
        >
          <Text
            style={[styles.buttonText, { color: theme.colors.textPrimary }]}
          >
            ❌ Hủy
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  contentContainer: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.lg,
    paddingBottom: 40,
  },
  header: {
    marginBottom: theme.spacing.lg,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  headerSubtitle: {
    fontSize: 13,
    color: theme.colors.muted,
    marginTop: theme.spacing.xs,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: '700',
    color: theme.colors.textOnPrimary,
  },
  formCard: {
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  input: {
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    fontSize: 14,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  helperText: {
    fontSize: 12,
    color: theme.colors.muted,
    marginBottom: theme.spacing.md,
    marginTop: -theme.spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.sm,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.muted,
  },
  buttonContainer: {
    gap: theme.spacing.md,
  },
  button: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  noUserText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginTop: 32,
  },
});

export default EditProfileScreen;
