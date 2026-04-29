-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "time" TEXT,
    "doc" TEXT
);

-- CreateTable
CREATE TABLE "Insight" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "whatHappened" TEXT NOT NULL,
    "whyItMatters" TEXT NOT NULL,
    "whatItMeans" TEXT,
    "whatToDo" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "category" TEXT
);

-- CreateTable
CREATE TABLE "Goal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "current" REAL NOT NULL,
    "target" REAL NOT NULL,
    "unit" TEXT,
    "tone" TEXT NOT NULL DEFAULT 'primary',
    "icon" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "BusinessSettings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'config',
    "companyName" TEXT DEFAULT 'My Business',
    "industry" TEXT,
    "mission" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'USD'
);
