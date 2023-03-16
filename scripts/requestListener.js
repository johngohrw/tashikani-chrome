import { timedTextInterception } from "./utils.js";

console.log("> requestListener.js");

function openInterceptor(url, regex, callback) {
  if (RegExp(regex).test(url)) {
    callback(url);
  }
}

let _open = window.XMLHttpRequest.prototype.open,
  _send = window.XMLHttpRequest.prototype.send;

function openReplacement(method, url, async, user, password) {
  this._url = url;
  openInterceptor(url, /timedtext/g, (url) => {
    timedTextInterception(url);
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
