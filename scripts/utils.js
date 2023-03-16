console.log("> utils.js");

// util functions

export const timedTextInterception = (url) => {
  console.log("interception:", url);
};

const debug = function (callerContext, ...message) {
  if (IS_DEBUG) console.log(`[${callerContext}]`, ...message);
};

function getFullPathString(window) {
  const location = window.location;
  return `${location.pathname}${location.search}${location.hash}`;
}

const isWatch = function (urlString) {
  return /watch/g.test(urlString);
};

const pathChecker = function (window, callback, checkInterval) {
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
};

const activate = function () {};

// global const declarations

const IS_DEBUG = true;
