console.log("service worker: background.js is running!");


async function getCurrentTab() {
  let queryOptions = { active: true, lastFocusedWindow: true };
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}

async function injectScript(tabId) {
  console.log("inject!")
  await chrome.scripting
    .executeScript({
      target: { tabId },
      files: ["scripts/networkListenScript.js"],
    })
    .then(() => console.log("script injected"));
}

getCurrentTab().then((result) => {
  console.log("result", result)
  console.log("result.id", result.id)
  if (result?.id) injectScript(result.id)
})


