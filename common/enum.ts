// common/enums.ts

export enum Role {
  ADMIN = 'ADMIN',
  DOCTOR = 'DOCTOR',
  STAFF = 'STAFF',
  PATIENT = 'PATIENT',
}

export enum Department {
  TELE_SALE = 'TELE_SALE',
  RECEPTION = 'RECEPTION',
  ACCOUNTING = 'ACCOUNTING',
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

export enum AppointmentStatus {
  WAITING = 'WAITING',
  SCHEDULED = 'SCHEDULED',
  DEPOSITED = 'DEPOSITED',
  DONE = 'DONE',
  CANCELLED = 'CANCELLED',
  FAILED = 'FAILED',
}

export enum AppointmentSource {
  ADS = 'ADS',
  SEEDING = 'SEEDING',
  WALKIN = 'WALKIN',
  REFERRAL = 'REFERRAL',
  OTHER = 'OTHER',
}

export enum AppointmentType {
  SCHEDULE_VISIT = 'SCHEDULE_VISIT',
  PROCEDURE = 'PROCEDURE',
  FOLLOW_UP = 'FOLLOW_UP',
}

export enum ServiceType {
  IMP = 'IMP',
  WISDOM_TOOTH = 'WISDOM_TOOTH',
  CERAMIC = 'CERAMIC',
  CLEANING = 'CLEANING',
  OTHER = 'OTHER',
}

// --- HỆ THỐNG NHÃN (LABEL) CHO UI ---

export const RoleLabels: Record<Role, string> = {
  [Role.ADMIN]: 'Quản trị viên',
  [Role.DOCTOR]: 'Bác sĩ',
  [Role.STAFF]: 'Nhân viên',
  [Role.PATIENT]: 'Bệnh nhân',
};

export const DepartmentLabels: Record<Department, string> = {
  [Department.TELE_SALE]: 'Telesale',
  [Department.RECEPTION]: 'Lễ tân',
  [Department.ACCOUNTING]: 'Kế toán',
};

export const StatusLabels: Record<AppointmentStatus, string> = {
  [AppointmentStatus.WAITING]: 'Chưa chốt',
  [AppointmentStatus.SCHEDULED]: 'Đã đặt lịch',
  [AppointmentStatus.DEPOSITED]: 'Đã đặt cọc',
  [AppointmentStatus.DONE]: 'Hoàn thành',
  [AppointmentStatus.CANCELLED]: 'Đã hủy',
  [AppointmentStatus.FAILED]: 'Không đến',
};

export const SourceLabels: Record<AppointmentSource, string> = {
  [AppointmentSource.ADS]: 'Quảng cáo',
  [AppointmentSource.SEEDING]: 'Seeding',
  [AppointmentSource.WALKIN]: 'Khách vãng lai',
  [AppointmentSource.REFERRAL]: 'Người quen giới thiệu',
  [AppointmentSource.OTHER]: 'Khác',
};

export const TypeLabels: Record<AppointmentType, string> = {
  [AppointmentType.SCHEDULE_VISIT]: 'Tái khám',
  [AppointmentType.PROCEDURE]: 'Thực hiện thủ thuật',
  [AppointmentType.FOLLOW_UP]: 'Theo dõi sau điều trị',
};

export const ServiceLabels: Record<ServiceType, string> = {
  [ServiceType.IMP]: 'Cấy ghép Implant',
  [ServiceType.WISDOM_TOOTH]: 'Nhổ răng khôn',
  [ServiceType.CERAMIC]: 'Răng sứ',
  [ServiceType.CLEANING]: 'Lấy cao răng',
  [ServiceType.OTHER]: 'Dịch vụ khác',
};

// --- HELPER FUNCTION ---

export const getLabel = (
  value: string, 
  map: Record<string, string>
): string => {
  return map[value] || value;
};

// Hàm lấy danh sách phòng ban KHÔNG bao gồm Kế toán
export const getFilteredDepartments = () => {
  return Object.values(Department).filter(
    (dept) => dept !== Department.ACCOUNTING
  );
};