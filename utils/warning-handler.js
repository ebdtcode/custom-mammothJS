const { IGNORED_WARNINGS } = require("../config/warnings");

function shouldIgnoreWarning(warning) {
  return IGNORED_WARNINGS.some(
    (ignored) =>
      warning.type === ignored.type && ignored.pattern.test(warning.message)
  );
}

function filterWarnings(messages) {
  return messages.filter((message) => !shouldIgnoreWarning(message));
}

module.exports = { filterWarnings };
