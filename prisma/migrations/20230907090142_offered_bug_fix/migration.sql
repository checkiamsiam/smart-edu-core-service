/*
  Warnings:

  - A unique constraint covering the columns `[courseId,academicDepartmentId,semesterRegistrationId]` on the table `offered_courses` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "offered_courses_courseId_academicDepartmentId_semesterRegis_key" ON "offered_courses"("courseId", "academicDepartmentId", "semesterRegistrationId");
