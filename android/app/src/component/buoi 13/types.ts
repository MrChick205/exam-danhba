import { ImageSourcePropType } from 'react-native';

//interface trước khi tạo CAtegory
export interface Product1 {
  id: string;
  name: string;
  price: string;
  image: ImageSourcePropType;
}

//interface khi tạo Category
export interface Product {
    id: number;  // ID là số nguyên
    name: string;
    price: number; // Giá nên là kiểu số
    image: string;
    categoryId: number;
  }
// HomeStackParamList: Là kiểu (type) bạn định nghĩa để mô tả danh sách các màn hình (routes) và các tham số tương ứng của chúng trong navigator
export type HomeStackParamList = {
    // Main: undefined;
    Home: undefined;
    Details: { product: Product1 };  //trang này có tham số nhận vào là product
    Accessory: undefined;
    Fashion: undefined;
    Categories:undefined;
    About:undefined;
    AdminDashboard: undefined;
    CategoryManagement: undefined;
    UserManagement: undefined;
    AddUser:undefined;
    EditUser:{userId:number};
    ProductManagement:{categoryId:number};
  };