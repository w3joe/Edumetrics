-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "role" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    CONSTRAINT "users_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "schools" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "timezone" TEXT
);

-- CreateTable
CREATE TABLE "classes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    CONSTRAINT "classes_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "classes_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "students" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "classId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    CONSTRAINT "students_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "assignments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "classId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "dueAt" TEXT NOT NULL,
    "timeEstimateMin" INTEGER NOT NULL,
    CONSTRAINT "assignments_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "submissions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "assignmentId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "scorePct" REAL NOT NULL,
    "completedAt" TEXT NOT NULL,
    CONSTRAINT "submissions_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "assignments" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "submissions_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "practice_sessions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "startedAt" TEXT NOT NULL,
    "durationMin" INTEGER NOT NULL,
    "accuracyPct" REAL NOT NULL,
    CONSTRAINT "practice_sessions_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "mood_checks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "moodScore" INTEGER NOT NULL,
    CONSTRAINT "mood_checks_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
