-- CreateTable
CREATE TABLE "SiteSettings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "logoUrl" TEXT NOT NULL DEFAULT '/logo.png',
    "siteName" TEXT NOT NULL DEFAULT 'Gaziantep Yüzme Spor Kulübü',
    "siteAcik" TEXT NOT NULL DEFAULT 'Tenis & Yüzme',
    "updatedAt" DATETIME NOT NULL
);
