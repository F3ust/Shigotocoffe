export interface BilingualText {
  ja: string;
  vi: string;
}

export interface MenuItem {
  name: string;
  price: number;
  image?: string;
}

export interface Cafe {
  _id: string;
  name: BilingualText;
  description: BilingualText;
  address: BilingualText;
  district: string;
  openingHours: { open: string; close: string };
  isOpen: boolean;
  images: string[];
  menu: MenuItem[];
  hashtags: string[];
  averageRating: number;
  reviewCount: number;
}

export interface CafeListResponse {
  status: string;
  data: Cafe[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CafeQueryParams {
  q?: string;
  district?: string;
  minRating?: string;
  tags?: string;
  page?: string;
  limit?: string;
}
