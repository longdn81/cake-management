import { DocumentSnapshot, Timestamp } from "firebase/firestore";

export interface InventoryData {
  ingredient: string;
  quantity: number;
  unit: string;
  category: string;
  lowStock: boolean;
  minQuantity?: number; // [MỚI] Thêm trường này (optional vì data cũ có thể chưa có)
  createdAt: Timestamp;
}

export class InventoryItem {
  id?: string;
  ingredient: string;
  quantity: number;
  unit: string;
  category: string;
  lowStock: boolean;
  minQuantity: number; // [MỚI]
  createdAt: Timestamp;

  constructor(
    id: string | undefined,
    ingredient: string,
    quantity: number,
    unit: string,
    category: string = "Uncategorized",
    lowStock: boolean = false,
    createdAt: Timestamp = Timestamp.now(),
    minQuantity: number = 5 // [MỚI] Giá trị mặc định là 5 nếu không truyền vào
  ) {
    this.id = id;
    this.ingredient = ingredient;
    this.quantity = quantity;
    this.unit = unit;
    this.category = category;
    this.lowStock = lowStock;
    this.createdAt = createdAt;
    this.minQuantity = minQuantity;
  }

  // Convert dữ liệu để lưu lên Firestore
  toFirestore(): InventoryData {
    return {
      ingredient: this.ingredient,
      quantity: this.quantity,
      unit: this.unit,
      category: this.category,
      lowStock: this.lowStock,
      createdAt: this.createdAt,
      minQuantity: this.minQuantity, // [MỚI] Lưu mức báo động tùy chỉnh
    };
  }

  // Convert dữ liệu từ Firestore về App
  static fromFirestore(doc: DocumentSnapshot): InventoryItem {
    const data = doc.data() as InventoryData;
    return new InventoryItem(
      doc.id,
      data.ingredient,
      data.quantity,
      data.unit,
      data.category ?? "Uncategorized",
      data.lowStock ?? false,
      data.createdAt ?? Timestamp.now(),
      data.minQuantity ?? 5 // [MỚI] Nếu data cũ không có trường này, mặc định lấy là 5
    );
  }
}