import React, { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect  } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabParamList } from './AppTabs';


const Header = () => {
  const [user, setUser] = useState<{ username: string; role: string } | null>(null);
  const navigation = useNavigation<NativeStackNavigationProp<BottomTabParamList>>();


   // Load user khi focus vào màn hình, dùng useFocusEffect() thay cho useEffect() để cập nhật lại state mỗi khi có sự chuyển đổi màn hình
   useFocusEffect(
    useCallback(() => {
      const loadUser = async () => {
        const loggedInUser = await AsyncStorage.getItem('loggedInUser');
        setUser(loggedInUser ? JSON.parse(loggedInUser) : null);
      };
      loadUser();
    }, [])
  );


  const handleLogout = async () => {
    await AsyncStorage.removeItem('loggedInUser');
    setUser(null); // Xóa thông tin người dùng trong state


    // navigation.navigate('Login'); // Điều hướng về trang Login lưu db bằng AsyncStorage
    navigation.navigate('LoginSqlite'); // Điều hướng về trang Login lưu db bằng AsyncStorage
    //trang Login được định nghĩa trong BottomTabParamList  
};


  return (
    <View style={styles.header}>
      {user ? (
        <>
          <Text style={styles.userInfo}>
            {/* Nếu user, user.username hoặc user.role là null hoặc undefined, nó sẽ không hiển thị gì cả. */}
            {user && user.username && user.role ? (
            <Text style={styles.userInfo}>
                Xin chào, {String(user.username)} ({String(user.role)})
            </Text>
            ) : null}
          </Text>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Text style={styles.logoutText}>Đăng Xuất</Text>
          </TouchableOpacity>
        </>
      ) : null}
    </View>
  );
};


const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 0,
    backgroundColor: '#6200ea',
  },
  userInfo: {
    color: 'white',
    fontSize: 16,
  },
  logoutButton: {
    backgroundColor: '#ff5252',
    padding: 8,
    borderRadius: 5,
  },
  logoutText: {
    color: 'white',
    fontWeight: 'bold',
  },
});


export default Header;
