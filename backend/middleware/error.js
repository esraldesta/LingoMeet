const APIError = require("../utils/APIError");

const Handler = (err, req, res, next) => {
  let _message = "";
  if (err.stack && err.stack.indexOf("MongoServer") !== -1) {
    const _err = err.message.split(" ");
    const type = _err[_err.indexOf("index:") + 1];
    const coll = _err.slice(1, _err.indexOf("collection:") - 1).join(" ");
    _message = `${coll} ${type}`;
  }
  const response = {
    code: err.status || 500,
    message: _message || err.message || err.name,
    errors: err.errors,
    stack: err.stack,
  };
  delete response.stack;
  console.error(response.message);
  res.status(response.code).json(response);
  res.end();
};

exports.ErrorHandler = Handler;
exports.Handler = Handler;

exports.ConvertError = (err, req, res, next) => {
  let ConvertedError = err;
  if (err instanceof ValidationError) {
    const errors = [];
    const entries = Object.entries(err.details);
    for (let i = 0; i < entries.length; i++) {
      const [key, value] = entries[i];
      errors.push(
        ...value.map((e) => ({
          location: key,
          messages: e.message.replace(/[^\w\s]/gi, ""),
          field: e.path[0],
        }))
      );
    }

    ConvertedError = new APIError({
      message: "Validation Error",
      status: err.statusCode || 400,
      errors,
    });
  } else if (!(err instanceof APIError)) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0];
      ConvertedError = new APIError({
        message: "Validation error",
        status: 400,
        errors: [
          {
            field: field,
            location: "body",
            messages: `This ${field} is alreday taken`,
          },
        ],
      });
    } else {
      ConvertedError = new APIError({
        message: err.message,
        status: err.status,
        stack: err.stack,
      });
    }
  }
  return Handler(ConvertedError, req, res, next);
};

exports.NotFound = (req, res, next) => {
  const err = new APIError({
    message: "Resource Not Found",
    status: 404,
  });
  return Handler(err, req, res, next);
};

exports.RateLimitHandler = (req, res, next) => {
  const err = new APIError({
    message: "Rate limt exceeded, please try again later some time.",
    status: 429,
  });
  return Handler(err, req, res, next);
};
