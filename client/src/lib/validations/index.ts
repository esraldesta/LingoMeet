import * as zod from "zod";

export const LEVELS = [
  "ALL",
  "BEGINNER",
  "UPPER_BEGINNER",
  "INTERMEDIATE",
  "UPPER_INTERMEDIATE",
  "ADVANCED",
  "FLUENT",
] as const;

export const group_schema = zod.object({
  topic: zod.string().min(3).max(50),
  languages: zod.array(zod.string()),
  maxPeople: zod.coerce.number(),
  levels: zod.array(zod.enum(LEVELS)),
  isPrivate: zod.boolean(),
});
