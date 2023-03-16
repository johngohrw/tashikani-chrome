import { debug, isWatch, pathChecker } from "../utils.js";

const onPathChange = function (current, previous) {
  debug("onPathChange", current);
  if (isWatch(current)) {
    console.log("watch!");
  } else {
    console.log("not watch...");
  }
};

const pathCheckInterval = pathChecker(window, onPathChange, 500, true);
