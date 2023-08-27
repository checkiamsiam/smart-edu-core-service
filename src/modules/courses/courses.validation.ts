import { z } from 'zod';

const createCourseReq = z.object({
    body: z.object({
        title: z.string({
            required_error: 'Title is required'
        }),
        code: z.string({
            required_error: 'Code is required'
        }),
        credits: z.number({
            required_error: 'Credits is required'
        }),
        preRequisiteCourses: z
            .array(
                z.object({
                    courseId: z.string({})
                })
            )
            .optional()
    })
});
const updateCourseReq = z.object({
    body: z.object({
        title: z.string().optional(),
        code: z.string().optional(),
        credits: z.number().optional(),
        preRequisiteCourses: z
            .array(
                z.object({
                    courseId: z.string(),
                    isRemove: z.boolean()
                })
            )
            .optional()
    })
});

export const courseValidation = {
    createCourseReq,
    updateCourseReq
};
