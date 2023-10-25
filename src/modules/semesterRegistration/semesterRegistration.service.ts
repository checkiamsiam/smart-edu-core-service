import {
  Course,
  OfferedCourse,
  Prisma,
  SemesterRegistration,
  SemesterRegistrationStatus,
  StudentEnrolledCourseStatus,
  StudentSemesterRegistration,
  StudentSemesterRegistrationCourse,
} from "@prisma/client";
import httpStatus from "http-status";
import prismaHelper from "../../helpers/prisma.helper";
import {
  IQueryFeatures,
  IQueryResult,
} from "../../interfaces/queryFeatures.interface";
import prisma from "../../shared/prismaClient";
import { asyncForEach } from "../../utils/asyncForeach.util";
import AppError from "../../utils/customError.util";
import { studentEnrolledCourseMarkService } from "../studentEnrolledCourseMark/studentEnrolledCourseMark.service";
import { studentSemesterPaymentService } from "../studentSemesterPayment/studentSemesterPayment.service";
import { IEnrollCoursePayload } from "./semesterRegistration.interface";
import { semesterRegistrationUtils } from "./semesterRegistration.utils";

const create = async (
  data: SemesterRegistration
): Promise<SemesterRegistration> => {
  const isAnySemesterRegUpcomingOrOngoing =
    await prisma.semesterRegistration.findFirst({
      where: {
        OR: [
          {
            status: SemesterRegistrationStatus.UPCOMING,
          },
          {
            status: SemesterRegistrationStatus.ONGOING,
          },
        ],
      },
    });

  if (isAnySemesterRegUpcomingOrOngoing) {
    throw new AppError(
      `There is already an ${isAnySemesterRegUpcomingOrOngoing.status} registration.`,
      httpStatus.BAD_REQUEST
    );
  }

  const result = await prisma.semesterRegistration.create({
    data,
  });

  return result;
};

const getSemesterRegistrations = async (
  queryFeatures: IQueryFeatures
): Promise<IQueryResult<SemesterRegistration>> => {
  const whereConditions: Prisma.SemesterRegistrationWhereInput =
    prismaHelper.findManyQueryHelper<Prisma.SemesterRegistrationWhereInput>(
      queryFeatures,
      {
        searchFields: ["academicSemesterId", "status"],
        relationalFields: {
          academicSemesterId: "academicSemester",
        },
      }
    );

  const query: Prisma.SemesterRegistrationFindManyArgs = {
    where: whereConditions,
    skip: queryFeatures.skip,
    take: queryFeatures.limit,
    orderBy: queryFeatures.sort,
  };

  if (
    queryFeatures.populate &&
    Object.keys(queryFeatures.populate).length > 0
  ) {
    query.include = {
      ...queryFeatures.populate,
    };
  } else {
    if (queryFeatures.fields && Object.keys(queryFeatures.fields).length > 0) {
      query.select = { id: true, ...queryFeatures.fields };
    }
  }

  const [result, count] = await prisma.$transaction([
    prisma.semesterRegistration.findMany(query),
    prisma.semesterRegistration.count({ where: whereConditions }),
  ]);

  return {
    data: result,
    total: count,
  };
};

const getSingleSemesterRegistration = async (
  id: string,
  queryFeatures: IQueryFeatures
): Promise<Partial<SemesterRegistration> | null> => {
  const query: Prisma.SemesterRegistrationFindUniqueArgs = {
    where: {
      id,
    },
  };

  if (
    queryFeatures.populate &&
    Object.keys(queryFeatures.populate).length > 0
  ) {
    query.include = {
      ...queryFeatures.populate,
    };
  } else {
    if (queryFeatures.fields && Object.keys(queryFeatures.fields).length > 0) {
      query.select = { id: true, ...queryFeatures.fields };
    }
  }

  const result: Partial<SemesterRegistration> | null =
    await prisma.semesterRegistration.findUnique(query);

  return result;
};

const update = async (
  id: string,
  payload: Partial<SemesterRegistration>
): Promise<SemesterRegistration> => {
  const isExist = await prisma.semesterRegistration.findUnique({
    where: {
      id,
    },
  });

  if (!isExist) {
    throw new AppError(
      "Semester Registration not found!",
      httpStatus.BAD_REQUEST
    );
  }

  if (
    payload.status &&
    isExist.status === SemesterRegistrationStatus.UPCOMING &&
    payload.status !== SemesterRegistrationStatus.ONGOING
  ) {
    throw new AppError(
      "Can only move from UPCOMING to ONGOING",
      httpStatus.BAD_REQUEST
    );
  }

  if (
    payload.status &&
    isExist.status === SemesterRegistrationStatus.ONGOING &&
    payload.status !== SemesterRegistrationStatus.ENDED
  ) {
    throw new AppError(
      "Can only move from ONGOING to ENDED",
      httpStatus.BAD_REQUEST
    );
  }

  const result = await prisma.semesterRegistration.update({
    where: {
      id,
    },
    data: payload,
    include: {
      academicSemester: true,
    },
  });

  return result;
};

const deleteSemesterRegistration = async (
  id: string
): Promise<SemesterRegistration> => {
  const result = await prisma.semesterRegistration.delete({
    where: {
      id,
    },
    include: {
      academicSemester: true,
    },
  });
  return result;
};

const startStudentRegistration = async (
  authUserId: string
): Promise<{
  semesterRegistration: SemesterRegistration | null;
  studentSemesterRegistration: StudentSemesterRegistration | null;
}> => {
  const studentInfo = await prisma.student.findFirst({
    where: {
      studentId: authUserId,
    },
  });

  if (!studentInfo) {
    throw new AppError("Student Info not found!", httpStatus.BAD_REQUEST);
  }

  const semesterRegistrationInfo = await prisma.semesterRegistration.findFirst({
    where: {
      status: {
        in: [
          SemesterRegistrationStatus.ONGOING,
          SemesterRegistrationStatus.UPCOMING,
        ],
      },
    },
  });

  if (
    semesterRegistrationInfo?.status === SemesterRegistrationStatus.UPCOMING
  ) {
    throw new AppError(
      "Registration is not started yet",
      httpStatus.BAD_REQUEST
    );
  }

  let studentRegistration = await prisma.studentSemesterRegistration.findFirst({
    where: {
      student: {
        id: studentInfo?.id,
      },
      semesterRegistration: {
        id: semesterRegistrationInfo?.id,
      },
    },
  });

  if (!studentRegistration) {
    studentRegistration = await prisma.studentSemesterRegistration.create({
      data: {
        student: {
          connect: {
            id: studentInfo?.id,
          },
        },
        semesterRegistration: {
          connect: {
            id: semesterRegistrationInfo?.id,
          },
        },
      },
    });
  }

  return {
    semesterRegistration: semesterRegistrationInfo,
    studentSemesterRegistration: studentRegistration,
  };
};

const enrollIntoCourse = async (
  authUserId: string,
  payload: IEnrollCoursePayload
): Promise<{
  message: string;
}> => {
  const student = await prisma.student.findFirst({
    where: {
      studentId: authUserId,
    },
  });

  const semesterRegistration = await prisma.semesterRegistration.findFirst({
    where: {
      status: SemesterRegistrationStatus.ONGOING,
    },
  });

  const offeredCourse = await prisma.offeredCourse.findFirst({
    where: {
      id: payload.offeredCourseId,
    },
    include: {
      course: true,
    },
  });
  const offeredCourseSection = await prisma.offeredCourseSection.findFirst({
    where: {
      id: payload.offeredCourseSectionId,
    },
  });

  if (!student) {
    throw new AppError("Student not found!", httpStatus.NOT_FOUND);
  }

  if (!semesterRegistration) {
    throw new AppError(
      "Semester Registration not found!",
      httpStatus.NOT_FOUND
    );
  }
  if (!offeredCourse) {
    throw new AppError("Offered Course not found!", httpStatus.NOT_FOUND);
  }
  if (!offeredCourseSection) {
    throw new AppError(
      "Offered Course Section not found!",
      httpStatus.NOT_FOUND
    );
  }

  if (
    offeredCourseSection.maxCapacity &&
    offeredCourseSection.currentlyEnrolledStudent &&
    offeredCourseSection.currentlyEnrolledStudent >=
      offeredCourseSection.maxCapacity
  ) {
    throw new AppError("Student capacity is full!", httpStatus.BAD_REQUEST);
  }

  await prisma.$transaction(async (transactionClient) => {
    await transactionClient.studentSemesterRegistrationCourse.create({
      data: {
        studentId: student?.id,
        semesterRegistrationId: semesterRegistration?.id,
        offeredCourseId: payload.offeredCourseId,
        offeredCourseSectionId: payload.offeredCourseSectionId,
      },
    });

    await transactionClient.offeredCourseSection.update({
      where: {
        id: payload.offeredCourseSectionId,
      },
      data: {
        currentlyEnrolledStudent: {
          increment: 1,
        },
      },
    });

    await transactionClient.studentSemesterRegistration.updateMany({
      where: {
        student: {
          id: student.id,
        },
        semesterRegistration: {
          id: semesterRegistration.id,
        },
      },
      data: {
        totalCreditsTaken: {
          increment: offeredCourse.course.credits,
        },
      },
    });
  });

  return {
    message: "Successfully enrolled into course",
  };
};

const withdrewFromCourse = async (
  authUserId: string,
  payload: IEnrollCoursePayload
): Promise<{
  message: string;
}> => {
  const student = await prisma.student.findFirst({
    where: {
      studentId: authUserId,
    },
  });

  const semesterRegistration = await prisma.semesterRegistration.findFirst({
    where: {
      status: SemesterRegistrationStatus.ONGOING,
    },
  });

  const offeredCourse = await prisma.offeredCourse.findFirst({
    where: {
      id: payload.offeredCourseId,
    },
    include: {
      course: true,
    },
  });

  if (!student) {
    throw new AppError("Student not found!", httpStatus.NOT_FOUND);
  }

  if (!semesterRegistration) {
    throw new AppError(
      "Semester Registration not found!",
      httpStatus.NOT_FOUND
    );
  }
  if (!offeredCourse) {
    throw new AppError("Offered Course not found!", httpStatus.NOT_FOUND);
  }

  await prisma.$transaction(async (transactionClient) => {
    await transactionClient.studentSemesterRegistrationCourse.delete({
      where: {
        semesterRegistrationId_studentId_offeredCourseId: {
          semesterRegistrationId: semesterRegistration?.id,
          studentId: student?.id,
          offeredCourseId: payload.offeredCourseId,
        },
      },
    });

    await transactionClient.offeredCourseSection.update({
      where: {
        id: payload.offeredCourseSectionId,
      },
      data: {
        currentlyEnrolledStudent: {
          decrement: 1,
        },
      },
    });

    await transactionClient.studentSemesterRegistration.updateMany({
      where: {
        student: {
          id: student.id,
        },
        semesterRegistration: {
          id: semesterRegistration.id,
        },
      },
      data: {
        totalCreditsTaken: {
          decrement: offeredCourse.course.credits,
        },
      },
    });
  });

  return {
    message: "Successfully withdraw from course",
  };
};

const confirmMyRegistration = async (
  authUserId: string
): Promise<{ message: string }> => {
  const semesterRegistration = await prisma.semesterRegistration.findFirst({
    where: {
      status: SemesterRegistrationStatus.ONGOING,
    },
  });

  // 3 - 6
  const studentSemesterRegistration =
    await prisma.studentSemesterRegistration.findFirst({
      where: {
        semesterRegistration: {
          id: semesterRegistration?.id,
        },
        student: {
          studentId: authUserId,
        },
      },
    });

  if (!studentSemesterRegistration) {
    throw new AppError(
      "You are not recognized for this semester!",
      httpStatus.BAD_REQUEST
    );
  }

  if (studentSemesterRegistration.totalCreditsTaken === 0) {
    throw new AppError(
      "You are not enrolled in any course!",
      httpStatus.BAD_REQUEST
    );
  }

  if (
    studentSemesterRegistration.totalCreditsTaken &&
    semesterRegistration?.minCredit &&
    semesterRegistration.maxCredit &&
    (studentSemesterRegistration.totalCreditsTaken <
      semesterRegistration?.minCredit ||
      studentSemesterRegistration.totalCreditsTaken >
        semesterRegistration?.maxCredit)
  ) {
    throw new AppError(
      `You can take only ${semesterRegistration.minCredit} to ${semesterRegistration.maxCredit} credits`,
      httpStatus.BAD_REQUEST
    );
  }

  await prisma.studentSemesterRegistration.update({
    where: {
      id: studentSemesterRegistration.id,
    },
    data: {
      isConfirmed: true,
    },
  });
  return {
    message: "Your registration is confirmed!",
  };
};

const getMyRegistration = async (authUserId: string) => {
  const semesterRegistration = await prisma.semesterRegistration.findFirst({
    where: {
      status: SemesterRegistrationStatus.ONGOING,
    },
    include: {
      academicSemester: true,
    },
  });

  const studentSemesterRegistration =
    await prisma.studentSemesterRegistration.findFirst({
      where: {
        semesterRegistration: {
          id: semesterRegistration?.id,
        },
        student: {
          studentId: authUserId,
        },
      },
      include: {
        student: true,
      },
    });

  return { semesterRegistration, studentSemesterRegistration };
};

const startNewSemester = async (
  id: string
): Promise<{
  message: string;
}> => {
  const semesterRegistration = await prisma.semesterRegistration.findUnique({
    where: {
      id,
    },
    include: {
      academicSemester: true,
    },
  });

  if (!semesterRegistration) {
    throw new AppError(
      "Semester Registration Not found!",
      httpStatus.BAD_REQUEST
    );
  }

  if (semesterRegistration.status !== SemesterRegistrationStatus.ENDED) {
    throw new AppError(
      "Semester Registration is not ended yet!",
      httpStatus.BAD_REQUEST
    );
  }

  if (semesterRegistration.academicSemester.isCurrent) {
    throw new AppError("Semester is already started!", httpStatus.BAD_REQUEST);
  }

  await prisma.$transaction(async (prismaTransactionClient) => {
    await prismaTransactionClient.academicSemester.updateMany({
      where: {
        isCurrent: true,
      },
      data: {
        isCurrent: false,
      },
    });

    await prismaTransactionClient.academicSemester.update({
      where: {
        id: semesterRegistration.academicSemesterId,
      },
      data: {
        isCurrent: true,
      },
    });

    const studentSemesterRegistrations =
      await prisma.studentSemesterRegistration.findMany({
        where: {
          semesterRegistration: {
            id,
          },
          isConfirmed: true,
        },
      });

    await asyncForEach(
      studentSemesterRegistrations,
      async (studentSemReg: StudentSemesterRegistration) => {
        if (studentSemReg.totalCreditsTaken) {
          const totalSemesterPaymentAmount =
            studentSemReg.totalCreditsTaken * 5000;

          await studentSemesterPaymentService.createSemesterPayment(
            prismaTransactionClient,
            {
              studentId: studentSemReg.studentId,
              academicSemesterId: semesterRegistration.academicSemesterId,
              totalPaymentAmount: totalSemesterPaymentAmount,
            }
          );
        }
        const studentSemesterRegistrationCourses =
          await prismaTransactionClient.studentSemesterRegistrationCourse.findMany(
            {
              where: {
                semesterRegistration: {
                  id,
                },
                student: {
                  id: studentSemReg.studentId,
                },
              },
              include: {
                offeredCourse: {
                  include: {
                    course: true,
                  },
                },
              },
            }
          );
        await asyncForEach(
          studentSemesterRegistrationCourses,
          async (
            item: StudentSemesterRegistrationCourse & {
              offeredCourse: OfferedCourse & {
                course: Course;
              };
            }
          ) => {
            const isExistEnrolledData =
              await prismaTransactionClient.studentEnrolledCourse.findFirst({
                where: {
                  student: { id: item.studentId },
                  course: { id: item.offeredCourse.courseId },
                  academicSemester: {
                    id: semesterRegistration.academicSemesterId,
                  },
                },
              });

            if (!isExistEnrolledData) {
              const enrolledCourseData = {
                studentId: item.studentId,
                courseId: item.offeredCourse.courseId,
                academicSemesterId: semesterRegistration.academicSemesterId,
              };

              const studentEnrolledCourseData =
                await prismaTransactionClient.studentEnrolledCourse.create({
                  data: enrolledCourseData,
                });

              await studentEnrolledCourseMarkService.createStudentEnrolledCourseDefaultMark(
                prismaTransactionClient,
                {
                  studentId: item.studentId,
                  studentEnrolledCourseId: studentEnrolledCourseData.id,
                  academicSemesterId: semesterRegistration.academicSemesterId,
                }
              );
            }
          }
        );
      }
    );
  });

  return {
    message: "Semester started successfully!",
  };
};

const getMySemesterRegCourses = async (authUserId: string) => {
  const student = await prisma.student.findFirst({
    where: {
      studentId: authUserId,
    },
  });

  const semesterRegistration = await prisma.semesterRegistration.findFirst({
    where: {
      status: {
        in: [
          SemesterRegistrationStatus.UPCOMING,
          SemesterRegistrationStatus.ONGOING,
        ],
      },
    },
    include: {
      academicSemester: true,
    },
  });

  if (!semesterRegistration) {
    throw new AppError(
      "No semester registration not found!",
      httpStatus.BAD_REQUEST
    );
  }

  const studentCompletedCourse = await prisma.studentEnrolledCourse.findMany({
    where: {
      status: StudentEnrolledCourseStatus.COMPLETED,
      student: {
        id: student?.id,
      },
    },
    include: {
      course: true,
    },
  });

  const studentCurrentSemesterTakenCourse =
    await prisma.studentSemesterRegistrationCourse.findMany({
      where: {
        student: {
          id: student?.id,
        },
        semesterRegistration: {
          id: semesterRegistration?.id,
        },
      },
      include: {
        offeredCourse: true,
        offeredCourseSection: true,
      },
    });

  const offeredCourse = await prisma.offeredCourse.findMany({
    where: {
      semesterRegistration: {
        id: semesterRegistration.id,
      },
      academicDepartment: {
        id: student?.academicDepartmentId,
      },
    },
    include: {
      course: {
        include: {
          preRequisite: {
            include: {
              preRequisite: true,
            },
          },
        },
      },
      offeredCourseSections: {
        include: {
          OfferedCourseClassSchedule: {
            include: {
              room: {
                include: {
                  building: true,
                },
              },
            },
          },
        },
      },
    },
  });
  const availableCourses = semesterRegistrationUtils.getAvailableCourses(
    offeredCourse,
    studentCompletedCourse,
    studentCurrentSemesterTakenCourse
  );

  return availableCourses;
};

export const semesterRegistrationService = {
  create,
  getSemesterRegistrations,
  getSingleSemesterRegistration,
  update,
  deleteSemesterRegistration,
  startStudentRegistration,
  enrollIntoCourse,
  withdrewFromCourse,
  confirmMyRegistration,
  getMyRegistration,
  startNewSemester,
  getMySemesterRegCourses,
};
