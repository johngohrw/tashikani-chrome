(async () => {
  const src = chrome.runtime.getURL("scripts/utils.js");
  const { debug, injectScript } = await import(src);

  // check for completion of script injection
  const completion = new Proxy(
    {
      requestListener: false,
    },
    {
      set(obj, prop, value) {
        const mutation = {};
        mutation[prop] = value;
        const _obj = { ...obj, ...mutation };
        if (Object.values(_obj).every((v) => v === true)) {
          debug(
            "completion",
            "all prerequisite scripts injected. invoking main.js"
          );
          injectScript("scripts/youtube/main.js");
        }
        return Reflect.set(...arguments);
      },
    }
  );

  // start script injection
  injectScript("scripts/requestListener.js").then(() => {
    completion["requestListener"] = true;
  });
})();
