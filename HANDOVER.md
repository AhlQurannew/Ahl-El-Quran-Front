# Developer Handover - Ahl El Quran Project

Welcome! This document will help you get started with the Ahl El Quran project.

## 📋 Project Overview

**Ahl El Quran** is a comprehensive Quran school management system with:
- **Frontend**: Next.js 14 (TypeScript, Tailwind CSS)
- **Backend**: FastAPI (Python, PostgreSQL)
- **Features**: Student management, memorization tracking, attendance, achievements, statistics

## 🗂️ Repository Structure

### Frontend
- **Repository**: https://github.com/rauuf-o/Ahl-El-Quran
- **Branch**: `rahim` (main development branch)
- **Deployment**: Vercel (auto-deploy on push)
- **Live URL**: https://ahl-el-quran.vercel.app

### Backend
- **Repository**: https://github.com/AhlQurannew/AhlQuran-Back
- **Branch**: `final-backend` (main development branch)
- **Deployment**: Docker / Railway / ngrok
- **API Docs**: http://localhost:8000/docs (when running locally)

## 🚀 Quick Start

### 1. Clone Repositories

```bash
# Frontend
git clone https://github.com/rauuf-o/Ahl-El-Quran.git
cd Ahl-El-Quran
git checkout rahim
npm install

# Backend (separate terminal)
git clone https://github.com/AhlQurannew/AhlQuran-Back.git
cd AhlQuran-Back
git checkout final-backend
```

### 2. Start Backend

```bash
cd AhlQuran-Back
docker-compose up -d    # Starts PostgreSQL + Backend
docker-compose logs -f backend  # View logs
```

Backend will be available at: http://localhost:8000

### 3. Seed Test Data

```bash
curl -X POST "http://localhost:8000/api/v1/seed/populate"
```

Or visit http://localhost:8000/docs and use the `/seed/populate` endpoint.

### 4. Start Frontend

```bash
cd Ahl-El-Quran

# Create .env.local file
echo "NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1" > .env.local

npm run dev
```

Frontend will be available at: http://localhost:3000

### 5. Login

Go to http://localhost:3000/login

**Test Credentials**:
- Admin: `admin@doctrine.com` / `admin123`
- President: `school1@doctrine.com` / `school123`
- Teacher: `teacher1@doctrine.com` / `teacher123`
- Student: `student1@doctrine.com` / `student123`

## 📚 Essential Documentation

Read these in order:

1. **README.md** (Frontend) - Project structure, features, API integration
2. **DEPLOYMENT.md** (Frontend) - Deployment guide for Vercel + backend
3. **README.md** (Backend) - API structure, database, migrations
4. **This file** (HANDOVER.md) - You're reading it now!

## 🏗️ Architecture Overview

### Frontend Architecture

```
app/
├── API/                    # API client modules
│   ├── interceptors.ts    # ⭐ Auth & role override logic
│   ├── students.ts        # Student API calls
│   ├── teacher.ts         # Teacher API calls
│   └── reports.ts         # Statistics API calls
├── [pages]/               # Next.js App Router pages
├── components/
│   ├── layout/
│   │   └── Sidebar.tsx   # ⭐ Role-based navigation
│   └── ui/               # Reusable components
└── store/
    └── authStore.ts      # ⭐ Auth state management (Zustand)
```

**⭐ Key Files to Understand**:

1. **`app/API/interceptors.ts`**
   - Adds JWT token to all requests
   - Implements admin role override system
   - Handles 401 errors and auto-logout

2. **`store/authStore.ts`**
   - Manages user authentication state
   - Stores access/refresh tokens
   - User role information

3. **`components/layout/Sidebar.tsx`**
   - Role-based navigation menus
   - Different menus for admin, president, supervisor, teacher, student

### Backend Architecture

```
app/
├── api/v1/routes/         # API endpoints
│   ├── admin.py          # Admin operations
│   ├── student.py        # Student CRUD
│   ├── teacher.py        # Teacher CRUD
│   └── president.py      # Statistics, reports
├── core/
│   ├── dependencies.py   # ⭐ Auth & permission checks
│   ├── security.py       # JWT handling
│   └── multi_tenancy.py  # ⭐ Multi-tenant logic
├── models/               # SQLAlchemy ORM models
├── schemas/              # Pydantic request/response schemas
└── db/                   # Database session
```

**⭐ Key Files to Understand**:

1. **`app/core/dependencies.py`**
   - `get_current_user()` - JWT validation & user extraction
   - `require_president_or_supervisor()` - Permission checks
   - Admin role override implementation

2. **`app/core/multi_tenancy.py`**
   - `get_president_id_for_user()` - Gets president ID for any user type
   - Handles admin viewing school scenario

3. **`app/api/v1/routes/student.py`**
   - Example of full CRUD operations
   - Shows how to use dependencies
   - Achievement and attendance operations

## 🔑 Key Concepts

### 1. User Roles & Permissions

| Role | Level | Description |
|------|-------|-------------|
| ADMIN | 1 | System admin, can view/manage all schools |
| PRESIDENT | 2 | School owner, full control of their school |
| CHIEF_SUPERVISOR | 3 | Elevated supervisor, can manage students/teachers |
| SUPERVISOR | 4 | Can manage students, add achievements |
| TEACHER | 5 | Can manage own lectures, add achievements |
| STUDENT | 6 | Read-only access to own data |
| GUARDIAN | 6 | Read-only access to ward's data |

### 2. Admin Role Override System

**The Problem**: Admin needs to manage any school but shouldn't have a president_id

**The Solution**: Role Override
1. Admin selects a school to view
2. Frontend stores `school_id` in sessionStorage
3. Frontend adds header: `X-Role-Override: CHIEF_SUPERVISOR`
4. Frontend adds param: `?school_id=5`
5. Backend creates `AdminAsUser` object with `is_admin=True`
6. Permission checks allow access because of `is_admin` flag
7. Operations use `school_id` parameter to scope data

**Code Locations**:
- Frontend: `app/API/interceptors.ts` → `schoolContextInterceptor()`
- Backend: `app/core/dependencies.py` → `get_current_user()`

### 3. Multi-Tenancy

Each school is isolated (data separation):
- Students belong to a president (school)
- Teachers belong to a president (school)
- Lectures belong to a president (school)
- Achievements are scoped by president_id

**How it works**:
- Every query filters by `president_id`
- `get_president_id_for_user()` determines the correct president_id
- Admin with role override uses `school_id` parameter

### 4. Authentication Flow

1. User logs in → Backend returns `access_token` + `refresh_token`
2. Frontend stores tokens in localStorage (Zustand)
3. Interceptor adds token to all requests: `Authorization: Bearer <token>`
4. Backend validates token in `get_current_user()`
5. If token expires (401) → Frontend auto-logs out

## 🔧 Common Development Tasks

### Adding a New API Endpoint

**Backend**:
```python
# app/api/v1/routes/student.py

@studentRouter.get("/test")
async def test_endpoint(
    current_user: User = Depends(require_president_or_supervisor),
    db: AsyncSession = Depends(get_db)
):
    """Test endpoint - only presidents and supervisors can access"""
    return {"message": "Hello from test endpoint"}
```

**Frontend**:
```typescript
// app/API/students.ts

const testEndpoint = async () => {
    const res = await axiosGlobal.get("/test");
    return res.data;
};

export default {
    // ... existing exports
    testEndpoint,
};
```

### Adding a New Page

```bash
# Create new page
mkdir app/my-new-page
touch app/my-new-page/page.tsx
```

```typescript
// app/my-new-page/page.tsx
'use client';

import { AppLayout } from '@/components/layout/AppLayout';

export default function MyNewPage() {
  return (
    <AppLayout title="My New Page" breadcrumb="Home / My New Page">
      <div>
        <h1>My New Page Content</h1>
      </div>
    </AppLayout>
  );
}
```

Add to sidebar:
```typescript
// components/layout/Sidebar.tsx

const presidentNavGroups: NavGroup[] = [
  {
    items: [
      // ... existing items
      { label: 'صفحتي الجديدة', href: '/my-new-page', icon: <Icon size={18} /> },
    ],
  },
];
```

### Database Migrations

**Create migration**:
```bash
docker-compose exec backend alembic revision -m "add_new_field"
```

**Edit migration**:
```python
# alembic/versions/xxx_add_new_field.py

def upgrade():
    op.add_column('students', sa.Column('new_field', sa.String(100)))

def downgrade():
    op.drop_column('students', 'new_field')
```

**Apply**:
```bash
docker-compose restart backend  # Auto-runs migrations
```

## 🐛 Debugging Tips

### Frontend Debugging

1. **Check Browser Console** (F12)
   - Look for errors, network failures
   - Check API requests in Network tab

2. **Check Headers**:
   - Network tab → Select request → Headers
   - Verify `Authorization`, `X-Role-Override` headers

3. **Check State**:
```typescript
// Add in any component
import { useAuthStore } from '@/store/authStore';

const user = useAuthStore((s) => s.user);
console.log('Current user:', user);
```

4. **Check sessionStorage**:
```javascript
// Browser console
console.log(sessionStorage.getItem('admin_viewing_school'));
```

### Backend Debugging

1. **Check Logs**:
```bash
docker-compose logs -f backend
```

2. **Database Queries**:
```bash
docker-compose exec db psql -U ahlquran_user -d ahlquran_db
SELECT * FROM users;
```

3. **Add Logging**:
```python
import logging
logger = logging.getLogger(__name__)

logger.info(f"Debug info: {variable}")
logger.error(f"Error occurred: {error}")
```

4. **Interactive API Testing**:
   - Go to http://localhost:8000/docs
   - Try endpoints with "Try it out" button

## 📝 Code Style

### Frontend (TypeScript)

- Use TypeScript for all new files
- Use functional components with hooks
- Use Tailwind CSS for styling (no CSS modules)
- Follow RTL (Right-to-Left) design for Arabic
- Use `'use client'` directive for client components

```typescript
'use client';

import React, { useState, useEffect } from 'react';

export default function MyComponent() {
  const [data, setData] = useState<any[]>([]);
  
  useEffect(() => {
    // Fetch data
  }, []);
  
  return <div>Component content</div>;
}
```

### Backend (Python)

- Use async/await for all database operations
- Use type hints for function parameters
- Add docstrings to all functions
- Follow FastAPI conventions

```python
async def my_function(
    param: str,
    db: AsyncSession = Depends(get_db)
) -> dict:
    """
    Function description.
    
    Args:
        param: Parameter description
        db: Database session
        
    Returns:
        dict: Response data
    """
    # Implementation
    return {"result": "data"}
```

## 🚨 Known Issues & Workarounds

### Issue 1: Role Override Header Case-Sensitivity

**Problem**: Header must be `X-Role-Override` (capitalized), not `x-role-override`

**Solution**: Already fixed in all API files. If adding new API client, use:
```typescript
config.headers['X-Role-Override'] = 'CHIEF_SUPERVISOR';  // ✅ Correct
config.headers['x-role-override'] = 'CHIEF_SUPERVISOR';  // ❌ Won't work
```

### Issue 2: Vercel Caching

**Problem**: Changes not appearing after deployment

**Solution**: 
1. Hard refresh: Ctrl+Shift+R (Chrome) or Cmd+Shift+R (Mac)
2. Clear browser cache
3. Wait 1-2 minutes for Vercel CDN to update

### Issue 3: CORS Errors

**Problem**: "CORS policy" error in browser console

**Solution**: Update backend CORS origins:
```python
# app/main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://your-frontend.vercel.app",  # Add your domain
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## 📞 Getting Help

### Resources

- **Frontend README**: Comprehensive guide in `README.md`
- **Backend README**: API documentation in backend `README.md`
- **Deployment Guide**: Step-by-step in `DEPLOYMENT.md`
- **API Docs**: http://localhost:8000/docs (when running locally)

### Useful Commands

```bash
# Frontend
npm run dev          # Start dev server
npm run build        # Build for production
npm run lint         # Run linter

# Backend
docker-compose up -d            # Start services
docker-compose logs -f backend  # View logs
docker-compose restart backend  # Restart backend
docker-compose down -v          # Stop and remove everything

# Database
docker-compose exec db psql -U ahlquran_user -d ahlquran_db
```

## ✅ Pre-Deployment Checklist

Before deploying to production:

- [ ] All features tested locally
- [ ] Database migrations created and tested
- [ ] Environment variables documented
- [ ] CORS configured for production domain
- [ ] SECRET_KEY changed from default
- [ ] Test data seed endpoint secured or removed
- [ ] All console.log statements removed or converted to proper logging
- [ ] Error handling added for all API calls
- [ ] Loading states added for async operations
- [ ] 404/error pages implemented
- [ ] Mobile responsiveness tested
- [ ] Arabic RTL layout verified
- [ ] All user roles tested
- [ ] Admin role override tested

## 🎓 Learning Path

**Day 1**: Setup & Understanding
- Clone and run locally
- Read README files
- Login with different roles
- Explore the UI

**Day 2**: Frontend Deep Dive
- Study `interceptors.ts`
- Study `authStore.ts`
- Understand role-based navigation
- Try making a simple UI change

**Day 3**: Backend Deep Dive
- Study `dependencies.py`
- Study `multi_tenancy.py`
- Explore API docs at `/docs`
- Try adding a simple endpoint

**Day 4**: Integration
- Add a new feature end-to-end
- Create API endpoint
- Create frontend page
- Test with different roles

**Day 5**: Deployment
- Follow DEPLOYMENT.md
- Deploy to Vercel + Railway
- Test in production
- Verify all features work

## 🤝 Contributing

When making changes:

1. Create a feature branch:
```bash
git checkout -b feature/my-feature
```

2. Make changes and commit:
```bash
git add .
git commit -m "feat: Add new feature"
```

3. Push and create PR:
```bash
git push origin feature/my-feature
```

4. Merge to main branch after review

## 📄 Project Status

**Current Version**: 1.0.0 (Production Ready)

**Recent Updates**:
- ✅ Admin role override system
- ✅ Comprehensive documentation
- ✅ Seed test data endpoint
- ✅ All CRUD operations complete
- ✅ Statistics and reports
- ✅ Attendance and achievements

**Future Enhancements**:
- Automated tests (pytest for backend, Jest for frontend)
- Real-time notifications (WebSocket)
- Email notifications
- report generation
- Mobile app (React Native)
- Bulk operations (import/export CSV)

## 🎉 Welcome Aboard!

You now have everything you need to work on Ahl El Quran. Start by running the project locally, exploring the code, and making small changes.

**Remember**:
- Read the code comments - they explain WHY, not just WHAT
- Use the API docs at `/docs` - it's interactive!
- Test with different user roles - they see different UIs
- Ask questions - document what you learn for future developers

Good luck, and happy coding! 🚀
