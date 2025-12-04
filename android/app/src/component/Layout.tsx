import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const App = () => {
  return (
    <View style={styles.container}>
        <View style={styles.section1}>
            <Text style={styles.text}>section 1</Text>
        </View>
        <View style={styles.section2}>
            <Text style={styles.text}>section 2</Text>
        </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    flexDirection: 'row',
  },
  section1: {
    flex: 1,
    backgroundColor: 'blue'
  },
  section2: {
    flex: 1,
    backgroundColor: 'yellow',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default App;
