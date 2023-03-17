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

  const targetNode = document.getElementById("ytp-caption-window-container");
  const observer = new MutationObserver((mutationList, observer) => {
    for (const mutation of mutationList) {
      const classList = Array.from(mutation.target.classList);
      if (classList.includes("ytp-caption-segment")) {
        const captionEl = mutation.target;

        // Disconnect it temporarily while we make changes to the observed element.
        // An infinite loop will occur otherwise.
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

        // Re-observe the element.
        observer.observe(targetNode, observerConfig);
      }
    }
  });

  observer.observe(targetNode, observerConfig);
}, 3000);
