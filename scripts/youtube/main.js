import {
  haltInterception,
  interceptRequests,
} from "../utils/requestListener.js";
import { debug, isWatch, pathChecker } from "../utils/index.js";

class CaptionEngine {
  constructor() {
    this.url = null;
    this.active = false;
  }

  activate(url) {
    this.active = true;
    this.url = url;

    console.log(document);

    debug("CaptionEngine", "activate!", url);
  }

  deactivate() {
    if (this.active) {
      this.url = null;
      this.active = false;

      debug("CaptionEngine", "deactivate!");
    }
  }
}

const caption = new CaptionEngine();

const onPathChange = function (current, previous) {
  debug("onPathChange", current);
  if (isWatch(current)) {
    console.log("watch!");
    caption.activate(current);
  } else {
    console.log("not watch...");
    caption.deactivate();
  }
};

const pathCheckInterval = pathChecker(window, onPathChange, 500, true);

interceptRequests({
  timedText: {
    regex: /timedtext/g,
    callback: (request) => console.log("timedtext!", request),
  },
});

setTimeout(() => {
  console.log("halted");
  haltInterception();
}, 10000);

setTimeout(() => {
  console.log("started again");
  interceptRequests({
    timedText: {
      regex: /timedtext/g,
      callback: (request) => console.log("timedtext!", request),
    },
  });
}, 20000);

setTimeout(() => {
  console.log("halted again");
  haltInterception();
}, 30000);

setTimeout(() => {
  const observerConfig = {
    childList: true,
    subtree: true,
  };

  console.log("start observing");
  // Select the node that will be observed for mutations
  const targetNode = document.getElementById("ytp-caption-window-container");
  console.log(">", targetNode);

  const observer = new MutationObserver((mutationList, observer) => {
    // console.log("> ", mutationList);
    for (const mutation of mutationList) {
      if (
        Array.from(mutation.target.classList).includes("ytp-caption-segment")
      ) {
        const captionEl = mutation.target;
        // console.log("caption element!", captionEl);
        // console.log(captionEl.innerText);

        observer.disconnect();

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

        observer.observe(targetNode, observerConfig);
      }
    }
  });

  observer.observe(targetNode, observerConfig);
}, 3000);
