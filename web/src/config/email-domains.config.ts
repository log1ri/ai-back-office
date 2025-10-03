// รายการ domain ที่อนุญาตสำหรับการ register
export const ALLOWED_EMAIL_DOMAINS = [
  'example.com',
  'unit.co.th',
  'gmail.com',
  'hotmail.com',
  'outlook.com',
  'yahoo.com',
  'company.com',
  'organization.org'
];

// ฟังก์ชันตรวจสอบ email domain
export const isValidEmailDomain = (email: string): boolean => {
  const domain = email.split('@')[1]?.toLowerCase();
  console.log(ALLOWED_EMAIL_DOMAINS.includes(domain));
  return ALLOWED_EMAIL_DOMAINS.includes(domain);
};

// ฟังก์ชันตรวจสอบ email format
export const isValidEmailFormat = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}; 