# Deployment Guide - Ahl El Quran

Complete guide for deploying the Ahl El Quran system to production.

## 📋 Prerequisites

- GitHub account with both repositories (frontend & backend)
- Vercel account (for frontend)
- Backend hosting account (Railway/Render/Heroku) or ngrok
- PostgreSQL database (provided by hosting or separate)

## 🎯 Deployment Overview

1. **Backend Deployment** (FastAPI + PostgreSQL)
2. **Frontend Deployment** (Next.js on Vercel)
3. **Configuration** (CORS, environment variables)
4. **Testing** (Verify all functionality)

---

## 🔧 Part 1: Backend Deployment

### Option A: Using Railway.app (Recommended)

**Advantages**: Free tier, auto-deploy from GitHub, PostgreSQL included, easy setup

1. **Sign up** at [railway.app](https://railway.app)

2. **Create New Project** → "Deploy from GitHub repo"

3. **Select Repository**: `AhlQuran-Back`

4. **Add PostgreSQL**:
   - Click "New" → "Database" → "Add PostgreSQL"
   - Railway automatically sets `DATABASE_URL` environment variable

5. **Configure Backend Service**:
   - Click on your backend service
   - Go to "Settings" → "Environment Variables"
   - Add these variables:

```env
SECRET_KEY=generate-a-secure-random-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1800
REFRESH_TOKEN_EXPIRE_DAYS=7
CORS_ORIGINS=http://localhost:3000,https://your-app.vercel.app
```

6. **Generate Secret Key**:
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

7. **Deploy**:
   - Railway auto-deploys from main branch
   - Click "Deploy" if needed
   - Wait for build to complete

8. **Get Backend URL**:
   - Go to "Settings" → "Networking" → "Public Networking"
   - Copy the URL (e.g., `https://ahlquran-production.up.railway.app`)

### Option B: Using Render.com

1. **Sign up** at [render.com](https://render.com)

2. **Create PostgreSQL Database**:
   - Dashboard → "New" → "PostgreSQL"
   - Select free tier
   - Copy the "Internal Database URL"

3. **Create Web Service**:
   - Dashboard → "New" → "Web Service"
   - Connect GitHub repository: `AhlQuran-Back`
   - Settings:
     - **Build Command**: `pip install -r requirements.txt`
     - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

4. **Add Environment Variables**:
```env
DATABASE_URL=<your-database-url-from-step-2>
SECRET_KEY=<generate-secure-key>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1800
CORS_ORIGINS=http://localhost:3000,https://your-app.vercel.app
```

5. **Deploy**: Render auto-deploys on push

### Option C: Using ngrok (Quick Testing)

**Use Case**: Quick demos, testing, temporary deployments

1. **Start Backend Locally**:
```bash
cd ahlQuran_Back
docker-compose up -d
```

2. **Install ngrok**:
   - Download from [ngrok.com](https://ngrok.com/download)
   - Sign up for free account
   - Follow installation instructions

3. **Expose Backend**:
```bash
ngrok http 8000
```

4. **Copy URL**: 
   - Look for "Forwarding" line (e.g., `https://abc-123.ngrok-free.dev`)
   - This is your backend URL

5. **Update CORS** in `app/main.py`:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://abc-123.ngrok-free.dev",  # Your ngrok URL
        "https://your-app.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

6. **Restart Backend**:
```bash
docker-compose restart backend
```

**⚠️ Note**: ngrok free URLs change every restart. For permanent URLs, upgrade to paid plan.

---

## 🚀 Part 2: Frontend Deployment (Vercel)

### Step 1: Prepare Repository

```bash
cd ahl_el_quran
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Step 2: Deploy to Vercel

1. **Sign up/Login** at [vercel.com](https://vercel.com)

2. **Import Project**:
   - Click "Add New" → "Project"
   - Import from GitHub: Select `Ahl-El-Quran` repository
   - Click "Import"

3. **Configure Project**:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (leave default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)

### Step 3: Configure Environment Variables

In Vercel project settings, add these variables:

| Name | Value | Example |
|------|-------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | Your backend URL | `https://ahlquran.railway.app/api/v1` |
| `NEXT_PUBLIC_API_URL` | Same as above (fallback) | `https://ahlquran.railway.app/api/v1` |

**Important**: 
- Replace with YOUR actual backend URL from Part 1
- Include `/api/v1` at the end
- Do NOT include trailing slash

### Step 4: Deploy

1. Click **"Deploy"**
2. Wait for build (usually 1-2 minutes)
3. Get your URL (e.g., `https://ahl-el-quran.vercel.app`)

### Step 5: Update Backend CORS

Go back to your backend hosting (Railway/Render/ngrok) and update CORS:

**Railway/Render**: Add environment variable:
```env
CORS_ORIGINS=http://localhost:3000,https://ahl-el-quran.vercel.app
```

**ngrok/Local**: Update `app/main.py`:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://ahl-el-quran.vercel.app",  # Your Vercel URL
    ],
    # ... rest of config
)
```

Then restart backend.

---

## ✅ Part 3: Verification & Testing

### 1. Test Backend Health

Visit your backend URL in browser:
- `https://your-backend.railway.app/` → Should see "Welcome" message
- `https://your-backend.railway.app/docs` → Should see Swagger UI
- `https://your-backend.railway.app/api/v1/health` → Should return `{"status": "healthy"}`

### 2. Seed Test Data

```bash
curl -X POST "https://your-backend.railway.app/api/v1/seed/populate"
```

Or visit `/docs` and try the `/seed/populate` endpoint.

### 3. Test Login

1. Go to `https://your-app.vercel.app/login`
2. Use test credentials:
   - Email: `admin@doctrine.com`
   - Password: `admin123`
3. Should successfully log in and redirect to dashboard

### 4. Test Admin Role Override

1. Login as admin
2. Go to "إدارة المدارس" (Manage Schools)
3. Click "عرض" (View) on a school
4. Try adding a student or achievement
5. Check browser DevTools → Network tab
6. Verify headers include:
   - `X-Role-Override: CHIEF_SUPERVISOR`
   - `school_id=X` in URL params

### 5. Test All Roles

Login with different accounts:
- President: `school1@doctrine.com` / `school123`
- Teacher: `teacher1@doctrine.com` / `teacher123`
- Student: `student1@doctrine.com` / `student123`

Verify each role sees appropriate menu items and can access their pages.

---

## 🔒 Security Checklist

Before going live:

- [ ] Changed `SECRET_KEY` to secure random value
- [ ] Updated CORS to only allow your frontend domain (not `*`)
- [ ] Removed or secured `/seed/populate` endpoint (add authentication)
- [ ] Set `DEBUG=False` in production
- [ ] Using HTTPS for both frontend and backend
- [ ] Database has strong password
- [ ] All environment variables are set correctly
- [ ] Test all user roles and permissions
- [ ] Backup database regularly
- [ ] Set up monitoring (optional: Sentry, LogRocket)

---

## 🔄 Continuous Deployment

### Automatic Deployment

Both Vercel and Railway/Render support automatic deployment:

**Frontend (Vercel)**:
- Push to `main` branch → Auto-deploys to production
- Push to other branches → Creates preview deployment

**Backend (Railway/Render)**:
- Push to `main` branch → Auto-deploys
- Database migrations run automatically on startup

### Manual Deployment

**Vercel**:
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd ahl_el_quran
vercel --prod
```

**Railway**:
- Dashboard → Your Service → "Deploy" button
- Or trigger via Git push

---

## 🐛 Troubleshooting

### Frontend can't connect to backend

**Symptoms**: "Network Error", "Failed to fetch"

**Solutions**:
1. Check `NEXT_PUBLIC_API_BASE_URL` in Vercel
2. Verify backend is running (visit `/docs`)
3. Check CORS settings in backend
4. Check browser console for CORS errors
5. Verify backend URL includes `/api/v1`

### Admin role override not working

**Symptoms**: 403 Forbidden when admin tries to manage school

**Solutions**:
1. Check browser DevTools → Network tab
2. Verify `X-Role-Override` header is sent (capitalized!)
3. Check `school_id` parameter in URL
4. Verify `sessionStorage` has `admin_viewing_school`
5. Clear browser cache and try again

### Database migration failed

**Symptoms**: Backend won't start, migration errors in logs

**Solutions**:
```bash
# Railway
railway logs --tail

# Check migration status
railway run alembic current

# Manually run migrations
railway run alembic upgrade head
```

### 401 Unauthorized errors

**Symptoms**: Logged out randomly, can't access endpoints

**Solutions**:
1. Check token expiration (`ACCESS_TOKEN_EXPIRE_MINUTES`)
2. Verify `SECRET_KEY` matches between deployments
3. Check if user exists in database
4. Try logging out and logging in again

---

## 📞 Support & Resources

- **Frontend Repo**: https://github.com/rauuf-o/Ahl-El-Quran
- **Backend Repo**: https://github.com/AhlQurannew/AhlQuran-Back
- **Vercel Docs**: https://vercel.com/docs
- **Railway Docs**: https://docs.railway.app
- **FastAPI Docs**: https://fastapi.tiangolo.com
- **Next.js Docs**: https://nextjs.org/docs

---

## 🎉 Done!

Your Ahl El Quran system should now be live and accessible:

- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-backend.railway.app`
- **API Docs**: `https://your-backend.railway.app/docs`

Share these URLs with your team and start using the system!
