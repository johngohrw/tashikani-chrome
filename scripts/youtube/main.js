import { debug, isWatch, pathChecker } from "../utils.js";


class CaptionEngine {
  constructor() {
    this.url = null
    this.active = false
  }

  activate(url) {
    this.active = true
    this.url = url

    console.log(document)

    debug("CaptionEngine", "activate!", url)
  }

  deactivate() {
    if (this.active) {
      this.url = null
      this.active = false

      debug("CaptionEngine", "deactivate!")
    }
  }
}


const caption = new CaptionEngine()


const onPathChange = function (current, previous) {
  debug("onPathChange", current);
  if (isWatch(current)) {
    console.log("watch!");
    caption.activate(current)
  } else {
    console.log("not watch...");
    caption.deactivate()
  }
};

const pathCheckInterval = pathChecker(window, onPathChange, 500, true);
