# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **WMS (Warehouse Management System)** built on the **RuoYi-Vue** admin template, specialized for laboratory and biotech operations. It manages plasmid tracking, lab workflows, inventory, and stock allocation with support for biological data formats (DNA files) and QR code scanning.

**Tech Stack:**
- Frontend: Vue 2.6.12 + Vue Router 3.4.9 + Vuex 3.6.0
- UI Framework: Element UI 2.15.8
- Build Tool: Vue CLI with Webpack
- HTTP Client: Axios with Bearer token authentication
- Charts: ECharts 5.5.0
- Biotech: @teselagen/bio-parsers for biological data, jsqr for QR code reading

## Development Commands

```bash
npm run dev              # Start development server (port 3000)
npm run build:prod       # Production build
npm run build:stage      # Staging build
npm run lint             # Run ESLint (auto-fixes on staged files via husky)
```

**Development Server:**
- Dev server runs on port 3000
- Backend API proxy: `http://localhost:9991/wms-api`
- Configure in `.env.development` (VUE_APP_BASE_API, VUE_APP_IMG_URL)

## Architecture

### Directory Structure

```
src/
├── api/              # Backend API integrations (mirrors views structure)
│   ├── base/         # Base/warehouse APIs
│   ├── plasmid/      # Plasmid management APIs
│   ├── lab/          # Laboratory operation APIs
│   ├── stock/        # Inventory management APIs
│   └── system/       # System/admin APIs
├── views/            # Feature modules (domain-driven)
│   ├── dashboard/    # Analytics with ECharts (Line, Bar, Pie, Radar)
│   ├── plasmid/      # Plasmid tracking and DNA file handling
│   ├── lab/          # Laboratory workflows
│   ├── stock/        # Inventory and stock management
│   ├── allocation/   # Resource allocation
│   ├── purchase/     # Procurement workflows
│   └── system/       # Admin, user, role management
├── components/       # Reusable UI components (pagination, upload, editors)
├── layout/           # Main application layout
├── router/           # Vue Router with role-based access control
├── store/            # Vuex modules (permissions, user, settings)
└── utils/            # Utilities (request.js, validation, date handling)
```

### Key Patterns

**API Integration (`src/utils/request.js`):**
- Centralized axios instance with Bearer token auth
- Request interceptor adds `Authorization: Bearer <token>` header
- Response interceptor handles errors and token expiration
- Download loading states and file-save handling

**Routing (`src/router/index.js`):**
- Layout-based nested routes
- Route meta properties: `title`, `icon`, `roles`, `permissions`, `noCache`
- Dynamic routes loaded from backend via `store/modules/permission`
- Hidden routes for login, register, error pages

**State Management:**
- Permission module handles dynamic route generation
- User module manages authentication state
- Cache module uses sessionStorage for request deduplication

**Biotech Features:**
- DNA file upload/download via `@teselagen/bio-parsers`
- QR code generation (`qrcodejs2`) and scanning (`vue-qrcode-reader`, `jsqr`)
- Plasmid-specific workflows in `src/views/plasmid/`

## Important Configuration

**`vue.config.js`:**
- Proxy setup: `/wms-api` → `http://localhost:9991`
- Gzip compression enabled for production
- Code splitting: Element UI, libs, commons chunks
- SVG sprite loader for icons in `src/assets/icons`

**Environment Files:**
- `.env.development`: Local development with localhost backend
- Alternative backend URLs commented out for remote deployment

## Common Module Patterns

When working with existing features, follow these patterns:

**Adding a new feature module:**
1. Create API functions in `src/api/<domain>/`
2. Create views in `src/views/<domain>/`
3. Use Element UI components (el-table, el-form, el-dialog)
4. Follow RuoYi patterns: list page with pagination, add/edit dialogs

**API calls:**
- Import from `@/api/<domain>/<file>`
- Use request service configured in `src/utils/request.js`
- Handle loading states and error messages

**Permissions:**
- Route access controlled via `roles` and `permissions` in route meta
- Use `v-hasPermi` directive for button-level permissions
