(async () => {
  const src = chrome.runtime.getURL("scripts/utils.js");
  const { injectScript } = await import(src);

  injectScript("scripts/youtube/main.js");
})();
