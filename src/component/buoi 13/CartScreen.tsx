import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import theme from './theme';
import { getImageSource } from './imageUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Product,
  getCartItems,
  updateCartItem,
  clearCart,
  createOrder,
} from './database';
import { useFocusEffect } from '@react-navigation/native';

interface CartItem extends Product {
  quantity: number;
  id: number;
  productId?: number;
}

const CartScreen = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      loadCart();
      return () => {};
    }, []),
  );

  const loadCart = async () => {
    try {
      const userData = await AsyncStorage.getItem('loggedInUser');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        // Load from database if user is logged in
        if (parsedUser?.id) {
          const dbCartItems = await getCartItems(parsedUser.id);
          setCartItems(dbCartItems);
        }
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  };

  const updateQuantity = async (itemId: number, quantity: number) => {
    if (quantity < 1) {
      removeItem(itemId);
      return;
    }

    setCartItems(prev =>
      prev.map(item =>
        item.id === itemId
          ? { ...item, quantity: Math.max(1, quantity) }
          : item,
      ),
    );

    await updateCartItem(itemId, quantity);
  };

  const removeItem = async (itemId: number) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
    await updateCartItem(itemId, 0);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      Alert.alert(
        'Giỏ hàng trống',
        'Vui lòng thêm sản phẩm trước khi thanh toán',
      );
      return;
    }

    if (!user?.id) {
      Alert.alert('Lỗi', 'Vui lòng đăng nhập để đặt hàng');
      return;
    }

    const totalPrice = getTotalPrice();
    const itemCount = cartItems.length;

    Alert.alert(
      'Xác nhận đơn hàng',
      `Tổng tiền: ${totalPrice.toLocaleString()} đ\nSố lượng sản phẩm: ${itemCount}\n\nBạn có muốn đặt hàng?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đặt hàng',
          onPress: async () => {
            setLoading(true);
            try {
              // Prepare items for order
              const orderItems = cartItems.map(item => ({
                productId: item.productId || item.id,
                quantity: item.quantity,
                price: item.price,
              }));

              // Calculate total quantity
              const totalQuantity = cartItems.reduce(
                (sum, item) => sum + item.quantity,
                0,
              );

              // Create order in database with correct itemCount (total quantity, not product types)
              const orderId = await createOrder(
                user.id,
                orderItems,
                totalPrice,
                totalQuantity,
              );

              if (orderId) {
                setCartItems([]);
                Alert.alert(
                  'Thành công',
                  `Đơn hàng ${orderId} đã được tạo!\nVui lòng kiểm tra tab "Đơn hàng" để xem chi tiết.`,
                );
              } else {
                Alert.alert('Lỗi', 'Không thể tạo đơn hàng. Vui lòng thử lại.');
              }
            } catch (error) {
              console.error('Checkout error:', error);
              Alert.alert('Lỗi', 'Có lỗi xảy ra khi đặt hàng');
            } finally {
              setLoading(false);
            }
          },
        },
      ],
    );
  };

  const renderItem = ({ item }: { item: CartItem }) => (
    <View style={styles.cartItem}>
      <Image source={getImageSource(item.img)} style={styles.image} />
      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.itemPrice}>
          {(item.price * item.quantity).toLocaleString()} đ
        </Text>
      </View>
      <View style={styles.quantityControl}>
        <TouchableOpacity
          onPress={() => updateQuantity(item.id, item.quantity - 1)}
          style={styles.qtyButton}
        >
          <Text style={styles.qtyButtonText}>−</Text>
        </TouchableOpacity>
        <Text style={styles.qtyText}>{item.quantity}</Text>
        <TouchableOpacity
          onPress={() => updateQuantity(item.id, item.quantity + 1)}
          style={styles.qtyButton}
        >
          <Text style={styles.qtyButtonText}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => removeItem(item.id)}
          style={[styles.qtyButton, styles.deleteBtn]}
        >
          <Text style={styles.qtyButtonText}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🛒 Giỏ Hàng</Text>
        <Text style={styles.cartCount}>{cartItems.length} sản phẩm</Text>
      </View>

      {cartItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Giỏ hàng của bạn đang trống</Text>
          <Text style={styles.emptySubtext}>
            Thêm sản phẩm để tiếp tục mua sắm
          </Text>
        </View>
      ) : (
        <>
          <FlatList
            data={cartItems}
            keyExtractor={item => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.listContainer}
          />
          <View style={styles.footer}>
            <View style={styles.totalSection}>
              <Text style={styles.totalLabel}>Tổng cộng:</Text>
              <Text style={styles.totalPrice}>
                {getTotalPrice().toLocaleString()} đ
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.checkoutButton,
                loading && styles.checkoutButtonDisabled,
              ]}
              onPress={handleCheckout}
              disabled={loading}
            >
              <Text style={styles.checkoutButtonText}>
                {loading ? 'Đang xử lý...' : 'Thanh Toán'}
              </Text>
            </TouchableOpacity>
          </View>
        </>
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
  cartCount: {
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
  cartItem: {
    flexDirection: 'row',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.md,
    marginRight: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.secondary,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  qtyButton: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  qtyText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginHorizontal: theme.spacing.sm,
    minWidth: 25,
    textAlign: 'center',
  },
  deleteBtn: {
    backgroundColor: '#ffe6e6',
  },
  footer: {
    backgroundColor: theme.colors.card,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    ...theme.shadows.lg,
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.muted,
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.secondary,
  },
  checkoutButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    ...theme.shadows.md,
  },
  checkoutButtonDisabled: {
    backgroundColor: theme.colors.muted,
    opacity: 0.6,
  },
  checkoutButtonText: {
    color: theme.colors.textOnPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
});

export default CartScreen;
