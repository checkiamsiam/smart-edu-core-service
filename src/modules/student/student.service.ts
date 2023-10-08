import { Prisma, Student, StudentEnrolledCourseStatus } from "@prisma/client";
import prismaHelper from "../../helpers/prisma.helper";
import {
  IQueryFeatures,
  IQueryResult,
} from "../../interfaces/queryFeatures.interface";
import prisma from "../../shared/prismaClient";
import { studentUtils } from "./student.utils";

const create = async (payload: Student): Promise<Student> => {
  const newStudent = await prisma.student.create({
    data: payload,
  });
  return newStudent;
};

const getStudents = async (
  queryFeatures: IQueryFeatures
): Promise<IQueryResult<Student>> => {
  const whereConditions: Prisma.StudentWhereInput =
    prismaHelper.findManyQueryHelper<Prisma.StudentWhereInput>(queryFeatures, {
      searchFields: [
        "id",
        "email",
        "contactNo",
        "firstName",
        "middleName",
        "lastName",
      ],
    });

  const query: Prisma.StudentFindManyArgs = {
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
    prisma.student.findMany(query),
    prisma.student.count({ where: whereConditions }),
  ]);

  return {
    data: result,
    total: count,
  };
};

const getSingleStudent = async (
  id: string,
  queryFeatures: IQueryFeatures
): Promise<Partial<Student> | null> => {
  const query: Prisma.StudentFindUniqueArgs = {
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

  const result: Partial<Student> | null = await prisma.student.findUnique(
    query
  );

  return result;
};

const updateStudent = async (
  id: string,
  payload: Partial<Student>
): Promise<Partial<Student> | null> => {
  const result: Partial<Student> | null = await prisma.student.update({
    where: {
      id,
    },
    data: payload,
  });

  return result;
};

const deleteStudent = async (id: string) => {
  const result: Partial<Student> | null = await prisma.student.delete({
    where: {
      id,
    },
  });

  return result;
};
const myCourses = async (
  authUserId: string,
  filter: {
    courseId?: string | undefined;
    academicSemesterId?: string | undefined;
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

  const result = await prisma.studentEnrolledCourse.findMany({
    where: {
      student: {
        studentId: authUserId,
      },
      ...filter,
    },
    include: {
      course: true,
    },
  });

  return result;
};

const getMyCourseSchedules = async (
  authUserId: string,
  filter: {
    courseId?: string | undefined;
    academicSemesterId?: string | undefined;
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

  const studentEnrolledCourses = await myCourses(authUserId, filter);
  const studentEnrolledCourseIds = studentEnrolledCourses.map(
    (item) => item.courseId
  );
  const result = await prisma.studentSemesterRegistrationCourse.findMany({
    where: {
      student: {
        studentId: authUserId,
      },
      semesterRegistration: {
        academicSemester: {
          id: filter.academicSemesterId,
        },
      },
      offeredCourse: {
        course: {
          id: {
            in: studentEnrolledCourseIds,
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
      offeredCourseSection: {
        include: {
          OfferedCourseClassSchedule: {
            include: {
              room: {
                include: {
                  building: true,
                },
              },
              faculty: true,
            },
          },
        },
      },
    },
  });
  return result;
};

const getMyAcademicInfo = async (authUserId: string): Promise<any> => {
  const academicInfo = await prisma.studentAcademicInfo.findFirst({
    where: {
      student: {
        studentId: authUserId,
      },
    },
  });

  const enrolledCourses = await prisma.studentEnrolledCourse.findMany({
    where: {
      student: {
        studentId: authUserId,
      },
      status: StudentEnrolledCourseStatus.COMPLETED,
    },
    include: {
      course: true,
      academicSemester: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  const groupByAcademicSemesterData =
    studentUtils.groupByAcademicSemester(enrolledCourses);

  return {
    academicInfo,
    courses: groupByAcademicSemesterData,
  };
};

const createStudentFromEvent = async (e: any) => {
  const studentData: Partial<Student> = {
    studentId: e.id,
    firstName: e.name.firstName,
    lastName: e.name.lastName,
    middleName: e.name.middleName,
    email: e.email,
    contactNo: e.contactNo,
    gender: e.gender,
    bloodGroup: e.bloodGroup,
    academicSemesterId: e.academicSemester.syncId,
    academicDepartmentId: e.academicDepartment.syncId,
    academicFacultyId: e.academicFaculty.syncId,
  };

  await create(studentData as Student);
};

const updateStudentFromEvent = async (e: any): Promise<void> => {
  const isExist = await prisma.student.findFirst({
    where: {
      studentId: e.id,
    },
  });

  if (!isExist) {
    await createStudentFromEvent(e);
    return;
  } else {
    const student: Partial<Student> = {
      studentId: e.id,
      firstName: e.name.firstName,
      lastName: e.name.lastName,
      middleName: e.name.middleName,
      profileImage: e.profileImage,
      email: e.email,
      contactNo: e.contactNo,
      gender: e.gender,
      bloodGroup: e.bloodGroup,
      academicDepartmentId: e.academicDepartment.syncId,
      academicFacultyId: e.academicFaculty.syncId,
      academicSemesterId: e.academicSemester.syncId,
    };
    await prisma.student.updateMany({
      where: {
        studentId: e.id,
      },
      data: student as Student,
    });
  }
};

const studentService = {
  create,
  getStudents,
  getSingleStudent,
  updateStudent,
  deleteStudent,
  myCourses,
  getMyCourseSchedules,
  getMyAcademicInfo,
  createStudentFromEvent,
  updateStudentFromEvent,
};

export default studentService;
