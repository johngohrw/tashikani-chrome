console.log("networkListener");

let _open = window.XMLHttpRequest.prototype.open,
  _send = window.XMLHttpRequest.prototype.send;

function openReplacement(method, url, async, user, password) {
  this._url = url;
  console.log("url > ", url);
  return _open.apply(this, arguments);
}

function sendReplacement(data) {
  if (this.onreadystatechange) {
    this._onreadystatechange = this.onreadystatechange;
  }

  console.log("Request sent");

  this.onreadystatechange = onReadyStateChangeReplacement;
  return _send.apply(this, arguments);
}

function onReadyStateChangeReplacement() {
  console.log("Ready state changed to: ", this.readyState);

  if (this._onreadystatechange) {
    return this._onreadystatechange.apply(this, arguments);
  }
}

window.XMLHttpRequest.prototype.open = openReplacement;
window.XMLHttpRequest.prototype.send = sendReplacement;

var request = new XMLHttpRequest();
request.open("GET", ".", true);
request.send();
