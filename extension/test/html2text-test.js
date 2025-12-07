import { degausser } from "../vendor/degausser.esm.js"

const content = document.querySelector("#content")

const degaussered = degausser(content)
document.querySelector("#degaussered").innerText = degaussered

const mailext = await messenger.messengerUtilities.convertToPlainText(content.innerHTML, {
  flowed: false,
})
document.querySelector("#mailext").innerText = mailext
