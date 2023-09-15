import { Prisma, SemesterRegistration, SemesterRegistrationStatus, StudentSemesterRegistration } from "@prisma/client";
import httpStatus from "http-status";
import prismaHelper from "../../helpers/prisma.helper";
import { IQueryFeatures, IQueryResult } from "../../interfaces/queryFeatures.interface";
import prisma from "../../shared/prismaClient";
import AppError from "../../utils/customError.util";
import { IEnrollCoursePayload } from "./semesterRegistration.interface";

const create = async (data: SemesterRegistration): Promise<SemesterRegistration> => {
  const isAnySemesterRegUpcomingOrOngoing = await prisma.semesterRegistration.findFirst({
    where: {
      OR: [
        {
          status: SemesterRegistrationStatus.upcoming,
        },
        {
          status: SemesterRegistrationStatus.ongoing,
        },
      ],
    },
  });

  if (isAnySemesterRegUpcomingOrOngoing) {
    throw new AppError(`There is already an ${isAnySemesterRegUpcomingOrOngoing.status} registration.`, httpStatus.BAD_REQUEST);
  }

  const result = await prisma.semesterRegistration.create({
    data,
  });

  return result;
};

const getSemesterRegistrations = async (queryFeatures: IQueryFeatures): Promise<IQueryResult<SemesterRegistration>> => {
  const whereConditions: Prisma.SemesterRegistrationWhereInput = prismaHelper.findManyQueryHelper<Prisma.SemesterRegistrationWhereInput>(
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
    prisma.semesterRegistration.findMany(query),
    prisma.semesterRegistration.count({ where: whereConditions }),
  ]);

  return {
    data: result,
    total: count,
  };
};

const getSingleSemesterRegistration = async (id: string, queryFeatures: IQueryFeatures): Promise<Partial<SemesterRegistration> | null> => {
  const query: Prisma.SemesterRegistrationFindUniqueArgs = {
    where: {
      id,
    },
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

  const result: Partial<SemesterRegistration> | null = await prisma.semesterRegistration.findUnique(query);

  return result;
};

const update = async (id: string, payload: Partial<SemesterRegistration>): Promise<SemesterRegistration> => {
  const isExist = await prisma.semesterRegistration.findUnique({
    where: {
      id,
    },
  });

  if (!isExist) {
    throw new AppError("Semester Registration not found!", httpStatus.BAD_REQUEST);
  }

  if (payload.status && isExist.status === SemesterRegistrationStatus.upcoming && payload.status !== SemesterRegistrationStatus.ongoing) {
    throw new AppError("Can only move from UPCOMING to ONGOING", httpStatus.BAD_REQUEST);
  }

  if (payload.status && isExist.status === SemesterRegistrationStatus.ongoing && payload.status !== SemesterRegistrationStatus.ended) {
    throw new AppError("Can only move from ONGOING to ENDED", httpStatus.BAD_REQUEST);
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

const deleteSemesterRegistration = async (id: string): Promise<SemesterRegistration> => {
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
        in: [SemesterRegistrationStatus.ongoing, SemesterRegistrationStatus.upcoming],
      },
    },
  });

  if (semesterRegistrationInfo?.status === SemesterRegistrationStatus.upcoming) {
    throw new AppError("Registration is not started yet", httpStatus.BAD_REQUEST);
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
      status: SemesterRegistrationStatus.ongoing,
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
    throw new AppError("Semester Registration not found!", httpStatus.NOT_FOUND);
  }
  if (!offeredCourse) {
    throw new AppError("Offered Course not found!", httpStatus.NOT_FOUND);
  }
  if (!offeredCourseSection) {
    throw new AppError("Offered Course Section not found!", httpStatus.NOT_FOUND);
  }

  if (
    offeredCourseSection.maxCapacity &&
    offeredCourseSection.currentlyEnrolledStudent &&
    offeredCourseSection.currentlyEnrolledStudent >= offeredCourseSection.maxCapacity
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
      status: SemesterRegistrationStatus.ongoing,
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
    throw new AppError("Semester Registration not found!", httpStatus.NOT_FOUND);
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

const confirmMyRegistration = async (authUserId: string): Promise<{ message: string }> => {
  const semesterRegistration = await prisma.semesterRegistration.findFirst({
    where: {
      status: SemesterRegistrationStatus.ongoing,
    },
  });

  // 3 - 6
  const studentSemesterRegistration = await prisma.studentSemesterRegistration.findFirst({
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
    throw new AppError("You are not recognized for this semester!", httpStatus.BAD_REQUEST);
  }

  if (studentSemesterRegistration.totalCreditsTaken === 0) {
    throw new AppError("You are not enrolled in any course!", httpStatus.BAD_REQUEST);
  }

  if (
    studentSemesterRegistration.totalCreditsTaken &&
    semesterRegistration?.minCredit &&
    semesterRegistration.maxCredit &&
    (studentSemesterRegistration.totalCreditsTaken < semesterRegistration?.minCredit ||
      studentSemesterRegistration.totalCreditsTaken > semesterRegistration?.maxCredit)
  ) {
    throw new AppError(`You can take only ${semesterRegistration.minCredit} to ${semesterRegistration.maxCredit} credits`, httpStatus.BAD_REQUEST);
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
      status: SemesterRegistrationStatus.ongoing,
    },
    include: {
      academicSemester: true,
    },
  });

  const studentSemesterRegistration = await prisma.studentSemesterRegistration.findFirst({
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
};
