import { z } from "zod";

const create = z.object({
  body: z.object({
    offeredCourseId: z.string({
      required_error: "Offered course id is required",
    }),
    maxCapacity: z.number({
      required_error: "Max capacity is required",
    }),
    title: z.string({
      required_error: "Title is required",
    }),
    classSchedules: z
      .array(
        z.object({
          startTime: z.string({
            required_error: "Start time is required",
          }),
          endTime: z.string({
            required_error: "End time is required",
          }),
          dayOfWeek: z.string({
            required_error: "Day of week is required",
          }),
          roomId: z.string({
            required_error: "Room id is required",
          }),
          facultyId: z.string({
            required_error: "Faculty id is required",
          }),
        })
      )
      .optional(),
  }),
});

const update = z.object({
  body: z.object({
    maxCapacity: z.number().optional(),
    title: z.string().optional(),
  }),
});

export const offeredCourseSectionValidation = {
  create,
  update,
};
