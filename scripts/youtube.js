function injectScript(src) {
    console.log("doc> ", document)
    const s = document.createElement('script');
    s.src = chrome.runtime.getURL(src);
    console.log(">>>", chrome.runtime.getURL(src))
    s.type = "module"
    s.onload = function () {
        this.remove();
    };
    (document.head || document.documentElement).appendChild(s);


}

injectScript('scripts/toInject.js')