var audioInputSelect = document.querySelector("select#audioSource");
var audioOutputSelect = document.querySelector("select#audioOutput");
var videoSelect = document.querySelector("select#videoSource");
var selectors = [audioInputSelect, audioOutputSelect, videoSelect];
function gotDevices(deviceInfos) {
  console.log(1);
  // Handles being called several times to update labels. Preserve values.
  let values = selectors.map(select => select.value);
  console.log(2);

  selectors.forEach(select => {
    while (select.firstChild) {
      select.removeChild(select.firstChild);
    }
  });
  console.log(3);
  window.videoTarget = [];
  alert('触发了')
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
      console.log(deviceInfo, '循环的数据', deviceInfo.toJSON());
      videoTarget.push(JSON.parse(JSON.stringify(deviceInfo)));
      option.text = deviceInfo.label || `camera ${videoSelect.length + 1}`;
      videoSelect.appendChild(option);
    } else {
      console.log("Some other kind of source/device: ", deviceInfo);
    }
  }
  console.log(videoTarget, '当前设备1');
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
  console.log('我获取了权限')
  navigator.mediaDevices.getUserMedia({ audio: true, video: true }).then(stream => {
    stream.getTracks().forEach(t => t.stop());
    fillDeviceList.call(this);
  }).catch(err => {
    console.log(err, 'errrrr')
  });
}

function fillDeviceList() {
  navigator.mediaDevices.enumerateDevices().then(gotDevices).catch(handleError);
}