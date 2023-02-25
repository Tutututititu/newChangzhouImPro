var audioInputSelect = document.querySelector("select#audioSource");
var audioOutputSelect = document.querySelector("select#audioOutput");
var videoSelect = document.querySelector("select#videoSource");
var selectors = [audioInputSelect, audioOutputSelect, videoSelect];
function gotDevices(deviceInfos) {
  // Handles being called several times to update labels. Preserve values.
  let values = selectors.map(select => select.value);
  selectors.forEach(select => {
    while (select.firstChild) {
      select.removeChild(select.firstChild);
    }
  });
  for (let i = 0; i !== deviceInfos.length; ++i) {
    let deviceInfo = deviceInfos[i];
    let option = document.createElement("option");
    option.value = deviceInfo.deviceId;
    if (deviceInfo.kind === "audioinput") {
      option.text = deviceInfo.label || `microphone ${audioInputSelect.length + 1}`;
      audioInputSelect.appendChild(option);
    } else if (deviceInfo.kind === "audiooutput") {
      option.text = deviceInfo.label || `speaker ${audioOutputSelect.length + 1}`;
      audioOutputSelect.appendChild(option);
    } else if (deviceInfo.kind === "videoinput") {
      option.text = deviceInfo.label || `camera ${videoSelect.length + 1}`;
      videoSelect.appendChild(option);
    } else {
      console.log("Some other kind of source/device: ", deviceInfo);
    }
  }
  selectors.forEach((select, selectorIndex) => {
    if (Array.prototype.slice.call(select.childNodes).some(n => n.value === values[selectorIndex])) {
      select.value = values[selectorIndex];
    }
  });
}

function handleError(error) {
  console.log("navigator.getUserMedia error: ", error);
}

if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
  navigator.mediaDevices.getUserMedia({ audio: true, video: true }).then(stream => {
    stream.getTracks().forEach(t => t.stop());
    fillDeviceList.call(this);
  }).catch(err => {
    console.log(err)
  });
}

function fillDeviceList() {
  navigator.mediaDevices.enumerateDevices().then(gotDevices).catch(handleError);
}
