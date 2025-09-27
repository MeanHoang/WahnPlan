# WahnPlan - Project Management Platform

WahnPlan là một nền tảng quản lý dự án toàn diện được xây dựng với kiến trúc monorepo hiện đại, sử dụng các công nghệ tiên tiến để tạo ra trải nghiệm quản lý công việc hiệu quả và trực quan.

## 🌟 Tính năng chính

### 📋 Quản lý công việc

- **Kanban Board**: Giao diện kéo thả trực quan để quản lý tiến độ công việc
- **Task Management**: Tạo, chỉnh sửa, và theo dõi các nhiệm vụ chi tiết
- **Task Attributes**: Quản lý thuộc tính đa dạng như trạng thái, độ ưu tiên, người thực hiện
- **Comments & Reactions**: Hệ thống bình luận và phản ứng cho từng công việc
- **File Upload**: Tải lên và quản lý tệp đính kèm với Cloudinary integration
- **Rich Text Editor**: Soạn thảo nội dung phong phú với TipTap editor

### 👥 Quản lý nhóm

- **Workspace Management**: Tạo và quản lý không gian làm việc
- **Member Roles**: Phân quyền chi tiết (Owner, Manager, Member, Guest)
- **Invitations**: Mời thành viên tham gia workspace
- **User Profiles**: Quản lý thông tin cá nhân và cài đặt

### 🔔 Thông báo & Analytics

- **Real-time Notifications**: Thông báo thời gian thực cho các hoạt động
- **Analytics Dashboard**: Báo cáo và phân tích hiệu suất dự án
- **Email Integration**: Gửi email thông báo với Nodemailer

### 🎨 Giao diện người dùng

- **Responsive Design**: Tương thích với mọi thiết bị
- **Dark/Light Mode**: Chế độ sáng/tối
- **Multi-language Support**: Hỗ trợ đa ngôn ngữ
- **Modern UI Components**: Sử dụng Radix UI và Tailwind CSS

## 🏗️ Kiến trúc hệ thống

### Monorepo Structure

```
WahnPlan/
├── apps/
│   ├── web/          # Next.js Frontend Application
│   ├── api/          # NestJS Backend API
│   └── docs/         # Documentation Site (Optional)
├── packages/
│   ├── ui/           # Shared React UI Components
│   ├── eslint-config/    # Shared ESLint Configuration
│   └── typescript-config/ # Shared TypeScript Configuration
└── ...
```

### Tech Stack

#### Frontend (`apps/web`)

- **Framework**: Next.js 15.4+ với App Router
- **Language**: TypeScript 5.8+
- **Styling**: Tailwind CSS + Radix UI
- **State Management**: React Context + Custom Hooks
- **Form Handling**: React Hook Form + Zod validation
- **Rich Text**: TipTap editor
- **Drag & Drop**: @dnd-kit
- **Charts**: Recharts
- **File Upload**: Cloudinary React

#### Backend (`apps/api`)

- **Framework**: NestJS 11.0+
- **Language**: TypeScript 5.7+
- **Database**: PostgreSQL với Prisma ORM
- **Authentication**: JWT + Passport
- **File Storage**: Cloudinary
- **Email**: Nodemailer
- **Validation**: Class Validator + Class Transformer
- **Security**: bcrypt, CORS, Helmet

#### Shared Packages

- **UI Components**: Reusable React components
- **TypeScript Config**: Shared TS configurations
- **ESLint Config**: Consistent code quality rules

## 🚀 Yêu cầu hệ thống

### Môi trường phát triển

- **Node.js**: >= 18.0.0 (khuyến nghị >= 20.0.0)
- **pnpm**: >= 9.0.0
- **PostgreSQL**: >= 13.0
- **Git**: >= 2.30.0

### Dịch vụ bên ngoài

- **Cloudinary**: Cho việc lưu trữ và xử lý hình ảnh
- **Email Service**: SMTP server cho gửi email thông báo

## 📦 Cài đặt và chạy dự án

### 1. Clone repository

```bash
git clone https://github.com/MeanHoang/WahnPlan.git
cd WahnPlan
```

### 2. Cài đặt pnpm (nếu chưa có)

```bash
npm install -g pnpm
```

### 3. Cài đặt dependencies

```bash
pnpm install
```

### 4. Cấu hình môi trường

#### Backend (`apps/api/.env`)

```env
DATABASE_URL="postgresql://username:password@localhost:5432/wahnplan"
JWT_SECRET="your-super-secret-jwt-key"
CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name"
CLOUDINARY_API_KEY="your-cloudinary-api-key"
CLOUDINARY_API_SECRET="your-cloudinary-api-secret"
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-email-password"
```

#### Frontend (`apps/web/.env.local`)

```env
NEXT_PUBLIC_API_URL="http://localhost:3001"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 5. Thiết lập database

```bash
# Chạy migrations
pnpm --filter api prisma migrate dev

# Seed data (nếu có)
pnpm --filter api prisma db seed
```

### 6. Chạy dự án

#### Chạy tất cả ứng dụng

```bash
pnpm dev
```

#### Chạy từng ứng dụng riêng biệt

```bash
# Frontend (Next.js) - http://localhost:3000
pnpm dev:web

# Backend (NestJS) - http://localhost:3001
pnpm dev:api

# Documentation - http://localhost:3002
pnpm dev:docs
```

#### Chạy chọn lọc nhiều app

```bash
pnpm turbo run dev --filter=web --filter=api
```

## 🛠️ Scripts và Commands

### Development

```bash
# Chạy tất cả apps
pnpm dev

# Chạy với watch mode cho specific app
pnpm turbo run dev --filter=web
pnpm turbo run dev --filter=api
```

### Build

```bash
# Build tất cả
pnpm build

# Build specific app
pnpm turbo run build --filter=web
pnpm turbo run build --filter=api
```

### Testing

```bash
# Chạy tests cho tất cả
pnpm test

# Test specific app
pnpm turbo run test --filter=api
pnpm turbo run test:e2e --filter=api
```

### Code Quality

```bash
# Lint tất cả
pnpm lint

# Check types
pnpm check-types

# Format code
pnpm format
```

### Database

```bash
# Generate Prisma client
pnpm --filter api prisma generate

# Reset database
pnpm --filter api prisma migrate reset

# Deploy migrations
pnpm --filter api prisma migrate deploy
```

## 📁 Cấu trúc chi tiết

### Frontend (`apps/web`)

```
apps/web/
├── app/                    # Next.js App Router
│   ├── dashboard/         # Dashboard page
│   ├── login/            # Authentication pages
│   ├── register/
│   ├── workspace/        # Workspace management
│   └── board-management/ # Board management
├── components/           # React Components
│   ├── ui/              # Base UI components
│   ├── boards/          # Board-related components
│   ├── task-detail/     # Task detail components
│   ├── workspaces/      # Workspace components
│   └── layout/          # Layout components
├── hooks/               # Custom React hooks
├── lib/                 # Utility libraries
├── types/               # TypeScript type definitions
└── contexts/            # React contexts
```

### Backend (`apps/api`)

```
apps/api/
├── src/
│   ├── modules/         # Feature modules
│   │   ├── auth/       # Authentication
│   │   ├── users/      # User management
│   │   ├── workspaces/ # Workspace management
│   │   ├── boards/     # Board management
│   │   ├── tasks/      # Task management
│   │   ├── notifications/ # Notifications
│   │   └── analytics/  # Analytics
│   └── shared/         # Shared utilities
├── prisma/             # Database schema & migrations
└── uploads/            # File uploads
```

## 🔧 Quản lý Dependencies

### Thêm dependency cho specific app

```bash
# Production dependency
pnpm add <package> --filter=web
pnpm add <package> --filter=api

# Development dependency
pnpm add -D <package> --filter=web
pnpm add -D <package> --filter=api
```

### Thêm dependency cho nhiều apps

```bash
pnpm add <package> --filter=web --filter=api
```

### Thêm dependency cho workspace root

```bash
pnpm add -w <package>
```

## 🚀 Deployment

### Frontend (Vercel)

1. Kết nối repository với Vercel
2. Cấu hình environment variables
3. Deploy tự động từ main branch

### Backend (Railway/Heroku/Docker)

```bash
# Build production
pnpm build

# Start production server
pnpm --filter api start:prod
```

### Database

```bash
# Deploy migrations to production
pnpm --filter api prisma migrate deploy

# Generate production client
pnpm --filter api prisma generate
```

## 🤝 Đóng góp

1. Fork repository
2. Tạo feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Tạo Pull Request

### Code Style

- Sử dụng TypeScript strict mode
- Tuân thủ ESLint rules
- Format code với Prettier
- Viết tests cho new features

## 📝 API Documentation

API endpoints được document tại: `http://localhost:3001/api` (khi chạy development)

### Main Endpoints

- `POST /auth/register` - Đăng ký user mới
- `POST /auth/login` - Đăng nhập
- `GET /workspaces` - Lấy danh sách workspaces
- `POST /workspaces` - Tạo workspace mới
- `GET /boards` - Lấy danh sách boards
- `POST /tasks` - Tạo task mới
- `GET /notifications` - Lấy thông báo

## 🔒 Bảo mật

- JWT authentication cho API endpoints
- Password hashing với bcrypt
- CORS configuration
- Input validation và sanitization
- File upload security với Cloudinary
- Rate limiting (có thể cấu hình)

## 📊 Performance

- Turborepo caching cho builds
- Next.js automatic optimization
- Image optimization với Cloudinary
- Database query optimization
- Lazy loading components

## 🐛 Troubleshooting

### Common Issues

1. **Database connection error**
   - Kiểm tra DATABASE_URL trong `.env`
   - Đảm bảo PostgreSQL đang chạy

2. **Build errors**
   - Xóa `node_modules` và `pnpm-lock.yaml`
   - Chạy lại `pnpm install`

3. **TypeScript errors**
   - Chạy `pnpm check-types` để kiểm tra
   - Đảm bảo types được import đúng

## 📄 License

Dự án này sử dụng [MIT License](LICENSE).

## 📞 Support

Nếu gặp vấn đề, vui lòng tạo issue trên GitHub repository hoặc liên hệ team phát triển.

---

**WahnPlan** - Nền tảng quản lý dự án hiện đại và hiệu quả 🚀
