import { debug, isWatch, pathChecker } from "../utils.js";

const onPathChange = function (current, previous) {
  debug("onPathChange", current);
  if (state.isWatchPage !== isWatch(current)) {
    state.isWatchPage = isWatch(current);
  }
};

const pathCheckInterval = pathChecker(window, onPathChange, 500);
