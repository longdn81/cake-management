// Import các hàm cần thiết
import { initializeApp } from "firebase/app";
// 1. Import Auth và cấu hình lưu trữ cho React Native
import { initializeAuth, Auth } from "firebase/auth";

import AsyncStorage, { AsyncStorageStatic } from "@react-native-async-storage/async-storage";
// 2. Import Firestore (Database)
import { getFirestore, Firestore } from "firebase/firestore";
// 3. Import Storage (Lưu ảnh)
import { getStorage, FirebaseStorage } from "firebase/storage";

// Cấu hình của bạn (Tôi giữ nguyên key của bạn)
const firebaseConfig = {
  apiKey: "AIzaSyBykSNVUreH6TNyM7kXAXyx1AdyFoyKTCg",
  authDomain: "cake-6716f.firebaseapp.com",
  projectId: "cake-6716f",
  storageBucket: "cake-6716f.firebasestorage.app",
  messagingSenderId: "925208808952",
  appId: "1:925208808952:web:d30572983602e4086b9a0d",
  measurementId: "G-TDZPS7B7DE"
};

// Khởi tạo Firebase App
const app = initializeApp(firebaseConfig);

// --- QUAN TRỌNG: Cấu hình Auth với AsyncStorage ---
// Giúp user không bị logout khi tắt app
const auth: Auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// Khởi tạo Database và Storage
const db: Firestore = getFirestore(app);
const storage: FirebaseStorage = getStorage(app);

// Xuất ra để dùng ở các file khác
export { app, auth, db, storage };

function getReactNativePersistence(AsyncStorage: AsyncStorageStatic): import("@firebase/auth").Persistence | import("@firebase/auth").Persistence[] | undefined {
    throw new Error("Function not implemented.");
}
