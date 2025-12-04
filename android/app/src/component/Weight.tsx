import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  Alert,
  ScrollView,
  Image,
} from 'react-native';

export default function BMICalculatorApp() {
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [bmi, setBmi] = useState<string | null>(null);
  const [status, setStatus] = useState('');
  const [suggestion, setSuggestion] = useState('');

  const heightRef = useRef<TextInput>(null);
  const weightRef = useRef<TextInput>(null);

  const validate = (): boolean => {
    if (height.trim() === '') {
      Alert.alert('Missing Input', 'Please enter your height (cm).');
      heightRef.current?.focus();
      return false;
    }
    if (weight.trim() === '') {
      Alert.alert('Missing Input', 'Please enter your weight (kg).');
      weightRef.current?.focus();
      return false;
    }
    if (isNaN(Number(height)) || isNaN(Number(weight))) {
      Alert.alert('Invalid Input', 'Height and weight must be numbers.');
      return false;
    }
    if (Number(height) <= 0 || Number(weight) <= 0) {
      Alert.alert('Invalid Value', 'Height and weight must be greater than 0.');
      return false;
    }
    return true;
  };

  const getImageByStatus = () => {
    switch (status) {
      case 'Thiếu cân':
        return require('../asset/images/skinny.webp');
      case 'Bình thường':
        return require('../asset/images/gigachad.jpg');
      case 'Thừa cân nhẹ':
        return require('../asset/images/overweight.jpg');
      case 'Béo phì':
        return require('../asset/images/fat.webp');
      default:
        return null;
    }
  };

  const getBackgroundColor = () => {
    switch (status) {
      case 'Thiếu cân':
        return '#dbeafe';
      case 'Bình thường':
        return '#dcfce7';
      case 'Thừa cân nhẹ':
        return '#fef9c3';
      case 'Béo phì':
        return '#fee2e2';
      default:
        return '#fff';
    }
  };

  const calculateBMI = () => {
    Keyboard.dismiss();
    if (!validate()) return;

    const h = Number(height) / 100;
    const w = Number(weight);
    const bmiValue = w / (h * h);
    setBmi(bmiValue.toFixed(2));

    let category = '';
    let advice = '';

    if (bmiValue < 18.5) {
      category = 'Thiếu cân';
      advice = 'Bạn nên ăn uống đầy đủ hơn, bổ sung protein và calo.';
    } else if (bmiValue < 23) {
      category = 'Bình thường';
      advice = 'Cơ thể bạn đang ở trạng thái tốt, hãy duy trì nếp sống lành mạnh.';
    } else if (bmiValue < 25) {
      category = 'Thừa cân nhẹ';
      advice = 'Bạn nên tập thể dục đều đặn hơn và giảm tinh bột.';
    } else {
      category = 'Béo phì';
      advice = 'Hãy điều chỉnh chế độ ăn uống và tăng vận động.';
    }

    setStatus(category);
    setSuggestion(advice);
  };

  const reset = () => {
    setHeight('');
    setWeight('');
    setBmi(null);
    setStatus('');
    setSuggestion('');
    heightRef.current?.focus();
  };

  return (
    <ScrollView contentContainerStyle={[styles.container]}>
      <Text style={styles.title}>BMI Calculator</Text>

      <TextInput
        ref={heightRef}
        style={styles.input}
        keyboardType="numeric"
        placeholder="Enter height (cm)"
        value={height}
        onChangeText={setHeight}
        returnKeyType="next"
        onSubmitEditing={() => weightRef.current?.focus()}
      />

      <TextInput
        ref={weightRef}
        style={styles.input}
        keyboardType="numeric"
        placeholder="Enter weight (kg)"
        value={weight}
        onChangeText={setWeight}
        returnKeyType="done"
        onSubmitEditing={calculateBMI}
      />

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.button} onPress={calculateBMI}>
          <Text style={styles.buttonText}>Compute BMI</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.reset]} onPress={reset}>
          <Text style={styles.buttonText}>Reset</Text>
        </TouchableOpacity>
      </View>

      {bmi && (
        <View style={[styles.resultBox, { backgroundColor: getBackgroundColor() }]}>
          <Image source={getImageByStatus()} style={styles.image} resizeMode="contain" />
          <Text style={styles.resultText}>BMI: {bmi}</Text>
          <Text style={styles.statusText}>Tình trạng: {status}</Text>
          <Text style={styles.suggestionTitle}>Đề xuất:</Text>
          <Text style={styles.suggestionText}>{suggestion}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#f9fafb',
    paddingVertical: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 24,
    color: '#2563eb',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 14,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  button: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    paddingHorizontal: 20,
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
  resultBox: {
    marginTop: 24,
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  image: {
    width: 140,
    height: 140,
    marginBottom: 12,
  },
  resultText: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    color: '#2563eb',
  },
  statusText: {
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
    marginVertical: 8,
  },
  suggestionTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 6,
    color: '#111',
  },
  suggestionText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
    textAlign: 'center',
  },
});
