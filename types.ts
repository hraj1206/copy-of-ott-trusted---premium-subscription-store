
export enum OrderStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export enum UserRole {
  ADMIN = 'ADMIN',
  CLIENT = 'CLIENT'
}

export interface OTTPlan {
  id: string;
  name: string;
  price: number;
  duration: string;
  features: string[];
}

export interface OTTService {
  id: string;
  name: string;
  logo: string;
  color: string;
  plans: OTTPlan[];
  isRecommended?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  phone: string;
  role: UserRole;
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  ottName: string;
  planName: string;
  amount: number;
  status: OrderStatus;
  createdAt: string;
  proofAttached: boolean;
  proofImage?: string; 
}

export interface Review {
  id: string;
  name: string;
  role: string;
  review: string;
  avatar: string;
}

export interface AppSettings {
  whatsappNumber: string;
  upiId: string;
  qrCodeUrl?: string; 
  demoVideoUrl: string;
  heroVideoUrl: string;
  reviews: Review[];
}
