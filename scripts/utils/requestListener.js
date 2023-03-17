import { debug } from "./index.js";

// Request interceptor
export function interceptRequests(matchers) {
  debug("interceptRequests", "starting interception");
  function invokeIfMatch(string, matcher, xhr) {
    const { regex, callback } = matcher;
    if (RegExp(regex).test(string)) {
      callback(xhr);
    }
  }

  window.XMLHttpRequest.prototype.openOriginal =
    window.XMLHttpRequest.prototype.open;
  window.XMLHttpRequest.prototype.sendOriginal =
    window.XMLHttpRequest.prototype.send;

  let _open = window.XMLHttpRequest.prototype.open,
    _send = window.XMLHttpRequest.prototype.send;

  function openReplacement(method, url, async, user, password) {
    this._url = url;
    Object.values(matchers).forEach((matcher) => {
      invokeIfMatch(url, matcher, this);
    });
    return _open.apply(this, arguments);
  }

  function sendReplacement(body) {
    if (this.onreadystatechange) {
      this._onreadystatechange = this.onreadystatechange;
    }
    this.onreadystatechange = onReadyStateChangeReplacement;
    return _send.apply(this, arguments);
  }

  function onReadyStateChangeReplacement() {
    if (this._onreadystatechange) {
      return this._onreadystatechange.apply(this, arguments);
    }
  }

  window.XMLHttpRequest.prototype.open = openReplacement;
  window.XMLHttpRequest.prototype.send = sendReplacement;
}

export function haltInterception() {
  window.XMLHttpRequest.prototype.open =
    window.XMLHttpRequest.prototype.openOriginal;
  window.XMLHttpRequest.prototype.send =
    window.XMLHttpRequest.prototype.sendOriginal;
}
