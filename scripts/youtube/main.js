import { debug, getFullPathString, isWatch, pathChecker } from "../utils.js";

export const initialState = {
  isWatchPage: isWatch(getFullPathString(window)),
};

let state = new Proxy(initialState, {
  set(obj, prop, value) {
    if (prop === "isWatchPage" && value) {
      debug("isWatchPage", value);
    }
    // debug("state set handler", `prop: ${prop}, value: ${value}`);
    return Reflect.set(...arguments);
  },
});

const onPathChange = function (current, previous) {
  debug("onPathChange", current);
  if (state.isWatchPage !== isWatch(current)) {
    state.isWatchPage = isWatch(current);
  }
};

let pathCheckInterval = pathChecker(window, onPathChange, 1000);
