import { redis } from "../../utils/redis.util";
import {
  EVENT_STUDENT_CREATED,
  EVENT_STUDENT_UPDATED,
} from "./student.constant";
import studentService from "./student.service";

const initStudentEvents = () => {
  redis.subscribe(EVENT_STUDENT_CREATED, async (e: string) => {
    const data = JSON.parse(e);
    await studentService.createStudentFromEvent(data);
  });

  redis.subscribe(EVENT_STUDENT_UPDATED, async (e: string) => {
    const data = JSON.parse(e);

    await studentService.updateStudentFromEvent(data);
  });
};

export default initStudentEvents;
