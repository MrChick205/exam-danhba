import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import theme from './theme';
import {
  CategoryPerformance,
  fetchCategoryPerformance,
  fetchTopProducts,
  getRevenueSummary,
  ProductStat,
  RevenueSummary,
} from './database';

const StatsScreen = () => {
  const [metrics, setMetrics] = useState<RevenueSummary | null>(null);
  const [topProducts, setTopProducts] = useState<ProductStat[]>([]);
  const [categoryStats, setCategoryStats] = useState<CategoryPerformance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [summary, products, categories] = await Promise.all([
          getRevenueSummary(),
          fetchTopProducts(3),
          fetchCategoryPerformance(),
        ]);
        setMetrics(summary);
        setTopProducts(products);
        setCategoryStats(categories);
      } catch (error) {
        console.error('❌ Error loading stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    });
  };

  const renderProductItem = ({ item }: { item: ProductStat }) => (
    <View style={styles.productItem}>
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.productSold}>Bán: {item.sold} sản phẩm</Text>
      </View>
      <Text style={styles.productRevenue}>
        {(item.revenue / 1000000).toFixed(1)}M đ
      </Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📊 Thống Kê</Text>
        <Text style={styles.headerSubtitle}>Hiệu suất kinh doanh</Text>
      </View>

      {/* Key Metrics */}
      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Tỷ lệ chuyển đổi</Text>
          <Text style={styles.metricValue}>
            {metrics ? `${metrics.conversionRate.toFixed(1)}%` : '---'}
          </Text>
          <Text style={styles.metricTrend}>
            {metrics
              ? `${metrics.totalCustomers} khách đã đặt hàng`
              : loading
              ? 'Đang tải...'
              : 'Chưa có dữ liệu'}
          </Text>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Trung bình sản phẩm / đơn</Text>
          <Text style={styles.metricValue}>
            {metrics ? metrics.averageItemsPerOrder.toFixed(1) : '---'}
          </Text>
          <Text style={styles.metricTrend}>
            {metrics
              ? `${
                  metrics.avgOrderValue
                    ? formatCurrency(metrics.avgOrderValue)
                    : '0đ'
                } trung bình`
              : ''}
          </Text>
        </View>
      </View>

      {/* Top Products */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sản phẩm bán chạy</Text>
        <FlatList
          data={topProducts}
          keyExtractor={item => item.id.toString()}
          renderItem={renderProductItem}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      </View>

      {/* Category Performance */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Hiệu suất danh mục</Text>
        {categoryStats.map((cat, idx) => (
          <View key={idx} style={styles.categoryItem}>
            <View style={styles.categoryInfo}>
              <Text style={styles.categoryName}>{cat.name}</Text>
              <Text style={styles.categoryOrders}>{cat.orders} đơn hàng</Text>
            </View>
            <View style={styles.categoryRevenue}>
              <Text style={styles.revenueValue}>
                {(cat.revenue / 1000000).toFixed(0)}M đ
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsSection}>
        <TouchableOpacity style={styles.actionBtn}>
          <Text style={styles.actionIcon}>📥</Text>
          <Text style={styles.actionLabel}>Xuất CSV</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}>
          <Text style={styles.actionIcon}>🔄</Text>
          <Text style={styles.actionLabel}>Làm mới</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}>
          <Text style={styles.actionIcon}>📧</Text>
          <Text style={styles.actionLabel}>Gửi báo cáo</Text>
        </TouchableOpacity>
      </View>

      {/* Summary */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Tóm tắt tháng này</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Tổng doanh thu:</Text>
          <Text style={styles.summaryValue}>
            {metrics ? formatCurrency(metrics.monthRevenue) : 'Đang tải...'}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Số đơn hàng:</Text>
          <Text style={styles.summaryValue}>
            {metrics ? metrics.monthOrders : '...'} đơn
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Khách hàng mới:</Text>
          <Text style={styles.summaryValue}>
            {metrics ? metrics.newCustomersThisMonth : '...'} người
          </Text>
        </View>
      </View>
    </ScrollView>
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
  headerSubtitle: {
    fontSize: 13,
    color: theme.colors.muted,
    marginTop: theme.spacing.xs,
  },
  metricsGrid: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.md,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  metricCard: {
    flex: 1,
    backgroundColor: theme.colors.card,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.sm,
  },
  metricLabel: {
    fontSize: 12,
    color: theme.colors.muted,
    marginBottom: theme.spacing.sm,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  metricTrend: {
    fontSize: 11,
    color: theme.colors.success,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    ...theme.shadows.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  productItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  productSold: {
    fontSize: 12,
    color: theme.colors.muted,
  },
  productRevenue: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.secondary,
  },
  separator: {
    height: 1,
    backgroundColor: theme.colors.border,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  categoryOrders: {
    fontSize: 12,
    color: theme.colors.muted,
  },
  categoryRevenue: {
    alignItems: 'flex-end',
  },
  revenueValue: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.secondary,
  },
  actionsSection: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: theme.colors.card,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  actionIcon: {
    fontSize: 20,
    marginBottom: theme.spacing.xs,
  },
  actionLabel: {
    fontSize: 11,
    color: theme.colors.textPrimary,
    fontWeight: '600',
    textAlign: 'center',
  },
  summaryCard: {
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.xl,
    backgroundColor: theme.colors.card,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.sm,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    borderBottomColor: theme.colors.border,
    borderBottomWidth: 1,
  },
  summaryLabel: {
    fontSize: 13,
    color: theme.colors.muted,
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
});

export default StatsScreen;
