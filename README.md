# Split Layout Builder

A full-stack layout builder application built with Next.js, TypeScript, Tailwind CSS, Prisma, Zod, and MongoDB.

## Project Overview

This application allows authenticated users to build their own split-screen layout. Each user gets a personal saved layout that is persisted in MongoDB.

### Core Features

- User signup and login
- JWT-based authentication with HTTP-only cookies
- Protected dashboard
- Recursive split layout builder
- Horizontal and vertical partitioning
- Partition delete support
- Resize support with snap assistance at 25%, 50%, and 75%
- Percentage indicator while resizing
- Per-user layout persistence
- Reset support with a fresh random color
- Refresh behavior:
  - If the saved layout contains only a single block, refresh generates a new random color
  - If the saved layout contains multiple blocks, refresh restores the saved layout

---

## Tech Stack

### Frontend
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- React Hook Form
- Shadcn UI

### Backend
- Next.js Route Handlers
- Prisma ORM
- Zod
- MongoDB Atlas

### Deployment
- Vercel

---

## Project Structure

```bash
src/
├── app/
│   ├── (app)/
│   │   └── dashboard/
│   │       └── page.tsx
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── signup/
│   │       └── page.tsx
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   │   └── route.ts
│   │   │   ├── logout/
│   │   │   │   └── route.ts
│   │   │   └── signup/
│   │   │       └── route.ts
│   │   ├── layout/
│   │   │   └── route.ts
│   │   └── user/
│   │       └── route.ts
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   └── SignupForm.tsx
│   └── layout/
│       ├── BlockToolbar.tsx
│       ├── LayoutBlock.tsx
│       ├── LayoutCanvas.tsx
│       ├── PercentageBadge.tsx
│       └── ResizeHandle.tsx
├── hooks/
│   ├── useLayoutTree.ts
│   └── useResizeSnap.ts
├── lib/
│   ├── auth.ts
│   ├── colors.ts
│   ├── layoutUtils.ts
│   ├── prisma.ts
│   └── utils.ts
├── types/
│   └── layout.ts
├── validators/
│   ├── authSchema.ts
│   └── layoutSchema.ts
└── proxy.ts

prisma/
└── schema.prisma
```

---

## Routing Overview

### Pages

#### `/login`
Public page for user login.

#### `/signup`
Public page for user registration.

#### `/dashboard`
Protected page where the user builds and manages their layout.

---

## API Routes

### `POST /api/auth/signup`
Creates a new user account.

#### Request body
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Responsibilities
- Validates input using Zod
- Checks for duplicate email
- Hashes password with bcrypt
- Creates user in MongoDB
- Generates JWT
- Stores JWT in HTTP-only cookie

---

### `POST /api/auth/login`
Authenticates an existing user.

#### Request body
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Responsibilities
- Validates input using Zod
- Finds user by email
- Verifies hashed password
- Generates JWT
- Stores JWT in HTTP-only cookie

---

### `POST /api/auth/logout`
Logs out the current user.

#### Responsibilities
- Clears the auth cookie
- Redirects user to `/login`
- Uses `303` redirect so the browser switches from POST to GET

---

### `GET /api/user`
Returns the current authenticated user.

#### Responsibilities
- Reads JWT from cookies
- Verifies token
- Returns public user information

---

### `GET /api/layout`
Returns the current user's saved layout.

#### Responsibilities
- Verifies user authentication
- Fetches user-specific layout from MongoDB
- Returns `tree` or `null`

---

### `POST /api/layout`
Saves or updates the current user's layout.

#### Request body
```json
{
  "tree": {
    "id": "uuid",
    "color": "hsl(...)"
  }
}
```

#### Responsibilities
- Verifies user authentication
- Validates layout tree with recursive Zod schema
- Upserts the layout in MongoDB
- Returns saved tree

---

## Authentication Flow

Authentication is handled with JWT and HTTP-only cookies.

### Flow
1. User signs up or logs in
2. Backend signs a JWT containing:
   - `userId`
   - `email`
3. JWT is stored in an HTTP-only cookie
4. Protected routes and APIs verify the token
5. Logout clears the cookie

### Main auth helpers

#### `src/lib/auth.ts`
Contains:
- `signToken`
- `verifyToken`
- `getAuthPayload`
- `setAuthCookie`
- `clearAuthCookie`

---

## Proxy Protection

### `src/proxy.ts`
Protects the following routes:
- `/dashboard`
- `/api/layout`
- `/api/user`

Also prevents logged-in users from re-accessing:
- `/login`
- `/signup`

### Responsibilities
- Reads auth cookie
- Verifies JWT
- Redirects unauthenticated users to `/login`
- Redirects authenticated users away from auth pages

---

## Database Design

### Prisma Schema

#### `User`
Stores account information.

Fields:
- `id`
- `email`
- `password`
- `createdAt`
- `updatedAt`
- `layout`

#### `Layout`
Stores one layout per user.

Fields:
- `id`
- `userId`
- `tree`
- `createdAt`
- `updatedAt`

### Why `tree` is stored as JSON
The layout structure is recursive and nested. Storing it as JSON is the cleanest solution for:
- recursive block trees
- flexible nested split structures
- simpler reads and writes
- MongoDB compatibility

---

## Layout System

### Layout Tree Structure

A layout node can be either:

#### Leaf node
A single block with a color.

Example:
```json
{
  "id": "uuid",
  "color": "hsl(216, 48%, 67%)"
}
```

#### Split node
A container split into two child nodes.

Example:
```json
{
  "id": "uuid",
  "color": "hsl(216, 48%, 67%)",
  "direction": "horizontal",
  "splitRatio": 0.5,
  "children": [
    { "id": "uuid-1", "color": "hsl(...)" },
    { "id": "uuid-2", "color": "hsl(...)" }
  ]
}
```

---

## Core Layout Logic

### `src/lib/layoutUtils.ts`

Contains all pure tree update logic:

#### `createLeafNode()`
Creates a new block with a random color.

#### `createInitialTree()`
Creates the initial single-block layout.

#### `splitNode()`
Splits a leaf node horizontally or vertically.

Behavior:
- first child keeps original color
- second child gets a new random color

#### `updateSplitRatio()`
Updates the split ratio during resizing.

#### `removeNode()`
Deletes a partition and collapses the sibling into the parent.

#### `applySnap()`
Snaps resize ratio near:
- 25%
- 50%
- 75%

#### `clampRatio()`
Prevents blocks from collapsing too small.

---

## Hooks

### `src/hooks/useLayoutTree.ts`
Manages the layout tree state in the client.

Exposes:
- `tree`
- `setTree`
- `split`
- `remove`
- `updateRatio`
- `resetTree`

### `src/hooks/useResizeSnap.ts`
Handles drag-based resizing.

Responsibilities:
- tracks drag state
- calculates ratio from pointer position
- clamps ratio
- applies snap logic
- emits updated ratio to layout state

---

## Components

### `LayoutCanvas.tsx`
Main layout container.

Responsibilities:
- loads saved layout
- handles autosave
- controls reset behavior
- renders root layout block

### `LayoutBlock.tsx`
Recursive layout renderer.

Responsibilities:
- renders leaf blocks
- renders split blocks
- passes recursive handlers
- mounts resize handles and percentage badges

### `BlockToolbar.tsx`
Toolbar shown inside leaf blocks.

Actions:
- split horizontally
- split vertically
- delete block

### `ResizeHandle.tsx`
Drag handle between partitions.

### `PercentageBadge.tsx`
Shows current size percentage during resize.

### `LoginForm.tsx` and `SignupForm.tsx`
Authentication forms built with React Hook Form and Zod.

---

## Validation

### `src/validators/authSchema.ts`
Validates:
- login payload
- signup payload

### `src/validators/layoutSchema.ts`
Validates recursive layout tree payload before saving.

This prevents invalid or malformed layout structures from reaching the database.

---

## Persistence Rules

### Save behavior
- layout autosaves after updates
- save is per-user
- saved data is stored in `Layout.tree`

### Refresh behavior
- single layout only: refresh creates a new random-color root block
- multiple layouts: refresh restores the saved structure

### Reset behavior
- always creates a fresh single block
- always generates a new random color

---

## How to Run the Project Locally

### 1. Install dependencies
```bash
npm install
```

### 2. Create environment file
Create a `.env` file using `.env.example`

### 3. Generate Prisma client
```bash
npx prisma generate
```

### 4. Push schema to MongoDB
```bash
npx prisma db push
```

### 5. Start the development server
```bash
npm run dev
```

### 6. Open in browser
```bash
http://localhost:3000
```

---

## How to Start in Production / Live

### Build locally
```bash
npm run build
```

### Start production server locally
```bash
npm run start
```

### Deploy to Vercel
1. Push code to GitHub
2. Import the repository into Vercel
3. Add environment variables from `.env.example`
4. Deploy

---

## Required Environment Variables

- `DATABASE_URL`
- `JWT_SECRET`

Optional:
- `NEXT_PUBLIC_APP_URL`

---

## Deployment Notes

### Vercel
- deploy as a single Next.js app
- keep all backend logic in route handlers
- set environment variables in Vercel project settings

### MongoDB Atlas
- ensure database user has correct permissions
- allow network access for Vercel if needed

---

## Recommended Development Commands

```bash
npm install
npx prisma generate
npx prisma db push
npm run dev
```

---

## Author Notes

This project was built as a full-stack assessment focusing on:
- recursive UI rendering
- local state management without external state libraries
- user-based persistence
- clean API design
- production-friendly authentication
- maintainable TypeScript architecture
