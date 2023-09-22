import { ExamType } from "@prisma/client";

export type IUpdateStudentMarksPayload = {
  academicSemesterId: string;
  studentId: string;
  courseId: string;
  examType: ExamType;
  marks: number;
}

export type IUpdateStudentCourseFinalMarksPayload = {
  academicSemesterId: string;
  studentId: string;
  courseId: string;
}