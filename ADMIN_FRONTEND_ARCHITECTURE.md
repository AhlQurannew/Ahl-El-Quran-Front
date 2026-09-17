# 🕌 Ahl El Quran - Super Admin Frontend Architecture & Technical Specification

## 1. Executive Summary & Domain Context

**Ahl El Quran** is a enterprise multi-school Quranic education and memorization management platform. The system operates across a multi-tenant hierarchy comprising five main roles:
1. **Super Admin (Top-level Administrator)**: System-wide overseer managing multi-school tenants, approvals, global compliance, user lifecycle, and platform analytics.
2. **President (School / Institution Head)**: Oversees a specific Quranic school/institution, managing supervisors, teachers, students, and school-wide schedules.
3. **Supervisor**: Manages specific academic sections, teachers, and student groups within a school.
4. **Teacher (Halqa Instructor)**: Conducts daily Quranic sessions, records student memorization (*Hifz*), revision (*Murajaa*), recitation quality (*Tilawa*), and attendance.
5. **Student & Guardian**: Tracks personal memorization progress, badges, khatm completion, and attendance records.

### Role of the Super Admin
The **Super Admin** is the most authoritative role in the application. Unlike Presidents or Teachers whose visibility is restricted to their specific school tenant, the Super Admin operates at the **Global Platform Level** with full cross-tenant visibility, audit capabilities, governance, and operational control.

---

## 2. Admin Frontend Architecture & Technology Stack

The Admin module is architected within the Next.js 16 (App Router) frontend application (`Ahl-El-Quran-Front`).

### Tech Stack Specification
- **Framework**: Next.js 16 (App Router with React Server Components & Server Actions)
- **UI Library & Components**: React 19, Tailwind CSS 4.x, Lucide React Icons
- **State Management & Data Fetching**: React Server Components (RSC) for initial page loads, SWR / React Query for client-side polling, live stats updates, and pagination cache.
- **Charts & Data Visualization**: Recharts or Chart.js for executive analytics (memorization velocity, attendance trends, school comparison charts).
- **RTL & Internationalization (i18n)**: Native RTL layout support (Arabic primary) with Cairo / Tajawal typography and English LTR fallback.

---

## 3. Frontend Functional Modules Needed for Admin

To empower the Super Admin to govern multiple schools effectively, the frontend architecture is divided into **5 core functional modules**:

```
app/admin/
├── layout.tsx                      # Admin Shell (RTL, Sidebar, Topbar, Alerts)
├── page.tsx                        # Module 1: Executive Dashboard Command Center
├── schools/                        # Module 2: Multi-School & President Management
│   ├── page.tsx                    # Active Schools Directory & Pending Approvals
│   └── [id]/page.tsx               # School Deep-Dive & Tenant Inspector
├── users/                          # Module 3: Global User & Security Management
│   ├── page.tsx                    # Cross-Role User Directory & Search
│   └── [id]/page.tsx               # User Detail & Audit Trail
├── analytics/                      # Module 4: Platform Academic & Memorization Stats
│   └── page.tsx                    # Cross-School Memorization & Quality Analytics
├── audit/                          # Module 5: System Audit Logs & Governance
│   └── page.tsx                    # Security Trail & Action Logs
└── settings/                       # Module 5: Global System Config & Broadcasts
    └── page.tsx                    # System Parameters & Broadcast Center
```

---

### Module 1: Executive Dashboard & Operations Command Center (`/admin`)

The Admin home page serves as a high-density, real-time command center providing a panoramic view of the entire platform.

#### Key Frontend Components & Features:
1. **Platform Executive KPI Cards**:
   - **Total Schools**: Active vs. Pending Approval vs. Deactivated count.
   - **Global User Breakdown**: Count of Presidents, Supervisors, Teachers, Students, Guardians.
   - **Active Sessions Today**: Real-time count of Quranic learning sessions conducted today.
   - **Total Memorization Progress**: Total Suwar and Ajzaa completed across all institutions.
   - **Platform Uptime & Health**: Database connection status and system response latency.

2. **Pending President Approvals Workbench (Priority Widget)**:
   - Real-time queue displaying newly registered school presidents awaiting verification.
   - Displays applicant name, email, school name, phone number, and submission date.
   - Quick **Approve** and **Reject** actions with a confirmation modal (reason required for rejection).

3. **Multi-School Performance & Activity Heatmap**:
   - Visual comparison chart showing active student engagement per school.
   - School ranking by memorization velocity (pages memorized per month).

4. **Real-time Alert & Anomaly Feed**:
   - Highlights inactive schools (no sessions recorded in 7+ days).
   - Highlights high student absenteeism rates across specific schools.
   - Unverified account alerts.

---

### Module 2: Multi-School & President Management (`/admin/schools`)

Manages the lifecycle of school tenants and school presidents across the entire system.

#### Key Frontend Components & Features:
1. **Pending Approvals Queue**:
   - Tabbed view dedicated to pending president registrations.
   - Document/Verification proof modal viewer.
   - Action triggers calling approval/rejection API endpoints with instant optimistic UI updates.

2. **Active Schools Directory**:
   - Multi-column data table listing all registered schools.
   - Features: Search by school name, president name, region; filter by status (Active, Inactive, Suspended); export to CSV/Excel.
   - Columns: School Name, President Name, Contact Info, Total Teachers, Total Students, Date Approved, Status, Actions.

3. **Tenant Inspector / School Deep-Dive (`/admin/schools/[id]`)**:
   - Full organizational breakdown of a selected school:
     - Linked President profile details.
     - School hierarchy tree (Supervisors -> Teachers -> Students).
     - School academic statistics (Total active lectures, daily attendance rate, memorization volume).
     - School activity audit log.
   - **School Governance Actions**:
     - Toggle School Status (Activate / Deactivate / Suspend).
     - Change President assignment or edit school metadata.

---

### Module 3: Global User Management & Security Center (`/admin/users`)

Provides centralized control over all user accounts across all roles and all schools.

#### Key Frontend Components & Features:
1. **Cross-School Unified User Directory**:
   - Single searchable, paginated table listing all users in the system.
   - Filters: Filter by Role (`PRESIDENT`, `SUPERVISOR`, `TEACHER`, `STUDENT`, `GUARDIAN`), Filter by School, Filter by Status (`Active`, `Inactive`).
   - Server-side pagination and instantaneous multi-attribute search (name, email, phone).

2. **User Control & Lifecycle Drawer/Modal**:
   - View complete user profile card.
   - **Deactivate User Account**: Instantly revoke access (with confirmation dialog preventing accidental deactivation).
   - **Reactivate Account**: Re-enable previously deactivated accounts.
   - **Password Reset Link Dispatch**: Send automated password reset notification to the user's registered email.

3. **Impersonation / Read-Only Inspection Mode**:
   - Allows the Super Admin to securely inspect the dashboard from the perspective of a specific school president for auditing or support troubleshooting.

4. **Bulk Operations Center**:
   - Select multiple users to perform bulk actions (e.g., bulk deactivation, bulk notification dispatch).

---

### Module 4: Platform Academic & Quranic Analytics (`/admin/analytics`)

Delivers deep analytical insights into Quranic memorization progress, evaluation quality, and educational performance across all institutions.

#### Key Frontend Components & Features:
1. **Global Quran Memorization Matrix**:
   - Overview of total *Ajzaa* (Parts) and *Suwar* memorized across the network.
   - Breakdown of students by memorization stage (e.g., Beginners: 1-5 Juz, Intermediate: 6-15 Juz, Advanced: 16-29 Juz, *Khatam*: Complete Quran 30 Juz).

2. **Evaluation & Quality Grade Metrics**:
   - Average score distribution for *Hifz* (New Memorization), *Murajaa* (Revision), and *Tilawa* (Recitation quality).
   - Identification of top-performing schools and schools needing educational support.

3. **Attendance & Engagement Analytics**:
   - Teacher attendance tracking across schools (punctuality, session completion rate).
   - Student attendance trends and absenteeism rates.

---

### Module 5: System Audit Logs, Announcements & Governance (`/admin/audit` & `/admin/settings`)

Ensures system transparency, compliance, security auditing, and platform-wide communication.

#### Key Frontend Components & Features:
1. **System Audit Trail Log (`/admin/audit`)**:
   - Log of all sensitive system actions (President approvals/rejections, user deactivations, role changes, settings updates).
   - Captures: Timestamp, Admin Actor, Action Type, Target Resource, IP Address.
   - Filterable by date range, admin user, and action type.

2. **Platform Announcements & Broadcast Hub (`/admin/settings`)**:
   - Rich text editor for creating platform-wide announcement messages.
   - Target recipient selection: All Users, All Presidents, All Teachers, or Specific Schools.
   - Schedule and send broadcast notifications.

3. **Global System Parameters**:
   - Define system-wide defaults (e.g., default pass marks for Quran sessions, maximum allowed students per teacher, system maintenance mode toggle).

---

## 4. API Endpoints Specification & Required Additions

To support the Super Admin frontend requirements, the current backend (`AhlQuran-Back`) must be extended. Below is the detailed specification of **existing endpoints** and **newly required endpoints** for statistics, facts, and administration.

### Summary Table of Admin API Endpoints

| Category | HTTP Method | Endpoint Path | Description | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/v1/auth/admin/login` | Admin authentication & JWT token issuance | Existing |
| **Presidents** | `GET` | `/api/v1/admin/pending-presidents` | List all unapproved president applications | Existing |
| **Presidents** | `POST` | `/api/v1/admin/approve-president/{user_id}` | Approve pending president application | Existing |
| **Presidents** | `DELETE` | `/api/v1/admin/reject-president/{user_id}` | Reject pending president application | Existing |
| **Users** | `GET` | `/api/v1/admin/all-users` | List basic info of all system users | Existing |
| **Users** | `PATCH` | `/api/v1/admin/deactivate-user/{user_id}` | Deactivate user account | Existing |
| **Stats (NEW)** | `GET` | `/api/v1/admin/stats/overview` | Platform-level KPI counters & summary stats | **REQUIRED NEW** |
| **Stats (NEW)** | `GET` | `/api/v1/admin/stats/schools` | Comparative statistics across all schools | **REQUIRED NEW** |
| **Stats (NEW)** | `GET` | `/api/v1/admin/stats/memorization-trends` | Platform-wide memorization progress timelines | **REQUIRED NEW** |
| **Stats (NEW)** | `GET` | `/api/v1/admin/stats/attendance` | Aggregate student & teacher attendance rates | **REQUIRED NEW** |
| **Schools (NEW)** | `GET` | `/api/v1/admin/schools` | Detailed multi-tenant school directory list | **REQUIRED NEW** |
| **Schools (NEW)** | `GET` | `/api/v1/admin/schools/{president_id}` | Full deep-dive profile of a single school | **REQUIRED NEW** |
| **Schools (NEW)** | `PATCH` | `/api/v1/admin/schools/{president_id}/status` | Activate / Deactivate / Suspend a school | **REQUIRED NEW** |
| **Users (NEW)** | `GET` | `/api/v1/admin/users/search` | Paginated, filtered user search across roles | **REQUIRED NEW** |
| **Users (NEW)** | `GET` | `/api/v1/admin/users/{user_id}` | Comprehensive user details & activity log | **REQUIRED NEW** |
| **Users (NEW)** | `PATCH` | `/api/v1/admin/users/{user_id}/reactivate` | Reactivate a deactivated user | **REQUIRED NEW** |
| **Users (NEW)** | `POST` | `/api/v1/admin/users/{user_id}/reset-password-link` | Send password reset notification | **REQUIRED NEW** |
| **Audit (NEW)** | `GET` | `/api/v1/admin/audit-logs` | Paginated system action audit logs | **REQUIRED NEW** |
| **System (NEW)** | `GET` | `/api/v1/admin/system/health` | System health, database & latency metrics | **REQUIRED NEW** |
| **Broadcast (NEW)** | `POST` | `/api/v1/admin/broadcast-message` | Send platform-wide announcements | **REQUIRED NEW** |

---

### Detailed Payload Specifications for Required New Endpoints

#### 1. `GET /api/v1/admin/stats/overview`
Returns platform-wide summary statistics for the executive dashboard.

**Response Schema (`200 OK`)**:
```json
{
  "kpis": {
    "total_schools": 24,
    "active_schools": 21,
    "pending_presidents": 3,
    "total_users": 1450,
    "users_by_role": {
      "presidents": 24,
      "supervisors": 48,
      "teachers": 120,
      "students": 950,
      "guardians": 308
    },
    "sessions_today": 86,
    "total_juz_memorized": 3420,
    "total_khatm_completed": 42
  },
  "system_health": {
    "db_status": "connected",
    "uptime_seconds": 1209600,
    "api_latency_ms": 45
  }
}
```

#### 2. `GET /api/v1/admin/stats/schools`
Provides comparative stats for all schools to render comparative charts and rankings.

**Query Parameters**: `sort_by` (`students`, `memorization_rate`, `attendance`), `order` (`asc`, `desc`), `limit` (`integer`).

**Response Schema (`200 OK`)**:
```json
{
  "schools": [
    {
      "president_id": 5,
      "school_name": "Al-Noor Academy",
      "president_name": "Ahmed Hassan",
      "total_teachers": 12,
      "total_students": 150,
      "active_lectures": 8,
      "avg_attendance_rate": 94.5,
      "total_pages_memorized_this_month": 480,
      "avg_hifz_score": 18.2
    }
  ]
}
```

#### 3. `GET /api/v1/admin/stats/memorization-trends`
Provides historical time-series data of Quranic memorization across the platform for visual charts.

**Query Parameters**: `period` (`weekly`, `monthly`, `yearly`).

**Response Schema (`200 OK`)**:
```json
{
  "period": "monthly",
  "data_points": [
    {
      "date": "2026-08-01",
      "total_hifz_lines": 45000,
      "total_murajaa_lines": 120000,
      "completed_juz_count": 85
    },
    {
      "date": "2026-09-01",
      "total_hifz_lines": 52000,
      "total_murajaa_lines": 135000,
      "completed_juz_count": 98
    }
  ]
}
```

#### 4. `GET /api/v1/admin/schools`
Enhanced endpoint listing all schools with enriched metadata and status flags.

**Query Parameters**: `status` (`ACTIVE`, `PENDING`, `DEACTIVATED`), `search` (`string`), `page` (`int`), `page_size` (`int`).

**Response Schema (`200 OK`)**:
```json
{
  "total": 24,
  "page": 1,
  "page_size": 10,
  "schools": [
    {
      "president_user_id": 12,
      "president_id": 4,
      "school_name": "Dar Al-Quran Institute",
      "email": "president@daralquran.edu",
      "phone_number": "+213555123456",
      "is_active": true,
      "approval_date": "2026-01-15T10:30:00Z",
      "metrics": {
        "supervisors_count": 3,
        "teachers_count": 10,
        "students_count": 120
      }
    }
  ]
}
```

#### 5. `GET /api/v1/admin/users/search`
Paginated user directory search supporting filtering across all roles and schools.

**Query Parameters**: `query` (`string`), `role` (`UserRoleEnum`), `is_active` (`bool`), `page` (`int`), `page_size` (`int`).

**Response Schema (`200 OK`)**:
```json
{
  "total": 1450,
  "page": 1,
  "page_size": 20,
  "users": [
    {
      "id": 101,
      "firstname": "Youssef",
      "lastname": "Brahimi",
      "email": "youssef@example.com",
      "role": "TEACHER",
      "is_active": true,
      "school_name": "Al-Noor Academy",
      "created_at": "2026-03-10T14:20:00Z"
    }
  ]
}
```

#### 6. `GET /api/v1/admin/audit-logs`
Retrieves administrative audit logs for compliance tracking.

**Query Parameters**: `admin_id` (`int`), `start_date` (`string`), `end_date` (`string`), `page` (`int`), `page_size` (`int`).

**Response Schema (`200 OK`)**:
```json
{
  "total": 150,
  "page": 1,
  "page_size": 25,
  "logs": [
    {
      "id": 501,
      "timestamp": "2026-09-17T12:00:00Z",
      "admin_username": "admin",
      "action": "APPROVE_PRESIDENT",
      "target_user_id": 12,
      "details": "Approved president registration for school 'Al-Noor Academy'",
      "ip_address": "192.168.1.50"
    }
  ]
}
```

---

## 5. Directory & File Structure for Admin Frontend

Below is the proposed Next.js 16 file organization for the Admin role within `Ahl-El-Quran-Front`:

```
Ahl-El-Quran-Front/
├── api/
│   └── admin.ts                    # Admin API Service layer (Axios/Fetch calls for all admin routes)
├── app/
│   └── admin/
│       ├── layout.tsx              # Admin Layout Shell (RTL, Nav, Header, Auth Guard)
│       ├── page.tsx                # Admin Dashboard (KPIs, Charts, Pending Approvals Widget)
│       ├── schools/
│       │   ├── page.tsx            # Schools Directory & Approvals Workbench
│       │   └── [id]/page.tsx       # School Profile & Tenant Inspector
│       ├── users/
│       │   ├── page.tsx            # Cross-School User Directory & Filtering
│       │   └── [id]/page.tsx       # User Profile & Activity Detail
│       ├── analytics/
│       │   └── page.tsx            # Academic & Quran Memorization Analytics
│       ├── audit/
│       │   └── page.tsx            # System Audit Log Trail
│       └── settings/
│           └── page.tsx            # System Configuration & Broadcast Center
├── components/
│   └── admin/
│       ├── AdminSidebar.tsx        # Collapsible Navigation Sidebar (Arabic RTL)
│       ├── AdminHeader.tsx         # Header with Notifications, System Status, Profile
│       ├── KpiCard.tsx             # Reusable KPI Summary Metric Card
│       ├── PendingPresidentCard.tsx# Pending President Approval Card Widget
│       ├── ApprovalModal.tsx       # Confirmation Modal for Approving/Rejecting
│       ├── SchoolsTable.tsx        # Interactive Data Table for Schools
│       ├── UsersTable.tsx          # Interactive Data Table for Global Users
│       ├── MemorizationChart.tsx   # Recharts component for Memorization Progress
│       └── AuditLogsTable.tsx      # Interactive Data Table for Audit Logs
├── types/
│   └── admin.ts                    # TypeScript definitions for Admin entities & API payloads
└── hooks/
    ├── useAdminStats.ts            # Custom SWR hook for Dashboard KPI updates
    ├── usePendingPresidents.ts     # Custom SWR hook for pending approval queue
    └── useGlobalUsers.ts           # Custom SWR hook for user search & pagination
```

---

## 6. Security, Authorization & Multi-Tenancy Compliance

1. **Authentication & Middleware Guard**:
   - `middleware.ts` inspects JWT token claims upon route access.
   - Access to `/admin/*` routes strictly requires token payload with role `ADMIN`.
   - Unauthorized attempts immediately redirect to `/login` with HTTP 403 Forbidden alert.

2. **Cross-Tenant Data Visibility**:
   - While lower roles (President, Supervisor, Teacher) are scoped to `school_id` via backend multi-tenancy middleware (`app/core/multi_tenancy.py`), Admin endpoints bypass tenant scoping to aggregate data across all schools.

3. **Data Integrity & Action Auditing**:
   - High-privilege actions (President Rejection, Account Deactivation) require confirmation modals with mandatory reason fields.
   - All administrative actions are automatically recorded into the backend audit log table.

---

## 7. Summary & Next Steps

This architecture provides a complete blueprint for the **Super Admin** frontend role in **Ahl El Quran**:
- **Comprehensive Functional Specification**: Outlines all 5 core modules required in the frontend.
- **API Endpoint Architecture**: Identifies existing endpoints and specifies **14 required new endpoints** with exact JSON request/response contracts for facts, statistics, and multi-school control.
- **Directory Structure & Code Organization**: Formulates a clean Next.js 16 App Router hierarchy.

By implementing this architecture, the platform will offer an enterprise-ready, scalable administration system for managing hundreds of Quranic schools seamlessly.
