import React, { useState, useRef } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  Alert,
  Platform,
} from 'react-native';

interface Result {
  text: string;
  type: 'infinite' | 'none' | 'one';
}

export default function App() {
  const [a, setA] = useState<string>('');
  const [b, setB] = useState<string>('');
  const [result, setResult] = useState<Result | null>(null);

  const aRef = useRef<TextInput>(null);
  const bRef = useRef<TextInput>(null);

  // Tách riêng hàm parse
  const parseNumber = (s: string): number => {
    if (s.trim() === '') return NaN;
    return Number(s.replace(',', '.'));
  };

  // Tách riêng kiểm tra input
  const validateInputs = (): boolean => {
    const aval = parseNumber(a);
    const bval = parseNumber(b);

    // Kiểm tra a trước
    if (isNaN(aval)) {
      Alert.alert('Lỗi', 'Giá trị a không hợp lệ.');
      aRef.current?.focus();
      return false;
    }

    // Kiểm tra b tiếp
    if (isNaN(bval)) {
      Alert.alert('Lỗi', 'Giá trị b không hợp lệ.');
      bRef.current?.focus();
      return false;
    }

    return true; // hợp lệ
  };

  const solve = () => {
    Keyboard.dismiss();

    // Nếu không hợp lệ thì dừng luôn
    if (!validateInputs()) return;

    const aval = parseNumber(a);
    const bval = parseNumber(b);

    if (aval === 0) {
      if (bval === 0) setResult({ text: 'Vô số nghiệm', type: 'infinite' });
      else setResult({ text: 'Vô nghiệm', type: 'none' });
      return;
    }

    const x = -bval / aval;
    setResult({ text: `x = ${x}`, type: 'one' });
  };

  const reset = () => {
    setA('');
    setB('');
    setResult(null);
    aRef.current?.focus(); // focus lại a sau khi reset
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Giải phương trình bậc nhất</Text>
        <Text style={styles.subtitle}>Dạng: ax + b = 0</Text>

        <View style={styles.row}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>a</Text>
            <TextInput
              ref={aRef}
              style={styles.input}
              value={a}
              onChangeText={setA}
              placeholder="Nhập a"
              keyboardType={Platform.OS === 'web' ? 'numeric' : 'decimal-pad'}
              returnKeyType="next"
              onSubmitEditing={() => bRef.current?.focus()}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>b</Text>
            <TextInput
              ref={bRef}
              style={styles.input}
              value={b}
              onChangeText={setB}
              placeholder="Nhập b"
              keyboardType={Platform.OS === 'web' ? 'numeric' : 'decimal-pad'}
              returnKeyType="done"
              onSubmitEditing={solve}
            />
          </View>
        </View>

        <View style={styles.buttonsRow}>
          <TouchableOpacity style={styles.buttonPrimary} onPress={solve}>
            <Text style={styles.buttonText}>Giải</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.buttonSecondary} onPress={reset}>
            <Text style={styles.buttonText}>Reset</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.resultBox}>
          <Text style={styles.resultLabel}>Kết quả</Text>
          <Text style={styles.resultText}>{result ? result.text : '—'}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f4f7',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 520,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    color: '#6b7280',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  inputContainer: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 10,
    borderRadius: 8,
    fontSize: 16,
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  buttonPrimary: {
    flex: 1,
    padding: 12,
    backgroundColor: '#2563eb',
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
  },
  buttonSecondary: {
    flex: 1,
    padding: 12,
    backgroundColor: '#374151',
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },
  resultBox: {
    marginTop: 18,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#eef2ff',
  },
  resultLabel: {
    fontSize: 12,
    color: '#374151',
  },
  resultText: {
    marginTop: 6,
    fontSize: 18,
    fontWeight: '700',
  },
});
