export type CakeStatus = 'Available' | 'Low Stock' | 'Out of Stock';

// 1. Định nghĩa kiểu dữ liệu cho 1 Size
export interface CakeVariant {
  label: string; // VD: "3kg", "5kg", "Size L"
  price: number; // Giá riêng cho size này
}

export interface CakeData {
  name: string;
  // price này là giá hiển thị mặc định (thường là giá nhỏ nhất)
  price: number; 
  images: string[];
  category: string;
  status: CakeStatus;
  stock: number;
  description?: string;
  rate?: number;
  discount?: number;
  
  // --- THAY ĐỔI: Dùng mảng variants thay vì size đơn lẻ ---
  variants: CakeVariant[]; 
}

export class Cake {
  id: string;
  name: string;
  price: number;
  images: string[];
  category: string;
  status: CakeStatus;
  stock: number;
  description?: string;
  rate: number;
  discount: number;
  
  // --- THAY ĐỔI ---
  variants: CakeVariant[];

  constructor(
    id: string,
    name: string,
    price: number,
    images: string[],
    category: string,
    status: CakeStatus,
    stock: number,
    description: string = '',
    rate: number = 5.0, 
    discount: number = 0,
    // Mặc định là mảng rỗng nếu không truyền vào
    variants: CakeVariant[] = [] 
  ) {
    this.id = id;
    this.name = name;
    this.price = price;
    this.images = images;
    this.category = category;
    this.status = status;
    this.stock = stock;
    this.description = description;
    this.rate = rate;
    this.discount = discount;
    this.variants = variants;
  }

  get thumbnail(): string {
    return this.images?.[0] || 'https://via.placeholder.com/150';
  }

  get isAvailable(): boolean {
    return this.status !== 'Out of Stock' && this.stock > 0;
  }

  // Lấy giá thấp nhất và cao nhất để hiển thị (VD: $50 - $100)
  get priceRange(): string {
    if (this.variants.length === 0) return `$${this.price}`;
    
    // Tìm min max trong variants
    const prices = this.variants.map(v => v.price);
    const min = Math.min(...prices, this.price);
    const max = Math.max(...prices, this.price);
    
    if (min === max) return `$${min}`;
    return `$${min} - $${max}`;
  }

  toFirestore(): CakeData {
    return {
      name: this.name,
      price: this.price,
      images: this.images,
      category: this.category,
      status: this.status,
      stock: this.stock,
      description: this.description || '',
      rate: this.rate,
      discount: this.discount,
      // Lưu mảng variants lên DB
      variants: this.variants, 
    };
  }

  static fromFirestore(doc: any): Cake {
    const data = doc.data() || {};
    return new Cake(
      doc.id,
      data.name || '',
      data.price || 0,
      Array.isArray(data.images) ? data.images : (data.image ? [data.image] : []),
      data.category || 'Uncategorized',
      data.status || 'Available',
      data.stock ?? 0,
      data.description || '',
      data.rate ?? 5.0,
      data.discount ?? 0,
      // Load variants từ DB về
      Array.isArray(data.variants) ? data.variants : [] 
    );
  }
}
export default Cake;