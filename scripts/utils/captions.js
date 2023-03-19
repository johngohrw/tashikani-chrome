import {
  YOUTUBE_CAPTION_CONTAINER_ID,
  YOUTUBE_CAPTION_SEGMENT_CLASS,
  YOUTUBE_CAPTION_TOP,
} from "../globals.js";
import { debug } from "./index.js";

export function hijackCaptions(callback) {
  const observerConfig = {
    childList: true,
    subtree: true,
  };

  const targetNode = document.getElementById(YOUTUBE_CAPTION_CONTAINER_ID);
  const observer = new MutationObserver((mutationList, observer) => {
    mutationList.forEach((mutation) => {
      const classList = Array.from(mutation.target.classList);
      if (
        classList.includes(YOUTUBE_CAPTION_SEGMENT_CLASS) &&
        !Array.from(mutation.target.offsetParent?.classList || []).includes(
          YOUTUBE_CAPTION_TOP
        )
      ) {
        // Disconnect it temporarily while we make changes to the observed element.
        // An infinite loop will occur otherwise.
        observer.disconnect();
        // Process mutations
        callback(mutation.target);
        // Re-observe the element.
        observer.observe(targetNode, observerConfig);
      }
    });
  });

  observer.observe(targetNode, observerConfig);
  return observer;
}

export function colorfulCaptions() {
  debug("colorfulCaptions", "start hijacking");
  return hijackCaptions((captionEl) => {
    const colors = [
      "#ff4e31",
      "#ffb100",
      "yellow",
      "#5be35b",
      "#60b8f7",
      "#ad7aff",
      "#e65fff",
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

export function highlightableCaptions() {
  debug("highlightableCaptions", "start hijacking");
  return hijackCaptions((captionEl) => {
    console.log(captionEl);
  });
}
