console.log("youtubeScript.js loaded");

// network request listener


// util functions

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

// global consts, declarations

const IS_DEBUG = true;
const initialState = {
  isWatchPage: isWatch(getFullPathString(window)),
};

// main running instance

let state = new Proxy(initialState, {
  set(obj, prop, value) {
    // console.log("changed", obj, prop, value);
    if (prop === "isWatchPage" && value) {
      activate();
    }
    debug("state set handler", `prop: ${prop}, value: ${value}`);
    return Reflect.set(...arguments);
  },
});

console.log(">", state, state.isWatchPage);

const onPathChange = function (current, previous) {
  if (state.isWatchPage !== isWatch(current)) {
    state.isWatchPage = isWatch(current);
  }
};

let pathCheckInterval = pathChecker(window, onPathChange, 1000);
