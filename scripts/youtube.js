function injectScript(src) {
  const s = document.createElement("script");
  s.src = chrome.runtime.getURL(src);
  s.type = "module";
  s.onload = function () {
    this.remove();
  };
  (document.head || document.documentElement).appendChild(s);
  return new Promise((resolve, reject) => {
    let startTime = new Date().getTime();
    const timeoutDuration = 10000;
    const checker = setInterval(() => {
      if ((document.head || document.documentElement).contains(s)) {
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

function main() {
  console.log("main");

  const initialState = {
    isWatchPage: isWatch(getFullPathString(window)),
  };

  let state = new Proxy(initialState, {
    set(obj, prop, value) {
      // console.log("changed", obj, prop, value);
      if (prop === "isWatchPage" && value) {
        activate();
      }
      debug("state set handler", `prop: ${prop}, value: ${value}`);
      return Reflect.set(...arguments);
    },
  });

  //   console.log(">", state, state.isWatchPage);

  const onPathChange = function (current, previous) {
    if (state.isWatchPage !== isWatch(current)) {
      state.isWatchPage = isWatch(current);
    }
  };

  let pathCheckInterval = pathChecker(window, onPathChange, 1000);
}

const completion = new Proxy(
  {
    requestListener: false,
    utils: false,
  },
  {
    set(obj, prop, value) {
      console.log("change >", obj, prop, value);
      if (Object.values(obj).every((v) => v === true)) {
        console.log("all done. invoking main...");
        main();
      }
      return Reflect.set(...arguments);
    },
  }
);

injectScript("scripts/requestListener.js").then(() => {
  console.log("requestListener fin");
  completion["requestListener"] = true;
});
injectScript("scripts/utils.js").then(() => {
  console.log("utils fin");
  completion["utils"] = true;
});
