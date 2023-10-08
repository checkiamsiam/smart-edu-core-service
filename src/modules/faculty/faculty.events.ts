import { redis } from "../../utils/redis.util";
import {
  EVENT_FACULTY_CREATED,
  EVENT_FACULTY_UPDATED,
} from "./faculty.constant";
import { FacultyCreatedEvent } from "./faculty.interface";
import facultyService from "./faculty.service";

const initFacultyEvents = () => {
  redis.subscribe(EVENT_FACULTY_CREATED, async (e: string) => {
    const data: FacultyCreatedEvent = JSON.parse(e);

    await facultyService.createFacultyFromEvent(data);
  });

  redis.subscribe(EVENT_FACULTY_UPDATED, async (e: string) => {
    const data = JSON.parse(e);
    await facultyService.updateFacultyFromEvent(data);
  });
};

export default initFacultyEvents;
