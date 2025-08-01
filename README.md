# 🎓 EDUConnect - Interactive Learning Platform

A modern, real-time collaborative learning platform built with React, TypeScript, and Supabase. EDUConnect provides an immersive educational experience with AI-powered assistance, real-time collaboration, and comprehensive course management.

## ✨ Features

### 🎯 Core Learning Features
- **Interactive Course Catalog** - Browse and access a wide variety of educational courses
- **Real-time Course Access** - Seamless course navigation with new tab functionality
- **My Learning Dashboard** - Track your enrolled courses and progress
- **AI-Powered Q&A System** - Get instant help with educational questions
- **Smart Course Recommendations** - Personalized course suggestions

### 🤝 Real-time Collaboration
- **Live Messaging** - Real-time chat with fellow students and instructors
- **User Presence** - See who's online and their expertise areas
- **Study Groups** - Create and join collaborative study sessions
- **Help Requests** - Request and provide academic assistance
- **Video & Voice Calls** - Integrated communication tools
- **File Sharing** - Share resources and study materials
- **Notifications** - Real-time updates and alerts

### 🔐 Authentication & Security
- **Social Authentication** - Login with Google and GitHub
- **Role-based Access Control** - Student and instructor roles
- **Session Management** - Secure session handling with recovery
- **Row Level Security** - Database-level security policies

### 🎨 Modern UI/UX
- **Responsive Design** - Works perfectly on all devices
- **Dark/Light Theme** - Customizable appearance
- **Accessibility** - WCAG compliant interface
- **Smooth Animations** - Enhanced user experience
- **Toast Notifications** - User-friendly feedback system

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd educonnect
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_OPENAI_API_KEY=your_openai_api_key
   ```

4. **Set up the database**
   - Go to your Supabase dashboard
   - Navigate to SQL Editor
   - Run the database setup script (see Database Setup section)

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   ```
   http://localhost:8083
   ```

## 🗄️ Database Setup

### Required Tables
The application requires the following Supabase tables:

- `profiles` - User profiles and preferences
- `external_courses` - Course catalog
- `enrolled_courses` - User enrollments
- `analytics_events` - Usage tracking
- `user_settings` - User preferences
- `messages` - Real-time messaging
- `user_presence` - Online status
- `study_groups` - Study group management
- `study_group_members` - Group membership
- `help_requests` - Academic assistance
- `help_request_responses` - Help responses
- `video_calls` - Video conferencing
- `voice_calls` - Voice calls
- `shared_resources` - File sharing
- `notifications` - User notifications

### Setup Instructions

1. **Access Supabase Dashboard**
   ```
   https://supabase.com/dashboard/project/your-project-id/editor
   ```

2. **Run the complete setup script**
   - Copy the SQL script from `collaboration_database_setup.sql`
   - Paste into SQL Editor
   - Execute the script

3. **Verify setup**
   - Use the test page: `test-collaboration-db.html`
   - Check all tables are accessible
   - Test real-time features

`

## 🛠️ Technology Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **React Router** - Navigation
- **React Query** - Data fetching
- **Shadcn UI** - Component library
- **Tailwind CSS** - Styling
- **Sonner** - Toast notifications

### Backend & Database
- **Supabase** - Backend as a Service
- **PostgreSQL** - Database
- **Row Level Security** - Data security
- **Real-time Subscriptions** - Live updates

### AI & Integrations
- **OpenAI API** - AI-powered features
- **Educational AI** - Learning assistance

## 🎮 Usage Guide

### For Students

1. **Browse Courses**
   - Visit the courses page
   - Filter by category, level, or search
   - Click "Access Course" to open in new tab

2. **Join Study Groups**
   - Navigate to Collaboration
   - Browse available study groups
   - Join groups matching your subjects

3. **Get Help**
   - Use the AI Q&A system
   - Create help requests
   - Respond to others' requests

4. **Collaborate**
   - Send real-time messages
   - Share files and resources
   - Join video/voice calls

### For Instructors

1. **Manage Courses**
   - Access course management tools
   - Track student progress
   - Update course content

2. **Support Students**
   - Monitor help requests
   - Provide real-time assistance
   - Host study sessions

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

### Code Quality

- **ESLint** - Code linting
- **TypeScript** - Type checking
- **Prettier** - Code formatting
- **Husky** - Git hooks

### Testing

```bash
npm run test         # Run tests
npm run test:watch   # Watch mode
npm run test:coverage # Coverage report
```

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify Supabase credentials in `.env`
   - Check if all tables exist
   - Run the database setup script

2. **Real-time Features Not Working**
   - Ensure database tables are created
   - Check browser console for errors
   - Verify Supabase real-time is enabled

3. **Authentication Issues**
   - Clear browser cache
   - Check Supabase auth settings
   - Verify OAuth providers are configured

4. **Course Access Problems**
   - Check if course URLs are valid
   - Ensure popup blockers are disabled
   - Verify session state

### Debug Tools

- **Test Database**: `test-collaboration-db.html`
- **Test Course Links**: `test-course-links-final.html`
- **Test OAuth**: `test-oauth.html`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- **Documentation**: Check the docs folder
- **Issues**: Create GitHub issues
- **Discussions**: Use GitHub discussions
- **Email**: Contact the development team

## 🎉 Acknowledgments

- **Supabase** for the excellent backend platform
- **Shadcn UI** for the beautiful components
- **OpenAI** for AI capabilities
- **Vite** for the fast build tool
- **React Team** for the amazing framework

---

**🎓 Happy Learning with EDUConnect!** 🚀