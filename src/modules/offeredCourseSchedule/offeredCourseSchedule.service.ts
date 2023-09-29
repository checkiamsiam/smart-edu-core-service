import { OfferedCourseClassSchedule, Prisma } from "@prisma/client";
import {
  IQueryFeatures,
  IQueryResult,
} from "../../interfaces/queryFeatures.interface";
import prisma from "../../shared/prismaClient";
import { offeredCourseClassScheduleUtils } from "./offeredCourseSchedule.utils";

const create = async (
  payload: OfferedCourseClassSchedule
): Promise<OfferedCourseClassSchedule> => {
  await offeredCourseClassScheduleUtils.checkRoomAvailable(payload);
  await offeredCourseClassScheduleUtils.checkFacultyAvailable(payload);

  const result = await prisma.offeredCourseClassSchedule.create({
    data: payload,
    include: {
      semesterRegistration: true,
      offeredCourseSection: true,
      room: true,
      faculty: true,
    },
  });

  return result;
};

const getOfferedCourseClassSchedule = async (
  queryFeatures: IQueryFeatures
): Promise<IQueryResult<OfferedCourseClassSchedule>> => {
  const query: Prisma.OfferedCourseClassScheduleFindManyArgs = {
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
    prisma.offeredCourseClassSchedule.findMany(query),
    prisma.offeredCourseClassSchedule.count(),
  ]);

  return {
    data: result,
    total: count,
  };
};

const getSingleOfferedCourseClassSchedule = async (
  id: string,
  queryFeatures: IQueryFeatures
): Promise<Partial<OfferedCourseClassSchedule> | null> => {
  const query: Prisma.OfferedCourseClassScheduleFindUniqueArgs = {
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

  const result: Partial<OfferedCourseClassSchedule> | null =
    await prisma.offeredCourseClassSchedule.findUnique(query);

  return result;
};

const updateOfferedCourseClassSchedule = async (
  id: string,
  payload: Partial<OfferedCourseClassSchedule>
): Promise<Partial<OfferedCourseClassSchedule> | null> => {
  const result: Partial<OfferedCourseClassSchedule> | null =
    await prisma.offeredCourseClassSchedule.update({
      where: {
        id,
      },
      data: payload,
    });

  return result;
};

const deleteOfferedCourseClassSchedule = async (id: string) => {
  const result: Partial<OfferedCourseClassSchedule> | null =
    await prisma.offeredCourseClassSchedule.delete({
      where: {
        id,
      },
    });

  return result;
};

const offeredCourseClassScheduleService = {
  create,
  getOfferedCourseClassSchedule,
  getSingleOfferedCourseClassSchedule,
  updateOfferedCourseClassSchedule,
  deleteOfferedCourseClassSchedule,
};

export default offeredCourseClassScheduleService;
