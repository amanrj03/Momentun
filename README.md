# Momentum - Premium Video Platform for Entrepreneurs

Build momentum in your entrepreneurial journey with exclusive video content from successful founders and AI-powered business guidance.

## 🚀 Project Overview

Momentum is a comprehensive video platform designed specifically for entrepreneurs. It provides curated video content from successful business founders combined with an AI-powered business mentor that offers real-time guidance on entrepreneurship, startups, and business growth.

### Key Features
- 🎥 **Premium Video Content** - Curated videos from successful entrepreneurs
- 🤖 **AI Business Mentor** - Specialized AI assistant for entrepreneurship questions
- 👥 **Multi-Role System** - Viewers, Creators, and Admins with tailored experiences
- 📊 **Advanced Analytics** - Comprehensive performance tracking and insights
- 🔐 **Secure Authentication** - JWT-based auth with OTP verification
- 📱 **Responsive Design** - Optimized for all devices

## 📸 Platform Preview

### 🏠 Landing Page & AI Chat
<div align="center">
  <img src="screenshots/landing-page.png" alt="Landing Page" width="800"/>
  <br/>
  <em>Modern landing page with hero section and feature highlights</em>
</div>

<div align="center">
  <img src="screenshots/ai-chat.png" alt="AI Business Mentor" width="800"/>
  <br/>
  <em>AI-powered business mentor specialized in entrepreneurship guidance</em>
</div>

### 📊 User Dashboards
<div align="center">
  <img src="screenshots/viewer-dashboard.png" alt="Viewer Dashboard" width="400"/>
  <img src="screenshots/creator-dashboard.png" alt="Creator Dashboard" width="400"/>
  <br/>
  <em>Personalized dashboards for Viewers and Creators</em>
</div>

<div align="center">
  <img src="screenshots/admin-dashboard.png" alt="Admin Dashboard" width="800"/>
  <br/>
  <em>Comprehensive admin dashboard with platform analytics and management tools</em>
</div>

### 📱 Mobile Experience
<div align="center">
  <img src="screenshots/mobile-landing.png" alt="Mobile Landing" width="250"/>
  <img src="screenshots/mobile-dashboard.png" alt="Mobile Dashboard" width="250"/>
  <img src="screenshots/mobile-ai-chat.png" alt="Mobile AI Chat" width="250"/>
  <br/>
  <em>Fully responsive design optimized for mobile devices</em>
</div>

---

## 🛠️ Tech Stack

### Frontend
- **React 18.3.1** - Modern UI library with hooks and context
- **TypeScript** - Type-safe JavaScript development
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Modern component library
- **Framer Motion** - Smooth animations and transitions
- **React Router 6.30.1** - Client-side routing

### Backend
- **Node.js 18+** - JavaScript runtime
- **Express 4.21.2** - Web application framework
- **TypeScript** - Type-safe server development
- **Prisma 5.22.0** - Modern database ORM
- **PostgreSQL** - Relational database
- **JWT** - Secure authentication tokens
- **bcryptjs** - Password hashing

### External Services
- **Google Gemini 2.5 Flash** - AI-powered business assistance
- **Cloudinary** - Video and image storage/processing
- **Nodemailer** - Email notifications and OTP delivery

## 📦 Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn package manager

### Environment Variables

Create `.env` files in both frontend and backend directories:

**Frontend (.env)**
```env
VITE_API_URL=http://localhost:3001/api
```

**Backend (.env)**
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/momentum"

# JWT Secret
JWT_SECRET="your-super-secret-jwt-key"

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Google Gemini AI
GEMINI_API_KEY="your-gemini-api-key"

# Email Configuration
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"

# Server Configuration
PORT=3001
NODE_ENV=development
```

### Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd momentum
   ```

2. **Install dependencies for both frontend and backend**
   ```bash
   # Install frontend dependencies
   cd frontend
   npm install
   
   # Install backend dependencies
   cd ../backend
   npm install
   ```

3. **Set up the database**
   ```bash
   # In the backend directory
   npx prisma generate
   npx prisma db push
   ```

4. **Start the development servers**
   ```bash
   # Terminal 1 - Backend server
   cd backend
   npm run dev
   
   # Terminal 2 - Frontend server
   cd frontend
   npm run dev
   ```

5. **Build for production**
   ```bash
   # Frontend
   cd frontend
   npm run build
   
   # Backend
   cd backend
   npm run build
   ```

## 🏗️ Project Structure

```
momentum/
├── frontend/                # React TypeScript frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   │   ├── ui/         # shadcn/ui components
│   │   │   ├── layout/     # Layout components (Header, etc.)
│   │   │   ├── landing/    # Landing page components
│   │   │   ├── dashboard/  # Dashboard components
│   │   │   ├── common/     # Common components
│   │   │   └── settings/   # Settings components
│   │   ├── pages/          # Page components
│   │   │   ├── Dashboard.tsx
│   │   │   ├── AskAI.tsx   # AI chat interface
│   │   │   ├── Analytics.tsx
│   │   │   └── ...
│   │   ├── contexts/       # React contexts (Auth, etc.)
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utilities and API client
│   │   └── types/          # TypeScript type definitions
│   ├── public/             # Static assets
│   └── package.json
├── backend/                 # Node.js Express backend
│   ├── src/
│   │   ├── routes/         # API route handlers
│   │   │   ├── auth.ts     # Authentication routes
│   │   │   ├── videos.ts   # Video management
│   │   │   ├── ai.ts       # AI assistant routes
│   │   │   ├── analytics.ts
│   │   │   └── profile.ts
│   │   ├── middleware/     # Express middleware
│   │   │   ├── auth.ts     # JWT authentication
│   │   │   └── upload.ts   # File upload handling
│   │   ├── lib/            # Utility libraries
│   │   ├── config/         # Configuration files
│   │   └── server.ts       # Main server file
│   ├── prisma/             # Database schema and migrations
│   │   ├── schema.prisma   # Database schema
│   │   └── migrations/     # Database migrations
│   └── package.json
└── README.md               # Project documentation
```

## 🎨 Features

### Core Platform Features
- **🎥 Video Management** - Upload, organize, and stream video content
- **👥 Multi-Role Authentication** - Viewers, Creators, and Admins with tailored dashboards
- **🔐 Secure Authentication** - JWT-based auth with OTP email verification
- **📱 Responsive Design** - Optimized for desktop, tablet, and mobile devices
- **🌙 Dark/Light Theme** - Automatic theme switching based on system preference

### AI-Powered Features
- **🤖 Business Mentor Chat** - Specialized AI assistant for entrepreneurship questions
- **💬 Real-time Responses** - Streaming chat interface with typing animations
- **🎯 Focused Expertise** - AI trained specifically for business and startup topics
- **📚 Contextual Learning** - Get instant answers while watching entrepreneur videos

### User Experiences

#### For Viewers
- Browse and watch premium entrepreneur videos
- Save favorite content and track watch history
- Get personalized business advice through AI chat
- View learning progress and engagement analytics

#### For Creators
- Upload and manage video content
- Monitor video performance and engagement
- Access detailed analytics and insights
- Manage creator profile and social links

#### For Admins
- Content moderation and approval workflow
- Platform-wide analytics and user management
- System monitoring and configuration
- User role and permission management

### Technical Features
- **📊 Advanced Analytics** - Comprehensive performance tracking
- **☁️ Cloud Storage** - Cloudinary integration for media management
- **🔄 Real-time Updates** - Live data synchronization
- **🛡️ Security First** - HTTPS, input validation, and secure file uploads
- **⚡ Performance Optimized** - Fast loading with code splitting and caching

## 🔧 Development

### Available Scripts

**Frontend**
- `npm run dev` - Start development server (Vite)
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

**Backend**
- `npm run dev` - Start development server with nodemon
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Start production server
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema changes to database
- `npm run db:migrate` - Run database migrations

### Database Schema

The application uses PostgreSQL with Prisma ORM. Key models include:

- **User** - User accounts with role-based access (VIEWER, CREATOR, ADMIN)
- **Video** - Video content with metadata and status tracking
- **Interaction** - User interactions (likes, saves, views) with videos
- **Conversation** - AI chat history and context
- **Profiles** - Role-specific profile data (ViewerProfile, CreatorProfile, AdminProfile)

### API Endpoints

**Authentication**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-otp` - OTP verification
- `POST /api/auth/logout` - User logout

**Videos**
- `GET /api/videos` - Get videos with filtering
- `POST /api/videos` - Upload new video
- `PUT /api/videos/:id` - Update video
- `DELETE /api/videos/:id` - Delete video

**AI Assistant**
- `POST /api/ai/ask` - Send question to AI mentor

**Analytics**
- `GET /api/analytics/:type` - Get analytics data

### AI Integration

The AI assistant uses Google Gemini 2.5 Flash with custom system prompts to:
- Focus exclusively on entrepreneurship and business topics
- Provide actionable advice and insights
- Maintain conversation context
- Format responses for optimal readability

## 📱 Deployment

### Production Deployment

**Frontend (Vercel)**
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

**Backend (Railway/Heroku)**
1. Connect your GitHub repository
2. Set all required environment variables
3. Ensure DATABASE_URL points to production database

**Database (Neon/Supabase)**
1. Create production PostgreSQL database
2. Run migrations: `npx prisma db push`
3. Update DATABASE_URL in backend environment

### Environment Setup

**Production Environment Variables:**
- Set `NODE_ENV=production`
- Use secure JWT_SECRET
- Configure production database URL
- Set up production email service
- Add production Cloudinary credentials
- Configure Gemini API key

### Popular Deployment Options

**Frontend:**
- Vercel (Recommended)
- Netlify
- AWS S3 + CloudFront
- GitHub Pages

**Backend:**
- Railway (Recommended)
- Heroku
- AWS EC2
- DigitalOcean

**Database:**
- Neon (Recommended)
- Supabase
- AWS RDS
- PlanetScale

## 🚀 Live Demo

- **Frontend:** [Your Vercel URL]
- **Backend API:** [Your Railway URL]
- **Documentation:** Available in SRS files

## 🤖 AI Features

The AI business mentor is designed specifically for entrepreneurs and includes:

- **Specialized Knowledge:** Trained on entrepreneurship, startups, and business growth
- **Real-time Chat:** Streaming responses with typing animations
- **Context Awareness:** Maintains conversation history for better responses
- **Topic Filtering:** Only responds to business-related questions
- **Actionable Advice:** Provides practical, implementable suggestions

**Supported Topics:**
- Startup strategies and business models
- Leadership and management techniques
- Financial literacy and business finance
- Marketing and sales strategies
- Career development and professional growth
- Industry insights and market trends

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit your changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Submit a pull request

### Development Guidelines

- Follow TypeScript best practices
- Use ESLint and Prettier for code formatting
- Write meaningful commit messages
- Add proper error handling
- Include JSDoc comments for complex functions
- Test your changes thoroughly

## 📚 Documentation

- **SRS Documents:** Complete software requirements specification
- **API Documentation:** Available through backend routes
- **Component Documentation:** JSDoc comments in component files
- **Database Schema:** Defined in `prisma/schema.prisma`

## 🔒 Security

- JWT-based authentication with secure token handling
- Password hashing using bcryptjs
- Input validation and sanitization
- CORS configuration for cross-origin requests
- Secure file upload with type validation
- Environment variable protection

## 🐛 Known Issues

- None currently reported

## 📈 Roadmap

- [ ] Real-time notifications
- [ ] Video comments and discussions
- [ ] Advanced video analytics
- [ ] Mobile app development
- [ ] Payment integration for premium content
- [ ] Multi-language support

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Open an issue in the repository
- Check existing documentation
- Review SRS files for detailed specifications

## 👨‍💻 Author

Built with ❤️ for the entrepreneurship community

---

**Tech Stack Summary:** React + TypeScript + Node.js + PostgreSQL + Google Gemini AI + Cloudinary