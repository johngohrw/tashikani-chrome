import { IS_DEBUG } from "../globals.js";

export function error(callerContext, ...errorMessage) {
  console.error(`[${callerContext}]:`, ...errorMessage);
}

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

export function pathChecker(
  window,
  callback,
  checkInterval,
  initialFire = false
) {
  let previous = getFullPathString(window);
  let current = getFullPathString(window);
  if (initialFire) {
    callback(current, undefined);
  }
  return setInterval(() => {
    if (getFullPathString(window) !== current) {
      previous = `${current}`;
      current = getFullPathString(window);
      debug("pathChecker", `current: ${current}, prev: ${previous}`);
      callback(current, previous);
    }
  }, checkInterval);
}

export function injectScript(src) {
  let done = false;
  const s = document.createElement("script");
  s.src = chrome.runtime.getURL(src);
  s.type = "module";
  s.onload = function () {
    done = true;
    this.remove();
  };
  (document.head || document.documentElement).appendChild(s);
  return new Promise((resolve, reject) => {
    let startTime = new Date().getTime();
    const timeoutDuration = 5000;
    const checker = setInterval(() => {
      if (done) {
        debug("injectScript", src, "(done)");
        clearInterval(checker);
        resolve();
      }
      if (new Date().getTime() - startTime > timeoutDuration) {
        error("injectScript", src, "(timeout)");
        clearInterval(checker);
        reject();
      }
    }, 50);
  });
}

