import { db } from "../../services/firebaseConfig";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  deleteDoc,
  updateDoc,
  doc,
} from "firebase/firestore";
import { InventoryItem, InventoryData } from "../../models/inventory.model";

const COLLECTION_NAME = "inventory";

// ➤ ADD ITEM
export const addInventoryToFirestore = async (
  newItem: InventoryItem
): Promise<void> => {
  try {
    const itemData = newItem.toFirestore();
    await addDoc(collection(db, COLLECTION_NAME), itemData);
  } catch (error) {
    console.error("Error adding inventory item: ", error);
    throw error;
  }
};

// ➤ GET LIST
export const getInventoryList = async (): Promise<InventoryItem[]> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((d) => InventoryItem.fromFirestore(d));
  } catch (error) {
    console.error("Error getting inventory list: ", error);
    return [];
  }
};

// ➤ UPDATE ITEM (chỉ update field thay đổi)
export const updateInventoryItem = async (
  id: string,
  data: Partial<InventoryData>
): Promise<void> => {
  try {
    const itemRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(itemRef, data);
  } catch (error) {
    console.error("Error updating inventory item:", error);
    throw error;
  }
};

// ➤ DELETE ITEM
export const deleteInventoryItem = async (id: string): Promise<void> => {
  try {
    const itemRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(itemRef);
  } catch (error) {
    console.error("Error deleting inventory item:", error);
    throw error;
  }
};
