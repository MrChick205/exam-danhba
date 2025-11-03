import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";

export default function StudentListApp() {
  const [students, setStudents] = useState([
    { id: 1, name: "An", age: 17, grade: 7.5 },
    { id: 2, name: "Bình", age: 18, grade: 8.2 },
    { id: 3, name: "Chi", age: 19, grade: 9.0 },
    { id: 4, name: "Dũng", age: 20, grade: 6.8 },
    { id: 5, name: "Hà", age: 21, grade: 8.7 },
  ]);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [grade, setGrade] = useState("");
  const [editingId, setEditingId] = useState(null);

  const [filterAge, setFilterAge] = useState("");
  const [filterGrade, setFilterGrade] = useState("");
  const [filteredList, setFilteredList] = useState(students);


  const handleSave = () => {
    if (!name || !age || !grade) {
      alert("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    if (editingId) {
      const updated = students.map((s) =>
        s.id === editingId
          ? { ...s, name, age: Number(age), grade: Number(grade) }
          : s
      );
      setStudents(updated);
      setFilteredList(updated);
      setEditingId(null);
    } else {
      const newStudent = {
        id: Date.now(),
        name,
        age: Number(age),
        grade: Number(grade),
      };
      const updated = [...students, newStudent];
      setStudents(updated);
      setFilteredList(updated);
    }

    setName("");
    setAge("");
    setGrade("");
  };

  const handleEdit = (student) => {
    setEditingId(student.id);
    setName(student.name);
    setAge(student.age.toString());
    setGrade(student.grade.toString());
  };

  const handleDelete = (id) => {
    const updated = students.filter((s) => s.id !== id);
    setStudents(updated);
    setFilteredList(updated);
  };

  const handleFilter = () => {
    let result = [...students];
    if (filterAge) result = result.filter((s) => s.age > Number(filterAge));
    if (filterGrade) result = result.filter((s) => s.grade > Number(filterGrade));
    setFilteredList(result);
  };

  const resetFilter = () => {
    setFilterAge("");
    setFilterGrade("");
    setFilteredList(students);
  };

  const highCount = students.filter((s) => s.grade > 8).length;

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>📘 Quản Lý Học Sinh</Text>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Tên học sinh"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Tuổi"
          value={age}
          onChangeText={setAge}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          placeholder="Điểm"
          value={grade}
          onChangeText={setGrade}
          keyboardType="numeric"
        />
        <Button
          title={editingId ? "💾 Lưu thay đổi" : "➕ Thêm học sinh"}
          onPress={handleSave}
        />
      </View>

      {/* Bộ lọc */}
      <View style={styles.filterBox}>
        <Text style={styles.filterTitle}>Bộ lọc học sinh</Text>
        <View style={styles.filterRow}>
          <TextInput
            style={[styles.input, styles.filterInput]}
            placeholder="Tuổi > ..."
            value={filterAge}
            onChangeText={setFilterAge}
            keyboardType="numeric"
          />
          <TextInput
            style={[styles.input, styles.filterInput]}
            placeholder="Điểm > ..."
            value={filterGrade}
            onChangeText={setFilterGrade}
            keyboardType="numeric"
          />
        </View>
        <View style={styles.filterButtons}>
          <Button title="🔍" onPress={handleFilter} />
          <Button title="♻️" onPress={resetFilter} color="#888" />
        </View>
      </View>

      <Text style={styles.count}>Số HS có điểm > 8: {highCount}</Text>

      {/* Danh sách */}
      <ScrollView style={styles.list}>
        {filteredList.length === 0 ? (
          <Text style={styles.empty}>Không có học sinh nào phù hợp.</Text>
        ) : (
          filteredList.map((s) => (
            <View key={s.id} style={styles.card}>
              <Text style={styles.name}>{s.name}</Text>
              <Text>Tuổi: {s.age}</Text>
              <Text>Điểm: {s.grade}</Text>
              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={[styles.btn, styles.btnEdit]}
                  onPress={() => handleEdit(s)}
                >
                  <Text style={styles.btnText}>Sửa</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.btn, styles.btnDelete]}
                  onPress={() => handleDelete(s.id)}
                >
                  <Text style={styles.btnText}>Xóa</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f5f5f5" },
  title: { fontSize: 22, fontWeight: "bold", textAlign: "center", marginBottom: 10 },
  form: { marginBottom: 20, backgroundColor: "#fff", padding: 12, borderRadius: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 8,
    marginBottom: 10,
  },
  filterBox: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
  },
  filterTitle: { fontWeight: "bold", fontSize: 16, marginBottom: 5 },
  filterRow: { flexDirection: "row", justifyContent: "space-between" },
  filterInput: { flex: 1, marginRight: 5 },
  filterButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
  },
  list: { flex: 1 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    marginVertical: 6,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  name: { fontSize: 18, fontWeight: "bold", color: "#333" },
  count: { textAlign: "center", fontSize: 16, fontWeight: "600", marginBottom: 10 },
  empty: { textAlign: "center", fontStyle: "italic", color: "#777" },
  actionRow: { flexDirection: "row", justifyContent: "flex-end", marginTop: 8 },
  btn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6, marginLeft: 6 },
  btnEdit: { backgroundColor: "#4caf50" },
  btnDelete: { backgroundColor: "#f44336" },
  btnText: { color: "#fff", fontWeight: "600" },
});
