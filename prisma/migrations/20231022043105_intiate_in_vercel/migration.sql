/*
  Warnings:

  - The values [upcoming,ongoing,ended] on the enum `SemesterRegistrationStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "SemesterRegistrationStatus_new" AS ENUM ('UPCOMING', 'ONGOING', 'ENDED');
ALTER TABLE "semester_registrations" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "semester_registrations" ALTER COLUMN "status" TYPE "SemesterRegistrationStatus_new" USING ("status"::text::"SemesterRegistrationStatus_new");
ALTER TYPE "SemesterRegistrationStatus" RENAME TO "SemesterRegistrationStatus_old";
ALTER TYPE "SemesterRegistrationStatus_new" RENAME TO "SemesterRegistrationStatus";
DROP TYPE "SemesterRegistrationStatus_old";
ALTER TABLE "semester_registrations" ALTER COLUMN "status" SET DEFAULT 'UPCOMING';
COMMIT;

-- AlterTable
ALTER TABLE "semester_registrations" ALTER COLUMN "status" SET DEFAULT 'UPCOMING';
