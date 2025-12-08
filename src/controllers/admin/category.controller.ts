import { db } from '../../services/firebaseConfig';
import { collection, addDoc, getDocs, query, orderBy, deleteDoc, updateDoc, doc } from 'firebase/firestore';
import { Category, CategoryData } from '../../models/category.model';

// 1. Thêm danh mục mới
export const addCategoryToFirestore = async (newCategory: Category): Promise<void> => {
  try {
    const categoryData = newCategory.toFirestore();
    await addDoc(collection(db, 'categories'), categoryData);
    console.log('Category added successfully!');
  } catch (error) {
    console.error('Error adding category: ', error);
    throw error;
  }
};

// 2. Lấy danh sách danh mục (Sắp xếp mới nhất trước)
export const getCategories = async (): Promise<Category[]> => {
  try {
    const q = query(collection(db, 'categories'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const categories: Category[] = [];
    querySnapshot.forEach((doc) => {
      categories.push(Category.fromFirestore(doc));
    });

    return categories;
  } catch (error) {
    console.error('Error getting categories: ', error);
    return [];
  }
};
// --- 3. CẬP NHẬT CATEGORY ---
export const updateCategory = async (id: string, data: Partial<CategoryData>): Promise<void> => {
  try {
    const catRef = doc(db, 'categories', id);
    await updateDoc(catRef, data);
    console.log('Category updated successfully');
  } catch (error) {
    console.error('Error updating category:', error);
    throw error;
  }
};

// --- 4. XÓA CATEGORY ---
export const deleteCategory = async (id: string): Promise<void> => {
  try {
    const catRef = doc(db, 'categories', id);
    await deleteDoc(catRef);
    console.log('Category deleted successfully');
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
};