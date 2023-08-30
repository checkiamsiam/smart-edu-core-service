import { Course, CourseFaculty, Prisma } from "@prisma/client";
import httpStatus from "http-status";
import prismaHelper from "../../helpers/prisma.helper";
import { IQueryFeatures, IQueryResult } from "../../interfaces/queryFeatures.interface";
import prisma from "../../shared/prismaClient";
import AppError from "../../utils/customError.util";
import { ICourse, IPrerequisiteCourseRequest } from "./course.interface";

const create = async (payload: ICourse): Promise<Course> => {
  const { preRequisiteCourses, ...data } = payload;

  const newCourseIncluded: Course | null = await prisma.$transaction(async (tx) => {
    const newCourse = await tx.course.create({
      data,
    });

    if (!newCourse) {
      throw new AppError("course not created", httpStatus.INTERNAL_SERVER_ERROR);
    }

    if (preRequisiteCourses && preRequisiteCourses.length > 0) {
      const createManyData = preRequisiteCourses.map((el: IPrerequisiteCourseRequest) => {
        return {
          courseId: newCourse.id,
          preRequisiteId: el.courseId,
        };
      });
      await tx.courseToPrerequisite.createMany({
        data: createManyData,
      });
    }

    const result = await tx.course.findUnique({
      where: {
        id: newCourse.id,
      },
      include: {
        _count: true,
        preRequisite: {
          include: {
            preRequisite: true,
          },
        },
        preRequisiteFor: {
          include: {
            course: true,
          },
        },
      },
    });

    return result;
  });

  if (!newCourseIncluded) {
    throw new AppError("course not created", httpStatus.INTERNAL_SERVER_ERROR);
  }

  return newCourseIncluded;
};

const getCourses = async (queryFeatures: IQueryFeatures): Promise<IQueryResult<Course>> => {
  const whereConditions: Prisma.CourseWhereInput = prismaHelper.findManyQueryHelper<Prisma.CourseWhereInput>(queryFeatures, {
    searchFields: ["title"],
  });

  const query: Prisma.CourseFindManyArgs = {
    include: {
      _count: true,
      preRequisite: {
        include: {
          preRequisite: true,
        },
      },
      preRequisiteFor: {
        include: {
          course: true,
        },
      },
    },
    where: whereConditions,
    skip: queryFeatures.skip,
    take: queryFeatures.limit,
    orderBy: queryFeatures.sort,
  };

  const [result, count] = await prisma.$transaction([prisma.course.findMany(query), prisma.course.count({ where: whereConditions })]);

  return {
    data: result,
    total: count,
  };
};

const getSingleCourse = async (id: string): Promise<Partial<Course> | null> => {
  const query: Prisma.CourseFindUniqueArgs = {
    include: {
      _count: true,
      preRequisite: {
        include: {
          preRequisite: true,
        },
      },
      preRequisiteFor: {
        include: {
          course: true,
        },
      },
    },
    where: {
      id,
    },
  };

  const result: Partial<Course> | null = await prisma.course.findUnique(query);

  return result;
};

const updateCourse = async (id: string, payload: Partial<ICourse>): Promise<Partial<Course> | null> => {
  const { preRequisiteCourses, ...courseData } = payload;

  await prisma.$transaction(async (transactionClient) => {
    const result = await transactionClient.course.update({
      where: {
        id,
      },
      data: courseData,
    });

    if (!result) {
      throw new AppError("Unable to update course", httpStatus.BAD_REQUEST);
    }

    if (preRequisiteCourses && preRequisiteCourses.length > 0) {
      const deletePrerequisite = preRequisiteCourses.filter((coursePrerequisite) => coursePrerequisite.courseId && coursePrerequisite.isRemove);

      const newPrerequisite = preRequisiteCourses.filter((coursePrerequisite) => coursePrerequisite.courseId && !coursePrerequisite.isRemove);

      console.log(deletePrerequisite);

      deletePrerequisite.forEach(async (deletePreCourse) => {
        await transactionClient.courseToPrerequisite.deleteMany({
          where: {
            AND: [
              {
                courseId: id,
              },
              {
                preRequisiteId: deletePreCourse.courseId,
              },
            ],
          },
        });
      });

      const createManyData = newPrerequisite.map((el: IPrerequisiteCourseRequest) => {
        return {
          courseId: id,
          preRequisiteId: el.courseId,
        };
      });

      await transactionClient.courseToPrerequisite.createMany({
        data: createManyData,
      });
    }

    return result;
  });

  const responseData = await prisma.course.findUnique({
    where: {
      id,
    },
    include: {
      preRequisite: {
        include: {
          preRequisite: true,
        },
      },
      preRequisiteFor: {
        include: {
          course: true,
        },
      },
    },
  });

  return responseData;
};

const deleteCourse = async (id: string) => {
  const result: Course = await prisma.$transaction(async (tx) => {
    await tx.courseToPrerequisite.deleteMany({
      where: {
        OR: [
          {
            courseId: id,
          },
          {
            preRequisiteId: id,
          },
        ],
      },
    });

    const deleteFromCourseTable = await tx.course.delete({
      where: {
        id,
      },
    });

    return deleteFromCourseTable;
  });

  return result;
};

const assignFaculties = async (
  id: string,
  payload: string[]
): Promise<CourseFaculty[]> => {
  await prisma.courseFaculty.createMany({
      data: payload.map((facultyId) => ({
          courseId: id,
          facultyId: facultyId
      }))
  })

  const assignFacultiesData = await prisma.courseFaculty.findMany({
      where: {
          courseId: id
      },
      include: {
          faculty: true
      }
  })

  return assignFacultiesData;
}

const removeFaculties = async (
  id: string,
  payload: string[]
): Promise<CourseFaculty[] | null> => {
  await prisma.courseFaculty.deleteMany({
      where: {
          courseId: id,
          facultyId: {
              in: payload
          }
      }
  })

  const assignFacultiesData = await prisma.courseFaculty.findMany({
      where: {
          courseId: id
      },
      include: {
          faculty: true
      }
  })

  return assignFacultiesData
}


const courseService = {
  create,
  getCourses,
  getSingleCourse,
  updateCourse,
  deleteCourse,
  assignFaculties,
  removeFaculties
};

export default courseService;
