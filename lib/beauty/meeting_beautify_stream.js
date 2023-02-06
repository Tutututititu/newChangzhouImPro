let Mars

if (typeof window !== "undefined") {
  Mars = window.Mars;
} else {
  Mars = require("./beauty.js")
}

var meetingBeautifyStream = function (stream, beauty_strength) {
  let beautyDiv = {};
  beauty_strength = beauty_strength ? beauty_strength : 2;
  let width = stream.getVideoTracks()[0].getSettings().width || 640;
  let height = stream.getVideoTracks()[0].getSettings().height || 480;
  let beauty_div = document.createElement('div');
  beauty_div.style.width = width + 'px';
  beauty_div.style.height = height + 'px';
  document.body.appendChild(beauty_div);
  let beauty_canvas = document.createElement('canvas');
  beauty_canvas.hidden = true;
  beauty_canvas.width = width;
  beauty_canvas.height = height;
  beauty_div.appendChild(beauty_canvas);
  let beauty_player = new Mars.MarsPlayer({ canvas: beauty_canvas });
  beauty_player.loadSceneAsync(createScene(stream, width, height, beauty_strength * 1.0 / 10))
    .then(scene => {
      beauty_player.play(scene, { keepResource: true });
      beauty_div.style.display = 'none'; // 一开始不能隐藏，内部初始需要用到clientWidth/clientHeight参数
    });
  beautyDiv.beauty_canvas = beauty_canvas;
  beautyDiv.beauty_player = beauty_player;
  beautyDiv.beauty_div = beauty_div;
  beautyDiv.stream = beauty_canvas.captureStream(20);
  return beautyDiv;
}
function createScene(stream, width, height, strength) {
  let aspect = width / height;
  let comp = {
    'compositionId': 18,
    'requires': [],
    'compositions': [{
      'name': 'composition_18',
      'id': 18,
      'duration': 9999,
      'camera': { 'fov': 60, 'far': 20, 'near': 0.1, 'position': [0, 0, 8] },
      'items': [{
        'name': 'item_683',
        'delay': 0,
        'id': 683,
        'ro': 0.1,
        'particle': {
          'options': {
            'startLifetime': 5,
            'startSize': 8,
            'sizeAspect': aspect,
            'startSpeed': 0,
            'startColor': ['color', [255, 255, 255]],
            'duration': 2,
            'maxCount': 10,
            'gravityModifier': 1,
            'looping': true,
          },
          'emission': { 'rateOverTime': 5 },
          'renderer': { 'texture': 0 },
          filter: {
            name: 'beauty',
            strength,
          },
        },
      }],
    }],
    'gltf': [],
    'images': [{ type: 'video', url: stream }],
    'version': '0.4.0-beta.51',
    'shapes': [],
    'plugins': [],
    '_imgs': { '18': [0] },
  }
  let camera = comp.compositions[0].camera;
  let z = 0;
  let w = aspect *
    (camera.position[2] - z) *
    Math.tan(((camera.fov / 2) * Math.PI) / 180);
  comp.compositions[0].items[0].particle.options.startSize = w * 2;
  return comp;
}
