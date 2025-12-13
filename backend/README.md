# Online Video Directory - Backend

Node.js/Express/Prisma backend API for the Online Video Directory application.

## Folder Structure

```
backend/
├── prisma/
│   └── schema.prisma      # Database schema
├── src/
│   ├── config/
│   │   └── index.ts       # Environment configuration
│   ├── lib/
│   │   ├── cloudinary.ts  # Cloudinary utilities
│   │   ├── prisma.ts      # Prisma client instance
│   │   └── validations.ts # Zod validation schemas
│   ├── middleware/
│   │   ├── auth.ts        # JWT authentication middleware
│   │   └── validation.ts  # Request validation middleware
│   ├── routes/
│   │   ├── auth.ts        # Authentication routes
│   │   ├── entrepreneurs.ts # Entrepreneur routes
│   │   ├── profile.ts     # Profile routes
│   │   └── videos.ts      # Video routes
│   └── server.ts          # Express server entry point
├── .env.example           # Environment variables template
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
└── README.md              # This file
```

## Quick Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

Copy the example environment file and fill in your values:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# Database (NeonDB PostgreSQL)
DATABASE_URL="postgresql://username:password@host:5432/database?sslmode=require"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# Server Configuration
PORT=3001
FRONTEND_URL="http://localhost:8080"
NODE_ENV="development"

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

### 3. Initialize Database

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# (Optional) Open Prisma Studio to view data
npm run prisma:studio
```

### 4. Start Development Server

```bash
npm run dev
```

The server will start on `http://localhost:3001`.

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm start` | Run compiled production build |
| `npm run prisma:generate` | Generate Prisma client |
| `npm run prisma:migrate` | Run database migrations |
| `npm run prisma:studio` | Open Prisma Studio |

## API Endpoints

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/login` | No | Login user |
| POST | `/api/auth/register/viewer` | No | Register viewer |
| POST | `/api/auth/register/creator` | No | Register creator |
| POST | `/api/auth/register/admin` | No | Register admin |
| POST | `/api/auth/logout` | No | Logout user |
| GET | `/api/auth/me` | Yes | Get current user |

### Videos

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/api/videos/public` | No | - | Get approved videos |
| GET | `/api/videos/my-videos` | Yes | Creator | Get creator's videos |
| GET | `/api/videos/admin/all` | Yes | Admin | Get all videos |
| POST | `/api/videos` | Yes | Creator | Upload video |
| PATCH | `/api/videos/:id/status` | Yes | Admin | Update video status |
| DELETE | `/api/videos/:id` | Yes | Creator/Admin | Delete video |
| POST | `/api/videos/:id/view` | No | - | Increment views |
| GET | `/api/videos/upload-signature` | Yes | Creator | Get Cloudinary signature |

### Profiles

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| PUT | `/api/profile/viewer` | Yes | Viewer | Update viewer profile |
| PUT | `/api/profile/creator` | Yes | Creator | Update creator profile |
| PUT | `/api/profile/admin` | Yes | Admin | Update admin profile |
| GET | `/api/profile/creator/:id` | Yes | Admin | Get creator details |
| GET | `/api/profile/creators` | Yes | Admin | List all creators |

### Entrepreneurs

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/api/entrepreneurs` | No | - | List entrepreneurs |
| GET | `/api/entrepreneurs/:id` | No | - | Get entrepreneur |
| POST | `/api/entrepreneurs` | Yes | Creator/Admin | Create entrepreneur |
| PUT | `/api/entrepreneurs/:id` | Yes | Admin | Update entrepreneur |
| DELETE | `/api/entrepreneurs/:id` | Yes | Admin | Delete entrepreneur |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server health status |

## User Roles

| Role | Permissions |
|------|-------------|
| **VIEWER** | Browse videos, manage own profile |
| **CREATOR** | Upload videos, manage own videos, create entrepreneurs |
| **ADMIN** | Approve/reject videos, manage entrepreneurs, view all creators |

## Video Status Flow

```
PENDING → APPROVED (publicly visible)
        → REJECTED (hidden from public)
```

## Validation Rules

- **Names**: Only letters and spaces allowed (no numbers or special characters)
- **Password**: Minimum 8 characters, must include uppercase, lowercase, and number
- **Email**: Standard email format validation

## Cloudinary Setup

1. Create a Cloudinary account at https://cloudinary.com
2. Get your credentials from the Dashboard
3. Create an upload preset named `video_directory` (Settings → Upload)
4. Add credentials to your `.env` file
