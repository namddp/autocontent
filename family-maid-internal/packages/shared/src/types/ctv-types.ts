// Shared types cho CTV (Cộng Tác Viên / Bảo mẫu)

export type CtvStatus = 'AVAILABLE' | 'WORKING' | 'UNAVAILABLE' | 'INACTIVE';

export interface CtvDto {
  id: string;
  fullName: string;
  phone?: string;
  yearsExperience: number;
  hasCertificate: boolean;
  bio?: string;
  avatarUrl?: string;
  status: CtvStatus;
  avgRating: number;
  totalReviews: number;
  referredByName?: string;  // Sales giới thiệu
  skills: string[];
  createdAt: string;
}

export interface CtvReviewDto {
  id: string;
  ctvId: string;
  caseId: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export const CTV_STATUS_LABELS: Record<CtvStatus, string> = {
  AVAILABLE: 'Sẵn sàng',
  WORKING: 'Đang làm ca',
  UNAVAILABLE: 'Tạm nghỉ',
  INACTIVE: 'Ngưng hợp tác',
};
