const content = document.querySelector("#content")

const mailext = await messenger.messengerUtilities.convertToPlainText(content.innerHTML, {
  flowed: false,
})
document.querySelector("#mailext").innerText = mailext
