/*
 * Copyright JFX 2021-2023
 * MIT License
 * https://gitlab.com/jfx2006
 */

// ----------------- Locale Maker ----------------------
// Files are saved through download links, named <locale>_messages.json
// localStorage.setItem('dark', 'true') for Dark theme

class LocaleMaker {
  constructor() {
    // --- Light/Dark Theme
    document.body.classList.toggle("dark", localStorage.getItem("dark") === "true")

    this.setDefault = this.setDefault.bind(this)
    this.import = this.import.bind(this)
    this.export = this.export.bind(this)
    this.exportAll = this.exportAll.bind(this)

    this.trTemplate = document.querySelector("template").content.firstElementChild
    this.tbody = document.querySelector("tbody")
    this.footer = document.querySelector("tfoot td")

    // --- import/export
    document.getElementById("import").addEventListener("change", this.import)
    document.getElementById("export").addEventListener("click", this.export)
    document.getElementById("exportAll").addEventListener("click", this.exportAll)

    // --- help popup
    const details = document.querySelector("details")
    document.body.addEventListener(
      "click",
      (e) => !details.contains(e.explicitOriginalTarget) && (details.open = false)
    )

    // --- i18n
    this.select = document.querySelector("#locale")
    this.locales = {}

    // load default locale
    this.defaultLocale = browser.runtime.getManifest().default_locale
    if (!this.defaultLocale) {
      this.notify('"default_locale" is not set')
    } else {
      fetch(`/_locales/${this.defaultLocale}/messages.json`)
        .then((response) => response.json())
        .then((data) => this.setDefault(data))
        .catch((error) =>
          this.notify(`"default_locale" ${this.defaultLocale} is not available. ${error.message}`)
        )
    }

    // load other locales
    ;[...this.select.options].forEach((item) => {
      if (!item.value) {
        return
      }

      const lang = item.value
      if (lang === this.defaultLocale) {
        item.prepend("\u2705 ")
        return
      }

      fetch(`/_locales/${lang}/messages.json`)
        .then((response) => response.json())
        .then((jsn) => {
          item.prepend("✔ ")
          this.locales[lang] = jsn
        })
        .catch(() => {}) // suppress error
    })

    // add select listener
    this.select.addEventListener("change", (e) => {
      if (!e.target.value) {
        return
      }
      this.footer.textContent = "" // reset
      const lang = e.target.value
      this.locales[lang]
        ? this.setLocale(this.locales[lang])
        : this.notify(`"${lang}" is not available.`)
    })
  }

  escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\\/]/g, "\\$&")
  }

  setDefault(data) {
    this.default = JSON.parse(JSON.stringify(data))
    const docfrag = document.createDocumentFragment()

    let item
    for (item of Object.keys(data)) {
      if (item === "extensionName") {
        document.title += " - " + data[item].message
        return // keep extension name
      }
      if (item === "__WET_LOCALE__") {
        continue
      }
      const tr = this.trTemplate.cloneNode(true)
      if (item.startsWith("__WET_GROUP__")) {
        tr.children[0].textContent = this.showSpecial(data[item].message)
        tr.children[0].classList.add("group_header")
        tr.children[1].children[0].remove()
      } else {
        tr.children[0].textContent = this.showSpecial(data[item].message)
        if (data[item].description) {
          tr.children[0].title = data[item].description
        }
        tr.children[1].children[0].id = item
        tr.children[1].children[0].setAttribute(
          "pattern",
          this.showSpecial(this.escapeRegExp(data[item].message))
        )
      }
      docfrag.appendChild(tr)
    }
    this.tbody.appendChild(docfrag)

    this.inputs = document.querySelectorAll("td input")

    // --- paste multiple 3+ lines
    document.body.addEventListener("paste", (e) => {
      const text = e.clipboardData.getData("text/plain")
      const lines = text.split(/[\r\n]+/)
      if (lines.length > 3) {
        e.preventDefault()
        const idx = [...document.querySelectorAll("td input")].indexOf(document.activeElement)
        this.inputs.forEach(
          (item, index) => index >= idx && lines[0] && (item.value = lines.shift().trim())
        )
      }
    })
  }

  setLocale(data) {
    this.inputs.forEach(
      (item) => (item.value = data[item.id] ? this.showSpecial(data[item.id].message) : "")
    )
  }

  showSpecial(str) {
    return JSON.stringify(str).slice(1, -1)
  }

  import(e) {
    this.footer.textContent = "" // reset
    const file = e.target.files[0]
    switch (true) {
      case !file:
        this.notify("There was an error with the operation.")
        return

      case !["text/plain", "application/json"].includes(file.type): // check file MIME type
        this.notify("Unsupported File Format.")
        return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      try {
        this.setLocale(JSON.parse(reader.result))
      } catch (e) {
        // Parse JSON
        this.notify(e.message)
      } // display the error
    }
    reader.onerror = () => this.notify("There was an error with reading the file.")
    reader.readAsText(file)
  }

  export() {
    if (!this.default) {
      return
    }

    let data = JSON.parse(JSON.stringify(this.default))
    this.inputs.forEach(
      (item) => item.value && (data[item.id].message = JSON.parse(`"${item.value}"`))
    )
    const filename = this.select.value ? this.select.value + "/messages.json" : "messages.json"
    const saveData = JSON.stringify(data)
    this.saveFile({ data: saveData, filename })
  }

  exportAll() {
    if (!this.default) {
      return
    }

    const defaultString = JSON.stringify(this.default)
    const data = JSON.parse(defaultString) // deep clone
    const filename = `${this.defaultLocale}/messages.json`
    this.saveFile({ data, filename }) // save default locale

    Object.entries(this.locales).forEach(([lang, thisLang]) => {
      let data = JSON.parse(defaultString) // deep clone
      Object.entries(thisLang).forEach(
        ([key, value]) => key !== "extensionName" && value && (data[key] = value)
      )
      const filename = `${lang}/messages.json`
      this.saveFile({ data, filename })
    })
  }

  // Saved through a download link: the downloads API would need an extra
  // permission just for this translator tool.
  saveFile({ data, filename, type = "text/plain" }) {
    const text = typeof data === "string" ? data : JSON.stringify(data, null, 2)
    const url = URL.createObjectURL(new Blob([text], { type }))
    const a = document.createElement("a")
    a.href = url
    a.setAttribute("download", filename.replaceAll("/", "_"))
    a.dispatchEvent(new MouseEvent("click"))
    setTimeout(() => URL.revokeObjectURL(url), 60000)
  }

  notify(message) {
    this.footer.textContent = "\u26a0\ufe0f " + message
  }
}
new LocaleMaker()
