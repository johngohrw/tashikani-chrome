import { IS_DEBUG } from "./globals.js";

export function debug(callerContext, ...message) {
  if (IS_DEBUG) console.log(`[${callerContext}]:`, ...message);
}

export const timedTextInterception = (url) => {
  console.log("interception:", url);
};

export function getFullPathString(window) {
  const location = window.location;
  return `${location.pathname}${location.search}${location.hash}`;
}

export function isWatch(urlString) {
  return /watch/g.test(urlString);
}

export function pathChecker(window, callback, checkInterval) {
  let previous = getFullPathString(window);
  let current = getFullPathString(window);
  return setInterval(() => {
    if (getFullPathString(window) !== current) {
      previous = `${current}`;
      current = getFullPathString(window);
      debug("pathChecker", `current: ${current}, prev: ${previous}`);
      callback(current, previous);
    }
  }, checkInterval);
}

export const activate = function () {};

// global const declarations
