export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  RECEPTIONIST = 'RECEPTIONIST',
  STYLIST = 'STYLIST',
}

export const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.CUSTOMER]: 'Khách hàng',
  [UserRole.RECEPTIONIST]: 'Tiếp tân',
  [UserRole.STYLIST]: 'Thợ cắt tóc',
};
