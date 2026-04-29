/*
  Warnings:

  - Added the required column `title` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Transaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "time" TEXT,
    "doc" TEXT
);
INSERT INTO "new_Transaction" ("amount", "category", "date", "description", "doc", "id", "time", "type") SELECT "amount", "category", "date", "description", "doc", "id", "time", "type" FROM "Transaction";
DROP TABLE "Transaction";
ALTER TABLE "new_Transaction" RENAME TO "Transaction";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
