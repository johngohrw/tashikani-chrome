import { interceptRequests } from "../utils/requestListener.js";
import { debug, isWatch, pathChecker, waitForNode } from "../utils/index.js";
import { colorfulCaptions, highlightableCaptions } from "../utils/captions.js";
import { YOUTUBE_CAPTION_CONTAINER_ID } from "../globals.js";

const captionData = {};

function onCaptionLoad(request, paramsObj) {
  const incomingCaption = {};
  incomingCaption[paramsObj.lang] = JSON.parse(request.response);
  const videoHasEntry = Object.prototype.hasOwnProperty.call(
    captionData,
    paramsObj.v
  );
  captionData[paramsObj.v] = videoHasEntry
    ? { ...captionData[paramsObj.v], ...incomingCaption }
    : incomingCaption;

  debug("onCaptionLoad", `(${paramsObj.v}, ${paramsObj.lang})`, captionData);
}

interceptRequests({
  timedText: {
    regex: /timedtext/g,
    callback: (request) => {
      const reqURL = new URL(request._url);
      const paramsObj = Array.from(reqURL.searchParams).reduce(
        (acc, [key, value]) => {
          acc[key] = value;
          return acc;
        },
        {}
      );
      request.onload = () => {
        if (request.readyState === 4 && request.status === 200) {
          onCaptionLoad(request, paramsObj);
        }
      };
    },
  },
});

let nodeCheckInterval, captionsObserver;
const onPathChange = function (current, previous) {
  // debug("onPathChange", "current path:", current);

  // clear previous interval
  if (nodeCheckInterval) {
    debug("onPathChange", "nodeCheckInterval cleared");
    clearInterval(nodeCheckInterval);
    nodeCheckInterval = null;
  }

  // disconnect captions observer if still connected
  if (captionsObserver) {
    debug("onPathChange", "captionsObserver cleared (stopped hijacking)");
    captionsObserver.disconnect();
    captionsObserver = null;
  }

  // check for window container
  if (isWatch(current)) {
    // console.log("watch!");
    nodeCheckInterval = waitForNode({
      document,
      id: YOUTUBE_CAPTION_CONTAINER_ID,
      callback: (element) => {
        captionsObserver = highlightableCaptions();
      },
    });
  } else {
    // console.log("not watch...");
  }
};

const pathCheckInterval = pathChecker({
  window,
  callback: onPathChange,
  checkInterval: 500,
  initialFire: true,
});
