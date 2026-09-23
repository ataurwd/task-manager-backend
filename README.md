# Task Manager & Secure Note-Taking REST API (Backend)

Built with **Node.js**, **Express**, **TypeScript**, and **MongoDB (Mongoose)**. Features JWT authentication, Role-Based Access Control (RBAC), strict explicit schema indexing (`schema.index`), and optimized MongoDB aggregation pipelines.

---

## 🚀 Features

- **Authentication & RBAC**:
  - Secure password hashing with `bcryptjs`.
  - JWT generation and stateless bearer token authentication.
  - Role-Based Access Control (`user` vs `admin`).
- **Notes Management**:
  - Regular Users can create, update, delete, and view their own notes.
  - Admins can view everyone's notes with global pagination.
- **Admin User Management**:
  - List all users with pagination and role filtering.
  - Add, update, and delete users (with cascading cleanup of notes & posts).
- **Public Posts**:
  - Authenticated post creation and public post reading with pagination.
- **Optimized MongoDB Aggregation Pipelines**:
  - **Scenario 1 (Group by Interests)**: Exactly one `User.aggregate()` call unwinding interests, grouping users, and sorting.
  - **Scenario 2 (User Posts $lookup)**: Single aggregation pipeline retrieving user details with all associated posts using a `$lookup` stage.
- **Database Indexing & Efficiency**:
  - **100% adherence to indexing constraints**: Zero redundant indexes.
  - Defined explicitly via `schema.index(...)`.

---

## 📊 Explicit Indexing Strategy

| Model | Index Definition | Index Type | Query / Feature Supported |
| :--- | :--- | :--- | :--- |
| **User** | `{ email: 1 }` | Unique Index | Authentication login and duplicate email prevention. |
| **User** | `{ interests: 1 }` | Multikey Index | **Scenario 1 Aggregation** (Group users by interests). |
| **User** | `{ role: 1, createdAt: -1 }` | Compound Index | Admin paginated user listing, sorted newest first. |
| **Note** | `{ userId: 1, createdAt: -1 }` | Compound Index | User listing their own notes (paginated & sorted). |
| **Note** | `{ _id: 1, userId: 1 }` | Compound Index | Single note read, update, delete with ownership check. |
| **Note** | `{ createdAt: -1 }` | Single Field Index | Admin view of everyone's notes with global pagination. |
| **Post** | `{ authorId: 1, createdAt: -1 }` | Compound Index | **Scenario 2 Aggregation** ($lookup user posts) & author post list. |
| **Post** | `{ createdAt: -1 }` | Single Field Index | Public post listing with pagination. |

---

## 🛠️ Getting Started

### 1. Installation
```bash
npm install
```

### 2. Environment Variables
Create `.env` (or copy `.env.example`):
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/secure_notes
JWT_SECRET=super_secret_jwt_key_interview_2026
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

### 3. Build & Run
```bash
# Development mode (with live reload)
npm run dev

# Production build
npm run build
npm start
```

### 4. Database Seed & Verification
```bash
# Seed realistic demo users, notes, and posts
npm run seed

# Run Index & Query Plan (explain) verification audit
npm run verify-indexes
```

---

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user (`name`, `email`, `password`, optional `role`, `interests`)
- `POST /api/auth/login` - Authenticate with `email` and `password`
- `GET /api/auth/me` - Get current user profile (requires Bearer token)

### Notes (Private)
- `GET /api/notes?page=1&limit=10` - List notes (Regular user: own notes; Admin: all notes)
- `POST /api/notes` - Create a new note (`title`, `content`)
- `GET /api/notes/:id` - Read single note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note

### Admin User Management (Admin Only)
- `GET /api/admin/users?page=1&limit=10&role=user` - List all users with pagination
- `POST /api/admin/users` - Create user with role and interests
- `GET /api/admin/users/:id` - Get user details
- `PUT /api/admin/users/:id` - Update user details/role
- `DELETE /api/admin/users/:id` - Delete user and cascade delete their notes/posts

### Public Posts
- `GET /api/posts?page=1&limit=10` - List public posts
- `POST /api/posts` - Create post (Authenticated)
- `GET /api/posts/:id` - View single post

### Aggregations
- `GET /api/aggregations/users-by-interests` - **Scenario 1**: Group users by interests using a single `collection.aggregate()` call.
- `GET /api/aggregations/users/:userId/posts` - **Scenario 2**: Retrieve user and all their posts using a single aggregation pipeline with a `$lookup` stage.
