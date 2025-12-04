import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import theme from './theme';
import { getOrders } from './database';

interface Order {
  id: number;
  orderId: string;
  totalPrice: number;
  itemCount: number;
  createdAt: string;
  status: 'pending' | 'completed' | 'cancelled';
}

type NavigationProp = NativeStackNavigationProp<any>;

const OrderScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed' | 'cancelled'>('all');

  useFocusEffect(
    useCallback(() => {
      loadOrders();
      return () => {};
    }, []),
  );

  useEffect(() => {
    // Lọc orders theo trạng thái
    if (statusFilter === 'all') {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter(o => o.status === statusFilter));
    }
  }, [statusFilter, orders]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const userData = await AsyncStorage.getItem('loggedInUser');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        if (parsedUser?.id) {
          const dbOrders = await getOrders(parsedUser.id);
          setOrders(dbOrders);
        }
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return theme.colors.success;
      case 'pending':
        return theme.colors.warning;
      case 'cancelled':
        return theme.colors.accent;
      default:
        return theme.colors.muted;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Đã giao';
      case 'pending':
        return 'Đang xử lý';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  const renderOrderItem = ({ item }: { item: Order }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View style={styles.orderInfo}>
          <Text style={styles.orderId}>Đơn #{item.orderId}</Text>
          <Text style={styles.orderDate}>{item.createdAt}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) },
          ]}
        >
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>
      <View style={styles.orderDetails}>
        <Text style={styles.detailText}>
          Số lượng:{' '}
          <Text style={styles.detailValue}>{item.itemCount} sản phẩm</Text>
        </Text>
        <Text style={styles.detailText}>
          Tổng tiền:{' '}
          <Text style={styles.detailValue}>
            {item.totalPrice.toLocaleString()} đ
          </Text>
        </Text>
        {item.status === 'pending' && (
          <Text style={styles.canCancelText}>✓ Có thể hủy đơn</Text>
        )}
      </View>
      <TouchableOpacity
        style={styles.detailButton}
        onPress={() => navigation.navigate('OrderDetail', { order: item })}
      >
        <Text style={styles.detailButtonText}>Xem chi tiết →</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📦 Đơn Hàng</Text>
        <Text style={styles.orderCount}>{orders.length} đơn hàng</Text>

        {/* Filter buttons */}
        <View style={styles.filterContainer}>
          {['all', 'pending', 'completed', 'cancelled'].map(status => (
            <TouchableOpacity
              key={status}
              style={[
                styles.filterButton,
                statusFilter === status && styles.filterButtonActive,
              ]}
              onPress={() => setStatusFilter(status as any)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  statusFilter === status && styles.filterButtonTextActive,
                ]}
              >
                {status === 'all'
                  ? 'Tất cả'
                  : status === 'pending'
                  ? 'Đang xử lý'
                  : status === 'completed'
                  ? 'Đã giao'
                  : 'Đã hủy'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Orders list */}
      {loading ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Đang tải...</Text>
        </View>
      ) : filteredOrders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Chưa có đơn hàng nào</Text>
          <Text style={styles.emptySubtext}>
            Mua sắm ngay để có đơn hàng đầu tiên
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={item => item.id.toString()}
          renderItem={renderOrderItem}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    backgroundColor: theme.colors.card,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    ...theme.shadows.sm,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  orderCount: {
    fontSize: 13,
    color: theme.colors.muted,
    marginTop: theme.spacing.xs,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.colors.muted,
  },
  listContainer: {
    padding: theme.spacing.md,
  },
  orderCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    borderBottomColor: theme.colors.border,
    borderBottomWidth: 1,
  },
  orderInfo: {
    flex: 1,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  orderDate: {
    fontSize: 12,
    color: theme.colors.muted,
    marginTop: theme.spacing.xs,
  },
  statusBadge: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  statusText: {
    color: theme.colors.textOnPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  orderDetails: {
    marginBottom: theme.spacing.md,
  },
  detailText: {
    fontSize: 13,
    color: theme.colors.muted,
    marginBottom: theme.spacing.sm,
  },
  detailValue: {
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  canCancelText: {
    fontSize: 12,
    color: theme.colors.success,
    fontWeight: '600',
    marginTop: theme.spacing.sm,
  },
  detailButton: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  detailButtonText: {
    color: theme.colors.textOnPrimary,
    fontWeight: '600',
    fontSize: 13,
  },
  filterContainer: {
    flexDirection: 'row',
    marginTop: theme.spacing.sm,
  },
  filterButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    marginHorizontal: 4,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  filterButtonText: {
    fontSize: 13,
    color: theme.colors.textPrimary,
  },
  filterButtonTextActive: {
    color: theme.colors.textOnPrimary,
    fontWeight: '700',
  },
});

export default OrderScreen;
