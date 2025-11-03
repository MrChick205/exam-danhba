import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";

const ChildComponent = ({
  name,
  age,
  onUpdate,
}: {
  name: string;
  age: number;
  onUpdate: (newName: string, newAge: number) => void;
}) => {
  const [newName, setNewName] = useState(name);
  const [newAge, setNewAge] = useState(age);

  return (
    <View style={styles.childContainer}>
      <Text style={styles.header}>🧒 Component Con</Text>
      <Text>
        Dữ liệu từ cha truyền xuống: {name || "(chưa có)"} – {age || "(chưa có)"} tuổi
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Nhập tên mới..."
        value={newName}
        onChangeText={setNewName}
      />

      <TextInput
        style={styles.input}
        placeholder="Nhập tuổi mới..."
        keyboardType="numeric"
        value={newAge ? newAge.toString() : ""}
        onChangeText={(text) => setNewAge(Number(text))}
      />

      <Button title="Gửi lại cho cha" onPress={() => onUpdate(newName, newAge)} />
    </View>
  );
};

export default function App() {
  const [name, setName] = useState("");
  const [age, setAge] = useState<number>(0);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>👨‍👩‍👧 Component Cha</Text>

      <TextInput
        style={styles.input}
        placeholder="Nhập tên..."
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="Nhập tuổi..."
        keyboardType="numeric"
        value={age ? age.toString() : ""}
        onChangeText={(text) => setAge(Number(text))}
      />

      <Text>➡️ Hiển thị trong cha:</Text>
      <Text>Họ tên: {name || "(chưa nhập)"}</Text>
      <Text>Tuổi: {age || "(chưa nhập)"}</Text>

      <ChildComponent
        name={name}
        age={age}
        onUpdate={(newName, newAge) => {
          setName(newName);
          setAge(newAge);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    marginBottom: 10,
    borderRadius: 6,
  },
  childContainer: {
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#aaa",
    padding: 10,
    borderRadius: 8,
  },
  header: { fontWeight: "bold", marginBottom: 6 },
});
