import {
  haltInterception,
  interceptRequests,
} from "../utils/requestListener.js";
import { debug, isWatch, pathChecker, waitForNode } from "../utils/index.js";

const YOUTUBE_CAPTION_CONTAINER_ID = "ytp-caption-window-container";
const YOUTUBE_CAPTION_SEGMENT_CLASS = "ytp-caption-segment";

function hijackCaptions(callback) {
  debug("hijackCaptions", "started");
  const observerConfig = {
    childList: true,
    subtree: true,
  };

  const targetNode = document.getElementById(YOUTUBE_CAPTION_CONTAINER_ID);
  const observer = new MutationObserver((mutationList, observer) => {
    for (const mutation of mutationList) {
      const classList = Array.from(mutation.target.classList);
      if (classList.includes(YOUTUBE_CAPTION_SEGMENT_CLASS)) {
        const captionEl = mutation.target;

        // Disconnect it temporarily while we make changes to the observed element.
        // An infinite loop will occur otherwise.
        observer.disconnect();

        callback(captionEl);

        // Re-observe the element.
        observer.observe(targetNode, observerConfig);
      }
    }
  });

  observer.observe(targetNode, observerConfig);

  function stopHijack() {
    debug("hijackCaptions", "stopped");
    observer.disconnect();
  }

  return [observer, stop];
}

function colorfulCaptions() {
  return hijackCaptions((captionEl) => {
    const colors = [
      "red",
      "orange",
      "yellow",
      "green",
      "lightblue",
      "purple",
      "pink",
    ];

    const captionString = captionEl.innerText.split("");
    captionEl.innerText = "";
    captionString.forEach((char, _index) => {
      const el = document.createElement("span");
      el.style = `color: ${colors[_index % colors.length]}`;
      el.innerText = char;
      captionEl.appendChild(el);
    });
  });
}

let nodeCheckInterval, captionsObserver, stopper;

const onPathChange = function (current, previous) {
  debug("onPathChange", "current path:", current);

  // clear previous interval
  if (nodeCheckInterval) {
    console.log("nodecheck cleared!");
    clearInterval(nodeCheckInterval);
    nodeCheckInterval = null;
  }

  // disconnect captions observer if still connected
  if (captionsObserver) {
    captionsObserver.disconnect();
    captionsObserver = null;
  }

  // check for window container
  if (isWatch(current)) {
    console.log("watch!");
    nodeCheckInterval = waitForNode({
      document,
      id: YOUTUBE_CAPTION_CONTAINER_ID,
      callback: (element) => {
        console.log("found!", element);
        [captionsObserver, stopper] = colorfulCaptions();
      },
    });
  } else {
    console.log("not watch...");
  }
};

interceptRequests({
  timedText: {
    regex: /timedtext/g,
    callback: (request) => console.log("timedtext!", request),
  },
});

haltInterception();

const pathCheckInterval = pathChecker(window, onPathChange, 500, true);
