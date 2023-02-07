/*
  The Logger class provides logging functionality for an application.
  It can be used to display errors, warnings and debug messages.
 */

const { createLogger, format, transports } = require("winston");
const { combine, timestamp, label, printf, json } = format;

const loginLogger = () => {
  const myFormat = printf(({ level, message, timestamp }) => {
    return `${level} ${timestamp} : ${message}`;
  });

  return createLogger({
    level: "debug",
    // format: winston.format.simple(),
    format: combine(timestamp(), json(), myFormat),

    defaultMeta: { service: "user-service" },
    transports: [
      new transports.Console(),
      new transports.File({
        filename: "loginerrors.log",
      }),
    ],
  });
};

module.exports = loginLogger;
