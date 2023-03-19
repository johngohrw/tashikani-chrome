import {
  haltInterception,
  interceptRequests,
} from "../utils/requestListener.js";
import { debug, isWatch, pathChecker, waitForNode } from "../utils/index.js";

const YOUTUBE_CAPTION_CONTAINER_ID = "ytp-caption-window-container";
const YOUTUBE_CAPTION_SEGMENT_CLASS = "ytp-caption-segment";
const YOUTUBE_CAPTION_TOP = "ytp-caption-window-top";
const YOUTUBE_CAPTION_BOTTOM = "ytp-caption-window-bottom";

function hijackCaptions(callback) {
  const observerConfig = {
    childList: true,
    // subtree: true,
  };

  const targetNode = document.getElementById(YOUTUBE_CAPTION_CONTAINER_ID);
  const observer = new MutationObserver((mutationList, observer) => {
    // console.log(">", mutationList);
    mutationList.forEach((mutation) => {
      // console.log("a>", mutation);
      const addedNodes = Array.from(mutation.addedNodes);
      for (const captionTypeNode of addedNodes) {
        const classList = Array.from(captionTypeNode.classList);
        if (classList.includes(YOUTUBE_CAPTION_BOTTOM)) {
          console.log(captionTypeNode);

          const segmentObserver = new MutationObserver(
            (_mutationList, observer) => {
              _mutationList.forEach((_mutation) => {
                console.log("segment>", _mutation.target.innerText);
                const classList = Array.from(_mutation.target.classList);

                if (classList.includes(YOUTUBE_CAPTION_SEGMENT_CLASS)) {
                  const captionEl = _mutation.target;
                  // Disconnect it temporarily while we make changes to the observed element.
                  // An infinite loop will occur otherwise.
                  segmentObserver.disconnect();
                  // Process mutations
                  callback(captionEl);
                  // Re-observe the element.
                  segmentObserver.observe(captionTypeNode, {
                    childList: true,
                    subtree: true,
                  });
                }
              });
            }
          );

          console.log(
            captionTypeNode.getElementsByClassName(
              YOUTUBE_CAPTION_SEGMENT_CLASS
            )
          );
        }
      }
    });
  });

  observer.observe(targetNode, observerConfig);
  return observer;
}

function colorfulCaptions() {
  debug("colorfulCaptions", "start hijacking");
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

let nodeCheckInterval, captionsObserver;

const onPathChange = function (current, previous) {
  debug("onPathChange", "current path:", current);

  // clear previous interval
  if (nodeCheckInterval) {
    debug("onPathChange", "nodeCheckInterval cleared");
    clearInterval(nodeCheckInterval);
    nodeCheckInterval = null;
  }

  // disconnect captions observer if still connected
  if (captionsObserver) {
    debug("onPathChange", "captionsObserver cleared");
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
        captionsObserver = colorfulCaptions();
      },
    });
  } else {
    // console.log("not watch...");
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
