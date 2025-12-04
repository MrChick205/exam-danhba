import React, { useEffect, useState } from 'react';
import {
  Alert,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ScrollView,
} from 'react-native';
import {
  initDatabase,
  fetchAllCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  Category,
} from './database';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import theme from './theme';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

type NavigationProp = NativeStackNavigationProp<any>;

const AdminCategory = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const navigation = useNavigation<NavigationProp>();

  useFocusEffect(
    useCallback(() => {
      loadData(); // reload categories + products
    }, [])
  );

  const loadData = async () => {
    const cats = await fetchAllCategories();
    setCategories(cats.reverse());
  };

  const handleAddOrUpdate = async () => {
    if (!name) return;

    try {
      if (editingId !== null) {
        await updateCategory({ id: editingId, name });
        setEditingId(null);
      } else {
        await addCategory(name);
      }
      setName('');
      loadData();
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  const handleEdit = (id: number) => {
    const cat = categories.find(x => x.id === id);
    if (cat) {
      setName(cat.name);
      setEditingId(cat.id);
    }
  };

  const handleDelete = (id: number) => {
    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc chắn muốn xóa loại sản phẩm này không?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log(`🔄 Attempting to delete category with id: ${id}`);
              const result = await deleteCategory(id);
              console.log(`📋 Delete result:`, result);

              if (result.ok) {
                Alert.alert('Đã xóa', 'Loại sản phẩm đã được xóa.');
                loadData();
              } else {
                Alert.alert(
                  'Lỗi',
                  `Không thể xóa: ${result.error || 'Lỗi không xác định'}`,
                );
              }
            } catch (err) {
              console.error('❌ Delete error:', err);
              Alert.alert('Lỗi', `Lỗi: ${String(err)}`);
            }
          },
        },
      ],
      { cancelable: true },
    );
  };

  const renderItem = ({ item }: { item: Category }) => (
    <View style={styles.card}>
      <Text style={styles.categoryName}>{item.name}</Text>
      <View style={styles.iconRow}>
        <TouchableOpacity onPress={() => handleEdit(item.id)}>
          <Text style={styles.icon}>✏️</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item.id)}>
          <Text style={styles.icon}>❌</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Quản lý loại sản phẩm</Text>
      <TextInput
        style={styles.input}
        placeholder="Tên loại sản phẩm"
        value={name}
        onChangeText={setName}
      />
      <TouchableOpacity style={styles.button} onPress={handleAddOrUpdate}>
        <Text style={styles.buttonText}>
          {editingId ? 'Cập nhật loại' : 'Thêm loại'}
        </Text>
      </TouchableOpacity>
      <FlatList
        data={categories}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center' }}>Không có loại nào</Text>
        }
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.lg,
    paddingBottom: 100,
    backgroundColor: theme.colors.background,
    flex: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
    color: theme.colors.primary,
  },
  input: {
    height: 48,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.card,
    fontSize: 15,
    color: theme.colors.textPrimary,
  },
  button: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    ...theme.shadows.md,
  },
  buttonText: {
    color: theme.colors.textOnPrimary,
    fontWeight: '700',
    fontSize: 15,
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.card,
    ...theme.shadows.sm,
  },
  categoryName: {
    flex: 1,
    fontWeight: '600',
    fontSize: 15,
    color: theme.colors.textPrimary,
  },
  iconRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  icon: {
    fontSize: 22,
    paddingHorizontal: theme.spacing.sm,
  },
});

export default AdminCategory;
