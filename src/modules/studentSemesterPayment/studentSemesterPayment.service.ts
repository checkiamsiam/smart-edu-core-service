import {
  PaymentStatus,
  Prisma,
  PrismaClient,
  StudentSemesterPayment,
} from "@prisma/client";
import {
  DefaultArgs,
  PrismaClientOptions,
} from "@prisma/client/runtime/library";
import axios from "axios";
import httpStatus from "http-status";
import config from "../../config";
import prismaHelper from "../../helpers/prisma.helper";
import {
  IQueryFeatures,
  IQueryResult,
} from "../../interfaces/queryFeatures.interface";
import prisma from "../../shared/prismaClient";
import AppError from "../../utils/customError.util";

const createSemesterPayment = async (
  prismaClient: Omit<
    PrismaClient<PrismaClientOptions, never, DefaultArgs>,
    "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
  >,
  payload: {
    studentId: string;
    academicSemesterId: string;
    totalPaymentAmount: number;
  }
) => {
  const isExist = await prismaClient.studentSemesterPayment.findFirst({
    where: {
      student: {
        id: payload.studentId,
      },
      academicSemester: {
        id: payload.academicSemesterId,
      },
    },
  });

  if (!isExist) {
    const dataToInsert = {
      studentId: payload.studentId,
      academicSemesterId: payload.academicSemesterId,
      fullPaymentAmount: payload.totalPaymentAmount,
      partialPaymentAmount: payload.totalPaymentAmount * 0.5,
      totalDueAmount: payload.totalPaymentAmount,
      totalPaidAmount: 0,
    };

    await prismaClient.studentSemesterPayment.create({
      data: dataToInsert,
    });
  }
};

const getStudentSemesterPayments = async (
  queryFeatures: IQueryFeatures
): Promise<IQueryResult<StudentSemesterPayment>> => {
  const whereConditions: Prisma.StudentSemesterPaymentWhereInput =
    prismaHelper.findManyQueryHelper<Prisma.StudentSemesterPaymentWhereInput>(
      queryFeatures,
      {
        searchFields: [],
        relationalFields: {
          academicSemesterId: "academicSemester",
          studentId: "student",
        },
      }
    );

  const query: Prisma.StudentSemesterPaymentFindManyArgs = {
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
    prisma.studentSemesterPayment.findMany(query),
    prisma.studentSemesterPayment.count({ where: whereConditions }),
  ]);

  return {
    data: result,
    total: count,
  };
};

const initiatePayment = async (payload: any, user: any) => {
  const student = await prisma.student.findFirst({
    where: {
      studentId: user.userId,
    },
  });

  if (!student) {
    throw new AppError("Student not found!", httpStatus.BAD_REQUEST);
  }

  const studentSemesterPayment = await prisma.studentSemesterPayment.findFirst({
    where: {
      student: {
        id: student.id,
      },
      academicSemester: {
        id: payload.academicSemesterId,
      },
    },
    include: {
      academicSemester: true,
    },
  });

  if (!studentSemesterPayment) {
    throw new AppError(
      "Payment information not found!",
      httpStatus.BAD_REQUEST
    );
  }

  if (studentSemesterPayment.paymentStatus === PaymentStatus.FULL_PAID) {
    throw new AppError("Already paid!", httpStatus.BAD_REQUEST);
  }

  if (
    studentSemesterPayment.paymentStatus === PaymentStatus.PARTIAL_PAID &&
    payload.paymentType !== "FULL"
  ) {
    throw new AppError("Already partial paid!", httpStatus.BAD_REQUEST);
  }

  const isPendingPaymentExist =
    await prisma.studentSemesterPaymentHistory.findFirst({
      where: {
        studentSemesterPayment: {
          id: studentSemesterPayment.id,
        },
        isPaid: false,
      },
    });

  if (isPendingPaymentExist) {
    const paymentResponse = await axios.post(config.initPaymentEndpoint, {
      amount: isPendingPaymentExist.dueAmount,
      transactionId: isPendingPaymentExist.transactionId,
      studentName: `${student.firstName} ${student.lastName}`,
      studentId: student.studentId,
      studentEmail: student.email,
      address: "Dhaka, Bangladesh",
      phone: student.contactNo,
    });

    return {
      paymentUrl: paymentResponse.data,
      paymentDetails: isPendingPaymentExist,
    };
  }

  let payableAmount = 0;
  if (
    payload.paymentType === "PARTIAL" &&
    studentSemesterPayment.totalPaidAmount === 0
  ) {
    payableAmount = studentSemesterPayment.partialPaymentAmount as number;
  } else {
    payableAmount = studentSemesterPayment.totalDueAmount as number;
  }

  const dataToInsert = {
    studentSemesterPaymentId: studentSemesterPayment.id,
    transactionId: `${student.studentId}-${
      studentSemesterPayment.academicSemester.title
    }-${Date.now()}`,
    dueAmount: payableAmount,
    paidAmount: 0,
  };

  const studentSemesterPaymentHistory =
    await prisma.studentSemesterPaymentHistory.create({
      data: dataToInsert,
    });

  const paymentResponse = await axios.post(config.initPaymentEndpoint, {
    amount: studentSemesterPaymentHistory.dueAmount,
    transactionId: studentSemesterPaymentHistory.transactionId,
    studentName: `${student.firstName} ${student.lastName}`,
    studentId: student.studentId,
    studentEmail: student.email,
    address: "Dhaka, Bangladesh",
    phone: student.contactNo,
  });
  return {
    paymentUrl: paymentResponse.data,
    paymentDetails: isPendingPaymentExist,
  };
};

const completePayment = async (payload: { transactionId: string }) => {
  const paymentDetails = await prisma.studentSemesterPaymentHistory.findFirst({
    where: {
      transactionId: payload.transactionId,
    },
  });

  if (!paymentDetails) {
    throw new AppError("Payment details not found!", httpStatus.BAD_REQUEST);
  }

  if (paymentDetails.isPaid) {
    throw new AppError("Already paid!", httpStatus.BAD_REQUEST);
  }

  const studentSemesterPayment = await prisma.studentSemesterPayment.findFirst({
    where: {
      id: paymentDetails.studentSemesterPaymentId,
    },
  });

  if (!studentSemesterPayment) {
    throw new AppError("Payment info not found", httpStatus.BAD_REQUEST);
  }

  await prisma.$transaction(async (transactionClient) => {
    await transactionClient.studentSemesterPaymentHistory.update({
      where: {
        id: paymentDetails.id,
      },
      data: {
        isPaid: true,
        paidAmount: paymentDetails.dueAmount,
        dueAmount: 0,
      },
    });

    await transactionClient.studentSemesterPayment.update({
      where: {
        id: paymentDetails.studentSemesterPaymentId,
      },
      data: {
        totalPaidAmount:
          (studentSemesterPayment.totalPaidAmount as number) +
          paymentDetails.dueAmount,
        totalDueAmount:
          (studentSemesterPayment.totalDueAmount as number) -
          paymentDetails.dueAmount,
        paymentStatus:
          (studentSemesterPayment.totalDueAmount as number) -
            paymentDetails.dueAmount ===
          0
            ? PaymentStatus.FULL_PAID
            : PaymentStatus.PARTIAL_PAID,
      },
    });
  });

  return {
    message: "Payment Completed Successfully!",
  };
};

const getMySemesterPayments = async (
  queryFeatures: IQueryFeatures,
  user: any
): Promise<IQueryResult<StudentSemesterPayment>> => {
  const whereConditions: Prisma.StudentSemesterPaymentWhereInput =
    prismaHelper.findManyQueryHelper<Prisma.StudentSemesterPaymentWhereInput>(
      queryFeatures,
      {
        searchFields: [],
        relationalFields: {
          academicSemesterId: "academicSemester",
          studentId: "student",
        },
      }
    );

  const query: Prisma.StudentSemesterPaymentFindManyArgs = {
    where: { ...whereConditions, studentId: user.userId },
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
    prisma.studentSemesterPayment.findMany(query),
    prisma.studentSemesterPayment.count({ where: whereConditions }),
  ]);

  return {
    data: result,
    total: count,
  };
};

export const studentSemesterPaymentService = {
  createSemesterPayment,
  getStudentSemesterPayments,
  getMySemesterPayments,
  initiatePayment,
  completePayment,
};
