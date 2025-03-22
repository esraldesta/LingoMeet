// import Joi from "joi";

// // Define a custom Joi extension for comma-separated strings
// const commaSeparatedArray = Joi.extend((joi) => ({
//   type: "commaSeparatedArray",
//   base: joi.array(),
//   coerce: {
//     from: "string",
//     method(value) {
//       if (typeof value === "string") {
//         // Split the string by commas and trim whitespace
//         return { value: value.split(",").map((item) => item.trim()) };
//       }
//       // If it's already an array, return it as-is
//       return { value };
//     },
//   },
//   // Add custom validation rules if needed
//   rules: {
//     integers: {
//       method() {
//         return this.$_addRule("integers");
//       },
//       validate(value, helpers) {
//         // Ensure all values in the array are valid integers
//         const integers = value.map((val) => {
//           const parsed = parseInt(val, 10);
//           if (isNaN(parsed)) {
//             return helpers.error("commaSeparatedArray.integers.invalid");
//           }
//           return parsed;
//         });
//         return integers;
//       },
//     },
//   },
//   messages: {
//     "commaSeparatedArray.integers.invalid": "All values must be valid integers",
//   },
// }));

// const stringNumber = Joi.extend((joi) => ({
//   type: "stringNumber",
//   base: joi.any(),
//   coerce: {
//     from: "string",
//     method(value, helpers) {
//       const parsed = parseFloat(value);
//       if (!isNaN(parsed)) {
//         return { value: parsed }; // Successfully parsed
//       }
//       return { value }; // Let Joi handle validation errors
//     },
//   },
//   validate(value, helpers) {
//     if (typeof value !== "number") {
//       return { value, errors: helpers.error("stringNumber.base") };
//     }
//     return { value }; // Return the coerced value
//   },
//   messages: {
//     "stringNumber.base": "{{#label}} must be a valid number",
//   },
// }));

// export const createGroup = {
//   body: Joi.object({
//     topic: Joi.string().min(3).max(300),
//     languages: commaSeparatedArray.commaSeparatedArray().items(Joi.string()),
//     levels: commaSeparatedArray.commaSeparatedArray().items(Joi.string()),
//     maxPeople: Joi.number().integer().required(),
//     isPrivate: Joi.boolean(),
//   }).options({ abortEarly: false }),
// };

// export const getOne = {
//   params: Joi.object({
//     id: Joi.string()
//       .regex(/^[a-fA-F0-9]{24}$/)
//       .required(),
//   }).options({ abortEarly: false }),
// };

// export const deleteOne = {
//   params: Joi.object({
//     id: Joi.string()
//       .regex(/^[a-fA-F0-9]{24}$/)
//       .required(),
//   }).options({ abortEarly: false }),
// };

/// express-validator

import { body, ContextRunner } from "express-validator";

export const createGroup: ContextRunner[] = [
  body("topic").isString().isLength({ min: 3, max: 300 }),
  body("languages")
    .isString()
    .withMessage("Languages must be a comma-separated string")
    .isLength({ min: 2 })
    .withMessage("Languages is required")
    .customSanitizer((value: string) => {
      return value.split(",").map((lang) => lang.trim());
    })
    .isArray({ min: 1 })
    .withMessage("Languages must contain at least one language")
    .custom((value: string[]) =>
      value.every((lang) => LANGUAGES.includes(lang))
    )
    .withMessage("Invalid languages"),

  body("levels")
    .isString()
    .withMessage("Levels must be a comma-separated string")
    .isLength({ min: 2 })
    .withMessage("Levels is required")
    .customSanitizer((value: string) => {
      return value.split(",").map((lang) => lang.trim());
    })
    .isArray({ min: 1 })
    .withMessage("Levels must contain at least one language")
    .custom((value: string[]) => value.every((l) => LEVELS.includes(l)))
    .withMessage("Invalid levels"),

  body("maxPeople")
    .isString()
    .withMessage("maxPeople must be a positive integer")
    .customSanitizer((value: string) => parseInt(value, 10))
    .isInt({ min: 1 })
    .withMessage("maxPeople must be a positive integer"),

  body("isPrivate")
    .isString()
    .withMessage("isPrivate must be a boolean")
    .customSanitizer((value: string) => {
      if (value === "true") return true;
      if (value === "false") return false;
      return value;
    })
    .isBoolean()
    .withMessage("isPrivate must be a boolean"),
];

export const LANGUAGES = ["en", "am", "ar"];
export const LEVELS = [
  "ALL",
  "BEGINNER",
  "UPPER_BEGINNER",
  "INTERMEDIATE",
  "UPPER_INTERMEDIATE",
  "ADVANCED",
  "FLUENT",
];
