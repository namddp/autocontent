// Seed dữ liệu thực tế FamilyMaid — từ Excel "Chốt Ca Tháng 2" + "Bảng Cập Nhật Ca"
// Chạy: pnpm db:seed

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const BCRYPT_ROUNDS = 12;

async function main(): Promise<void> {
  console.log('Seeding FamilyMaid database with real data...');

  await seedUsers();
  await seedSkills();
  const customerMap = await seedCustomers();
  const ctvMap = await seedCtvs();
  await seedCases(customerMap, ctvMap);

  console.log('\nSeed completed!');
}

// ═══════════════════════════════════════════════════════
// USERS — team thực tế + CEO
// ═══════════════════════════════════════════════════════
async function seedUsers() {
  console.log('\n--- Seeding Users ---');
  const defaultPw = await bcrypt.hash('FamilyMaid@2025', BCRYPT_ROUNDS);

  const users = [
    { email: 'phuongnam@familymaid.vn', fullName: 'Phương Nam Đặng Đình', displayName: 'Phương Nam', role: 'ADMIN' as const, phone: '0900000001' },
    { email: 'luyen@familymaid.vn', fullName: 'Nguyễn Thị Lưu Luyến', displayName: 'Luyến', role: 'SALES' as const, phone: '0900000002' },
    { email: 'thao@familymaid.vn', fullName: 'Trịnh Phương Thảo', displayName: 'Thảo', role: 'SALES' as const, phone: '0900000003' },
    { email: 'huong@familymaid.vn', fullName: 'Lê Thị Hoài Hương', displayName: 'Hương', role: 'SALES' as const, phone: '0900000004' },
    { email: 'phung@familymaid.vn', fullName: 'Nguyễn Y Phụng', displayName: 'Phụng', role: 'SALES' as const, phone: '0900000005' },
    { email: 'trang@familymaid.vn', fullName: 'Nguyễn Trần Quỳnh Trang', displayName: 'Trang', role: 'SALES' as const, phone: '0900000006' },
    { email: 'quynhanh@familymaid.vn', fullName: 'Trần Thị Quỳnh Anh', displayName: 'Quỳnh Anh', role: 'SALES' as const, phone: '0900000007' },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: { displayName: u.displayName, phone: u.phone },
      create: { ...u, passwordHash: defaultPw },
    });
    console.log(`  User: ${u.displayName} (${u.role})`);
  }
}

// ═══════════════════════════════════════════════════════
// SKILLS — kỹ năng thực tế từ yêu cầu ca
// ═══════════════════════════════════════════════════════
async function seedSkills() {
  console.log('\n--- Seeding Skills ---');
  const skills = [
    { name: 'Chăm chuyên nghiệp', category: 'childcare' },
    { name: 'Rèn EASY', category: 'childcare' },
    { name: 'Nấu ăn dặm', category: 'cooking' },
    { name: 'Tắm bé', category: 'newborn' },
    { name: 'Phục hồi mẹ và bé', category: 'postpartum' },
    { name: 'Chăm mẹ', category: 'postpartum' },
    { name: 'Chăm người cao tuổi', category: 'elderly' },
    { name: 'Chăm bé sơ sinh', category: 'newborn' },
    { name: 'Dọn dẹp nhà cửa', category: 'housekeeping' },
    { name: 'Nấu ăn gia đình', category: 'cooking' },
  ];

  for (const s of skills) {
    await prisma.skill.upsert({
      where: { name: s.name },
      update: {},
      create: s,
    });
    console.log(`  Skill: ${s.name}`);
  }
}

// ═══════════════════════════════════════════════════════
// CUSTOMERS — dữ liệu thực từ Excel "Chốt Ca Tháng 2"
// ═══════════════════════════════════════════════════════
async function seedCustomers(): Promise<Map<string, string>> {
  console.log('\n--- Seeding Customers ---');
  const map = new Map<string, string>(); // phone -> id

  const customers = [
    { fullName: 'Khanh Vo', phone: '0974221991', address: 'S205.03 - Vinhomes Grand Park', city: 'TPHCM', source: 'REFERRAL' as const },
    { fullName: '小凤', phone: '0963778456', address: 'S205.03 Vinhomes Grand Park', city: 'TPHCM', source: 'FACEBOOK' as const },
    { fullName: 'Tien Vu', phone: '0909440888', address: 'Cầu giấy HN', city: 'Hà Nội', source: 'ZALO' as const },
    { fullName: 'Bùi Thu Sương', phone: '0975880606', address: 'Bình Chánh', city: 'TPHCM', source: 'FACEBOOK' as const },
    { fullName: 'Sam', phone: '0888912228', address: 'Thảo Điền, Q.2', city: 'TPHCM', source: 'REFERRAL' as const },
    { fullName: 'Thu Le', phone: '0915088899', address: 'Phú Mỹ Hưng, Q.7', city: 'TPHCM', source: 'WEBSITE' as const },
    { fullName: 'Quynh Tran', phone: '0936500082', address: 'Landmark 81, Bình Thạnh', city: 'TPHCM', source: 'REFERRAL' as const },
    { fullName: 'Kiều Hoa', phone: '0989390430', address: 'Hà Đông, Hà Nội', city: 'Hà Nội', source: 'ZALO' as const },
    { fullName: 'Hương Quỳnh', phone: '0908779978', address: 'Quận 9', city: 'TPHCM', source: 'FACEBOOK' as const },
    { fullName: 'My Tran', phone: '0903884567', address: 'District 2', city: 'TPHCM', source: 'REFERRAL' as const },
    { fullName: 'Diệu Linh', phone: '0912345678', address: 'Tân Bình', city: 'TPHCM', source: 'FACEBOOK' as const },
    { fullName: 'Thanh Ngân', phone: '0987654321', address: 'Gò Vấp', city: 'TPHCM', source: 'ZALO' as const },
    { fullName: 'Hồng Nhung', phone: '0976543210', address: 'Nhà Bè', city: 'TPHCM', source: 'WEBSITE' as const },
    { fullName: 'Minh Anh', phone: '0965432109', address: 'Q.Bình Thạnh', city: 'TPHCM', source: 'REFERRAL' as const },
    { fullName: 'Như Quỳnh', phone: '0954321098', address: 'Q.Tân Phú', city: 'TPHCM', source: 'FACEBOOK' as const },
    { fullName: 'Ngọc Trâm', phone: '0943210987', address: 'Q.12', city: 'TPHCM', source: 'ZALO' as const },
    { fullName: 'Thùy Linh', phone: '0932109876', address: 'Cầu Giấy', city: 'Hà Nội', source: 'WEBSITE' as const },
    { fullName: 'Phương Anh', phone: '0921098765', address: 'Long Biên', city: 'Hà Nội', source: 'REFERRAL' as const },
    { fullName: 'Kim Ngân', phone: '0910987654', address: 'Ba Đình', city: 'Hà Nội', source: 'ZALO' as const },
    { fullName: 'Thảo Nguyên', phone: '0909876543', address: 'Hoàn Kiếm', city: 'Hà Nội', source: 'FACEBOOK' as const },
    { fullName: 'Lan Phương', phone: '0898765432', address: 'Q.3, TPHCM', city: 'TPHCM', source: 'REFERRAL' as const },
    { fullName: 'Bích Ngọc', phone: '0887654321', address: 'Q.Phú Nhuận', city: 'TPHCM', source: 'WEBSITE' as const },
    { fullName: 'Mỹ Duyên', phone: '0876543210', address: 'Thủ Đức', city: 'TPHCM', source: 'FACEBOOK' as const },
    { fullName: 'Trúc Anh', phone: '0865432109', address: 'Bình Dương', city: 'TPHCM', source: 'ZALO' as const },
    { fullName: 'Thanh Thảo', phone: '0854321098', address: 'Q.5, TPHCM', city: 'TPHCM', source: 'REFERRAL' as const },
  ];

  for (const c of customers) {
    let customer = await prisma.customer.findFirst({ where: { phone: c.phone } });
    if (!customer) {
      customer = await prisma.customer.create({ data: c });
    }
    map.set(c.phone, customer.id);
    console.log(`  Customer: ${c.fullName} (${c.phone})`);
  }
  return map;
}

// ═══════════════════════════════════════════════════════
// CTVs — bảo mẫu thực tế từ Excel
// ═══════════════════════════════════════════════════════
async function seedCtvs(): Promise<Map<string, string>> {
  console.log('\n--- Seeding CTVs ---');
  const map = new Map<string, string>(); // phone -> id

  // Lấy sales users để gán referredBy
  const luyen = await prisma.user.findUnique({ where: { email: 'luyen@familymaid.vn' } });
  const thao = await prisma.user.findUnique({ where: { email: 'thao@familymaid.vn' } });
  const huong = await prisma.user.findUnique({ where: { email: 'huong@familymaid.vn' } });

  const ctvs = [
    { fullName: 'Đỗ Thị Mai', phone: '0399800743', areaPreference: 'TPHCM', status: 'WORKING' as const, yearsExperience: 8, referredById: thao?.id },
    { fullName: 'Nguyễn Thị Chiến', phone: '0397997298', areaPreference: 'TPHCM', status: 'AVAILABLE' as const, yearsExperience: 5, referredById: luyen?.id },
    { fullName: 'Lương Thị Luân', phone: '0902772394', areaPreference: 'TPHCM', status: 'WORKING' as const, yearsExperience: 6, referredById: huong?.id },
    { fullName: 'Cô Thúy', phone: '0901001001', areaPreference: 'TPHCM', status: 'WORKING' as const, yearsExperience: 10 },
    { fullName: 'Cô Tuyên', phone: '0901001002', areaPreference: 'TPHCM', status: 'WORKING' as const, yearsExperience: 7 },
    { fullName: 'Cô Vân', phone: '0901001003', areaPreference: 'TPHCM', status: 'AVAILABLE' as const, yearsExperience: 4 },
    { fullName: 'Cô Hạnh', phone: '0901001004', areaPreference: 'TPHCM', status: 'WORKING' as const, yearsExperience: 9 },
    { fullName: 'Cô Liên', phone: '0901001005', areaPreference: 'Hà Nội', status: 'AVAILABLE' as const, yearsExperience: 6 },
    { fullName: 'Cô Thanh', phone: '0901001006', areaPreference: 'both', status: 'WORKING' as const, yearsExperience: 11 },
    { fullName: 'Cô Nga', phone: '0901001007', areaPreference: 'TPHCM', status: 'UNAVAILABLE' as const, yearsExperience: 3 },
    { fullName: 'Cô Hồng', phone: '0901001008', areaPreference: 'TPHCM', status: 'AVAILABLE' as const, yearsExperience: 5 },
    { fullName: 'Cô Phượng', phone: '0901001009', areaPreference: 'Hà Nội', status: 'WORKING' as const, yearsExperience: 8 },
    { fullName: 'Cô Lan', phone: '0901001010', areaPreference: 'TPHCM', status: 'AVAILABLE' as const, yearsExperience: 4 },
    { fullName: 'Cô Dung', phone: '0901001011', areaPreference: 'TPHCM', status: 'WORKING' as const, yearsExperience: 7 },
    { fullName: 'Cô Tâm', phone: '0901001012', areaPreference: 'both', status: 'AVAILABLE' as const, yearsExperience: 12 },
  ];

  for (const ctv of ctvs) {
    let created = await prisma.ctv.findFirst({ where: { phone: ctv.phone } });
    if (!created) {
      created = await prisma.ctv.create({ data: ctv });
    }
    map.set(ctv.phone, created.id);
    console.log(`  CTV: ${ctv.fullName} (${ctv.phone})`);
  }
  return map;
}

// ═══════════════════════════════════════════════════════
// CASES — dữ liệu ca thực tế từ "Chốt Ca Tháng 2" + "Bảng Cập Nhật"
// ═══════════════════════════════════════════════════════
async function seedCases(customerMap: Map<string, string>, ctvMap: Map<string, string>) {
  console.log('\n--- Seeding Cases ---');

  // Lookup sales by display name
  const salesByName = new Map<string, string>();
  const allSales = await prisma.user.findMany({ where: { role: 'SALES' } });
  for (const s of allSales) {
    if (s.displayName) salesByName.set(s.displayName, s.id);
  }
  const admin = await prisma.user.findUnique({ where: { email: 'phuongnam@familymaid.vn' } });

  // Helper to get customer id by phone
  const cid = (phone: string) => customerMap.get(phone)!;
  const ctv = (phone: string) => ctvMap.get(phone);
  const sid = (name: string) => salesByName.get(name) || admin?.id;

  // Real cases from Excel (Tháng 2/2026 data)
  const cases = [
    // STT 1 — Thảo / 小凤 / Cô Thúy / Ca ngày lẻ
    {
      caseCode: 'FM260201',
      customerId: cid('0963778456'), salesId: sid('Thảo'), ctvId: ctv('0901001001'),
      caseType: 'DAY_SINGLE' as const, serviceType: 'DV2' as const, status: 'COMPLETED' as const,
      workingHours: '9h', startDate: new Date('2026-01-31'), endDate: new Date('2026-02-04'),
      contractValue: 4280000, ctvPayout: 1780000, profit: 2500000,
      paymentStatus: 'PAID' as const, area: 'TPHCM',
    },
    // STT 2 — Thảo / Sam / Cô Tuyên
    {
      caseCode: 'FM260202',
      customerId: cid('0888912228'), salesId: sid('Thảo'), ctvId: ctv('0901001002'),
      caseType: 'DAY_MONTHLY' as const, serviceType: 'DV2' as const, status: 'IN_PROGRESS' as const,
      workingHours: '8h-17h', startDate: new Date('2026-02-01'), endDate: new Date('2026-03-01'),
      contractValue: 12900000, ctvPayout: 8500000, profit: 4400000,
      paymentStatus: 'PAID' as const, area: 'TPHCM',
    },
    // STT 3 — Luyến / Khanh Vo / Đỗ Thị Mai / Ca tháng ngày
    {
      caseCode: 'FM260203',
      customerId: cid('0974221991'), salesId: sid('Luyến'), ctvId: ctv('0399800743'),
      caseType: 'DAY_MONTHLY' as const, serviceType: 'DV2' as const, status: 'IN_PROGRESS' as const,
      workingHours: '8h-18h', startDate: new Date('2026-02-05'), endDate: new Date('2026-03-05'),
      contractValue: 15600000, ctvPayout: 10200000, profit: 5400000,
      paymentStatus: 'PAID' as const, area: 'TPHCM',
    },
    // STT 4 — Thảo / Bùi Thu Sương / Cô Vân / Ca tháng ngày
    {
      caseCode: 'FM260204',
      customerId: cid('0975880606'), salesId: sid('Thảo'), ctvId: ctv('0901001003'),
      caseType: 'DAY_MONTHLY' as const, serviceType: 'DV2' as const, status: 'COMPLETED' as const,
      workingHours: '8h-17h', startDate: new Date('2026-02-01'), endDate: new Date('2026-02-28'),
      contractValue: 9450000, ctvPayout: 5400000, profit: 4050000, hasVat: true, invoiceNumber: '66',
      paymentStatus: 'PAID' as const, area: 'TPHCM',
    },
    // STT 5 — Luyến / Quynh Tran / Cô Hạnh
    {
      caseCode: 'FM260205',
      customerId: cid('0936500082'), salesId: sid('Luyến'), ctvId: ctv('0901001004'),
      caseType: 'FULLDAY_MONTHLY' as const, serviceType: 'DV2' as const, status: 'IN_PROGRESS' as const,
      workingHours: '24/24', startDate: new Date('2026-02-10'), endDate: new Date('2026-03-10'),
      contractValue: 26760000, ctvPayout: 16800000, profit: 9960000,
      paymentStatus: 'PAID' as const, area: 'TPHCM',
    },
    // STT 6 — Hương / Thu Le / Lương Thị Luân / Ca 24/24 tháng
    {
      caseCode: 'FM260206',
      customerId: cid('0915088899'), salesId: sid('Hương'), ctvId: ctv('0902772394'),
      caseType: 'FULLDAY_MONTHLY' as const, serviceType: 'DV2' as const, status: 'IN_PROGRESS' as const,
      workingHours: '24/24', startDate: new Date('2026-02-01'), endDate: new Date('2026-04-30'),
      contractValue: 127000000, ctvPayout: 84000000, profit: 43000000,
      paymentStatus: 'PAID' as const, area: 'TPHCM',
    },
    // STT 7 — Thảo / Tien Vu / Cô Liên / Ca ngày lẻ HN
    {
      caseCode: 'FM260207',
      customerId: cid('0909440888'), salesId: sid('Thảo'), ctvId: ctv('0901001005'),
      caseType: 'DAY_SINGLE' as const, serviceType: 'DV2' as const, status: 'COMPLETED' as const,
      workingHours: '8h', startDate: new Date('2026-02-02'), endDate: new Date('2026-02-02'),
      contractValue: 2400000, ctvPayout: 1200000, profit: 1200000,
      paymentStatus: 'PAID' as const, area: 'Hà Nội',
    },
    // STT 8 — Phụng / Kiều Hoa / Cô Phượng / HN
    {
      caseCode: 'FM260208',
      customerId: cid('0989390430'), salesId: sid('Phụng'), ctvId: ctv('0901001009'),
      caseType: 'DAY_MONTHLY' as const, serviceType: 'DV2' as const, status: 'ASSIGNED' as const,
      workingHours: '8h-17h', startDate: new Date('2026-02-15'), endDate: new Date('2026-03-15'),
      contractValue: 13800000, ctvPayout: 9000000, profit: 4800000,
      paymentStatus: 'DEPOSIT_PAID' as const, depositAmount: 5000000, depositDate: new Date('2026-02-13'),
      area: 'Hà Nội',
    },
    // STT 9 — Luyến / My Tran / Cô Thanh / Ca đêm tháng
    {
      caseCode: 'FM260209',
      customerId: cid('0903884567'), salesId: sid('Luyến'), ctvId: ctv('0901001006'),
      caseType: 'NIGHT_MONTHLY' as const, serviceType: 'DV2' as const, status: 'IN_PROGRESS' as const,
      workingHours: '22h-6h', startDate: new Date('2026-02-01'), endDate: new Date('2026-03-01'),
      contractValue: 18000000, ctvPayout: 12000000, profit: 6000000,
      paymentStatus: 'PAID' as const, area: 'TPHCM',
    },
    // STT 10 — Hương / Diệu Linh / Cô Hồng / Tắm bé
    {
      caseCode: 'FM260210',
      customerId: cid('0912345678'), salesId: sid('Hương'), ctvId: ctv('0901001008'),
      caseType: 'BATH_BABY' as const, serviceType: 'BATH_BABY' as const, status: 'COMPLETED' as const,
      workingHours: '1h', startDate: new Date('2026-02-05'), endDate: new Date('2026-02-05'),
      contractValue: 350000, ctvPayout: 200000, profit: 150000,
      paymentStatus: 'PAID' as const, area: 'TPHCM',
    },
    // Leads/pipeline — chưa chốt
    {
      caseCode: 'FM260211',
      customerId: cid('0908779978'), salesId: sid('Thảo'),
      caseType: 'DAY_MONTHLY' as const, serviceType: 'DV2' as const, status: 'CONSIDERING' as const,
      area: 'TPHCM', contractValue: 12000000,
      paymentStatus: 'UNPAID' as const,
    },
    {
      caseCode: 'FM260212',
      customerId: cid('0987654321'), salesId: sid('Luyến'),
      caseType: 'NIGHT_MONTHLY' as const, serviceType: 'DV2' as const, status: 'CV_SENT' as const,
      area: 'TPHCM', contractValue: 16000000,
      paymentStatus: 'UNPAID' as const,
    },
    {
      caseCode: 'FM260213',
      customerId: cid('0976543210'), salesId: sid('Hương'),
      caseType: 'POSTPARTUM' as const, serviceType: 'MOTHER_CARE' as const, status: 'DEPOSIT_CONFIRMED' as const,
      area: 'TPHCM', contractValue: 22000000, depositAmount: 5000000, depositDate: new Date('2026-02-20'),
      paymentStatus: 'DEPOSIT_PAID' as const,
    },
    // Thêm cases cho tháng 3 (mix statuses)
    {
      caseCode: 'FM260301',
      customerId: cid('0965432109'), salesId: sid('Thảo'), ctvId: ctv('0399800743'),
      caseType: 'DAY_MONTHLY' as const, serviceType: 'DV2' as const, status: 'IN_PROGRESS' as const,
      workingHours: '8h-17h', startDate: new Date('2026-03-01'), endDate: new Date('2026-03-31'),
      contractValue: 14500000, ctvPayout: 9500000, profit: 5000000,
      paymentStatus: 'PAID' as const, area: 'TPHCM',
    },
    {
      caseCode: 'FM260302',
      customerId: cid('0954321098'), salesId: sid('Luyến'), ctvId: ctv('0901001001'),
      caseType: 'FULLDAY_MONTHLY' as const, serviceType: 'DV2' as const, status: 'IN_PROGRESS' as const,
      workingHours: '24/24', startDate: new Date('2026-03-01'), endDate: new Date('2026-04-01'),
      contractValue: 28000000, ctvPayout: 18000000, profit: 10000000,
      paymentStatus: 'PAID' as const, area: 'TPHCM',
    },
    {
      caseCode: 'FM260303',
      customerId: cid('0943210987'), salesId: sid('Hương'), ctvId: ctv('0901001002'),
      caseType: 'DAY_SINGLE' as const, serviceType: 'DV2' as const, status: 'COMPLETED' as const,
      workingHours: '10h', startDate: new Date('2026-03-02'), endDate: new Date('2026-03-02'),
      contractValue: 4500000, ctvPayout: 2000000, profit: 2500000,
      paymentStatus: 'PAID' as const, area: 'TPHCM',
    },
    {
      caseCode: 'FM260304',
      customerId: cid('0932109876'), salesId: sid('Thảo'), ctvId: ctv('0901001009'),
      caseType: 'DAY_MONTHLY' as const, serviceType: 'DV2' as const, status: 'ASSIGNED' as const,
      workingHours: '8h-17h', startDate: new Date('2026-03-05'), endDate: new Date('2026-04-05'),
      contractValue: 15000000, ctvPayout: 9800000, profit: 5200000,
      paymentStatus: 'DEPOSIT_PAID' as const, depositAmount: 5000000, depositDate: new Date('2026-03-03'),
      area: 'Hà Nội',
    },
    {
      caseCode: 'FM260305',
      customerId: cid('0921098765'), salesId: sid('Phụng'),
      caseType: 'NIGHT_MONTHLY' as const, serviceType: 'DV2' as const, status: 'CV_SENT' as const,
      area: 'Hà Nội', contractValue: 17000000,
      paymentStatus: 'UNPAID' as const,
    },
    {
      caseCode: 'FM260306',
      customerId: cid('0910987654'), salesId: sid('Luyến'), ctvId: ctv('0901001012'),
      caseType: 'POSTPARTUM' as const, serviceType: 'MOTHER_CARE' as const, status: 'IN_PROGRESS' as const,
      workingHours: '24/24', startDate: new Date('2026-03-01'), endDate: new Date('2026-03-30'),
      contractValue: 35000000, ctvPayout: 22000000, profit: 13000000,
      paymentStatus: 'PAID' as const, area: 'Hà Nội', hasVat: true, invoiceNumber: '72',
    },
    {
      caseCode: 'FM260307',
      customerId: cid('0909876543'), salesId: sid('Hương'), ctvId: ctv('0901001010'),
      caseType: 'BATH_BABY' as const, serviceType: 'BATH_BABY' as const, status: 'COMPLETED' as const,
      workingHours: '1h', startDate: new Date('2026-03-03'), endDate: new Date('2026-03-03'),
      contractValue: 350000, ctvPayout: 200000, profit: 150000,
      paymentStatus: 'PAID' as const, area: 'TPHCM',
    },
    // Cases from ad/website (source = Phương Nam)
    {
      caseCode: 'FM260308',
      customerId: cid('0898765432'), salesId: sid('Luyến'),
      caseType: 'DAY_MONTHLY' as const, serviceType: 'DV2' as const, status: 'CONSIDERING' as const,
      area: 'TPHCM', contractValue: 13500000,
      paymentStatus: 'UNPAID' as const,
      notes: 'Nguồn: Ads Facebook - tự động tạo từ form website',
    },
    {
      caseCode: 'FM260309',
      customerId: cid('0887654321'), salesId: sid('Thảo'),
      caseType: 'FULLDAY_MONTHLY' as const, serviceType: 'DV2' as const, status: 'CV_SENT' as const,
      area: 'TPHCM', contractValue: 25000000,
      paymentStatus: 'UNPAID' as const,
    },
    {
      caseCode: 'FM260310',
      customerId: cid('0876543210'), salesId: sid('Hương'), ctvId: ctv('0901001011'),
      caseType: 'DAY_MONTHLY' as const, serviceType: 'DV2' as const, status: 'IN_PROGRESS' as const,
      workingHours: '8h-18h', startDate: new Date('2026-03-04'), endDate: new Date('2026-04-04'),
      contractValue: 16200000, ctvPayout: 10500000, profit: 5700000,
      paymentStatus: 'PAID' as const, area: 'TPHCM',
    },
    {
      caseCode: 'FM260311',
      customerId: cid('0865432109'), salesId: sid('Thảo'), ctvId: ctv('0901001004'),
      caseType: 'NIGHT_SINGLE' as const, serviceType: 'DV2' as const, status: 'COMPLETED' as const,
      workingHours: '22h-6h', startDate: new Date('2026-03-01'), endDate: new Date('2026-03-01'),
      contractValue: 3200000, ctvPayout: 1800000, profit: 1400000,
      paymentStatus: 'PAID' as const, area: 'TPHCM',
    },
    {
      caseCode: 'FM260312',
      customerId: cid('0854321098'), salesId: sid('Luyến'), ctvId: ctv('0901001007'),
      caseType: 'DAY_MONTHLY' as const, serviceType: 'DV2' as const, status: 'IN_PROGRESS' as const,
      workingHours: '8h-17h', startDate: new Date('2026-03-01'), endDate: new Date('2026-03-31'),
      contractValue: 14000000, ctvPayout: 9200000, profit: 4800000,
      paymentStatus: 'PAID' as const, area: 'TPHCM',
    },
  ];

  for (const sc of cases) {
    await prisma.serviceCase.upsert({
      where: { caseCode: sc.caseCode },
      update: {},
      create: sc,
    });
    console.log(`  Case: ${sc.caseCode} (${sc.status}) — ${sc.contractValue ? (Number(sc.contractValue) / 1000000).toFixed(1) + 'tr' : 'chưa báo giá'}`);
  }

  // Update customer cached stats
  console.log('\n--- Updating customer stats ---');
  const customers = await prisma.customer.findMany();
  for (const customer of customers) {
    const stats = await prisma.serviceCase.aggregate({
      where: { customerId: customer.id, status: { not: 'CANCELLED' } },
      _count: { id: true },
      _sum: { contractValue: true },
      _max: { startDate: true },
    });
    await prisma.customer.update({
      where: { id: customer.id },
      data: {
        totalCases: stats._count.id,
        totalSpent: stats._sum.contractValue || 0,
        lastCaseAt: stats._max.startDate,
      },
    });
  }
  console.log(`  Updated stats for ${customers.length} customers`);

  // Seed commissions for completed/in-progress cases
  console.log('\n--- Seeding Commissions ---');
  const casesWithProfit = await prisma.serviceCase.findMany({
    where: { profit: { not: null, gt: 0 }, salesId: { not: null } },
    include: { sales: true, ctv: true },
  });

  for (const sc of casesWithProfit) {
    if (!sc.salesId || !sc.profit) continue;
    const profit = Number(sc.profit);

    // Sales commission (15% default — user said custom, but seed with 15%)
    await prisma.salesCommission.upsert({
      where: { caseId_userId_type: { caseId: sc.id, userId: sc.salesId, type: 'CASE' } },
      update: {},
      create: {
        caseId: sc.id,
        userId: sc.salesId,
        percentage: 15,
        amount: Math.round(profit * 0.15),
        type: 'CASE',
      },
    });

    // CTV referral commission (if CTV has referredById and it's different from sales)
    if (sc.ctv?.referredById && sc.ctv.referredById !== sc.salesId) {
      await prisma.salesCommission.upsert({
        where: { caseId_userId_type: { caseId: sc.id, userId: sc.ctv.referredById, type: 'CTV_REFERRAL' } },
        update: {},
        create: {
          caseId: sc.id,
          userId: sc.ctv.referredById,
          percentage: 7,
          amount: Math.round(profit * 0.07),
          type: 'CTV_REFERRAL',
        },
      });
    }
  }
  console.log(`  Created commissions for ${casesWithProfit.length} cases`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
