import {
  TASHIKANI_MENU_ITEM_ID,
  TASHIKANI_MENU_ITEM_LABEL,
  YOUTUBE_CAPTION_CONTAINER_ID,
  YOUTUBE_CAPTION_SEGMENT_CLASS,
  YOUTUBE_CAPTION_TOP,
  YOUTUBE_PLAYER_PANEL_MENU_CLASS,
  YOUTUBE_SETTINGS_MENU_BUTTON,
  YOUTUBE_SETTINGS_MENU_CONTAINER,
} from "../globals.js";
import { debug, getByClass, waitForNode } from "./index.js";

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

// panel & style elements creation
function createPanel() {
  const styles = document.createElement("style");
  styles.innerHTML = `
      :root {
        --panel-bg-color: rgba(0, 0, 0, 0);
        --panel-border-color: rgba(255, 255, 255, 0);
      }
      .hijacked-captions__panel {
        width: 100%;
        height: 100%;
        background: var(--panel-bg-color);
        border: 1px solid var(--panel-border-color);
        mix-blend-mode: exclusion;
        filter: brightness(2);
        border-radius: 4px;    
        z-index: 10;
        position: absolute;
        top: 0px;
        left: 0px;
  
        padding: 1.5rem 1.5rem;
      }
      .hijacked-captions__panel-title {
        font-size: 2.5rem;
        font-weight: 600;
        margin-bottom: 1rem;
        filter: hue-rotate(180deg);
      }
      .hijacked-captions__panel-description {
        font-size: 1.5rem;
      }
    `;
  const panel = document.createElement("div");
  panel.classList.add("hijacked-captions__panel");
  const titleEl = document.createElement("div");
  titleEl.classList.add("hijacked-captions__panel-title");
  panel.appendChild(titleEl);
  const descriptionEl = document.createElement("div");
  descriptionEl.classList.add("hijacked-captions__panel-description");
  panel.appendChild(descriptionEl);
  return [panel, styles]
}

function createCaptions() {
  // template element for caption word segment.
  const captionEl = document.createElement("span");
  captionEl.classList.add("hijacked-captions__word");

  const styles = document.createElement("style");
  styles.innerHTML = `
  :root {
    --hover-bg-color: white;
  }
  .hijacked-captions__word {
    transition-duration: 200ms;
  }
  .hijacked-captions__word:hover {
    color: #7ed0ff;
  }
`;

  return [captionEl, styles]
}

export function highlightableCaptions() {
  debug("highlightableCaptions", "start hijacking");

  function wordHover(event) {
    console.log(event.target.innerText);
    getByClass("hijacked-captions__panel-title").innerText =
      event.target.innerText;
    getByClass(
      "hijacked-captions__panel-description"
    ).innerText = `description for ${event.target.innerText}`;
  }

  // hooking up captions to DOM
  const [captionTemplate, captionStyles] = createCaptions()
  document.body.appendChild(captionStyles);

  // hooking up panel to DOM
  const [panel, panelStyles] = createPanel()
  document.getElementById(YOUTUBE_CAPTION_CONTAINER_ID).appendChild(panel);
  document.body.appendChild(panelStyles);

  // inject menu item (only if it doesnt exist yet)
  if (!document.getElementById(TASHIKANI_MENU_ITEM_ID)) {
    menuItemInjection()
  }

  return hijackCaptions((captionEl) => {
    //TODO: very naive word splitting implementation here
    const captionWords = captionEl.innerText
      .split(" ")
      .filter((word) => word !== "");
    captionEl.innerText = "";
    captionWords.forEach((word, _index) => {
      const el = captionTemplate.cloneNode(true);
      el.innerText = `${word}${_index < captionWords.length && " "}`;
      el.onmouseover = wordHover;
      captionEl.appendChild(el);
    });
  });
}

// export function hijackCaptions(callback) {
//   const observerConfig = {
//     childList: true,
//     subtree: true,

//   };

//   const targetNode = document.getElementById(YOUTUBE_CAPTION_CONTAINER_ID);
//   const observer = new MutationObserver((mutationList, observer) => {
//     mutationList.forEach((mutation) => {
//       const classList = Array.from(mutation.target.classList);
//       if (
//         classList.includes(YOUTUBE_CAPTION_SEGMENT_CLASS) &&
//         !Array.from(mutation.target.offsetParent?.classList || []).includes(
//           YOUTUBE_CAPTION_TOP
//         )
//       ) {
//         // Disconnect it temporarily while we make changes to the observed element.
//         // An infinite loop will occur otherwise.
//         observer.disconnect();
//         // Process mutations
//         callback(mutation.target);
//         // Re-observe the element.
//         observer.observe(targetNode, observerConfig);
//       }
//     });
//   });

//   observer.observe(targetNode, observerConfig);
//   return observer;
// }

function handleShowSettings(e) {
  console.log("show settings > ", e)
}

function menuItemInjection() {
  nodeCheckInterval = waitForNode({
    document,
    className: YOUTUBE_PLAYER_PANEL_MENU_CLASS,
    callback: (elements) => {
      if (elements.length > 0) {
        injectMenuItem(elements[0])
      } else {
        console.error("failed to find class", YOUTUBE_PLAYER_PANEL_MENU_CLASS)
      }
    },
    checkInterval: 250
  });
}

function injectMenuItem(targetNode) {
  debug("injectMenuItem", "observer started, getting ready to inject");

  const observerConfig = {
    attributes: true
  };
  const observer = new MutationObserver((mutationList, observer) => {
    let shouldSkip = false
    mutationList.forEach(mutation => {
      if (!shouldSkip && mutation.type === "attributes" && mutation.attributeName === "style") {
        // done observing.
        observer.disconnect()
        shouldSkip = true

        // clone from existing menu item
        const newMenuItem = mutation.target.childNodes[0].cloneNode(true)
        const newMenuHeight = mutation.target.clientHeight + mutation.target.childNodes[0].clientHeight

        // remove unnecessary attributes
        newMenuItem.removeAttribute("role")
        newMenuItem.removeAttribute("aria-checked")
        newMenuItem.removeAttribute("aria-haspopup")
        newMenuItem.removeAttribute("tabindex")
        newMenuItem.id = TASHIKANI_MENU_ITEM_ID

        // alter cloned menu item node
        newMenuItem.childNodes[0].innerHTML = tashikaniIconString
        newMenuItem.childNodes[1].innerText = TASHIKANI_MENU_ITEM_LABEL
        newMenuItem.childNodes[1].setAttribute("style", "white-space: nowrap")
        newMenuItem.childNodes[2].innerHTML = ""
        newMenuItem.onclick = (e) => {
          handleShowSettings(e)
          console.log(document.getElementsByClassName(YOUTUBE_SETTINGS_MENU_BUTTON))
          document.getElementsByClassName(YOUTUBE_SETTINGS_MENU_BUTTON)[0].click()
        }

        // append new menu item
        mutation.target.appendChild(newMenuItem)

        // alter parent container height to prevent scrollbar
        // mutation.target.style.height = `${newMenuHeight}px`
        // mutation.target.parentNode.style.height = `${newMenuHeight}px`
        // mutation.target.parentNode.parentNode.style.height = `${newMenuHeight}px`

      }
    })
  })
  observer.observe(targetNode, observerConfig);
}

const tashikaniIconString = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <text fill="white" xml:space="preserve" style="white-space: pre" font-family="Inter" font-size="20"
        letter-spacing="0em">
        <tspan x="2" y="19.2727">&#x78ba; </tspan>
    </text>
  </svg>`