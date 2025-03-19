import { ProficiencyLevel } from "@prisma/client";
import { LANGUAGES, LEVELS } from "../api/validations/group";

export const languages = LANGUAGES.map((l) => ({ name: l }));
export const levels = LEVELS.map((l) => ({ name: l })) as {
  name: ProficiencyLevel;
}[];
