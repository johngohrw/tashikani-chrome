console.log("service worker: background.js is running!");

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
