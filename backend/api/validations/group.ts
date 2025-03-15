import Joi from "joi";

// Define a custom Joi extension for comma-separated strings
const commaSeparatedArray = Joi.extend((joi) => ({
  type: "commaSeparatedArray",
  base: joi.array(),
  coerce: {
    from: "string",
    method(value) {
      if (typeof value === "string") {
        // Split the string by commas and trim whitespace
        return { value: value.split(",").map((item) => item.trim()) };
      }
      // If it's already an array, return it as-is
      return { value };
    },
  },
}));

const stringNumber = Joi.extend((joi) => ({
  type: "stringNumber",
  base: joi.any(),
  coerce: {
    from: "string",
    method(value, helpers) {
      const parsed = parseFloat(value);
      if (!isNaN(parsed)) {
        return { value: parsed }; // Successfully parsed
      }
      return { value }; // Let Joi handle validation errors
    },
  },
  validate(value, helpers) {
    if (typeof value !== "number") {
      return { value, errors: helpers.error("stringNumber.base") };
    }
    return { value }; // Return the coerced value
  },
  messages: {
    "stringNumber.base": "{{#label}} must be a valid number",
  },
}));

export const createGroup = {
  body: Joi.object({
    topic: Joi.string().min(3).max(300),
    languages: commaSeparatedArray.commaSeparatedArray().items(Joi.string()),
    levels: commaSeparatedArray.commaSeparatedArray().items(Joi.string()),
    maxPeople: stringNumber.stringNumber().optional(),
    isPrivate: Joi.boolean(),
  }).options({ abortEarly: false }),
};

export interface GroupRequestBody {
  isPrivate?: boolean;
  topic?: string;
  levels: string[];
  languages: string[];
  maxPeople: number;
}

export const getOne = {
  params: Joi.object({
    id: Joi.string()
      .regex(/^[a-fA-F0-9]{24}$/)
      .required(),
  }).options({ abortEarly: false }),
};

export const deleteOne = {
  params: Joi.object({
    id: Joi.string()
      .regex(/^[a-fA-F0-9]{24}$/)
      .required(),
  }).options({ abortEarly: false }),
};
