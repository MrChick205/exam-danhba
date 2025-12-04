import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
} from "react-native";

export default function DanhBa() {
  const [contacts, setContacts] = useState([
    { id: "1", name: "An", phone: "0123456789" },
    { id: "2", name: "Bình", phone: "0977456456" },
    { id: "3", name: "Chi", phone: "0722345678" },
  ]);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);

  const handleAddOrUpdate = () => {
    if (!name.trim() || !phone.trim()) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập đầy đủ tên và số điện thoại");
      return;
    }

    if (editingId) {
      // Đang sửa
      setContacts((prev) =>
        prev.map((item) =>
          item.id === editingId ? { ...item, name, phone } : item
        )
      );
      setEditingId(null);
      Alert.alert("✔️ Đã cập nhật", "Liên hệ đã được chỉnh sửa thành công!");
    } else {
      // Thêm mới
      const newContact = {
        id: Date.now().toString(),
        name,
        phone,
      };
      setContacts([...contacts, newContact]);
      Alert.alert("🎉 Thêm thành công", "Liên hệ mới đã được lưu!");
    }

    setName("");
    setPhone("");
  };
    const filteredContacts = contacts.filter(
    (item) =>
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.phone.includes(search)
    );
      const handleDelete = (id) => {
        Alert.alert("Xác nhận", "Bạn có chắc muốn xóa liên hệ này?", [
        { text: "Hủy" },
        {
            text: "Xóa",
            style: "destructive",
            onPress: () => {
            setContacts(contacts.filter((item) => item.id !== id));
            },
        },
        ]);
  };
    const handleEdit = (contact) => {
        setName(contact.name);
        setPhone(contact.phone);
        setEditingId(contact.id);
    };


  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>📒 Danh Bạ cute</Text>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Họ tên"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Số điện thoại"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />

        <TouchableOpacity
          style={[
            styles.addButton,
            editingId ? { backgroundColor: "#ffa500" } : {},
          ]}
          onPress={handleAddOrUpdate}
        >
          <Text style={styles.addButtonText}>
            {editingId ? "💾 Lưu chỉnh sửa" : "➕ Thêm"}
          </Text>
        </TouchableOpacity>
        <TextInput
            style={styles.searchInput}
            placeholder="🔍 Tìm theo tên hoặc số..."
            value={search}
            onChangeText={setSearch}
            />
      </View>
      <FlatList
        data={filteredContacts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardName}>👤 {item.name} - {item.phone}</Text>
            <View style={styles.cardActions}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => handleDelete(item.id)}
              >
                <Text>🗑️</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => handleEdit(item)}
              >
                <Text>✏️</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fad9f6ff",
    padding: 16,
  },
  header: {
    margin: 30,
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
  },
  form: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#fff",
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: "#ff00d9ff",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  listTitle: {
    fontWeight: "bold",
    marginBottom: 10,
  },
    card: {
    backgroundColor: "#eea2dbff",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    },

    cardActions: {
    flexDirection: "row",
    gap: 10,
    },

    iconButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    },

  cardName: {
    fontSize: 16,
    fontWeight: "600",
  },
  cardPhone: {
    color: "#555",
    marginTop: 4,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#fff",
    marginBottom: 15,
    marginTop: 15,
},
});
