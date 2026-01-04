import {
  Home,
  Wifi,
  Power,
  Receipt,
  Droplet,
  Building2,
  UtensilsCrossed,
  ShoppingCart,
  Car,
  ShoppingBag,
  Package,
  Music,
  Dumbbell,
  BookOpen,
  CreditCard,
  CircleDot,
  type LucideIcon,
} from 'lucide-react'

// 12 個視覺上易於區分的顏色（在色輪上均勻分布，確保每個顏色都有明顯差異）
export const CATEGORY_COLORS = [
  '#2563eb', // Blue - 藍色
  '#16a34a', // Green - 綠色
  '#ea580c', // Orange - 橙色
  '#dc2626', // Red - 紅色
  '#9333ea', // Purple - 紫色
  '#0891b2', // Cyan - 青色
  '#ec4899', // Pink - 粉紅色
  '#eab308', // Yellow - 黃色
  '#14b8a6', // Teal - 青綠色
  '#6366f1', // Indigo - 靛藍色
  '#f97316', // Orange-red - 橙紅色
  '#84cc16', // Lime - 青檸色
]

// 定義固定的類別順序（與 TransactionOverview 相同）
export const CATEGORY_ORDER: string[] = [
  // Rent & Bills
  'Rent',
  'Wi-Fi',
  'Energy',
  'Council Tax',
  'Water',
  'Council',
  // Daily Expense
  'Eating Out',
  'Groceries',
  'Transportation',
  'Shopping',
  'Necessity',
  'Entertainment',
  'Exercise',
  'Learning',
  'Subscription',
  'Subscription Service',
  'Others',
]

// 類別圖標映射
export const categoryIcons: Record<string, LucideIcon> = {
  Rent: Home,
  'Wi-Fi': Wifi,
  Energy: Power,
  'Council Tax': Receipt,
  Council: Building2,
  Water: Droplet,
  'Eating Out': UtensilsCrossed,
  Groceries: ShoppingCart,
  Transportation: Car,
  Shopping: ShoppingBag,
  Necessity: Package,
  Entertainment: Music,
  Exercise: Dumbbell,
  Learning: BookOpen,
  Subscription: CreditCard,
  'Subscription Service': CreditCard,
  Others: CircleDot,
}

/**
 * 根據類別名稱獲取圖標
 */
export function getCategoryIcon(category: string): LucideIcon {
  return categoryIcons[category] || CircleDot
}

/**
 * 根據類別名稱獲取顏色（確保同一類別總是使用相同的顏色）
 * 使用與 TransactionOverview 相同的邏輯：根據類別在固定順序列表中的索引來分配顏色
 */
export function getCategoryColor(category: string): string {
  // 根據類別在固定順序列表中的索引來分配顏色
  const index = CATEGORY_ORDER.indexOf(category)
  // 如果類別在列表中，使用該索引；否則使用類別名稱的哈希值
  if (index !== -1) {
    return CATEGORY_COLORS[index % CATEGORY_COLORS.length]
  }
  // 對於不在列表中的類別，使用哈希函數
  let hash = 0
  for (let i = 0; i < category.length; i++) {
    hash = category.charCodeAt(i) + ((hash << 5) - hash)
  }
  return CATEGORY_COLORS[Math.abs(hash) % CATEGORY_COLORS.length]
}

/**
 * 將十六進制顏色轉換為 rgba 格式（添加透明度）
 */
export function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

