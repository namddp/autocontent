// Shared types cho Ca dịch vụ — đơn vị kinh doanh cơ bản của FamilyMaid

export type CaseStatus =
  | 'CONSIDERING'   // Còn suy nghĩ
  | 'CV_SENT'       // Gửi CV chưa phản hồi
  | 'DEPOSIT_CONFIRMED' // Đã chốt cọc
  | 'ASSIGNED'      // Đã giao
  | 'IN_PROGRESS'   // Đang làm
  | 'COMPLETED'     // Đã xong
  | 'CANCELLED';    // Đã hủy

export type CaseType =
  | 'DAY_SINGLE'      // Ca ngày lẻ
  | 'NIGHT_SINGLE'    // Ca đêm lẻ
  | 'FULLDAY_SINGLE'  // Ca 24/24 lẻ
  | 'DAY_MONTHLY'     // Ca tháng ngày
  | 'NIGHT_MONTHLY'   // Ca tháng đêm
  | 'FULLDAY_MONTHLY' // Ca 24/24 tháng
  | 'BATH_BABY'       // Tắm bé
  | 'POSTPARTUM'      // Phục hồi mẹ và bé
  | 'TET'             // Ca Tết
  | 'OTHER';

export type ServiceType =
  | 'DV1'         // Dịch vụ 1
  | 'DV2'         // Dịch vụ 2
  | 'OLD_PRICE'   // Bảng giá cũ
  | 'NEW_PRICE'   // Bảng giá mới
  | 'MOTHER_CARE' // Chăm mẹ
  | 'BATH_BABY';  // Tắm bé

export type PaymentStatus = 'UNPAID' | 'DEPOSIT_PAID' | 'PAID';

export type LeadSource = 'FACEBOOK' | 'ZALO' | 'WEBSITE' | 'REFERRAL' | 'OTHER';

export interface ServiceCaseDto {
  id: string;
  caseCode?: string;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  babyInfo?: string;
  caseType: CaseType;
  serviceType: ServiceType;
  workingHours?: string;
  requirements?: string;
  address?: string;
  area?: string;
  startDate?: string;
  endDate?: string;
  status: CaseStatus;
  salesId?: string;
  salesName?: string;
  ctvId?: string;
  ctvName?: string;
  contractValue?: number;
  ctvPayout?: number;
  profit?: number;
  paymentStatus: PaymentStatus;
  notes?: string;
  createdAt: string;
}

// Nhãn hiển thị tiếng Việt cho frontend
export const CASE_STATUS_LABELS: Record<CaseStatus, string> = {
  CONSIDERING: 'Còn suy nghĩ',
  CV_SENT: 'Gửi CV chưa phản hồi',
  DEPOSIT_CONFIRMED: 'Đã chốt cọc',
  ASSIGNED: 'Đã giao',
  IN_PROGRESS: 'Đang làm',
  COMPLETED: 'Đã xong',
  CANCELLED: 'Đã hủy',
};

export const CASE_TYPE_LABELS: Record<CaseType, string> = {
  DAY_SINGLE: 'Ca ngày lẻ',
  NIGHT_SINGLE: 'Ca đêm lẻ',
  FULLDAY_SINGLE: 'Ca 24/24 lẻ',
  DAY_MONTHLY: 'Ca tháng ngày',
  NIGHT_MONTHLY: 'Ca tháng đêm',
  FULLDAY_MONTHLY: 'Ca 24/24 tháng',
  BATH_BABY: 'Tắm bé',
  POSTPARTUM: 'Phục hồi mẹ và bé',
  TET: 'Ca Tết',
  OTHER: 'Khác',
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  UNPAID: 'Chưa thu',
  DEPOSIT_PAID: 'Đã thu cọc',
  PAID: 'Đã thu đủ',
};

export const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  DV1: 'Dịch vụ 1',
  DV2: 'Dịch vụ 2',
  OLD_PRICE: 'Bảng giá cũ',
  NEW_PRICE: 'Bảng giá mới',
  MOTHER_CARE: 'Chăm mẹ',
  BATH_BABY: 'Tắm bé',
};
