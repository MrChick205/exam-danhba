import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView } from 'react-native';

const About = () => {
  return (
    <ScrollView style={styles.container}>
      <Image
        source={require('../../assets/images/about_banner.jpg')} // Đường dẫn hình ảnh banner
        style={styles.banner}
      />
      <Text style={styles.title}>Chào Mừng Đến Với Cửa Hàng Mô Hình Của Chúng Tôi!</Text>
      
      <Text style={styles.description}>
        Tại đây, chúng tôi cung cấp những mô hình chất lượng cao với các thiết kế đẹp mắt và chi tiết. 
        Dù bạn là người mới bắt đầu hay một nhà sưu tập dày dạn kinh nghiệm, chúng tôi có tất cả những gì bạn cần.
      </Text>

      <Text style={styles.subtitle}>Sản Phẩm Nổi Bật:</Text>
      <Text style={styles.description}>
        - Mô hình xe ô tô được thiết kế tinh xảo với độ chi tiết tuyệt đẹp.
        {'\n'}- Mô hình nhân vật từ các bộ phim hoạt hình và trò chơi nổi tiếng.
        {'\n'}- Bộ mô hình lắp ráp cho những tín đồ đam mê thủ công.
      </Text>

      <Text style={styles.subtitle}>Tại Sao Chọn Chúng Tôi?</Text>
      <Text style={styles.description}>
        - Chất lượng sản phẩm tốt nhất. {'\n'}
        - Dịch vụ khách hàng tận tình và chuyên nghiệp. {'\n'}
        - Giao hàng nhanh chóng và an toàn.
      </Text>

      <Text style={styles.footer}>
        Liên hệ với chúng tôi qua email: contact@modelshop.com
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    padding: 20,
  },
  banner: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    marginVertical: 10,
    color: '#E91E63',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#666',
    marginBottom: 10,
  },
  footer: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default About;