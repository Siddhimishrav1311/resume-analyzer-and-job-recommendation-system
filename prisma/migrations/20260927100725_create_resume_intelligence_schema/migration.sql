-- CreateEnum
CREATE TYPE "ExperienceLevel" AS ENUM ('INTERN', 'ENTRY', 'JUNIOR', 'MID', 'SENIOR', 'LEAD');

-- CreateTable
CREATE TABLE "Candidate" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "location" TEXT,
    "linkedin" TEXT,
    "github" TEXT,
    "portfolio" TEXT,
    "summary" TEXT,
    "experienceLevel" "ExperienceLevel",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Candidate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Resume" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "storedName" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "filePath" TEXT NOT NULL,
    "rawText" TEXT NOT NULL,
    "structuredData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Resume_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Skill" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,

    CONSTRAINT "Skill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CandidateSkill" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "proficiency" DOUBLE PRECISION,
    "years" DOUBLE PRECISION,

    CONSTRAINT "CandidateSkill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Education" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "institution" TEXT,
    "degree" TEXT,
    "field" TEXT,
    "startDate" TEXT,
    "endDate" TEXT,
    "grade" TEXT,
    "description" TEXT,

    CONSTRAINT "Education_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Experience" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "company" TEXT,
    "role" TEXT,
    "location" TEXT,
    "startDate" TEXT,
    "endDate" TEXT,
    "description" TEXT,
    "technologies" JSONB,

    CONSTRAINT "Experience_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "name" TEXT,
    "description" TEXT,
    "technologies" JSONB,
    "url" TEXT,
    "role" TEXT,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Certification" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "name" TEXT,
    "issuer" TEXT,
    "issueDate" TEXT,
    "expiryDate" TEXT,
    "credentialId" TEXT,
    "url" TEXT,

    CONSTRAINT "Certification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Achievement" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "date" TEXT,

    CONSTRAINT "Achievement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Candidate_email_idx" ON "Candidate"("email");

-- CreateIndex
CREATE INDEX "Candidate_createdAt_idx" ON "Candidate"("createdAt");

-- CreateIndex
CREATE INDEX "Resume_candidateId_idx" ON "Resume"("candidateId");

-- CreateIndex
CREATE UNIQUE INDEX "Skill_name_key" ON "Skill"("name");

-- CreateIndex
CREATE INDEX "Skill_name_idx" ON "Skill"("name");

-- CreateIndex
CREATE INDEX "CandidateSkill_candidateId_idx" ON "CandidateSkill"("candidateId");

-- CreateIndex
CREATE INDEX "CandidateSkill_skillId_idx" ON "CandidateSkill"("skillId");

-- CreateIndex
CREATE UNIQUE INDEX "CandidateSkill_candidateId_skillId_key" ON "CandidateSkill"("candidateId", "skillId");

-- CreateIndex
CREATE INDEX "Education_candidateId_idx" ON "Education"("candidateId");

-- CreateIndex
CREATE INDEX "Experience_candidateId_idx" ON "Experience"("candidateId");

-- CreateIndex
CREATE INDEX "Project_candidateId_idx" ON "Project"("candidateId");

-- CreateIndex
CREATE INDEX "Certification_candidateId_idx" ON "Certification"("candidateId");

-- CreateIndex
CREATE INDEX "Achievement_candidateId_idx" ON "Achievement"("candidateId");

-- AddForeignKey
ALTER TABLE "Resume" ADD CONSTRAINT "Resume_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateSkill" ADD CONSTRAINT "CandidateSkill_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateSkill" ADD CONSTRAINT "CandidateSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Education" ADD CONSTRAINT "Education_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Experience" ADD CONSTRAINT "Experience_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certification" ADD CONSTRAINT "Certification_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Achievement" ADD CONSTRAINT "Achievement_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
