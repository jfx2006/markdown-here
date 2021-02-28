/*
 * Copyright JFX 2021
 * MIT License
 */

/*
 * Options page UI code
 */

/* global messenger:false */

import BSN from "../vendor/bootstrap-native.esm.js"
import shortcutInput from "./shortcuts.js"

import { OptionsStore } from "./options-storage.js"

async function onOptionsLoaded() {
  const optTabs = document.getElementById("optionsTabList")
  const optTabLinks = optTabs.getElementsByTagName("a")
  Array.from(optTabLinks).map(tab => new BSN.Tab(tab, {}))

  const savedMsgToast = new BSN.Toast("#saved-msg")
    document.getElementById("saved-msg").addEventListener("shown.bs.toast",
    function(e){
      setTimeout(function() {
        savedMsgToast.hide()
      }, 5000);
  })
  // savedMsgToast.show();

  document.getElementById("copyVersionToClipboard").addEventListener('click', function (e) {
    e.preventDefault();
    e.stopPropagation();
    const copyText = document.getElementById('versionInfo').innerText;
    navigator.clipboard.writeText(copyText);
    const check = e.target.nextElementSibling;
    check.classList.add("show");
    setTimeout(function() {
      check.classList.remove("show");
    }, 5000);
  });

  if (messenger !== undefined) {
    fillSupportInfo().then();
    // fixLinks().then();
  }
  await OptionsStore.syncForm("#mdh-options-form")
}

async function fillSupportInfo() {
  const platform = await messenger.runtime.getPlatformInfo();
  const browser_info = await messenger.runtime.getBrowserInfo();
  const appManifest = messenger.runtime.getManifest();
  document.getElementById("mdhrVersion").innerText = appManifest.version;
  document.getElementById("mdhrThunderbirdVersion").innerText =
    `${browser_info.name} ${browser_info.version} ${browser_info.buildID}`;
  document.getElementById("mdhrOS").innerText = `${platform.os} ${platform.arch}`
}

async function fixLinks() {
  // Open
}

window.addEventListener('load', onOptionsLoaded)

customElements.define("hotkey-input", shortcutInput);
