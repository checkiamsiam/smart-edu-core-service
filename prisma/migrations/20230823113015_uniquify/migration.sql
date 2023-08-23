/*
  Warnings:

  - A unique constraint covering the columns `[title]` on the table `academic_departments` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[title]` on the table `academic_faculty` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[facultyId]` on the table `faculties` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `faculties` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[contactNo]` on the table `faculties` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[studentId]` on the table `students` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `students` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[contactNo]` on the table `students` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "academic_departments_title_key" ON "academic_departments"("title");

-- CreateIndex
CREATE UNIQUE INDEX "academic_faculty_title_key" ON "academic_faculty"("title");

-- CreateIndex
CREATE UNIQUE INDEX "faculties_facultyId_key" ON "faculties"("facultyId");

-- CreateIndex
CREATE UNIQUE INDEX "faculties_email_key" ON "faculties"("email");

-- CreateIndex
CREATE UNIQUE INDEX "faculties_contactNo_key" ON "faculties"("contactNo");

-- CreateIndex
CREATE UNIQUE INDEX "students_studentId_key" ON "students"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "students_email_key" ON "students"("email");

-- CreateIndex
CREATE UNIQUE INDEX "students_contactNo_key" ON "students"("contactNo");
