## WahnPlan Monorepo

Monorepo sử dụng Turborepo + pnpm, gồm các ứng dụng và packages sau:

- `apps/web`: Next.js (frontend)
- `apps/api`: NestJS (backend)
- `apps/docs`: Next.js (tài liệu/demo, tùy chọn)
- `packages/ui`: thư viện React UI dùng chung
- `@repo/eslint-config`, `@repo/typescript-config`: cấu hình dùng chung

Tất cả viết bằng TypeScript.

### Yêu cầu môi trường

- Node.js >= 20
- pnpm >= 9 (cài nếu chưa có):

```bash
npm i -g pnpm
```

### Bắt đầu nhanh (sau khi clone repo)

```bash
pnpm install
pnpm dev
```

Mặc định sẽ chạy toàn bộ apps có script `dev`.

### Chạy theo ứng dụng

- Web (Next.js):

```bash
pnpm dev:web
```

- API (NestJS):

```bash
pnpm dev:api
```

Nếu `apps/api` chưa có script `dev`, thêm vào `apps/api/package.json`:

```json
{
  "scripts": {
    "dev": "pnpm start:dev"
  }
}
```

- Docs (tùy chọn):

```bash
pnpm dev:docs
```

Chạy chọn lọc nhiều app cùng lúc bằng filter:

```bash
pnpm turbo run dev --filter=web --filter=api
```

### Build

- Build tất cả:

```bash
pnpm build
```

- Build 1 app cụ thể:

```bash
pnpm turbo run build --filter=web
pnpm turbo run build --filter=api
```

Turborepo đã cấu hình cache outputs: Next.js (`.next/**`), NestJS (`dist/**`).

### Lint và kiểm tra kiểu

```bash
pnpm lint
pnpm check-types
```

### Thêm dependency

- Thêm vào 1 app:

```bash
pnpm add <pkg> --filter=web
pnpm add <pkg> --filter=api
```

- Thêm devDependency:

```bash
pnpm add -D <pkg> --filter=web
```

- Thêm cùng lúc cho nhiều app:

```bash
pnpm add <pkg> --filter=web --filter=api
```

### Cấu trúc thư mục

```
apps/
  web/   # Next.js frontend
  api/   # NestJS backend
  docs/  # Next.js docs/demo (tùy chọn)
packages/
  ui/                 # Thư viện UI dùng chung
  eslint-config/      # Cấu hình ESLint
  typescript-config/  # Cấu hình TypeScript
```

### Biến môi trường

- Next.js: tạo `.env.local` trong `apps/web` nếu cần.
- NestJS: tạo `.env` trong `apps/api` (ví dụ DB_URL, JWT_SECRET...).

### Ghi chú

- `apps/docs` chỉ phục vụ tài liệu/demo, có thể xóa nếu không dùng.
- Sử dụng filter của Turborepo để tăng tốc chạy theo phạm vi.
