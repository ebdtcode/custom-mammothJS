const chalk = require("chalk");

/**
 * Provides standardized logging functionality with colored output.
 * Uses the chalk library to add colors and styling to console output.
 * 
 * @class Logger
 * @static
 */
class Logger {
  /**
   * Logs an informational message in blue.
   * 
   * @static
   * @param {string} message - The message to log
   */
  static info(message) {
    console.log(chalk.blue("ℹ"), message);
  }

  /**
   * Logs a success message in green.
   * 
   * @static
   * @param {string} message - The message to log
   */
  static success(message) {
    console.log(chalk.green("✓"), message);
  }

  /**
   * Logs a warning message in yellow.
   * 
   * @static
   * @param {string} message - The message to log
   */
  static warn(message) {
    console.log(chalk.yellow("⚠"), message);
  }

  /**
   * Logs an error message in red with optional error stack trace.
   * 
   * @static
   * @param {string} message - The error message to log
   * @param {Error} [error] - Optional Error object to display stack trace
   */
  static error(message, error) {
    console.error(chalk.red("✖"), message);
    if (error?.stack) {
      console.error(chalk.red(error.stack));
    }
  }

  /**
   * Logs a progress message with percentage completion.
   * 
   * @static
   * @param {number} current - Current progress value
   * @param {number} total - Total value representing 100% progress
   * @param {string} message - Message to display with the progress
   */
  static progress(current, total, message) {
    const percentage = Math.round((current / total) * 100);
    console.log(chalk.cyan(`[${percentage}%]`), message);
  }
}

module.exports = Logger;
