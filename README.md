# Ahl El Quran - Frontend (Next.js)

A comprehensive Quran school management system built with Next.js 14, TypeScript, and Tailwind CSS.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Deployment on Vercel](#deployment-on-vercel)
- [User Roles](#user-roles)
- [Key Features by Role](#key-features-by-role)
- [API Integration](#api-integration)
- [Admin Role Override System](#admin-role-override-system)

## 🎯 Overview

Ahl El Quran is a modern web application designed to manage Quran schools (حلقات القرآن). It provides comprehensive tools for administrators, supervisors, teachers, students, and guardians to track memorization progress, attendance, achievements, and generate detailed reports.

## ✨ Features

- **Multi-tenant Architecture**: Support for multiple schools under one admin
- **Role-Based Access Control**: 6 distinct user roles with specific permissions
- **Student Management**: Complete student profiles with medical info, guardian details, and academic records
- **Memorization Tracking**: Track Quran memorization progress with verse-level accuracy
- **Attendance System**: Mark and track daily attendance with multiple statuses
- **Achievement System**: Record and monitor student achievements (memorization, minor/major revision)
- **Statistics & Reports**: Comprehensive dashboards with charts and analytics
- **Lecture Management**: Organize students into lectures (حلقات) with teacher assignments
- **Real-time Updates**: Dynamic data fetching and state management
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Charts**: Recharts
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Linting**: ESLint

## 📁 Project Structure

```
ahl_el_quran/
├── app/                          # Next.js App Router pages
│   ├── API/                     # API client modules
│   │   ├── interceptors.ts      # Axios interceptors (auth, role override)
│   │   ├── admin.ts             # Admin API calls
│   │   ├── students.ts          # Student API calls
│   │   ├── teacher.ts           # Teacher API calls
│   │   ├── supervisor.ts        # Supervisor API calls
│   │   ├── president.ts         # President API calls
│   │   ├── lectures.ts          # Lecture API calls
│   │   ├── reports.ts           # Reports & statistics API calls
│   │   └── messages.ts          # Messaging API calls
│   ├── admin/                   # Admin dashboard pages
│   ├── memorization/            # Memorization tracking page
│   ├── students/                # Student management pages
│   ├── teachers/                # Teacher management pages
│   ├── lectures/                # Lecture management pages
│   ├── statistics/              # Statistics & analytics pages
│   ├── reports/                 # Reports dashboard
│   ├── login/                   # Authentication pages
│   └── layout.tsx               # Root layout
├── components/                   # Reusable React components
│   ├── layout/                  # Layout components
│   │   ├── AppLayout.tsx        # Main app layout wrapper
│   │   ├── Sidebar.tsx          # Navigation sidebar with role-based menus
│   │   └── Header.tsx           # Top header with user info
│   ├── ui/                      # UI components
│   │   ├── Button.tsx           # Custom button component
│   │   ├── Input.tsx            # Form input component
│   │   ├── Select.tsx           # Dropdown select component
│   │   ├── Modal.tsx            # Modal dialog component
│   │   └── Table.tsx            # Data table component
│   └── features/                # Feature-specific components
├── store/                        # Zustand state management
│   └── authStore.ts             # Authentication state (user, tokens)
├── utils/                        # Utility functions
│   ├── auth.ts                  # Authentication helpers
│   └── quranData.ts             # Quran surah/verse data
├── types/                        # TypeScript type definitions
└── public/                       # Static assets

```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Backend API running (see backend README)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/rauuf-o/Ahl-El-Quran.git
cd ahl_el_quran
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Create a `.env.local` file (see [Environment Variables](#environment-variables))

4. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🔐 Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Backend API URL
NEXT_PUBLIC_API_BASE_URL=https://your-backend-api.ngrok-free.dev/api/v1
# or for local development:
# NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1

# Alternative API URL variable (fallback)
NEXT_PUBLIC_API_URL=https://your-backend-api.ngrok-free.dev/api/v1

# Optional: NextAuth configuration (if using NextAuth)
# NEXTAUTH_URL=http://localhost:3000
# NEXTAUTH_SECRET=your-secret-key-here
```

### Environment Variables Explained:

- **NEXT_PUBLIC_API_BASE_URL**: The base URL of your backend API. This is the primary URL used by all API clients.
- **NEXT_PUBLIC_API_URL**: Fallback URL if `NEXT_PUBLIC_API_BASE_URL` is not set.

**Important**: 
- Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser
- Never include sensitive secrets in `NEXT_PUBLIC_` variables
- For production, use your deployed backend URL (e.g., ngrok, Railway, Render)

## 🌐 Deployment on Vercel

### Step 1: Prepare Your Repository

1. Ensure your code is pushed to GitHub:
```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"Add New Project"**
3. Select your **Ahl-El-Quran** repository
4. Configure your project:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (leave default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)

### Step 3: Configure Environment Variables

In the Vercel deployment settings, add these environment variables:

| Variable Name | Value | Description |
|--------------|-------|-------------|
| `NEXT_PUBLIC_API_BASE_URL` | `https://your-backend.ngrok-free.dev/api/v1` | Your backend API URL |
| `NEXT_PUBLIC_API_URL` | `https://your-backend.ngrok-free.dev/api/v1` | Fallback API URL |

**Example**:
```
NEXT_PUBLIC_API_BASE_URL=https://unaskingly-onomastic-leta.ngrok-free.dev/api/v1
NEXT_PUBLIC_API_URL=https://unaskingly-onomastic-leta.ngrok-free.dev/api/v1
```

### Step 4: Deploy

1. Click **"Deploy"**
2. Vercel will build and deploy your application
3. You'll get a URL like: `https://ahl-el-quran.vercel.app`

### Step 5: Update Backend CORS

Update your backend to allow requests from your Vercel domain:

In `backend/app/core/config.py`:
```python
CORS_ORIGINS = [
    "http://localhost:3000",
    "https://ahl-el-quran.vercel.app",  # Add your Vercel URL
]
```

### Continuous Deployment

Vercel automatically deploys when you push to your GitHub repository:
- **Push to `main`** → Production deployment
- **Push to other branches** → Preview deployment

### Custom Domain (Optional)

1. Go to your project settings in Vercel
2. Navigate to **Domains**
3. Add your custom domain (e.g., `ahlquran.com`)
4. Follow DNS configuration instructions

## 👥 User Roles

The system supports 6 user roles, each with specific permissions:

| Role | Arabic | Description |
|------|--------|-------------|
| `ADMIN` | الرئيس | System administrator with full access to all schools |
| `PRESIDENT` | رئيس المدرسة | School owner/president with full control over their school |
| `CHIEF_SUPERVISOR` | المشرف الرئيسي | Chief supervisor with elevated permissions |
| `SUPERVISOR` | المشرف | Regular supervisor with limited administrative access |
| `TEACHER` | المعلم | Teacher with access to their assigned lectures/students |
| `STUDENT` | الطالب | Student with access to personal data and achievements |
| `GUARDIAN` | ولي الأمر | Parent/guardian with access to ward's information |

## 🔑 Key Features by Role

### Admin (الرئيس)
- View and manage all schools in the system
- Access any school's data using the "Admin View School" feature
- Create and manage presidents (school owners)
- View system-wide statistics
- **Special Feature**: Role Override System (acts as CHIEF_SUPERVISOR when viewing a school)

### President (رئيس المدرسة)
- Manage school profile and settings
- Create and manage supervisors, teachers, students
- View school-wide statistics and reports
- Manage lectures (حلقات)
- Full access to all school data

### Chief Supervisor (المشرف الرئيسي)
- Elevated supervisor with additional permissions
- Manage students, teachers, and lectures
- Add achievements and attendance for all students
- View statistics and reports
- Cannot create other supervisors

### Supervisor (المشرف)
- Manage students within assigned lectures
- Add achievements and attendance
- View statistics for assigned lectures
- Limited administrative access

### Teacher (المعلم)
- View and manage assigned lectures
- Add achievements and attendance for their students
- Track student memorization progress
- View student-specific statistics

### Student (الطالب)
- View personal profile and achievements
- Track memorization progress
- View attendance history
- Access assigned lectures

### Guardian (ولي الأمر)
- View ward's (student) profile
- Monitor ward's achievements and attendance
- View ward's memorization progress
- Communicate with teachers

## 🔌 API Integration

### API Client Architecture

The application uses Axios with custom interceptors for API communication:

#### Interceptors (`app/API/interceptors.ts`)

1. **authInterceptor**: Adds authentication token to all requests
```typescript
// Automatically adds: Authorization: Bearer <token>
```

2. **schoolContextInterceptor**: Handles admin role override
```typescript
// When admin views a school, adds:
// - Header: X-Role-Override: CHIEF_SUPERVISOR
// - Param: school_id=<school_id>
```

3. **authErrorInterceptor**: Handles 401 errors and auto-logout

### API Modules

Each API module handles specific domain logic:

- **admin.ts**: School management, president CRUD
- **students.ts**: Student CRUD, enrollment, profile management
- **teacher.ts**: Teacher CRUD, lecture assignments, student achievements
- **supervisor.ts**: Supervisor CRUD, student management
- **president.ts**: School settings, statistics
- **lectures.ts**: Lecture CRUD, student assignments
- **reports.ts**: Statistics, achievement/attendance breakdowns
- **messages.ts**: Internal messaging system

### Making API Calls

Example:
```typescript
import studentsAPI from '@/app/API/students';

// Get all students (automatically includes auth token and school context)
const students = await studentsAPI.getStudents();

// Add achievement
await studentsAPI.addAchievement(studentId, {
  from_surah: 1,
  from_verse: 1,
  to_surah: 1,
  to_verse: 7,
  achievement_type: 'normal',
  date: '21-10-2026'
});
```

## 🔐 Admin Role Override System

### How It Works

When an admin wants to view and manage a specific school:

1. **Admin selects a school** from the admin dashboard
2. **Session storage stores** the school information:
```typescript
sessionStorage.setItem('admin_viewing_school', JSON.stringify({
  id: schoolId,
  name: schoolName
}));
```

3. **All API requests automatically include**:
   - Header: `X-Role-Override: CHIEF_SUPERVISOR`
   - Query param: `school_id=<school_id>`

4. **Backend receives the request** and:
   - Detects the `X-Role-Override` header
   - Creates an `AdminAsUser` object with `is_admin=True`
   - Grants CHIEF_SUPERVISOR permissions for that school
   - Uses `school_id` to filter data

5. **Admin can now**:
   - Add/edit/delete students, teachers, supervisors
   - Add achievements and attendance
   - View statistics and reports
   - Manage lectures

### Implementation Details

**Frontend** (`app/API/interceptors.ts`):
```typescript
export const schoolContextInterceptor = (config) => {
  if (typeof window !== 'undefined') {
    const adminViewData = sessionStorage.getItem('admin_viewing_school');
    if (adminViewData) {
      const { id } = JSON.parse(adminViewData);
      config.headers['X-Role-Override'] = 'CHIEF_SUPERVISOR';
      config.params = { ...config.params, school_id: id };
    }
  }
  return config;
};
```

**Backend** (`app/core/dependencies.py`):
```python
role_override = request.headers.get("X-Role-Override")
if role_override:
    class AdminAsUser:
        def __init__(self, admin, role):
            self.id = admin.id
            self.role = UserRoleEnum(role)
            self.is_admin = True  # Special flag for admin access
    return AdminAsUser(admin, role_override)
```

### Exit Admin View

To exit admin view mode:
```typescript
sessionStorage.removeItem('admin_viewing_school');
// Redirect back to admin dashboard
router.push('/admin');
```

## 📊 State Management

### Authentication Store (`store/authStore.ts`)

Uses Zustand for global auth state:

```typescript
interface AuthState {
  user: User | null;           // Current user object
  accessToken: string | null;  // JWT access token
  refreshToken: string | null; // JWT refresh token
  setUser: (user: User) => void;
  setTokens: (access: string, refresh: string) => void;
  logout: () => void;
}
```

**Features**:
- Persists tokens in localStorage
- Automatic token refresh
- Role-based UI rendering

## 🎨 Styling

### Tailwind CSS Configuration

Custom theme with Arabic-first design:

```javascript
// tailwind.config.js
theme: {
  extend: {
    fontFamily: {
      sans: ['Cairo', 'system-ui', 'sans-serif'],
    },
    colors: {
      primary: '#10b981',    // Emerald
      secondary: '#3b82f6',  // Blue
      // ... more colors
    }
  }
}
```

### RTL Support

The app is built with RTL (Right-to-Left) support for Arabic:
- `dir="rtl"` on `<html>` tag
- Tailwind directionality utilities
- Arabic-first typography

## 🧪 Testing

```bash
# Run linting
npm run lint

# Type checking
npx tsc --noEmit

# Build for production (tests build errors)
npm run build
```

## 📝 Code Documentation

### Adding Comments

When modifying code, follow these conventions:

```typescript
/**
 * Fetches all students for the current school
 * @param lectureId - Optional: Filter by lecture ID
 * @returns Promise<Student[]> - Array of student objects
 * @throws {Error} - If authentication fails or network error occurs
 * 
 * @example
 * const students = await studentsAPI.getStudents();
 * const lectureStudents = await studentsAPI.getStudents(lectureId: 5);
 */
```

## 🔒 Security Notes

1. **Never commit** `.env.local` or sensitive credentials
2. **API tokens** are stored in localStorage (browser-only)
3. **CORS** must be configured on backend
4. **XSS Protection**: Sanitize user inputs
5. **CSRF**: Handled by JWT token authentication

## 🐛 Common Issues

### API Connection Failed
- Check `NEXT_PUBLIC_API_BASE_URL` in `.env.local`
- Ensure backend is running
- Check CORS settings on backend

### 401 Unauthorized
- Token expired - logout and login again
- Check if backend JWT secret matches

### Role Override Not Working
- Clear browser cache and sessionStorage
- Verify `X-Role-Override` header is capitalized (not `x-role-override`)
- Check backend logs for role override detection

## 📞 Support

For issues or questions:
- Check the [Backend README](../ahlQuran_Back/README.md)
- Review API documentation
- Check browser console for errors

## 🤝 Contributing

When contributing:
1. Create a feature branch
2. Add comprehensive comments
3. Update this README if needed
4. Test thoroughly before pushing
5. Create a pull request with detailed description

## 📄 License

[Add your license here]

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Vercel for hosting platform
- All contributors to this project
