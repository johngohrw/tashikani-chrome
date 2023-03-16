console.log("service worker: background.js is running!");

function getTabId() { ... }

chrome.scripting
  .executeScript({
    target: { tabId: getTabId() },
    files: ["scripts/networkListenScript.js"],
  })
  .then(() => console.log("script injected"));

function reddenPage() {
  console.log("redden!");
  document.body.style.backgroundColor = "red";
}

chrome.action.onClicked.addListener((tab) => {
  console.log("action.onclicked > tab:", tab);
  if (!tab.url.includes("chrome://")) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: reddenPage,
    });
  }
});
