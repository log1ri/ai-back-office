# 🚀 AI Back-Office OCR Service - Frontend Web Application

ระบบ Frontend Web Application ทำหน้าที่เป็นส่วนติดต่อกับผู้ใช้งาน เพื่อให้ผู้ใช้สามารถเข้าถึงฟังก์ชันทั้งหมดของระบบ AI Back-Office OCR Service ผ่านเว็บเบราว์เซอร์ได้อย่างสะดวก โดยพัฒนาด้วย **React + TailwindCSS + Vite + TypeScript** ทำงานแบบ **Single Page Application (SPA)** เพื่อให้การโหลดหน้าเว็บรวดเร็วและรองรับการสื่อสารกับ Backend แบบเรียลไทม์ผ่าน **REST API** และ **WebSocket**

## 🎯 ฟีเจอร์หลัก

- ✅ **Authentication & Authorization**: JWT-based authentication พร้อม Role-Based Access Control (RBAC)
- 📊 **Dashboard & Analytics**: แดชบอร์ดแสดงสถิติการใช้งาน OCR พร้อมกราฟเรียลไทม์
- 🖼️ **OCR Image Management**: ดูภาพที่ประมวลผล ตรวจสอบคุณภาพ และให้คะแนนภาพ
- 📝 **OCR Log Tracking**: ติดตามประวัติการประมวลผล OCR แบบเรียลไทม์
- 🔄 **Session Management**: จัดการ Session การใช้งาน OCR Service
- ⚠️ **Image Issue Detection**: ตรวจจับและจัดการปัญหาภาพที่ประมวลผลไม่สำเร็จ
- 👥 **User & Organization Management**: จัดการผู้ใช้และองค์กรแบบแบ่งระดับ (Multi-tenant)
- 💰 **Rate Model & Pricing**: ตรวจสอบราคาและการใช้งานแบบครบวงจร
- 📥 **Bulk Image Download**: ดาวน์โหลดภาพเป็น ZIP สำหรับปรับปรุงโมเดล AI
- 🔔 **Real-time Notifications**: รับการแจ้งเตือนแบบเรียลไทม์ผ่าน WebSocket

## 🏗️ สถาปัตยกรรมและเทคโนโลยีที่ใช้

### Core Technologies

| เทคโนโลยี | เวอร์ชัน | หน้าที่ |
|-----------|---------|---------|
| **React** | 19.1.0 | UI Library สำหรับสร้าง Component |
| **Vite** | 7.2.2 | Build Tool & Dev Server แบบเร็วสูง |
| **TypeScript** | 5.8.3 | Type Safety ลดบัคและอ่านโค้ดง่าย |
| **TanStack Router** | 1.130.2 | File-based Routing + Protected Routes |
| **TanStack Query** | 5.83.0 | Server State Management + Caching |
| **TailwindCSS** | 4.1.10 | Utility-first CSS Framework |
| **shadcn/ui** | Latest | Pre-built UI Components |
| **Socket.IO Client** | 4.8.1 | WebSocket สำหรับ Realtime Communication |
| **React Hook Form** | 7.58.1 | Form Management & Validation |
| **Zod** | 3.25.67 | Schema Validation |
| **Recharts** | 3.0.2 | Data Visualization Library |

### Key Features

1. **Routing**: TanStack Router
   - โครงสร้างเส้นทางแบบ Declarative & Nested Routes
   - Protected Route ตรวจสอบ JWT/Role ก่อนเข้าหน้า
   - Type-safe routing parameters

2. **Data Fetching**: TanStack Query (React Query)
   - จัดการ Caching, Refetching และ Background Updates
   - Optimistic Updates สำหรับ UX ที่ดีขึ้น
   - ผสานกับ Base HTTP Client พร้อม JWT Token

3. **UI & Styling**: TailwindCSS + shadcn/ui
   - Responsive Design ครอบคลุมทุกอุปกรณ์
   - Dark Mode Support
   - Component Library พร้อมใช้: Table, Modal, Button, Form, Chart

4. **Authentication**: JWT + RBAC
   - Access Token & Refresh Token ใน localStorage
   - Role-based Permission (Admin, User, Viewer)
   - Auto Token Refresh

5. **Realtime**: Socket.IO Client
   - รับ Event การอัปเดต Log แบบเรียลไทม์
   - JWT Authentication ใน WebSocket Handshake
   - Auto Reconnection

6. **Forms**: React Hook Form + Zod
   - Client-side Validation
   - Type-safe Form Data
   - Error Handling UI

## 📁 โครงสร้างโปรเจกต์

```
web/
├── .tanstack/              # TanStack Router generated files
├── node_modules/           # Dependencies
├── public/                 # Static assets
│   ├── AI-LPR.png
│   ├── LPR Eye-logo.png
│   ├── LPR Eye.ico
│   ├── best-practices.md
│   ├── changelog.md
│   └── usage-examples.md
├── src/
│   ├── assets/            # Images, icons, media
│   ├── components/        # Reusable React Components
│   │   ├── charts/       # Chart components (4 files)
│   │   ├── dashboard/    # Dashboard widgets (3 files)
│   │   ├── Sidebar/      # Sidebar navigation (4 files)
│   │   └── ui/           # shadcn/ui components (26 files)
│   ├── config/           # Configuration files
│   │   ├── auth.schema.ts
│   │   ├── email-domains.config.ts
│   │   ├── environment.ts
│   │   └── sidebar.config.ts
│   ├── constants/        # App constants
│   ├── contexts/         # React Context providers
│   │   ├── AuthContext.tsx
│   │   ├── BackendAuthContext.tsx
│   │   └── SubIdContext.tsx
│   ├── hooks/            # Custom React Hooks (21 hooks)
│   │   ├── useAuth.ts
│   │   ├── useAuthTokens.ts
│   │   ├── useOcrLogs.ts
│   │   ├── useRealtimeLogs.ts
│   │   └── ...
│   ├── lib/              # Utility libraries
│   │   ├── api-client.ts
│   │   ├── query-client.ts
│   │   └── utils.ts
│   ├── pages/            # Page components
│   │   ├── LoginPage.tsx
│   │   ├── BackendLoginPage.tsx
│   │   └── ocr-services/
│   │       ├── DashboardPage.tsx
│   │       ├── ImageLogPage.tsx
│   │       ├── ImageIssuePage.tsx
│   │       └── SessionPage.tsx
│   ├── routes/           # Route definitions
│   │   ├── __root.tsx
│   │   ├── index.tsx
│   │   ├── login.tsx
│   │   └── ocr-services/
│   ├── services/         # API service layer (13 services)
│   │   ├── auth.service.ts
│   │   ├── base-http-client.ts
│   │   ├── ocr-services-log.service.ts
│   │   ├── user.service.ts
│   │   └── ...
│   ├── types/           # TypeScript type definitions
│   │   ├── api.types.ts
│   │   ├── sidebar.types.ts
│   │   └── socket.types.ts
│   ├── User/            # User module
│   ├── utils/           # Utility functions
│   ├── App.css
│   ├── index.css
│   ├── main.tsx         # App entry point
│   ├── routeTree.gen.ts # Auto-generated routes
│   └── vite-env.d.ts
├── .dockerignore
├── .env                  # Environment variables
├── .gitignore
├── bun.lock
├── components.json       # shadcn/ui config
├── Dockerfile
├── eslint.config.js
├── index.html           # HTML entry point
├── package.json
├── README.md
├── tailwind.config.js
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
└── vite.config.ts
```

## 🚀 การติดตั้งและรัน

### Prerequisites

- Node.js 20+ หรือ Bun 1.0+
- Backend API running (API Gateway)

### Installation

```bash
# ติดตั้ง Dependencies
bun install
# หรือ
npm install
```

### Development

```bash
# รัน Development Server
bun dev
# หรือ
npm run dev
```

เปิดเบราว์เซอร์ที่ http://localhost:5173

### Build Production

```bash
# Build สำหรับ Production
bun run build
# หรือ
npm run build

# Preview Production Build
bun run preview
# หรือ
npm run preview
```

## 🔧 Environment Variables

สร้างไฟล์ `.env` และกำหนดค่าดังนี้:

```env
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_WS_URL=wss://api.yourdomain.com
VITE_APP_NAME=AI OCR Service
```

## 🏗️ Architecture Highlights

### 1. Authentication Flow

```
Login → JWT Token → localStorage → HTTP Interceptor → Protected Routes
                                                     ↓
                                            WebSocket Auth
```

### 2. Data Flow

```
Component → Custom Hook → TanStack Query → API Service → Backend API
                           ↓ (Cache)
                      Auto Refetch
```

### 3. Real-time Updates

```
Backend → WebSocket Event → Socket.IO Client → React State → UI Update
```

### 4. API Communication

- Base HTTP Client พร้อม JWT Auto-attach
- Error Handling แบบ Centralized
- Auto Retry & Token Refresh
- Type-safe Request/Response

## 📦 Key Dependencies

### Production

- `@tanstack/react-query` - Server state management
- `@tanstack/react-router` - Type-safe routing
- `socket.io-client` - WebSocket communication
- `react-hook-form` + `zod` - Form validation
- `recharts` - Data visualization
- `lucide-react` - Icon library
- `date-fns` - Date utilities
- `jwt-decode` - JWT parsing
- `file-saver` + `jszip` - File downloads

### Development

- `@vitejs/plugin-react-swc` - Fast refresh
- `@tanstack/router-plugin` - Route generation
- `typescript-eslint` - Linting
- `tailwindcss` - Styling

## 🔐 Security Features

- JWT-based Authentication
- Token Refresh Mechanism
- Protected Routes by Role
- XSS Protection
- CORS Configuration
- Environment Variable Protection

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints: sm, md, lg, xl, 2xl
- Touch-friendly UI
- Adaptive layouts

## 🎨 UI Components

จาก **shadcn/ui** รวม 26+ components:
- Avatar, Badge, Breadcrumb, Button, Calendar
- Card, Dialog, Dropdown, Input, Label
- Popover, Select, Separator, Sheet, Sidebar
- Skeleton, Switch, Table, Textarea, Tooltip
- Data Table (with sorting, filtering, pagination)

## 📚 Documentation

- [Best Practices](./public/best-practices.md)
- [Usage Examples](./public/usage-examples.md)
- [Changelog](./public/changelog.md)

## 🚢 Deployment

### Docker

```bash
# Build Docker Image
docker build -t lpr-frontend .

# Run Container
docker run -p 80:80 lpr-frontend
```

### DigitalOcean App Platform

1. Push code to Git repository
2. Connect repository to App Platform
3. Set environment variables
4. Deploy automatically

## 🤝 Contributing

1. Fork the project
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👨‍💻 Authors

**Your Team Name**

---

Built with ❤️ using React + Vite + TypeScript
