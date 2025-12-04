import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getOrderItems, updateOrderStatus } from './database';
import { getImageSource } from './imageUtils';
import theme from './theme';

interface OrderItem {
  id: number;
  productId: number;
  quantity: number;
  price: number;
  name: string;
  img: string;
}

interface Order {
  id: number;
  orderId: string;
  totalPrice: number;
  itemCount: number;
  createdAt: string;
  status: 'pending' | 'completed' | 'cancelled';
  username?: string | null;
}

type RootStackParamList = {
  OrderDetail: { order: Order; isAdmin?: boolean };
};

type OrderDetailRouteProp = RouteProp<RootStackParamList, 'OrderDetail'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const OrderDetailScreen = () => {
  const route = useRoute<OrderDetailRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { order, isAdmin = false } = route.params;

  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentOrder, setCurrentOrder] = useState<Order>(order);
  const [statusUpdating, setStatusUpdating] = useState(false);

  useEffect(() => {
    loadOrderItems();
  }, []);

  const loadOrderItems = async () => {
    try {
      setLoading(true);
      const orderItems = await getOrderItems(order.id);
      setItems(orderItems);
    } catch (error) {
      console.error('Error loading order items:', error);
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

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const changeOrderStatus = async (
    newStatus: 'completed' | 'cancelled',
    successMessage: string,
  ) => {
    try {
      setStatusUpdating(true);
      await updateOrderStatus(currentOrder.id, newStatus);
      setCurrentOrder(prev => ({ ...prev, status: newStatus }));
      Alert.alert('Thành công', successMessage);
    } catch (error) {
      console.error('Error updating order status:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật trạng thái');
    } finally {
      setStatusUpdating(false);
    }
  };

  const confirmStatusChange = (
    targetStatus: 'completed' | 'cancelled',
    title: string,
    message: string,
    successMessage: string,
  ) => {
    Alert.alert(title, message, [
      { text: 'Không', style: 'cancel' },
      {
        text: 'Xác nhận',
        style: targetStatus === 'cancelled' ? 'destructive' : 'default',
        onPress: () => changeOrderStatus(targetStatus, successMessage),
      },
    ]);
  };

  const handleCancelOrder = () => {
    confirmStatusChange(
      'cancelled',
      'Hủy đơn hàng',
      'Bạn có chắc chắn muốn hủy đơn hàng này không?',
      'Đơn hàng đã được hủy',
    );
  };

  const handleAdminComplete = () => {
    confirmStatusChange(
      'completed',
      'Hoàn tất đơn hàng',
      'Bạn có muốn đánh dấu đơn là đã giao?',
      'Đơn hàng đã được đánh dấu là đã giao',
    );
  };

  const handleAdminCancel = () => {
    confirmStatusChange(
      'cancelled',
      'Hủy đơn hàng',
      'Bạn có chắc chắn muốn hủy đơn hàng này không?',
      'Đơn hàng đã được hủy',
    );
  };

  const renderItem = ({ item }: { item: OrderItem }) => (
    <View style={styles.itemCard}>
      <Image source={getImageSource(item.img)} style={styles.itemImage} />
      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.itemQuantity}>Số lượng: {item.quantity}</Text>
        <Text style={styles.itemPrice}>
          {(item.price * item.quantity).toLocaleString()} đ
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Order Header */}
        <View style={styles.header}>
          <View style={styles.orderInfoSection}>
            <Text style={styles.orderId}>Đơn hàng #{currentOrder.orderId}</Text>
            <Text style={styles.orderDate}>
              {formatDate(currentOrder.createdAt)}
            </Text>
            {isAdmin && (
              <Text style={styles.customerInfo}>
                Khách hàng:{' '}
                {currentOrder.username ? currentOrder.username : 'Ẩn danh'}
              </Text>
            )}
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(currentOrder.status) },
            ]}
          >
            <Text style={styles.statusText}>
              {getStatusText(currentOrder.status)}
            </Text>
          </View>
        </View>

        {/* Order Summary */}
        <View style={styles.summarySection}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Số lượng sản phẩm:</Text>
            <Text style={styles.summaryValue}>{currentOrder.itemCount}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tổng tiền:</Text>
            <Text style={styles.summaryValue}>
              {currentOrder.totalPrice.toLocaleString()} đ
            </Text>
          </View>
        </View>

        {/* Items List */}
        <View style={styles.itemsSection}>
          <Text style={styles.sectionTitle}>Chi tiết sản phẩm</Text>
          {loading ? (
            <Text style={styles.loadingText}>Đang tải...</Text>
          ) : items.length === 0 ? (
            <Text style={styles.emptyText}>Không có sản phẩm nào</Text>
          ) : (
            <FlatList
              data={items}
              keyExtractor={item => item.id.toString()}
              renderItem={renderItem}
              scrollEnabled={false}
            />
          )}
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.footer}>
        {isAdmin && (
          <View style={styles.adminActions}>
            {currentOrder.status !== 'completed' && (
              <TouchableOpacity
                style={[
                  styles.adminButton,
                  statusUpdating && styles.buttonDisabled,
                ]}
                onPress={handleAdminComplete}
                disabled={statusUpdating}
              >
                <Text style={styles.adminButtonText}>
                  {statusUpdating ? 'Đang cập nhật...' : '✅ Hoàn tất'}
                </Text>
              </TouchableOpacity>
            )}
            {currentOrder.status !== 'cancelled' && (
              <TouchableOpacity
                style={[
                  styles.adminButtonOutline,
                  statusUpdating && styles.buttonDisabled,
                ]}
                onPress={handleAdminCancel}
                disabled={statusUpdating}
              >
                <Text style={styles.adminButtonTextOutline}>❌ Hủy</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        {!isAdmin && currentOrder.status === 'pending' && (
          <TouchableOpacity
            style={[
              styles.cancelButton,
              statusUpdating && styles.buttonDisabled,
            ]}
            onPress={handleCancelOrder}
            disabled={statusUpdating}
          >
            <Text style={styles.cancelButtonText}>
              {statusUpdating ? 'Đang hủy...' : '❌ Hủy đơn hàng'}
            </Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Quay lại</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    backgroundColor: theme.colors.card,
    padding: theme.spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    ...theme.shadows.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  orderInfoSection: {
    flex: 1,
  },
  orderId: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
  },
  orderDate: {
    fontSize: 13,
    color: theme.colors.muted,
  },
  customerInfo: {
    fontSize: 12,
    color: theme.colors.muted,
    marginTop: theme.spacing.xs,
  },
  statusBadge: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  statusText: {
    color: theme.colors.textOnPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  summarySection: {
    backgroundColor: theme.colors.card,
    margin: theme.spacing.md,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  summaryLabel: {
    fontSize: 14,
    color: theme.colors.muted,
    fontWeight: '600',
  },
  summaryValue: {
    fontSize: 16,
    color: theme.colors.textPrimary,
    fontWeight: '700',
  },
  itemsSection: {
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.primary,
    marginBottom: theme.spacing.md,
  },
  adminActions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  adminButton: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.success,
    marginRight: theme.spacing.sm,
  },
  adminButtonOutline: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.accent,
    backgroundColor: 'transparent',
  },
  adminButtonText: {
    color: theme.colors.textOnPrimary,
    fontWeight: '600',
  },
  adminButtonTextOutline: {
    color: theme.colors.accent,
    fontWeight: '600',
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.md,
    marginRight: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
  itemInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  itemQuantity: {
    fontSize: 13,
    color: theme.colors.muted,
    marginBottom: theme.spacing.sm,
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.secondary,
  },
  loadingText: {
    textAlign: 'center',
    color: theme.colors.muted,
    paddingVertical: theme.spacing.lg,
  },
  emptyText: {
    textAlign: 'center',
    color: theme.colors.muted,
    paddingVertical: theme.spacing.lg,
  },
  footer: {
    backgroundColor: theme.colors.card,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    ...theme.shadows.lg,
    gap: theme.spacing.md,
  },
  cancelButton: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.accent,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: theme.colors.textOnPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  backButton: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  backButtonText: {
    color: theme.colors.textOnPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});

export default OrderDetailScreen;
