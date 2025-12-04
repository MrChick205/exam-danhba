import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { getUserByCredentials } from './database'; // Import hàm kiểm tra user từ database
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HomeStackParamList } from './types';
import { BottomTabParamList } from './AppTabs';

const LoginSqlite = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigation1 =
    useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const navigation2 =
    useNavigation<NativeStackNavigationProp<BottomTabParamList>>();

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin!');
      return;
    }

    try {
      const user = await getUserByCredentials(username, password);
      if (user) {
        await AsyncStorage.setItem('loggedInUser', JSON.stringify(user)); // Lưu thông tin đăng nhập

        Alert.alert('Thành công', `Xin chào, ${user.username}!`, [
          {
            text: 'OK',
            onPress: () => {
              // Điều hướng dựa trên vai trò
              navigation1.navigate(
                user.role === 'admin' ? 'AdminDashboard' : 'Home',
              );
            },
          },
        ]);
      } else {
        Alert.alert('Lỗi', 'Tên đăng nhập hoặc mật khẩu không đúng!');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Lỗi', 'Đăng nhập thất bại');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đăng Nhập</Text>
      <TextInput
        placeholder="Tên đăng nhập"
        style={styles.input}
        onChangeText={setUsername}
        value={username}
      />
      <TextInput
        placeholder="Mật khẩu"
        style={styles.input}
        secureTextEntry
        onChangeText={setPassword}
        value={password}
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Đăng Nhập</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation2.navigate('SignupSqlite')}>
        <Text style={styles.switchText}>Chưa có tài khoản? Đăng ký ngay</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#6200ea',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: { color: 'white', fontWeight: 'bold' },
  switchText: { marginTop: 15, color: '#6200ea' },
});

export default LoginSqlite;
