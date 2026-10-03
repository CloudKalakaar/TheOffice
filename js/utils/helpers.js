// ============================================
// THE OFFICE — Utility Helpers
// ============================================

/**
 * Generate a unique ID
 * @param {string} [prefix=''] - Optional prefix
 * @returns {string}
 */
export function uid(prefix = '') {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).substring(2, 8);
  return prefix ? `${prefix}_${ts}${rand}` : `${ts}${rand}`;
}

/**
 * Delay execution
 * @param {number} ms
 * @returns {Promise<void>}
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Debounce a function
 * @param {Function} fn
 * @param {number} delay
 * @returns {Function}
 */
export function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Throttle a function
 * @param {Function} fn
 * @param {number} limit
 * @returns {Function}
 */
export function throttle(fn, limit = 300) {
  let inThrottle = false;
  return (...args) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => { inThrottle = false; }, limit);
    }
  };
}

/**
 * Format a timestamp to relative time
 * @param {number|Date} date
 * @returns {string}
 */
export function timeAgo(date) {
  const now = Date.now();
  const ts = date instanceof Date ? date.getTime() : date;
  const diff = Math.floor((now - ts) / 1000);

  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

/**
 * Format a game time (day + hour)
 * @param {number} day
 * @param {number} hour - 9-17 (work hours)
 * @returns {string}
 */
export function formatGameTime(day, hour) {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour > 12 ? hour - 12 : hour;
  return `Day ${day}, ${displayHour}:00 ${period}`;
}

/**
 * Truncate text with ellipsis
 * @param {string} text
 * @param {number} maxLength
 * @returns {string}
 */
export function truncate(text, maxLength = 50) {
  if (!text || text.length <= maxLength) return text || '';
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Escape HTML to prevent XSS
 * @param {string} str
 * @returns {string}
 */
export function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Simple template renderer - replaces {{key}} with values
 * @param {string} template
 * @param {Object} data
 * @returns {string}
 */
export function render(template, data) {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return data[key] !== undefined ? escapeHtml(String(data[key])) : match;
  });
}

/**
 * Create an HTML element.
 * Supports two call signatures:
 *  1. createElement('<div class="x">...</div>') — from HTML string
 *  2. createElement('div', 'className') — tag + class string
 *  3. createElement('div', { className, id, style }) — tag + props object
 * @param {string} tagOrHtml
 * @param {string|Object} [classOrProps]
 * @returns {HTMLElement}
 */
export function createElement(tagOrHtml, classOrProps, textContent) {
  // If second argument is provided, treat first as tag name
  if (classOrProps !== undefined) {
    const el = document.createElement(tagOrHtml);
    if (typeof classOrProps === 'string') {
      el.className = classOrProps;
    } else if (typeof classOrProps === 'object') {
      Object.entries(classOrProps).forEach(([key, val]) => {
        if (key === 'className') el.className = val;
        else if (key === 'style' && typeof val === 'string') el.style.cssText = val;
        else if (key.startsWith('on')) el.addEventListener(key.slice(2).toLowerCase(), val);
        else el.setAttribute(key, val);
      });
    }
    if (textContent !== undefined) {
      el.textContent = textContent;
    }
    return el;
  }
  // Otherwise treat as HTML string
  const template = document.createElement('template');
  template.innerHTML = tagOrHtml.trim();
  return template.content.firstChild;
}

/**
 * Clamp a number between min and max
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Random integer between min and max (inclusive)
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Pick a random item from an array
 * @param {Array} arr
 * @returns {*}
 */
export function randomPick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Shuffle an array (Fisher-Yates)
 * @param {Array} arr
 * @returns {Array}
 */
export function shuffle(arr) {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Group an array by a key
 * @param {Array} arr
 * @param {string|Function} key
 * @returns {Object}
 */
export function groupBy(arr, key) {
  return arr.reduce((acc, item) => {
    const k = typeof key === 'function' ? key(item) : item[key];
    (acc[k] = acc[k] || []).push(item);
    return acc;
  }, {});
}

/**
 * Format number with commas
 * @param {number} num
 * @returns {string}
 */
export function formatNumber(num) {
  return num.toLocaleString('en-US');
}

/**
 * Get CSS variable value
 * @param {string} name - e.g. '--color-primary'
 * @returns {string}
 */
export function getCssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

/**
 * Vibrate device (if supported)
 * @param {number|number[]} pattern
 */
export function vibrate(pattern = 10) {
  if (navigator.vibrate) navigator.vibrate(pattern);
}

export default {
  uid, sleep, debounce, throttle, timeAgo, formatGameTime, truncate,
  escapeHtml, render, createElement, clamp, randomInt, randomPick,
  shuffle, groupBy, formatNumber, getCssVar, vibrate
};
