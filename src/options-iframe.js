/*
 * Copyright Adam Pritchard 2015
 * MIT License : http://adampritchard.mit-license.org/
 */

function onLoad() {
  window.LOAD_MARKDOWN_HERE_CONTENT_SCRIPT = true;
  var contentscript = document.createElement('script');
  contentscript.src = 'composescript.js';
  document.body.appendChild(contentscript);

  // The body of the iframe needs to have a (collapsed) selection range for
  // Markdown Here to work (simulating focus/cursor).
  var range = document.createRange();
  range.setStart(document.body, 0);
  var sel = document.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);

  // This is an asynchrous call that must complete before we notify the parent
  // window that we've completed loading.
  localize();
}
document.addEventListener('DOMContentLoaded', onLoad, false);


// Basically copied from options.js
function localize() {
  Utils.registerStringBundleLoadListener(function localizeHelper() {
      const elements = document.querySelectorAll("[data-i18n]");
      elements.forEach(el => {
        const messageId = `options_page__${el.getAttribute("data-i18n")}`;
        const message = Utils.getMessage(messageId);
        if (el.tagName.toUpperCase() === "TITLE") {
          el.innerText = message;
        } else {
          Utils.saferSetInnerHTML(el, message);
        }
      });

    notifyIframeLoaded();
  });
}


function notifyIframeLoaded() {
  // Let our owner page know that we've loaded.
  var e = top.document.createEvent('HTMLEvents');
  e.initEvent('options-iframe-loaded', true, true);
  top.document.dispatchEvent(e);
}
