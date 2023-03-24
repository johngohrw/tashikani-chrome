import {
  TASHIKANI_ICON_STRING,
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
      #${YOUTUBE_CAPTION_CONTAINER_ID},
      #${YOUTUBE_CAPTION_CONTAINER_ID} * {
        box-sizing: border-box;
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

// panel & style elements creation
function createSettingsPanel() {
  const styles = document.createElement("style");
  styles.innerHTML = `
      :root {
        --settings-panel-bg-color: rgba(0, 0, 0, 0.7);
        --settings-panel-border-color: rgba(255, 255, 255, 0);
      }
      #tashikani-settings__container {
        display: flex;
        flex-flow: column nowrap;
        gap: 1rem;
        overflow-y: auto;

        position: absolute;
        top: 1rem;
        right: 1rem;

        width: 400px;
        height: calc(100% - 64px - 1rem);
        padding: 1.5rem 1.5rem;

        background: var(--settings-panel-bg-color);
        backdrop-filter: blur(20px);
        border: 1px solid var(--settings-panel-border-color);
        border-radius: 12px;
        font-size: 1.5rem;

        pointer-events: all;
        z-index: 50;

        transform: translateX(0%);
        transition-duration: 500ms;
      }
      #tashikani-settings__container.paneHidden {
        transform: translateX(calc(100% + 1rem));
      }
    `;
  const panel = document.createElement("div");
  panel.id = "tashikani-settings__container"
  panel.classList.add("paneHidden")
  panel.paneHidden = true

  populateSettings(panel, {
    title: {
      tag: "h4",
      innerHTML: `Tashikani Settings`,
      style: `
        font-size: 2.5rem;
      `
    },
    description: {
      tag: "p",
      innerHTML: `settings for Tashikani`,
      style: `
        padding: 0 0 1rem;
      `
    },
    field1: {
      tag: "p",
      innerHTML: `sample field 1`
    },
    field2: {
      tag: "p",
      innerHTML: `sample field 2`
    },
    field3: {
      tag: "p",
      innerHTML: `sample field 3`
    },
    field4: {
      tag: "p",
      innerHTML: `sample field 4`
    },
    field5: {
      tag: "p",
      innerHTML: `sample field 5`
    },
    field6: {
      tag: "p",
      innerHTML: `sample field 6`
    },
    field7: {
      tag: "p",
      innerHTML: `sample field 7`
    },
    field8: {
      tag: "p",
      innerHTML: `sample field 8`
    },
    field9: {
      tag: "p",
      innerHTML: `sample field 9`
    },
  })

  return [panel, styles]
}

function populateSettings(containerEl, fields) {
  Object.entries(fields).forEach(([key, { tag, innerHTML, style }]) => {
    const fieldEl = document.createElement(tag)
    fieldEl.innerHTML = innerHTML
    fieldEl.style = style
    containerEl.appendChild(fieldEl);
  })
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



  // hooking up settings panel to DOM
  const [settingsPanel, settingsPanelStyles] = createSettingsPanel()
  document.getElementById(YOUTUBE_CAPTION_CONTAINER_ID).appendChild(settingsPanel);
  document.body.appendChild(settingsPanelStyles);

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


function handleShowSettings(e) {
  console.log("show settings > ", e)
  const settingsPane = document.getElementById("tashikani-settings__container")
  if (settingsPane.paneHidden) {
    settingsPane.classList.remove("paneHidden")
    settingsPane.paneHidden = false
  } else {
    settingsPane.classList.add("paneHidden")
    settingsPane.paneHidden = true
  }
}

function menuItemInjection() {
  const nodeCheckInterval = waitForNode({
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
  return nodeCheckInterval
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
        // const newMenuHeight = mutation.target.clientHeight + mutation.target.childNodes[0].clientHeight

        // remove unnecessary attributes
        newMenuItem.removeAttribute("role")
        newMenuItem.removeAttribute("aria-checked")
        newMenuItem.removeAttribute("aria-haspopup")
        newMenuItem.removeAttribute("tabindex")
        newMenuItem.id = TASHIKANI_MENU_ITEM_ID

        // alter cloned menu item node
        newMenuItem.childNodes[0].innerHTML = TASHIKANI_ICON_STRING
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

