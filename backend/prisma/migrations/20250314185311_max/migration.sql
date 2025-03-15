-- AlterTable
ALTER TABLE "Group" ADD COLUMN "maxPeople" INTEGER;

-- CreateTable
CREATE TABLE "_GroupLevels" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_GroupLevels_A_fkey" FOREIGN KEY ("A") REFERENCES "Group" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_GroupLevels_B_fkey" FOREIGN KEY ("B") REFERENCES "Level" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Level" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "groupId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Level" ("createdAt", "groupId", "id", "name", "updatedAt") SELECT "createdAt", "groupId", "id", "name", "updatedAt" FROM "Level";
DROP TABLE "Level";
ALTER TABLE "new_Level" RENAME TO "Level";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "_GroupLevels_AB_unique" ON "_GroupLevels"("A", "B");

-- CreateIndex
CREATE INDEX "_GroupLevels_B_index" ON "_GroupLevels"("B");
