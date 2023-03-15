console.log("youtubeScript.js loaded");

console.log(">", document);

const IS_DEBUG = true;

const debug = function (...message) {
  console.log(...message);
};

const pathChecker = function (window, callback, checkInterval) {
  let location = window.location;
  function getLocationString(location) {
    return `${location.pathname}${location.search}${location.hash}`;
  }
  let previous = getLocationString(location);
  let current = getLocationString(location);
  return setInterval(() => {
    if (getLocationString(location) !== current) {
      previous = `${current}`;
      current = getLocationString(location);
      if (IS_DEBUG) debug(`pathChecker change > c: ${current} p: ${previous}`);
      callback(current, previous);
    }
  }, checkInterval);
};

let pathCheckInterval = pathChecker(
  window,
  (current, prev) => {
    console.log("path has changed!", current, prev);
  },
  1000
);
