const path = require('path');
const fs = require('fs').promises;
const Logger = require('../logger');

/**
 * Common utility functions used across the application
 */
class CommonUtils {
    /**
     * Ensures a directory exists, creating it if necessary
     * @param {string} dir - Directory path
     */
    static async ensureDir(dir) {
        try {
            await fs.access(dir);
        } catch {
            await fs.mkdir(dir, { recursive: true });
        }
    }

    /**
     * Safely read a file with error handling
     * @param {string} filePath - Path to file
     * @returns {Promise<string|null>} File contents or null if error
     */
    static async safeReadFile(filePath) {
        try {
            return await fs.readFile(filePath, 'utf8');
        } catch (error) {
            Logger.error(`Failed to read file ${filePath}`, error);
            return null;
        }
    }

    /**
     * Safely write to a file with error handling
     * @param {string} filePath - Path to file
     * @param {string} content - Content to write
     * @returns {Promise<boolean>} Success status
     */
    static async safeWriteFile(filePath, content) {
        try {
            await this.ensureDir(path.dirname(filePath));
            await fs.writeFile(filePath, content);
            return true;
        } catch (error) {
            Logger.error(`Failed to write file ${filePath}`, error);
            return false;
        }
    }

    /**
     * Debounce a function
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @returns {Function} Debounced function
     */
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Throttle a function
     * @param {Function} func - Function to throttle
     * @param {number} limit - Time limit in milliseconds
     * @returns {Function} Throttled function
     */
    static throttle(func, limit) {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func(...args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * Deep clone an object
     * @param {Object} obj - Object to clone
     * @returns {Object} Cloned object
     */
    static deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (Array.isArray(obj)) return obj.map(item => this.deepClone(item));
        return Object.fromEntries(
            Object.entries(obj).map(([key, value]) => [key, this.deepClone(value)])
        );
    }

    /**
     * Format bytes to human readable string
     * @param {number} bytes - Number of bytes
     * @returns {string} Formatted string
     */
    static formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
    }

    /**
     * Generate a unique ID
     * @returns {string} Unique ID
     */
    static generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * Validate file extension
     * @param {string} filename - Filename to validate
     * @param {string[]} allowedExtensions - Array of allowed extensions
     * @returns {boolean} Whether file extension is allowed
     */
    static isValidFileExtension(filename, allowedExtensions) {
        const ext = path.extname(filename).toLowerCase();
        return allowedExtensions.includes(ext);
    }

    /**
     * Sanitize filename
     * @param {string} filename - Filename to sanitize
     * @returns {string} Sanitized filename
     */
    static sanitizeFilename(filename) {
        return filename
            .replace(/[^a-z0-9]/gi, '_')
            .toLowerCase();
    }
}

module.exports = CommonUtils;
