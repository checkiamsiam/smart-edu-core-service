import { OfferedCourseSection, Prisma } from "@prisma/client";
import httpStatus from "http-status";
import { IQueryFeatures, IQueryResult } from "../../interfaces/queryFeatures.interface";
import prisma from "../../shared/prismaClient";
import { asyncForEach } from "../../utils/asyncForeach.util";
import AppError from "../../utils/customError.util";
import { offeredCourseClassScheduleUtils } from "../offeredCourseSchedule/offeredCourseSchedule.utils";
import { IClassSchedule, IOfferedCourseSectionCreate } from "./offeredCourseSection.interface";

const create = async (payload: IOfferedCourseSectionCreate): Promise<OfferedCourseSection | null> => {
  const { classSchedules, ...data } = payload;

  const isExistOfferedCourse = await prisma.offeredCourse.findFirst({
    where: {
      id: data.offeredCourseId,
    },
  });

  if (!isExistOfferedCourse) {
    throw new AppError("Offered Course does not exist!", httpStatus.BAD_REQUEST);
  }

  await asyncForEach(classSchedules, async (schedule: any) => {
    await offeredCourseClassScheduleUtils.checkRoomAvailable(schedule);
    await offeredCourseClassScheduleUtils.checkFacultyAvailable(schedule);
  });

  const offerCourseSectionData = await prisma.offeredCourseSection.findFirst({
    where: {
      offeredCourse: {
        id: data.offeredCourseId,
      },
      title: data.title,
    },
  });

  if (offerCourseSectionData) {
    throw new AppError("Course Section already exists", httpStatus.BAD_REQUEST);
  }

  const createSection = await prisma.$transaction(async (transactionClient) => {
    const createOfferedCourseSection = await transactionClient.offeredCourseSection.create({
      data: {
        title: data.title,
        maxCapacity: data.maxCapacity,
        offeredCourseId: data.offeredCourseId,
        semesterRegistrationId: isExistOfferedCourse.semesterRegistrationId,
      },
    });

    const scheduleData = classSchedules.map((schedule: IClassSchedule) => ({
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      dayOfWeek: schedule.dayOfWeek,
      roomId: schedule.roomId,
      facultyId: schedule.facultyId,
      offeredCourseSectionId: createOfferedCourseSection.id,
      semesterRegistrationId: isExistOfferedCourse.semesterRegistrationId,
    }));

    await transactionClient.offeredCourseClassSchedule.createMany({
      data: scheduleData,
    });

    return createOfferedCourseSection;
  });

  const result = await prisma.offeredCourseSection.findFirst({
    where: {
      id: createSection.id,
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
          faculty: true,
        },
      },
    },
  });

  return result;
};

const getOfferedCourseSection = async (queryFeatures: IQueryFeatures): Promise<IQueryResult<OfferedCourseSection>> => {
  const query: Prisma.OfferedCourseSectionFindManyArgs = {
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

  const [result, count] = await prisma.$transaction([prisma.offeredCourseSection.findMany(query), prisma.offeredCourseSection.count()]);

  return {
    data: result,
    total: count,
  };
};

const getSingleOfferedCourseSection = async (id: string, queryFeatures: IQueryFeatures): Promise<Partial<OfferedCourseSection> | null> => {
  const query: Prisma.OfferedCourseSectionFindUniqueArgs = {
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

  const result: Partial<OfferedCourseSection> | null = await prisma.offeredCourseSection.findUnique(query);

  return result;
};

const updateOfferedCourseSection = async (id: string, payload: Partial<OfferedCourseSection>): Promise<Partial<OfferedCourseSection> | null> => {
  const result: Partial<OfferedCourseSection> | null = await prisma.offeredCourseSection.update({
    where: {
      id,
    },
    data: payload,
  });

  return result;
};

const deleteOfferedCourseSection = async (id: string) => {
  const result: Partial<OfferedCourseSection> | null = await prisma.offeredCourseSection.delete({
    where: {
      id,
    },
  });

  return result;
};

const offeredCourseSectionService = {
  create,
  getOfferedCourseSection,
  getSingleOfferedCourseSection,
  updateOfferedCourseSection,
  deleteOfferedCourseSection,
};

export default offeredCourseSectionService;
