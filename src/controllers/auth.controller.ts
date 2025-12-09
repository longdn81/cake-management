// src/controllers/auth.controller.ts

import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, getAuth, EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth'; // Import thêm signIn
import { doc, setDoc, getDoc, updateDoc, arrayRemove, arrayUnion } from 'firebase/firestore';
import { auth, db } from '../services/firebaseConfig';
import { User } from '../models/user.model';

// --- HÀM LOGIN MỚI ---
export const loginUser = async (email: string, pass: string) => {
  try {
    // 1. Đăng nhập Auth
    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
    const uid = userCredential.user.uid;

    // 2. Lấy thông tin Role từ Firestore
    const userDocRef = doc(db, "users", uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      return {
        uid: uid,
        role: userData.role || 'client', // Mặc định là client nếu không tìm thấy role
        ...userData
      };
    } else {
      throw new Error("User data not found in database.");
    }
  } catch (error: any) {
    console.error("Login Error:", error);
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
    console.log("User signed out!");
  } catch (error) {
    console.error("Logout Error:", error);
    throw error;
  }
};

// Hàm cập nhật thông tin User
export const updateUserProfile = async (uid: string, data: any) => {
  try {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, data);
    console.log("User profile updated!");
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
};

export const changeUserPassword = async (currentPassword: string, newPassword: string) => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user || !user.email) {
    throw new Error("No user logged in");
  }

  try {
    // 1. Tạo credential từ mật khẩu cũ
    const credential = EmailAuthProvider.credential(user.email, currentPassword);

    // 2. Xác thực lại (Re-authenticate) để đảm bảo chính chủ
    await reauthenticateWithCredential(user, credential);

    // 3. Nếu đúng mật khẩu cũ, tiến hành cập nhật mật khẩu mới
    await updatePassword(user, newPassword);
    
    return true;
  } catch (error: any) {
    console.error("Change password error:", error);
    if (error.code === 'auth/wrong-password') {
      throw new Error("Mật khẩu hiện tại không đúng.");
    }
    throw error;
  }
};

// 1. Hàm Toggle Favorite (Thêm/Xóa)
export const toggleUserFavorite = async (uid: string, cakeId: string, isAdding: boolean) => {
  try {
    const userRef = doc(db, "users", uid);
    
    if (isAdding) {
      // Thêm ID vào mảng favorites (arrayUnion tự động tránh trùng lặp)
      await updateDoc(userRef, {
        favorites: arrayUnion(cakeId)
      });
    } else {
      // Xóa ID khỏi mảng favorites
      await updateDoc(userRef, {
        favorites: arrayRemove(cakeId)
      });
    }
  } catch (error) {
    console.error("Lỗi toggle favorite:", error);
    throw error;
  }
};

// 2. Hàm lấy danh sách User Favorites (Trả về mảng ID)
export const getUserFavoritesIds = async (uid: string): Promise<string[]> => {
  try {
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
      return userDoc.data().favorites || [];
    }
    return [];
  } catch (error) {
    console.error("Lỗi lấy favorites:", error);
    return [];
  }
};