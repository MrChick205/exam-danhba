import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import theme from './theme';
import { getRevenueSummary, RevenueSummary } from './database';

const RevenueScreen = () => {
  const [summary, setSummary] = useState<RevenueSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSummary = async () => {
      try {
        const data = await getRevenueSummary();
        setSummary(data);
      } catch (error) {
        console.error('❌ Error loading revenue summary:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSummary();
  }, []);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>💰 Doanh Thu</Text>
        <Text style={styles.headerSubtitle}>Tổng quan hôm nay</Text>
      </View>

      {/* Main Revenue Card */}
      <View style={styles.mainCard}>
        <Text style={styles.mainLabel}>Doanh thu hôm nay</Text>
        <Text style={styles.mainValue}>
          {summary ? formatCurrency(summary.todayRevenue) : 'Đang tải...'}
        </Text>
        <View style={styles.mainFooter}>
          <Text style={styles.trendUp}>
            {summary
              ? `${summary.todayOrders} đơn hàng hôm nay`
              : loading
              ? 'Đang tải số liệu...'
              : 'Chưa có đơn hàng hôm nay'}
          </Text>
        </View>
      </View>

      {/* Revenue Cards Grid */}
      <View style={styles.cardsGrid}>
        <View style={styles.card}>
          <Text style={styles.cardIcon}>📅</Text>
          <Text style={styles.cardLabel}>Tháng này</Text>
          <Text style={styles.cardValue}>
            {summary ? formatCurrency(summary.monthRevenue) : 'Đang tải...'}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardIcon}>📊</Text>
          <Text style={styles.cardLabel}>Năm nay</Text>
          <Text style={styles.cardValue}>
            {summary ? formatCurrency(summary.yearRevenue) : 'Đang tải...'}
          </Text>
        </View>
      </View>

      {/* Stats Section */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Thống kê</Text>

        <View style={styles.statItem}>
          <View style={styles.statInfo}>
            <Text style={styles.statLabel}>Tổng đơn hàng</Text>
            <Text style={styles.statValue}>
              {summary ? summary.totalOrders : '...'}
            </Text>
          </View>
          <View
            style={[
              styles.statIcon,
              { backgroundColor: 'rgba(59, 130, 246, 0.1)' },
            ]}
          >
            <Text style={styles.statIconText}>📦</Text>
          </View>
        </View>

        <View style={styles.statItem}>
          <View style={styles.statInfo}>
            <Text style={styles.statLabel}>Khách hàng</Text>
            <Text style={styles.statValue}>
              {summary ? summary.totalCustomers : '...'}
            </Text>
          </View>
          <View
            style={[
              styles.statIcon,
              { backgroundColor: 'rgba(16, 185, 129, 0.1)' },
            ]}
          >
            <Text style={styles.statIconText}>👥</Text>
          </View>
        </View>

        <View style={styles.statItem}>
          <View style={styles.statInfo}>
            <Text style={styles.statLabel}>Giá trị đơn trung bình</Text>
            <Text style={styles.statValue}>
              {summary ? formatCurrency(summary.avgOrderValue) : 'Đang tải...'}
            </Text>
          </View>
          <View
            style={[
              styles.statIcon,
              { backgroundColor: 'rgba(251, 146, 60, 0.1)' },
            ]}
          >
            <Text style={styles.statIconText}>💵</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsSection}>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionIcon}>📈</Text>
          <Text style={styles.actionText}>Xuất báo cáo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionIcon}>📋</Text>
          <Text style={styles.actionText}>Chi tiết đơn</Text>
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
  mainCard: {
    backgroundColor: theme.colors.primary,
    margin: theme.spacing.md,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.md,
  },
  mainLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  mainValue: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.textOnPrimary,
    marginVertical: theme.spacing.md,
  },
  mainFooter: {
    flexDirection: 'row',
  },
  trendUp: {
    fontSize: 13,
    color: theme.colors.secondary,
    fontWeight: '600',
  },
  cardsGrid: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  card: {
    flex: 1,
    backgroundColor: theme.colors.card,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  cardIcon: {
    fontSize: 32,
    marginBottom: theme.spacing.sm,
  },
  cardLabel: {
    fontSize: 12,
    color: theme.colors.muted,
    marginBottom: theme.spacing.xs,
  },
  cardValue: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  statsSection: {
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  statItem: {
    backgroundColor: theme.colors.card,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  statInfo: {
    flex: 1,
  },
  statLabel: {
    fontSize: 13,
    color: theme.colors.muted,
    marginBottom: theme.spacing.xs,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  statIcon: {
    width: 50,
    height: 50,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statIconText: {
    fontSize: 24,
  },
  actionsSection: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  actionButton: {
    flex: 1,
    backgroundColor: theme.colors.card,
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: theme.spacing.sm,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
});

export default RevenueScreen;
