# Momentum - Premium Video Platform for Entrepreneurs

Build momentum in your entrepreneurial journey with exclusive video content from successful founders.

## 🚀 Project Overview

Momentum is a premium video platform designed specifically for entrepreneurs. It provides a curated collection of video content from successful business founders, offering insights into their strategies, failures, and breakthroughs.

## 🛠️ Technologies Used

This project is built with modern web technologies:

- **Vite** - Fast build tool and development server
- **TypeScript** - Type-safe JavaScript
- **React** - UI library with hooks and context
- **shadcn/ui** - Modern component library
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **React Router** - Client-side routing
- **React Hook Form** - Form management
- **Zod** - Schema validation

## 📦 Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn package manager

### Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd momentum
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

5. **Preview production build**
   ```bash
   npm run preview
   ```

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── layout/         # Layout components
│   ├── landing/        # Landing page components
│   └── dashboard/      # Dashboard components
├── pages/              # Page components
├── contexts/           # React contexts
├── hooks/              # Custom hooks
├── lib/                # Utilities and configurations
└── types/              # TypeScript type definitions
```

## 🎨 Features

- **Multi-role Authentication** - Support for Viewers, Creators, and Admins
- **Video Management** - Upload, manage, and organize video content
- **Responsive Design** - Optimized for all device sizes
- **Dark/Light Theme** - Automatic theme switching
- **Analytics Dashboard** - Comprehensive analytics for creators and admins
- **Interactive Video Player** - Custom video player with advanced controls

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:3001/api
```

## 📱 Deployment

The application can be deployed to any static hosting service:

1. Build the project: `npm run build`
2. Deploy the `dist` folder to your hosting service

Popular deployment options:
- Vercel
- Netlify
- AWS S3 + CloudFront
- GitHub Pages

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit your changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions, please open an issue in the repository.