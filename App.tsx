/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { NewAppScreen } from '@react-native/new-app-screen';
import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import MainApp from './src/component/MainApp';
import FirstApp from './src/component/FirstApp';
import GiaiPT from './src/component/GiaiPT';
import CalculatorApp from './src/component/Caculator';
import Weight from './src/component/Weight';
import Layout from './src/component/Layout';
import LayCmplt from './src/component/Layoutcmplt';
import Net from './src/component/NetBackground';
import StudentManagement from './src/component/StudentManagement';
import DanhBa from './src/component/Exam_DanhBa.tsx';


function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    // <MainApp/>
    // <FirstApp />
    // <GiaiPT/>
    // <CalculatorApp/>
    // <Layout/>
    // <LayCmplt/>
    // <Net/>
    // <Weight/>
    // <StudentManagement/>
    <DanhBa/>
  );
}
export default App;
