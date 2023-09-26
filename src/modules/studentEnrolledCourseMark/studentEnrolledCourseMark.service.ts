import { ExamType, Prisma, PrismaClient, StudentEnrolledCourseMark, StudentEnrolledCourseStatus } from "@prisma/client";
import { DefaultArgs, PrismaClientOptions } from "@prisma/client/runtime/library";
import httpStatus from "http-status";
import { JwtPayload } from "jsonwebtoken";
import prismaHelper from "../../helpers/prisma.helper";
import { IQueryFeatures, IQueryResult } from "../../interfaces/queryFeatures.interface";
import prisma from "../../shared/prismaClient";
import AppError from "../../utils/customError.util";
import { studentEnrolledCourseMarkUtils } from "./studentEnrolledCourse.util";
import { IUpdateStudentCourseFinalMarksPayload, IUpdateStudentMarksPayload } from "./studentEnrolledCourseMark.interface";

const createStudentEnrolledCourseDefaultMark = async (
  prismaClient: Omit<
    PrismaClient<PrismaClientOptions, never, DefaultArgs>,
    "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
  >,
  payload: {
    studentId: string;
    studentEnrolledCourseId: string;
    academicSemesterId: string;
  }
) => {
  const isExitMidtermData = await prismaClient.studentEnrolledCourseMark.findFirst({
    where: {
      examType: ExamType.MIDTERM,
      student: {
        id: payload.studentId,
      },
      studentEnrolledCourse: {
        id: payload.studentEnrolledCourseId,
      },
      academicSemester: {
        id: payload.academicSemesterId,
      },
    },
  });
  if (!isExitMidtermData) {
    await prismaClient.studentEnrolledCourseMark.create({
      data: {
        student: {
          connect: {
            id: payload.studentId,
          },
        },
        studentEnrolledCourse: {
          connect: {
            id: payload.studentEnrolledCourseId,
          },
        },
        academicSemester: {
          connect: {
            id: payload.academicSemesterId,
          },
        },
        examType: ExamType.MIDTERM,
      },
    });
  }

  const isExistFinalData = await prismaClient.studentEnrolledCourseMark.findFirst({
    where: {
      examType: ExamType.FINAL,
      student: {
        id: payload.studentId,
      },
      studentEnrolledCourse: {
        id: payload.studentEnrolledCourseId,
      },
      academicSemester: {
        id: payload.academicSemesterId,
      },
    },
  });

  if (!isExistFinalData) {
    await prismaClient.studentEnrolledCourseMark.create({
      data: {
        student: {
          connect: {
            id: payload.studentId,
          },
        },
        studentEnrolledCourse: {
          connect: {
            id: payload.studentEnrolledCourseId,
          },
        },
        academicSemester: {
          connect: {
            id: payload.academicSemesterId,
          },
        },
        examType: ExamType.FINAL,
      },
    });
  }
};

const getStudentEnrolledCourseMarks = async (queryFeatures: IQueryFeatures): Promise<IQueryResult<StudentEnrolledCourseMark>> => {
  const whereConditions: Prisma.StudentEnrolledCourseMarkWhereInput = prismaHelper.findManyQueryHelper<Prisma.StudentEnrolledCourseMarkWhereInput>(
    queryFeatures,
    {
      searchFields: ["examType", "grade"],
      relationalFields: {
        academicSemesterId: "academicSemester",
        studentId: "student",
        studentEnrolledCourseId: "studentEnrolledCourse",
      },
    }
  );

  const query: Prisma.StudentEnrolledCourseMarkFindManyArgs = {
    where: whereConditions,
    skip: queryFeatures.skip,
    take: queryFeatures.limit,
    orderBy: queryFeatures.sort,
  };

  if (queryFeatures.populate && Object.keys(queryFeatures.populate).length > 0) {
    query.include = {
      ...queryFeatures.populate,
    };
  } else {
    if (queryFeatures.fields && Object.keys(queryFeatures.fields).length > 0) {
      query.select = { id: true, ...queryFeatures.fields };
    }
  }
  const [result, count] = await prisma.$transaction([
    prisma.studentEnrolledCourseMark.findMany(query),
    prisma.studentEnrolledCourseMark.count({ where: whereConditions }),
  ]);

  return {
    data: result,
    total: count,
  };
};

const updateStudentMarks = async (payload: IUpdateStudentMarksPayload) => {
  const { studentId, academicSemesterId, courseId, examType, marks } = payload;

  const studentEnrolledCourseMarks = await prisma.studentEnrolledCourseMark.findFirst({
    where: {
      student: {
        id: studentId,
      },
      academicSemester: {
        id: academicSemesterId,
      },
      studentEnrolledCourse: {
        course: {
          id: courseId,
        },
      },
      examType,
    },
  });

  if (!studentEnrolledCourseMarks) {
    throw new AppError("Student enrolled course mark not found!", httpStatus.BAD_REQUEST);
  }
  const result = studentEnrolledCourseMarkUtils.getGradeFromMarks(marks);

  const updateStudentMarks = await prisma.studentEnrolledCourseMark.update({
    where: {
      id: studentEnrolledCourseMarks.id,
    },
    data: {
      marks,
      grade: result.grade,
    },
  });

  return updateStudentMarks;
};

const updateFinalMarks = async (payload: IUpdateStudentCourseFinalMarksPayload) => {
  const { studentId, academicSemesterId, courseId } = payload;
  const studentEnrolledCourse = await prisma.studentEnrolledCourse.findFirst({
    where: {
      student: {
        id: studentId,
      },
      academicSemester: {
        id: academicSemesterId,
      },
      course: {
        id: courseId,
      },
    },
  });

  if (!studentEnrolledCourse) {
    throw new AppError("Student enrolled course data not found!", httpStatus.BAD_REQUEST);
  }

  const studentEnrolledCourseMarks = await prisma.studentEnrolledCourseMark.findMany({
    where: {
      student: {
        id: studentId,
      },
      academicSemester: {
        id: academicSemesterId,
      },
      studentEnrolledCourse: {
        course: {
          id: courseId,
        },
      },
    },
  });

  if (!studentEnrolledCourseMarks.length) {
    throw new AppError("student enrolled course mark not found!", httpStatus.BAD_REQUEST);
  }

  const midTermMarks = studentEnrolledCourseMarks.find((item) => item.examType === ExamType.MIDTERM)?.marks || 0;
  const finalTermMarks = studentEnrolledCourseMarks.find((item) => item.examType === ExamType.FINAL)?.marks || 0;

  const totalFinalMarks = Math.ceil(midTermMarks * 0.4) + Math.ceil(finalTermMarks * 0.6);
  const result = studentEnrolledCourseMarkUtils.getGradeFromMarks(totalFinalMarks);

  await prisma.studentEnrolledCourse.updateMany({
    where: {
      student: {
        id: studentId,
      },
      academicSemester: {
        id: academicSemesterId,
      },
      course: {
        id: courseId,
      },
    },
    data: {
      grade: result.grade,
      point: result.point,
      totalMarks: totalFinalMarks,
      status: StudentEnrolledCourseStatus.COMPLETED,
    },
  });

  const grades = await prisma.studentEnrolledCourse.findMany({
    where: {
      student: {
        id: studentId,
      },
      status: StudentEnrolledCourseStatus.COMPLETED,
    },
    include: {
      course: true,
    },
  });

  const academicResult = await studentEnrolledCourseMarkUtils.calcCGPAandGrade(grades);

  const studentAcademicInfo = await prisma.studentAcademicInfo.findFirst({
    where: {
      student: {
        id: studentId,
      },
    },
  });

  if (studentAcademicInfo) {
    await prisma.studentAcademicInfo.update({
      where: {
        id: studentAcademicInfo.id,
      },
      data: {
        totalCompletedCredit: academicResult.totalCompletedCredit,
        cgpa: academicResult.cgpa,
      },
    });
  } else {
    await prisma.studentAcademicInfo.create({
      data: {
        student: {
          connect: {
            id: studentId,
          },
        },
        totalCompletedCredit: academicResult.totalCompletedCredit,
        cgpa: academicResult.cgpa,
      },
    });
  }

  return grades;
};

const getMyCourseMarks = async (queryFeatures: IQueryFeatures, authUser: JwtPayload): Promise<IQueryResult<StudentEnrolledCourseMark>> => {
  const student = await prisma.student.findFirst({
    where: {
      studentId: authUser.id,
    },
  });

  if (!student) {
    throw new AppError("Student not found", httpStatus.NOT_FOUND);
  }

  const whereConditions: Prisma.StudentEnrolledCourseMarkWhereInput = prismaHelper.findManyQueryHelper<Prisma.StudentEnrolledCourseMarkWhereInput>(
    queryFeatures,
    {
      searchFields: ["examType", "grade"],
      relationalFields: {
        academicSemesterId: "academicSemester",
        studentId: "student",
        studentEnrolledCourseId: "studentEnrolledCourse",
      },
    }
  );

  const query: Prisma.StudentEnrolledCourseMarkFindManyArgs = {
    where: whereConditions,
    skip: queryFeatures.skip,
    take: queryFeatures.limit,
    orderBy: queryFeatures.sort,
  };

  if (queryFeatures.populate && Object.keys(queryFeatures.populate).length > 0) {
    query.include = {
      ...queryFeatures.populate,
    };
  } else {
    if (queryFeatures.fields && Object.keys(queryFeatures.fields).length > 0) {
      query.select = { id: true, ...queryFeatures.fields };
    }
  }
  const [result, count] = await prisma.$transaction([
    prisma.studentEnrolledCourseMark.findMany(query),
    prisma.studentEnrolledCourseMark.count({ where: whereConditions }),
  ]);

  return {
    data: result,
    total: count,
  };
};

export const studentEnrolledCourseMarkService = {
  createStudentEnrolledCourseDefaultMark,
  getStudentEnrolledCourseMarks,
  updateStudentMarks,
  updateFinalMarks,
  getMyCourseMarks,
};
