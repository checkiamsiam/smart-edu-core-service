import { CourseFaculty, Faculty, Prisma, Student } from "@prisma/client";
import { JwtPayload } from "jsonwebtoken";
import prismaHelper from "../../helpers/prisma.helper";
import { IQueryFeatures, IQueryResult } from "../../interfaces/queryFeatures.interface";
import prisma from "../../shared/prismaClient";
import { IFacultyMyCourseStudentsRequest } from "./faculty.interface";

const create = async (payload: Faculty): Promise<Faculty> => {
  const newFaculty = await prisma.faculty.create({
    data: payload,
  });
  return newFaculty;
};

const getFaculties = async (queryFeatures: IQueryFeatures): Promise<IQueryResult<Faculty>> => {
  const whereConditions: Prisma.FacultyWhereInput = prismaHelper.findManyQueryHelper<Prisma.FacultyWhereInput>(queryFeatures, {
    searchFields: ["id", "email", "contactNo", "firstName", "middleName", "lastName"],
  });

  const query: Prisma.FacultyFindManyArgs = {
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

  const [result, count] = await prisma.$transaction([prisma.faculty.findMany(query), prisma.faculty.count({ where: whereConditions })]);

  return {
    data: result,
    total: count,
  };
};

const getSingleFaculty = async (id: string, queryFeatures: IQueryFeatures): Promise<Partial<Faculty> | null> => {
  const query: Prisma.FacultyFindUniqueArgs = {
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

  const result: Partial<Faculty> | null = await prisma.faculty.findUnique(query);

  return result;
};

const updateFaculty = async (id: string, payload: Partial<Faculty>): Promise<Partial<Faculty> | null> => {
  const result: Partial<Faculty> | null = await prisma.faculty.update({
    where: {
      id,
    },
    data: payload,
  });

  return result;
};

const deleteFaculty = async (id: string) => {
  const result: Partial<Faculty> | null = await prisma.faculty.delete({
    where: {
      id,
    },
  });

  return result;
};

const assignCourses = async (id: string, payload: string[]): Promise<CourseFaculty[]> => {
  await prisma.courseFaculty.createMany({
    data: payload.map((courseId) => ({
      facultyId: id,
      courseId: courseId,
    })),
    skipDuplicates: true,
  });

  const assignCoursesData = await prisma.courseFaculty.findMany({
    where: {
      facultyId: id,
    },
    include: {
      course: true,
    },
  });

  return assignCoursesData;
};

const removeCourses = async (id: string, payload: string[]): Promise<CourseFaculty[] | null> => {
  await prisma.courseFaculty.deleteMany({
    where: {
      facultyId: id,
      courseId: {
        in: payload,
      },
    },
  });

  const assignCoursesData = await prisma.courseFaculty.findMany({
    where: {
      facultyId: id,
    },
    include: {
      course: true,
    },
  });

  return assignCoursesData;
};

const myCourses = async (
  authUser: JwtPayload,
  filter: {
    academicSemesterId?: string | null | undefined;
    courseId?: string | null | undefined;
  }
) => {
  if (!filter.academicSemesterId) {
    const currentSemester = await prisma.academicSemester.findFirst({
      where: {
        isCurrent: true,
      },
    });

    filter.academicSemesterId = currentSemester?.id;
  }

  const offeredCourseSections = await prisma.offeredCourseSection.findMany({
    where: {
      OfferedCourseClassSchedule: {
        some: {
          faculty: {
            facultyId: authUser.userId,
          },
        },
      },
      offeredCourse: {
        semesterRegistration: {
          academicSemester: {
            id: filter.academicSemesterId,
          },
        },
      },
    },
    include: {
      offeredCourse: {
        include: {
          course: true,
        },
      },
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
  });

  const couseAndSchedule = offeredCourseSections.reduce((acc: any, obj: any) => {
    const course = obj.offeredCourse.course;
    const classSchedules = obj.offeredCourseClassSchedules;

    const existingCourse = acc.find((item: any) => item.couse?.id === course?.id);
    if (existingCourse) {
      existingCourse.sections.push({
        section: obj,
        classSchedules,
      });
    } else {
      acc.push({
        course,
        sections: [
          {
            section: obj,
            classSchedules,
          },
        ],
      });
    }
    return acc;
  }, []);
  return couseAndSchedule;
};

const getMyCourseStudents = async (
  filters: IFacultyMyCourseStudentsRequest,
  options: Omit<IQueryFeatures, "filter">,
  authUser: JwtPayload
): Promise<IQueryResult<Student>> => {
  const { page, limit, skip } = options;
  if (!filters.academicSemesterId) {
    const currentAcademicSemester = await prisma.academicSemester.findFirst({
      where: {
        isCurrent: true,
      },
    });

    if (currentAcademicSemester) {
      filters.academicSemesterId = currentAcademicSemester.id;
    }
  }

  const offeredCourseSections = await prisma.studentSemesterRegistrationCourse.findMany({
    where: {
      offeredCourse: {
        course: {
          id: filters.courseId,
        },
      },
      offeredCourseSection: {
        offeredCourse: {
          semesterRegistration: {
            academicSemester: {
              id: filters.academicSemesterId,
            },
          },
        },
        id: filters.offeredCourseSectionId,
      },
    },
    include: {
      student: true,
    },
    take: limit,
    skip,
  });

  const students = offeredCourseSections.map((offeredCourseSection) => offeredCourseSection.student);

  const total = await prisma.studentSemesterRegistrationCourse.count({
    where: {
      offeredCourse: {
        course: {
          id: filters.courseId,
        },
      },
      offeredCourseSection: {
        offeredCourse: {
          semesterRegistration: {
            academicSemester: {
              id: filters.academicSemesterId,
            },
          },
        },
        id: filters.offeredCourseSectionId,
      },
    },
  });
  return {
    data: students,
    total,
  };
};

const facultyService = {
  create,
  getFaculties,
  getSingleFaculty,
  updateFaculty,
  deleteFaculty,
  assignCourses,
  removeCourses,
  myCourses,
  getMyCourseStudents,
};

export default facultyService;
