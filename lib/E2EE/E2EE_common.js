'use strict';

// 常量
// 算法类型(int)
var ALGORITHM_TYPE_SM4_ECB_PKCS5Padding = 1;
var ALGORITHM_TYPE_SM4_GCM_NoPadding = 2;
// 编码格式
var VIDEO_CODEC_H264 = 1;
var VIDEO_CODEC_VP8 = 2;
var VIDEO_CODEC_VP9 = 3;
var VIDEO_CODEC_AV1 = 4;
var AUDIO_CODEC_OPUS = 50;

function leb128_decode(data, index = 0) {
  let isDataView = data.getUint8 ? true : false;
  let byte_num = 0;
  let value = 0;
  while (byte_num < 8) {  // byte_num < 8,防止脏数据造成死循环
    let temp;
    if (isDataView) {
      temp = data.getUint8(index + byte_num);
    } else {
      temp = data[index + byte_num];
    }
    value |= ((temp & 0x7f) << (byte_num * 7));
    byte_num++;
    if (!(temp & 0x80)) {
      break;
    }
  }
  return { value, byte_num };
}

function leb128_encode(value) {
  let arr = new Array();
  let byte_num = 0;
  while (byte_num < 8) {  // byte_num < 8,防止脏数据造成死循环
    let temp_7 = (value >> (byte_num * 7)) & 0x7f;
    let has_next = value >> ((byte_num + 1) * 7);
    if (has_next) {
      arr[byte_num] = temp_7 | 0x80;
    } else {
      arr[byte_num] = temp_7;
    }
    byte_num++;
    if (!has_next) {
      break;
    }
  }
  return arr;
}

// generate session key
async function getE2EESessionKey(rawMaterial, salt) {
  console.time("[mrtc E2EE] getE2EESessionKey");

  // TextEncoder
  let textEncoder = new TextEncoder();
  // console.log("[mrtc E2EE] getE2EESessionKey rawMaterial=", rawMaterial);

  // ikm import
  let ikm = await crypto.subtle.importKey(
    "raw",
    textEncoder.encode(rawMaterial),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  // console.log("[mrtc E2EE] getE2EESessionKey ikm=", ikm);

  // derive key
  let deriveKey = await crypto.subtle.deriveKey(
    { name: "PBKDF2", hash: "SHA-256", salt: textEncoder.encode(salt), iterations: 1000 },
    ikm,
    { name: "AES-GCM", length: 128 }, // Note: for this demo we don't actually need a cipher suite, but the api requires that it must be specified.
    true,
    ["encrypt", "decrypt"]
  );
  // console.log("[mrtc E2EE] getE2EESessionKey deriveKey=", deriveKey);

  // export key
  let exportKey = await crypto.subtle.exportKey("raw", deriveKey);
  // console.log("[mrtc E2EE] getE2EESessionKey exportKey=", exportKey);

  // Uint8Array
  let result = new Uint8Array(exportKey.slice());
  // console.log("[mrtc E2EE] getE2EESessionKey result=", result);

  console.timeEnd("[mrtc E2EE] getE2EESessionKey");
  return result;
}

// 初始化算法库
async function initAlgorithmLib() {
  return new Promise((res, rej) => {
    console.time("[mrtc E2EE] initAlgorithmLib");
    // antssm.js
    importScripts('./antssm.js');
    Module.onRuntimeInitialized = function () {
      // init key ctx
      key_ctx_sm4_gcm = JS_AK_Init_SM4_GCM_array(SESSION_KEY);
      key_ctx_sm4_ecb = JS_AK_Init_SM4_ECB_array(SESSION_KEY);
      // init_lib success
      console.timeEnd("[mrtc E2EE] initAlgorithmLib");
      res();
    }
    // antssm_wrapper.js
    importScripts('./antssm_wrapper.js');
  })
}

// 关闭worker前释放资源
function preClose() {
  let ret_gcm = JS_AK_Free_SM4_GCM(key_ctx_sm4_gcm);
  if (ret_gcm != 0) {
    console.error("[mrtc E2EE] preClose JS_AK_Free_SM4_GCM fail! Ret = ", ret_gcm);
  }
  let ret_ecb = JS_AK_Free_SM4_ECB(key_ctx_sm4_ecb);
  if (ret_ecb != 0) {
    console.error("[mrtc E2EE] preClose JS_AK_Free_SM4_ECB fail! Ret = ", ret_ecb);
  }
}