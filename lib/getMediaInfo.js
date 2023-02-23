var audioInputSelect = document.querySelector("select#audioSource");
var audioOutputSelect = document.querySelector("select#audioOutput");
var videoSelect = document.querySelector("select#videoSource");
var selectors = [audioInputSelect, audioOutputSelect, videoSelect];
window.noEquipmentFlage = false; // 设备是否损坏或者查找不到, 目前无论是摄像头还是麦克风都报这个
var flage = false; // 是否二次获取权限
function gotDevices(deviceInfos) {
  // Handles being called several times to update labels. Preserve values.
  let values = selectors.map(select => select.value);
  selectors.forEach(select => {
    while (select.firstChild) {
      select.removeChild(select.firstChild);
    }
  });
  window.videoTarget = [];
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
      console.log(deviceInfo, '循环的数据');
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


window.windowGetUserMediaFunc = function getUserMediaFunc() {
  return new Promise((res, rej) => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ audio: true, video: true }).then(stream => {
        stream.getTracks().forEach(t => t.stop());
        fillDeviceList.call(this);
        window.noEquipmentFlage = false;
        res();
      }).catch(err => {
        console.log('1a11');
        window.noEquipmentFlage = true;
        fillDeviceList.call(this);
        console.log('2a22');
        console.log(err)
        rej();
      });
    }
  })
}

window.windowGetUserMediaFunc()



function fillDeviceList() {
  if (window.noEquipmentFlage && !flage) {
    flage = true;
    window.windowGetUserMediaFunc();
  };
  navigator.mediaDevices.enumerateDevices().then(gotDevices).catch(handleError);
}
