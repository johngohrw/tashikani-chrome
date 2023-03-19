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

export function pathChecker({
  window,
  callback,
  checkInterval = 500,
  initialFire = false,
}) {
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

export function waitForNodePromise({
  document,
  className,
  id,
  checkInterval = 100,
  timeout = null,
}) {
  return new Promise((resolve, reject) => {
    let startTime = new Date().getTime();
    debug(
      "waitForNodePromise",
      `waiting for ${id ? "#" : ""}${id ?? ""}${id && className ? " or " : ""}${
        className ? "." : ""
      }${className ?? ""}`
    );
    const checker = setInterval(() => {
      const queriedNode =
        (id && document.getElementById(id)) ||
        (className && document.getElementsByClassName(className));
      if (queriedNode) {
        debug("waitForNodePromise", id || className, "(done)", queriedNode);
        clearInterval(checker);
        resolve(queriedNode);
      }
      if (timeout && new Date().getTime() - startTime > timeout) {
        error("waitForNodePromise", id || className, "(timeout)");
        clearInterval(checker);
        reject();
      }
    }, checkInterval);
  });
}

export function waitForNode({
  document,
  className = null,
  id,
  checkInterval = 100,
  timeout = null,
  callback,
}) {
  let startTime = new Date().getTime();
  debug(
    "waitForNode",
    `waiting for ${id ? "#" : ""}${id ?? ""}${id && className ? " or " : ""}${
      className ? "." : ""
    }${className ?? ""}`
  );
  const checker = setInterval(() => {
    const queriedNode =
      (id && document.getElementById(id)) ||
      (className && document.getElementsByClassName(className));
    if (queriedNode) {
      debug("waitForNode", id || className, "(done)", queriedNode);
      clearInterval(checker);
      callback(queriedNode);
    }
    if (timeout && new Date().getTime() - startTime > timeout) {
      error("waitForNode", id || className, "(timeout)");
      clearInterval(checker);
    }
  }, checkInterval);
  return checker;
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
        resolve(true);
      }
      if (new Date().getTime() - startTime > timeoutDuration) {
        error("injectScript", src, "(timeout)");
        clearInterval(checker);
        reject();
      }
    }, 50);
  });
}
