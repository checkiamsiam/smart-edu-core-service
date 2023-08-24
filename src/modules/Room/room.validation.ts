import { z } from "zod";

const createRoomReq = z.object({
  body: z.object({
    roomNumber: z.string({
      required_error: "Room number is required",
    }),
    floor: z.string({
      required_error: "Floor is required",
    }),
    buildingId: z.string({
      required_error: "Building id is required",
    }),
  }),
});

const updateRoomReq = z.object({
  body: z.object({
    roomNumber: z.string().optional(),
    floor: z.string().optional(),
    buildingId: z.string().optional(),
  }),
});

export const roomValidation = {
  createRoomReq,
  updateRoomReq,
};
