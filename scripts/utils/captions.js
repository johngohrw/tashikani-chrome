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

  function getByClass(className) {
    return document.getElementsByClassName(className)[0];
  }

  function wordHover(event) {
    console.log(event.target.innerText);
    getByClass("hijacked-captions__panel-title").innerText =
      event.target.innerText;
    getByClass(
      "hijacked-captions__panel-description"
    ).innerText = `description for ${event.target.innerText}`;
  }

  const styles = document.createElement("style");
  styles.innerHTML = `
    :root {
      --hover-bg-color: white;
      --panel-bg-color: rgba(0, 0, 0, 0);
      --panel-border-color: rgba(255, 255, 255, 0);
    }
    .hijacked-captions__word {
      transition-duration: 200ms;
    }
    .hijacked-captions__word:hover {
      color: #7ed0ff;
    }
    #ytp-caption-window-container,
    #ytp-caption-window-container * {
      box-sizing: border-box;
    }
    .hijacked-captions__panel {
      width: clamp(0px, calc(100% - 20px), 600px);
      height: 300px;
      background: var(--panel-bg-color);
      border: 1px solid var(--panel-border-color);
      mix-blend-mode: exclusion;
      border-radius: 4px;    
      z-index: 10;
      position: absolute;
      top: 10px;
      left: 10px;

      padding: 1rem 1rem;
    }
    .hijacked-captions__panel-title {
      font-size: 2.5rem;
      font-weight: 600;
      margin-bottom: 1rem;
    }
    .hijacked-captions__panel-description {
      font-size: 1.5rem;
    }
  `;

  document.body.appendChild(styles);

  // template element for caption word segment.
  const template = document.createElement("span");
  template.classList.add("hijacked-captions__word");

  // panel elements creation
  const panel = document.createElement("div");
  panel.classList.add("hijacked-captions__panel");
  const titleEl = document.createElement("div");
  titleEl.classList.add("hijacked-captions__panel-title");
  panel.appendChild(titleEl);
  const descriptionEl = document.createElement("div");
  descriptionEl.classList.add("hijacked-captions__panel-description");
  panel.appendChild(descriptionEl);

  // append panel to video caption overlay
  document.getElementById(YOUTUBE_CAPTION_CONTAINER_ID).appendChild(panel);

  return hijackCaptions((captionEl) => {
    //TODO: very naive word splitting implementation here
    const captionWords = captionEl.innerText.split(" ");
    captionEl.innerText = "";
    captionWords.forEach((word, _index) => {
      const el = template.cloneNode(true);
      el.innerText = `${word}${_index < captionWords.length && " "}`;
      el.onmouseover = wordHover;
      captionEl.appendChild(el);
    });
  });
}
