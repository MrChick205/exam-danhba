import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  Alert,
} from 'react-native';

export default function CalculatorApp() {
  const [num1, setNum1] = useState('');
  const [num2, setNum2] = useState('');
  const [operation, setOperation] = useState('+');
  const [result, setResult] = useState<string | null>(null);

  const input1Ref = useRef<TextInput>(null);
  const input2Ref = useRef<TextInput>(null);

  const validate = (): boolean => {
    if (num1.trim() === '') {
      Alert.alert('Validation Error', 'Please enter the first number.');
      input1Ref.current?.focus();
      return false;
    }
    if (num2.trim() === '') {
      Alert.alert('Validation Error', 'Please enter the second number.');
      input2Ref.current?.focus();
      return false;
    }
    if (isNaN(Number(num1)) || isNaN(Number(num2))) {
      Alert.alert('Validation Error', 'Both inputs must be valid numbers.');
      return false;
    }
    if (operation === '/' && Number(num2) === 0) {
      Alert.alert('Math Error', 'Division by zero is not allowed.');
      input2Ref.current?.focus();
      return false;
    }
    return true;
  };

  const calculate = () => {
    Keyboard.dismiss();
    if (!validate()) return;

    const a = Number(num1);
    const b = Number(num2);
    let res = 0;

    switch (operation) {
      case '+':
        res = a + b;
        break;
      case '-':
        res = a - b;
        break;
      case '*':
        res = a * b;
        break;
      case '/':
        res = a / b;
        break;
    }

    setResult(res.toFixed(2));
  };

  const reset = () => {
    setNum1('');
    setNum2('');
    setOperation('+');
    setResult(null);
    input1Ref.current?.focus();
  };

  const operations = ['+', '-', '*', '/'];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Simple Calculator</Text>

      <TextInput
        ref={input1Ref}
        style={styles.input}
        keyboardType="numeric"
        placeholder="Enter first number"
        value={num1}
        onChangeText={setNum1}
        returnKeyType="next"
        onSubmitEditing={() => input2Ref.current?.focus()}
      />

      <TextInput
        ref={input2Ref}
        style={styles.input}
        keyboardType="numeric"
        placeholder="Enter second number"
        value={num2}
        onChangeText={setNum2}
        returnKeyType="done"
        onSubmitEditing={calculate}
      />

      <View style={styles.radioGroup}>
        {operations.map(op => (
          <TouchableOpacity
            key={op}
            style={[
              styles.radioButton,
              operation === op && styles.radioButtonSelected,
            ]}
            onPress={() => setOperation(op)}
          >
            <Text
              style={[
                styles.radioLabel,
                operation === op && styles.radioLabelSelected,
              ]}
            >
              {op}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.button} onPress={calculate}>
          <Text style={styles.buttonText}>Compute</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.reset]} onPress={reset}>
          <Text style={styles.buttonText}>Reset</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.resultLabel}>
        Result: <Text style={styles.resultValue}>{result ?? '—'}</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#f9fafb',
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  radioGroup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 16,
  },
  radioButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  radioButtonSelected: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  radioLabel: {
    fontSize: 16,
    color: '#333',
  },
  radioLabelSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  button: {
    backgroundColor: '#2563eb',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  reset: {
    backgroundColor: '#9ca3af',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resultLabel: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 18,
  },
  resultValue: {
    fontWeight: 'bold',
    color: '#2563eb',
  },
});
