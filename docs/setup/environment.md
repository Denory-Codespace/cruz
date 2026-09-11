# Development Environment & Tooling Assessment

This document records the system inspection and tooling configuration for Cruz.

## 1. System & Machine Profile
- **Host OS**: Windows
- **Node.js**: `v22.23.2` (Installed & active)
- **NPM**: `10.9.8` (Installed & active)
- **Git**: `2.55.0.windows.3` (Installed & active)

## 2. Tooling Status & Analysis

| Tool | Status | Action Required / Recommended Strategy |
| :--- | :--- | :--- |
| **Node.js & npm** | **Available** | Ready for monorepo package management & script execution. |
| **Git** | **Available** | Initialized repository (`main` branch) with `.gitignore` and security rules. |
| **pnpm / yarn** | Not in PATH | Using npm workspaces natively (or optionally `npm i -g pnpm` if faster resolution is desired). |
| **GitHub CLI (`gh`)** | Not in PATH | Optional. Git works directly. Remote repo linking can use standard `git remote add`. |
| **Docker** | Not in PATH | Local Supabase CLI with Docker is optional; can also connect directly to a free remote Supabase project. |
| **Supabase CLI** | Available via `npx supabase` | Ready for generating types, running schema migrations, and managing database state. |
| **Expo CLI** | Available via `npx expo` | Ready for initializing React Native mobile apps without global installs. |

## 3. Recommended Free-Tier Development Setup
1. **Remote Free Supabase Instance**: Connect local Next.js / Expo apps to a free-tier Supabase cloud project or local SQLite/in-memory test suite for unit testing.
2. **Next.js App Router**: Run via standard `npm run dev`.
3. **Expo Mobile**: Run via `npx expo start` to test with Expo Go on iOS/Android devices at zero cost.
