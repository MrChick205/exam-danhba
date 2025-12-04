import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert, StyleSheet } from "react-native";

const MainApp = () => {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");

  const handlePress = () => {
    if (name.trim() === "" || age.trim() === "") {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ tên và tuổi!");
      return;
    }
    Alert.alert("Xin chào!", `Hello ${name}!`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nhập thông tin của bạn</Text>

      <TextInput
        style={styles.input}
        placeholder="Nhập tên..."
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="Nhập tuổi..."
        value={age}
        onChangeText={setAge}
        keyboardType="numeric"
      />

      {/* Hiển thị Hello tên, tuổi */}
      {name && age ? (
        <View style={{ alignItems: "center", marginVertical: 20 }}>
          <Text style={styles.text}>Hello {name}!</Text>
          <Text style={styles.text}>Tuổi: {age}</Text>
        </View>
      ) : null}

      <Button title="Nhấn để chào" onPress={handlePress} />
    </View>
  );
};

export default MainApp;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f0f0f0",
  },
  title: {
    fontSize: 20,
    marginBottom: 10,
    fontWeight: "bold",
  },
  input: {
    width: "80%",
    height: 40,
    borderColor: "#888",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
    marginVertical: 5,
  },
  text: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
});
