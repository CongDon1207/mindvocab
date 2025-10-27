# CHANGELOG - mindvocab

## 2025-10-27

### Added
- ✅ Cài đặt và cấu hình TypeScript cho frontend - Migration hoàn toàn từ JS sang TS
- ✅ Cài đặt shadcn/ui với TypeScript support tại frontend/src/components/ui/
- ✅ Cấu hình Tailwind CSS v4 với Vite plugin tại frontend/vite.config.ts
- ✅ Thêm path aliases (@/*) cho TypeScript tại frontend/tsconfig.json
- ✅ Thêm type definitions cho assets (CSS, SVG, images) tại frontend/src/vite-env.d.ts

### Changed
- ✅ Convert main.jsx → main.tsx tại frontend/src/
- ✅ Convert App.jsx → App.tsx tại frontend/src/
- ✅ Convert Folder.jsx → Folder.tsx tại frontend/src/pages/
- ✅ Convert utils.js → utils.ts với proper typing tại frontend/src/lib/
- ✅ Convert vite.config.js → vite.config.ts
- ✅ Regenerate tất cả shadcn/ui components với TypeScript (button, card, dialog, dropdown-menu, form, input, label)
- ✅ Update index.html để trỏ tới main.tsx thay vì main.jsx
- ✅ Update components.json để enable TypeScript mode (tsx: true)

### Removed
- ✅ Remove jsconfig.json (replaced by tsconfig.json)
- ✅ Remove các UI components cũ bằng JavaScript

### Fixed
- ✅ Fix Tailwind CSS không hoạt động - Thêm @tailwindcss/vite plugin vào vite.config
- ✅ Fix import alias errors - Cấu hình path mapping trong tsconfig.json
- ✅ Fix TypeScript errors trong UI components - Regenerate bằng shadcn CLI
