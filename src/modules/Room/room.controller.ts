import { Room } from "@prisma/client";
import { Request, RequestHandler, Response } from "express";
import httpStatus from "http-status";
import catchAsyncErrors from "../../utils/catchAsyncError.util";
import AppError from "../../utils/customError.util";
import sendResponse from "../../utils/sendResponse.util";
import roomServices  from "./room.service";

const createRoom: RequestHandler = catchAsyncErrors(async (req: Request, res: Response) => {
  const body: Room = req.body;
  const result = await roomServices.create(body);
  sendResponse<Room>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Room created successfully",
    data: result,
  });
});

const getRooms: RequestHandler = catchAsyncErrors(async (req: Request, res: Response) => {
  const getResult = await roomServices.getRooms(req.queryFeatures);
  sendResponse<Partial<Room>[]>(res, {
    statusCode: httpStatus.OK,
    success: true,
    data: getResult.data,
    meta: {
      page: req.queryFeatures.page,
      limit: req.queryFeatures.limit,
      total: getResult.total || 0,
    },
  });
});
const getSingleRoom: RequestHandler = catchAsyncErrors(async (req: Request, res: Response) => {
  const id: string = req.params.id;
  const result: Partial<Room> | null = await roomServices.getSingleRoom(id, req.queryFeatures);
  if (!result) {
    throw new AppError("Room Not Found", httpStatus.NOT_FOUND);
  }
  sendResponse<Partial<Room>>(res, {
    statusCode: httpStatus.OK,
    success: true,
    data: result,
  });
});

const updateRoom: RequestHandler = catchAsyncErrors(async (req: Request, res: Response) => {
  const id: string = req.params.id;
  const updatePayload: Partial<Room> = req.body;
  const result: Partial<Room> | null = await roomServices.updateRoom(id, updatePayload);

  if (!result) {
    throw new AppError("Room Not Found", httpStatus.NOT_FOUND);
  }
  sendResponse<Partial<Room>>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Document Updated Successfully",
    data: result,
  });
});
const deleteRoom: RequestHandler = catchAsyncErrors(async (req: Request, res: Response) => {
  const id: string = req.params.id;

  const result = await roomServices.deleteRoom(id);

  if (!result) {
    throw new AppError("Room Not Found", httpStatus.NOT_FOUND);
  }
  sendResponse<Partial<Room>>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Room Deleted Successfully",
  });
});

const roomController = {
  createRoom,
  getRooms,
  getSingleRoom,
  updateRoom,
  deleteRoom,
};
export default roomController;
