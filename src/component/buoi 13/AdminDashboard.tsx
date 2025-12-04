import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import theme from './theme';

const AdminDashboard = ({ navigation }: any) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Trang Quản Trị Admin</Text>

      <TouchableOpacity
        style={styles.btn}
        onPress={() => navigation.navigate('AdminProduct')}
      >
        <Text style={styles.btnText}>Quản lý sản phẩm</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.btn}
        onPress={() => navigation.navigate('CategoryManagement')}
      >
        <Text style={styles.btnText}>Quản lý loại sản phẩm</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.btn}
        onPress={() => navigation.navigate('UserManagement')}
      >
        <Text style={styles.btnText}>Quản lý người dùng</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.btn, styles.secondaryBtn]}
        onPress={() => navigation.navigate('AdminOrders')}
      >
        <Text style={styles.secondaryText}>Đơn hàng người dùng</Text>
      </TouchableOpacity>
      
      {/* Add more navigation buttons as needed */}
      
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 24,
    color: theme.colors.primary,
  },
  btn: {
    width: '100%',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    alignItems: 'center',
  },
  btnText: {
    color: theme.colors.textOnPrimary,
    fontWeight: '700',
  },
  secondaryBtn: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  secondaryText: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
});

export default AdminDashboard;