import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation, useFocusEffect, RouteProp } from '@react-navigation/native';
import theme from './theme';
import { HomeStackParamList } from './types';
import {
  fetchOrdersWithUsers,
  OrderWithUser,
  updateOrderStatus,
} from './database';

type AdminOrdersRouteProp = RouteProp<HomeStackParamList, 'AdminOrders'>;
type NavigationProp = NativeStackNavigationProp<HomeStackParamList>;

const AdminOrdersScreen = ({ route }: { route: AdminOrdersRouteProp }) => {
  const navigation = useNavigation<NavigationProp>();
  const { userId, username } = route.params || {};
  const [orders, setOrders] = useState<OrderWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'pending' | 'completed' | 'cancelled'
  >('all');
  const [processingOrderId, setProcessingOrderId] = useState<number | null>(
    null,
  );

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchOrdersWithUsers(userId);
      setOrders(data);
    } catch (error) {
      console.error('❌ Error loading orders:', error);
      Alert.alert('Lỗi', 'Không thể tải đơn hàng');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useFocusEffect(
    React.useCallback(() => {
      loadOrders();
    }, [loadOrders]),
  );

  const formatCurrency = (value: number) =>
    value.toLocaleString('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    });

  const formatDate = (value: string) => {
    try {
      return new Date(value).toLocaleString('vi-VN');
    } catch {
      return value;
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

  const statusTabs = [
    { label: 'Tất cả', value: 'all' },
    { label: 'Đang xử lý', value: 'pending' },
    { label: 'Hoàn tất', value: 'completed' },
    { label: 'Đã hủy', value: 'cancelled' },
  ] as const;

  const filteredOrders =
    statusFilter === 'all'
      ? orders
      : orders.filter(order => order.status === statusFilter);

  const handleStatusChange = (
    order: OrderWithUser,
    targetStatus: 'completed' | 'cancelled',
  ) => {
    const title =
      targetStatus === 'completed' ? 'Hoàn tất đơn hàng' : 'Hủy đơn hàng';
    const message =
      targetStatus === 'completed'
        ? 'Bạn có muốn đánh dấu đơn là đã giao?'
        : 'Bạn có muốn hủy đơn này không?';
    Alert.alert(title, message, [
      { text: 'Không', style: 'cancel' },
      {
        text: 'Xác nhận',
        onPress: async () => {
          setProcessingOrderId(order.id);
          try {
            await updateOrderStatus(order.id, targetStatus);
            Alert.alert('Thành công', 'Trạng thái đơn hàng đã được cập nhật');
            await loadOrders();
          } catch (error) {
            console.error('❌ Error updating status:', error);
            Alert.alert('Lỗi', 'Không thể cập nhật trạng thái');
          } finally {
            setProcessingOrderId(null);
          }
        },
      },
    ]);
  };

  const renderOrderItem = ({ item }: { item: OrderWithUser }) => (
    <View style={styles.orderCard}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.orderId}>#{item.orderId}</Text>
          <Text style={styles.subText}>{formatDate(item.createdAt)}</Text>
          <Text style={styles.subText}>
            Người dùng: {item.username || 'Không xác định'}
          </Text>
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

      <View style={styles.orderBody}>
        <Text style={styles.detailText}>
          Tổng tiền:{' '}
          <Text style={styles.detailValue}>{formatCurrency(item.totalPrice)}</Text>
        </Text>
        <Text style={styles.detailText}>
          Số sản phẩm:{' '}
          <Text style={styles.detailValue}>{item.itemCount}</Text>
        </Text>
      </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.detailButton}
            onPress={() =>
              navigation.navigate('OrderDetail', { order: item, isAdmin: true })
            }
          >
            <Text style={styles.detailButtonText}>Xem chi tiết</Text>
          </TouchableOpacity>
          <View style={styles.statusButtons}>
            {item.status !== 'completed' && (
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  processingOrderId === item.id && styles.disabledButton,
                ]}
                onPress={() => handleStatusChange(item, 'completed')}
                disabled={processingOrderId === item.id}
              >
                <Text style={styles.actionText}>Hoàn tất</Text>
              </TouchableOpacity>
            )}
            {item.status !== 'cancelled' && (
              <TouchableOpacity
                style={[
                  styles.actionButtonOutline,
                  processingOrderId === item.id && styles.disabledButton,
                ]}
                onPress={() => handleStatusChange(item, 'cancelled')}
                disabled={processingOrderId === item.id}
              >
                <Text style={styles.actionTextOutline}>Hủy</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>
            {userId
              ? `Đơn hàng của ${username ?? 'người dùng'}`
              : 'Đơn hàng người dùng'}
          </Text>
          <Text style={styles.subtitle}>
            {filteredOrders.length} / {orders.length} đơn •{' '}
            {userId ? 'Lọc theo tài khoản' : 'Tất cả đơn hàng'}
          </Text>
        </View>

        <TouchableOpacity style={styles.refreshButton} onPress={loadOrders}>
          <Text style={styles.refreshText}>Làm mới</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filterRow}>
        {statusTabs.map(tab => (
          <TouchableOpacity
            key={tab.value}
            style={[
              styles.filterChip,
              statusFilter === tab.value && styles.filterChipActive,
            ]}
            onPress={() => setStatusFilter(tab.value)}
          >
            <Text
              style={[
                styles.filterChipText,
                statusFilter === tab.value && styles.filterChipTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.emptyState}>
          <Text style={styles.loadingText}>Đang tải đơn hàng...</Text>
        </View>
      ) : orders.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Chưa có đơn hàng trong danh sách</Text>
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
    padding: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  subtitle: {
    fontSize: 13,
    color: theme.colors.muted,
  },
  refreshButton: {
    backgroundColor: theme.colors.card,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  refreshText: {
    fontWeight: '600',
    color: theme.colors.primary,
  },
  listContainer: {
    paddingBottom: theme.spacing.xl,
  },
  orderCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  subText: {
    fontSize: 12,
    color: theme.colors.muted,
  },
  statusBadge: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: theme.colors.textOnPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  orderBody: {
    marginBottom: theme.spacing.sm,
  },
  detailText: {
    fontSize: 13,
    color: theme.colors.muted,
    marginBottom: theme.spacing.xs,
  },
  detailValue: {
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  detailButton: {
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primary,
  },
  detailButtonText: {
    color: theme.colors.textOnPrimary,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: theme.colors.muted,
  },
  emptyText: {
    color: theme.colors.muted,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: theme.spacing.md,
  },
  filterChip: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: 'transparent',
    backgroundColor: theme.colors.card,
    marginRight: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  filterChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterChipText: {
    fontSize: 12,
    color: theme.colors.textPrimary,
  },
  filterChipTextActive: {
    color: theme.colors.textOnPrimary,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  statusButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.success,
    marginLeft: theme.spacing.sm,
  },
  actionButtonOutline: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.accent,
    backgroundColor: 'transparent',
    marginLeft: theme.spacing.sm,
  },
  actionText: {
    color: theme.colors.textOnPrimary,
    fontWeight: '600',
  },
  actionTextOutline: {
    color: theme.colors.accent,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default AdminOrdersScreen;

