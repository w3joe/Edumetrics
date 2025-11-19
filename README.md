# Edumetrics - Teacher Class Insights MVP

A web application that enables teachers to view their classes, monitor student performance metrics, and create assignments.

---

## Quick Start

Copy and paste these commands to get started:

```bash
# 1. Install dependencies
npm install

# 2. Set up database (from project root)
cd apps/api
npm run db:generate
npm run db:migrate
npm run db:seed
cd ../..

# 3. Start development servers
npm run dev
```

**Access the application:**
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:3001`
- Login credentials:
  - **Email**: `teacher@lincoln.edu`
  - **Password**: Any password

---

## Architecture

### System Diagram

```
┌─────────────────────────────────────────────────────────┐
│                        Browser                           │
│  ┌──────────────────────────────────────────────────┐   │
│  │         Next.js Frontend (React 19)              │   │
│  │  - Login Page                                     │   │
│  │  - Classes List                                   │   │
│  │  - Class Detail (Roster, Metrics, Assignments)   │   │
│  └───────────────────┬──────────────────────────────┘   │
└──────────────────────┼───────────────────────────────────┘
                       │ HTTP/REST API
                       │ Authorization: Bearer <JWT>
                       ▼
┌─────────────────────────────────────────────────────────┐
│              Express.js Backend (Node.js)                │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Routes: /auth, /classes, /assignments            │   │
│  │  Middleware: Auth, Error Handling, Request ID    │   │
│  │  Controllers: Business Logic                     │   │
│  └───────────────────┬──────────────────────────────┘   │
└──────────────────────┼───────────────────────────────────┘
                       │ Prisma ORM Queries
                       ▼
┌─────────────────────────────────────────────────────────┐
│              SQLite Database                             │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Tables:                                          │   │
│  │  - users, schools, classes                       │   │
│  │  - students, assignments                         │   │
│  │  - submissions, practice_sessions, mood_checks  │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Data Flow

1. **User Action**: Teacher logs in or views class data in the browser
2. **Frontend Request**: Next.js makes HTTP request to Express API with JWT token
3. **Authentication**: Express middleware validates JWT token
4. **Authorization**: Middleware verifies teacher owns the requested class
5. **Data Access**: Prisma ORM queries SQLite database
6. **Response**: JSON data flows back through the stack to the browser
7. **UI Update**: React components re-render with new data

---

## How Authentication Works

### Login Process

1. **User submits credentials** on the login page (`/login`)
2. **Frontend sends POST request** to `/auth/login` with email and password
3. **Backend validates credentials**:
   - Looks up user by email in database
   - Verifies password using bcrypt hash comparison
   - Returns 401 if credentials are invalid
4. **JWT token generation**: Backend creates a JWT token containing:
   ```json
   {
     "userId": "uuid-of-teacher",
     "role": "teacher",
     "schoolId": "uuid-of-school"
   }
   ```
5. **Token storage**: Frontend stores token in `localStorage`
6. **Subsequent requests**: All API calls include `Authorization: Bearer <token>` header

### Protected Routes

Every protected endpoint:
- Extracts token from `Authorization` header
- Verifies token signature and expiration
- Extracts `userId`, `role`, and `schoolId` from token
- Attaches user info to request object (`req.user`)
- Validates that teacher owns the requested class (for class-specific endpoints)

### Security Features

- **Password Hashing**: Passwords are hashed with bcrypt (10 salt rounds) before storage
- **JWT Expiration**: Tokens expire after 7 days
- **Authorization Checks**: Teachers can only access their own classes
- **School Isolation**: Teachers can only access resources within their school

---

## How Metrics Are Computed

The system computes student performance metrics in real-time from database records. All calculations happen server-side in the `GET /classes/:id/metrics` endpoint.

### Per-Student Metrics

#### Average Score Percentage (`avgScorePct`)
**Source**: `Submission` table  
**Calculation**:
```typescript
avgScorePct = sum(all submission.scorePct) / count(submissions)
```
**Example**: If a student has submissions with scores [95, 87, 72], the average is (95 + 87 + 72) / 3 = 84.67%  
**Returns**: `null` if student has no submissions

#### Sessions This Week (`sessionsThisWeek`)
**Source**: `PracticeSession` table  
**Calculation**:
```typescript
sevenDaysAgo = currentDate - 7 days
sessionsThisWeek = count(practiceSessions where startedAt >= sevenDaysAgo)
```
**Example**: Counts all practice sessions started in the last 7 days  
**Returns**: Integer (0 or greater)

#### Average Accuracy Percentage (`avgAccuracyPct`)
**Source**: `PracticeSession` table  
**Calculation**:
```typescript
avgAccuracyPct = sum(all session.accuracyPct) / count(sessions)
```
**Example**: If sessions have accuracy [92, 95, 85], the average is (92 + 95 + 85) / 3 = 90.67%  
**Returns**: `null` if student has no practice sessions

#### Recent Mood (`recentMood`)
**Source**: `MoodCheck` table  
**Calculation**:
```typescript
recentMood = most recent moodCheck.moodScore (ordered by date DESC, limit 1)
```
**Example**: Returns the mood score (1-5) from the most recent mood check  
**Returns**: `null` if student has no mood checks

### Class-Level Summary Metrics

These are computed from the per-student metrics:

- **Average Accuracy**: Mean of all students' `avgAccuracyPct` (excluding null values)
- **Active Students**: Count of students where `sessionsThisWeek >= 2`
- **Low Mood Count**: Count of students where `recentMood <= 2` (and not null)
- **Total Students**: Total count of students in the class

**Note**: All metrics are computed on-demand when the endpoint is called, ensuring data is always current.

---

## Technology Stack & Trade-offs

### Frontend Stack

**Next.js 16 + React 19**
- **Pros**: Modern framework with excellent developer experience, built-in routing, server components capability
- **Trade-off**: Using client components for interactivity (could leverage server components for better performance)
- **Choice**: App Router provides better structure than Pages Router

**Tailwind CSS**
- **Pros**: Rapid UI development, consistent design system, small bundle size
- **Trade-off**: Learning curve for utility-first approach, but faster than writing custom CSS

**Vitest**
- **Pros**: Fast, Vite-based, excellent TypeScript support
- **Choice**: Better performance than Jest for frontend testing

### Backend Stack

**Express.js**
- **Pros**: Simple, flexible, large ecosystem, easy to understand
- **Trade-off**: Less opinionated than NestJS, but simpler for MVP
- **Choice**: Perfect balance of simplicity and functionality

**Prisma + SQLite**
- **Pros**: Type-safe database access, easy migrations, SQLite requires no setup
- **Trade-off**: SQLite doesn't scale like PostgreSQL, but easy to migrate later
- **Choice**: SQLite perfect for development, Prisma makes migration to PostgreSQL trivial

**JWT Authentication**
- **Pros**: Stateless, scalable, works well with REST APIs
- **Trade-off**: Stored in localStorage (vulnerable to XSS), but simple for MVP
- **Future**: Consider httpOnly cookies for production

### Monorepo

**Turborepo**
- **Pros**: Fast builds with caching, parallel execution, great DX
- **Choice**: Industry standard for monorepos

### Design Decisions

1. **Separation of Concerns**: Routes → Controllers → Services pattern keeps code organized
2. **Type Safety**: Full TypeScript ensures fewer runtime errors
3. **Error Handling**: Centralized middleware catches and formats errors consistently
4. **Request IDs**: Every request gets unique ID for logging and debugging
5. **No PII Logging**: Emails and names are not logged per security requirements

---

## API Endpoints

### Authentication
- `POST /auth/login` - Authenticate and receive JWT token
  - Body: `{ email: string, password: string }`
  - Response: `{ token: string }`

### Classes
- `GET /classes` - List all classes for authenticated teacher
  - Headers: `Authorization: Bearer <token>`
  - Response: `Array<{ id, name, studentCount, assignmentCount }>`

- `GET /classes/:id/roster` - Get student roster for a class
  - Headers: `Authorization: Bearer <token>`
  - Response: `Array<{ id, name, email? }>`

- `GET /classes/:id/metrics` - Get computed KPIs per student
  - Headers: `Authorization: Bearer <token>`
  - Response: `Array<{ studentId, studentName, avgScorePct, sessionsThisWeek, avgAccuracyPct, recentMood }>`

- `GET /classes/:id/assignments` - Get all assignments for a class
  - Headers: `Authorization: Bearer <token>`
  - Response: `Array<{ id, title, topic, dueAt, timeEstimateMin }>`

### Assignments
- `POST /assignments` - Create new assignment
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ classId: string, title: string, topic: string, dueAt: string (ISO datetime), timeEstimateMin: number }`
  - Response: Created assignment object

---

## Development

### Running Tests

The project includes minimal but essential tests to verify core functionality.

#### Backend Test (1 test case)

**File**: `apps/api/src/__tests__/assignments.test.ts`

**Test**: "Valid assignment creation"
- **Purpose**: Verifies the assignment creation endpoint works correctly
- **What it tests**:
  - Authenticated teacher can create an assignment
  - All required fields are validated
  - Assignment is persisted to database
  - Response includes created assignment with ID
- **Setup**: Creates test school, teacher, and class
- **Assertions**: Checks status code (201), response structure, and data correctness

**Why this test**: Assignment creation is a critical feature that involves authentication, authorization, validation, and database persistence.

#### Frontend Test (1 test case)

**File**: `apps/web/src/__tests__/ClassList.test.tsx`

**Test**: "displays classes successfully"
- **Purpose**: Verifies the classes list page renders correctly
- **What it tests**:
  - Component fetches and displays class data
  - All class information (name, student count, assignment count) is shown
  - Multiple classes are rendered correctly
- **Setup**: Mocks API response and Next.js router
- **Assertions**: Checks that all expected text content appears in the DOM

**Why this test**: The classes list is the main entry point after login, so ensuring it works correctly is essential.

#### Running Tests

```bash
# Run all tests (backend + frontend)
npm run test

# Run backend tests only
cd apps/api && npm test

# Run frontend tests only
cd apps/web && npm test

# Run tests in watch mode
cd apps/web && npm test -- --watch
cd apps/api && npm test -- --watch
```

### Database Management

```bash
cd apps/api

# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed database
npm run db:seed

# Open Prisma Studio (database GUI)
npx prisma studio
```

### Creating New Users

```bash
cd apps/api
npm run user:create <email> <name> <role> [schoolId] [password]
```

**Examples:**
```bash
# Create a new teacher (prompts for password)
npm run user:create teacher2@school.edu "John Doe" teacher

# Create with password
npm run user:create teacher3@school.edu "Jane Smith" teacher "" "mypassword"
```

### Building for Production

```bash
# Build all apps
npm run build

# Start production servers
cd apps/api && npm start
cd apps/web && npm start
```

---

## AI Usage in Development

This project was built with the assistance of AI (Claude via Cursor) to accelerate development while maintaining code quality and best practices.

While AI assisted with code generation, all code was:
- **Reviewed** for correctness and best practices
- **Refactored** for clarity and maintainability
- **Tested** to ensure functionality
- **Validated** against the SRS requirements

---

## AWS Migration Notes

To migrate to AWS:

1. **Database**: Replace SQLite with RDS (PostgreSQL/MySQL)
   - Update `DATABASE_URL` in Prisma schema
   - Run migrations on RDS instance

2. **Backend API**: Deploy to AWS Lambda or EC2
   - Use API Gateway for Lambda
   - Or deploy Express app to EC2/ECS
   - Set environment variables (JWT_SECRET, DATABASE_URL)

3. **Frontend**: Deploy to S3 + CloudFront or Amplify
   - Build Next.js app: `npm run build`
   - Upload to S3 or use Amplify hosting
   - Update `NEXT_PUBLIC_API_URL` to point to API endpoint

4. **Security**:
   - Use AWS Secrets Manager for JWT_SECRET
   - Enable HTTPS with ACM certificates
   - Configure CORS properly for production domain

---

## CHANGELOG

### Development Order

1. **Monorepo Setup** - Initialized Turborepo structure with workspace packages
2. **Backend Foundation** - Express.js, Prisma, SQLite, database schema
3. **Authentication** - JWT-based auth with login endpoint and middleware
4. **Classes API** - GET endpoints for classes, roster, and metrics
5. **Assignments API** - POST endpoint with validation and authorization
6. **Frontend Setup** - Next.js, Tailwind CSS, API client utilities
7. **Frontend Pages** - Login, classes list, class detail with filters
8. **Testing** - Backend and frontend unit tests
9. **Seed Data** - Sample data generation script
10. **Documentation** - Comprehensive README and code documentation
