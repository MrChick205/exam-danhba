import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeStackScreen from './HomeStackScreen';
import LoginSqlite from './LoginSqlite';
import SignupSqlite from './SignupSqlite';


export type BottomTabParamList = {
  HomeTab: undefined;
  SignupSqlite: undefined; //minh họa cho users lưu bằng Sqlite
  LoginSqlite: undefined; //minh họa cho users lưu bằng Sqlite
};


const Tab = createBottomTabNavigator<BottomTabParamList>();


const AppTabs = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen 
        name="HomeTab" 
        component={HomeStackScreen} 
        options={{ title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>🏠</Text> // Unicode 🏠 (home)
          ),
         }} 
      />
     
      <Tab.Screen 
        name="SignupSqlite" 
        component={SignupSqlite} 
        options={{ title: 'Signup',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>➕</Text> // Unicode ➕
          ),
         }} 
      />
      <Tab.Screen 
        name="LoginSqlite" 
        component={LoginSqlite} 
        options={{ title: 'Login',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>🔒</Text> // Unicode 🔒
          ),
         }} 
      />
    </Tab.Navigator>
  );
};


export default AppTabs;
