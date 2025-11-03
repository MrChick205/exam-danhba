import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const App = () => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.text}>Header</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.text}>Content</Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.text}>Footer</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flex: 1,
    backgroundColor: '#4dabf7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 2,
    backgroundColor: '#d0ebff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    flex: 1,
    backgroundColor: '#4dabf7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default App;
