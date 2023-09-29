import {
  Prisma,
  StudentEnrolledCourse,
  StudentEnrolledCourseStatus,
} from "@prisma/client";
import httpStatus from "http-status";
import prismaHelper from "../../helpers/prisma.helper";
import {
  IQueryFeatures,
  IQueryResult,
} from "../../interfaces/queryFeatures.interface";
import prisma from "../../shared/prismaClient";
import AppError from "../../utils/customError.util";

const create = async (
  payload: StudentEnrolledCourse
): Promise<StudentEnrolledCourse> => {
  const isCourseOngoingOrCompleted =
    await prisma.studentEnrolledCourse.findFirst({
      where: {
        OR: [
          {
            status: StudentEnrolledCourseStatus.ONGOING,
          },
          {
            status: StudentEnrolledCourseStatus.COMPLETED,
          },
        ],
      },
    });

  if (isCourseOngoingOrCompleted) {
    throw new AppError(
      `There is already an ${isCourseOngoingOrCompleted.status?.toLowerCase()} registration`,
      httpStatus.BAD_REQUEST
    );
  }
  const newAd = await prisma.studentEnrolledCourse.create({
    data: payload,
  });
  return newAd;
};

const getStudentEnrolledCourses = async (
  queryFeatures: IQueryFeatures
): Promise<IQueryResult<StudentEnrolledCourse>> => {
  const whereConditions: Prisma.StudentEnrolledCourseWhereInput =
    prismaHelper.findManyQueryHelper<Prisma.StudentEnrolledCourseWhereInput>(
      queryFeatures,
      {
        searchFields: [],
        relationalFields: {
          academicSemesterId: "academicSemester",
          studentId: "student",
          courseId: "course",
        },
      }
    );

  const query: Prisma.StudentEnrolledCourseFindManyArgs = {
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
      _count: true,
      ...queryFeatures.populate,
    };
  } else {
    if (queryFeatures.fields && Object.keys(queryFeatures.fields).length > 0) {
      query.select = { id: true, ...queryFeatures.fields };
    }
  }
  const [result, count] = await prisma.$transaction([
    prisma.studentEnrolledCourse.findMany(query),
    prisma.studentEnrolledCourse.count({ where: whereConditions }),
  ]);

  return {
    data: result,
    total: count,
  };
};

const getSingleStudentEnrolledCourse = async (
  id: string,
  queryFeatures: IQueryFeatures
): Promise<Partial<StudentEnrolledCourse> | null> => {
  const query: Prisma.StudentEnrolledCourseFindUniqueArgs = {
    where: {
      id,
    },
  };

  if (
    queryFeatures.populate &&
    Object.keys(queryFeatures.populate).length > 0
  ) {
    query.include = {
      _count: true,
      ...queryFeatures.populate,
    };
  } else {
    if (queryFeatures.fields && Object.keys(queryFeatures.fields).length > 0) {
      query.select = { id: true, ...queryFeatures.fields };
    }
  }

  const result: Partial<StudentEnrolledCourse> | null =
    await prisma.studentEnrolledCourse.findUnique(query);

  return result;
};

const updateStudentEnrolledCourse = async (
  id: string,
  payload: Partial<StudentEnrolledCourse>
): Promise<Partial<StudentEnrolledCourse> | null> => {
  const result: Partial<StudentEnrolledCourse> | null =
    await prisma.studentEnrolledCourse.update({
      where: {
        id,
      },
      data: payload,
    });

  return result;
};

const deleteStudentEnrolledCourse = async (id: string) => {
  const result: Partial<StudentEnrolledCourse> | null =
    await prisma.studentEnrolledCourse.delete({
      where: {
        id,
      },
    });

  return result;
};

const studentEnrolledCourseService = {
  create,
  getStudentEnrolledCourses,
  getSingleStudentEnrolledCourse,
  updateStudentEnrolledCourse,
  deleteStudentEnrolledCourse,
};

export default studentEnrolledCourseService;
