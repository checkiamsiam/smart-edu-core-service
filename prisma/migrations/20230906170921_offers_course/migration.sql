-- CreateTable
CREATE TABLE "offered_courses" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "courseId" TEXT NOT NULL,
    "academicDepartmentId" TEXT NOT NULL,
    "semesterRegistrationId" TEXT NOT NULL,

    CONSTRAINT "offered_courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "offered_course_sections" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "maxCapacity" INTEGER NOT NULL,
    "currentlyEnrolledStudent" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "offeredCourseId" TEXT NOT NULL,
    "semesterRegistrationId" TEXT NOT NULL,

    CONSTRAINT "offered_course_sections_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "offered_courses" ADD CONSTRAINT "offered_courses_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offered_courses" ADD CONSTRAINT "offered_courses_academicDepartmentId_fkey" FOREIGN KEY ("academicDepartmentId") REFERENCES "academic_departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offered_courses" ADD CONSTRAINT "offered_courses_semesterRegistrationId_fkey" FOREIGN KEY ("semesterRegistrationId") REFERENCES "semester_registrations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offered_course_sections" ADD CONSTRAINT "offered_course_sections_offeredCourseId_fkey" FOREIGN KEY ("offeredCourseId") REFERENCES "offered_courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offered_course_sections" ADD CONSTRAINT "offered_course_sections_semesterRegistrationId_fkey" FOREIGN KEY ("semesterRegistrationId") REFERENCES "semester_registrations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
