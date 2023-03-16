(async () => {
  const src = chrome.runtime.getURL("scripts/utils.js");
  const { debug } = await import(src);

  function injectScript(src) {
    let done = false;
    const s = document.createElement("script");
    s.src = chrome.runtime.getURL(src);
    s.type = "module";
    s.onload = function () {
      done = true;
      this.remove();
    };
    (document.head || document.documentElement).appendChild(s);
    return new Promise((resolve, reject) => {
      let startTime = new Date().getTime();
      const timeoutDuration = 5000;
      const checker = setInterval(() => {
        if (done) {
          debug("injectScript", src, "(done)");
          clearInterval(checker);
          resolve();
        }
        if (new Date().getTime() - startTime > timeoutDuration) {
          clearInterval(checker);
          reject();
        }
      }, 50);
    });
  }

  // main running instance

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
          debug("completion", "all done, invoking main.js");
          injectScript("scripts/youtube/main.js");
        }
        return Reflect.set(...arguments);
      },
    }
  );

  injectScript("scripts/requestListener.js").then(() => {
    completion["requestListener"] = true;
  });
})();
