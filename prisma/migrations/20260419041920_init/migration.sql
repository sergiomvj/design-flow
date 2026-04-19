-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'CLIENT',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "jobNumber" TEXT,
    "status" TEXT NOT NULL DEFAULT 'RECEIVED',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "requesterId" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "requesterEmail" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "internalSalesRep" TEXT,
    "department" TEXT NOT NULL,
    "contactMethod" TEXT NOT NULL,
    "projectType" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "objective" TEXT NOT NULL,
    "nature" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "usage" TEXT NOT NULL,
    "mainMessage" TEXT NOT NULL,
    "headline" TEXT,
    "requiredText" TEXT,
    "mandatoryInfo" TEXT,
    "dimensions" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "material" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "colors" TEXT NOT NULL,
    "brandGuidelines" TEXT,
    "finishing" TEXT,
    "logoUrl" TEXT,
    "fileUrls" TEXT,
    "photoUrls" TEXT,
    "referenceLinks" TEXT,
    "likes" TEXT,
    "dislikes" TEXT,
    "deadline" DATETIME,
    "isRush" BOOLEAN NOT NULL DEFAULT false,
    "rushReason" TEXT,
    "eventDate" DATETIME,
    "approverName" TEXT,
    "approverContact" TEXT,
    "reviewerCount" INTEGER DEFAULT 1,
    "revisionCount" INTEGER NOT NULL DEFAULT 1,
    "additionalChargesAware" BOOLEAN NOT NULL DEFAULT false,
    "designerId" TEXT,
    "priority" TEXT DEFAULT 'MEDIUM',
    "internalNotes" TEXT,
    "isConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "briefingAware" BOOLEAN NOT NULL DEFAULT false,
    "validationAware" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Project_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Project_designerId_fkey" FOREIGN KEY ("designerId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "text" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Comment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Project_jobNumber_key" ON "Project"("jobNumber");
