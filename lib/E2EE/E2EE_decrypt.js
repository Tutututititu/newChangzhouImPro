'use strict';

importScripts('./E2EE_common.js');

// 音频 OR 视频
var MEDIA_TYPE = null;

// E2EE参数
var E2EE = null;

// key
var SESSION_KEY = null;
// key_ctx
var key_ctx_sm4_gcm = null;
var key_ctx_sm4_ecb = null;

// 统计
var total_costTime = 0;
var total_frameCount = 0;
var total_statInterval = 10000;

var k_costTime = 0;
var k_frameCount = 0;
var k_statInterval = 50;

var d_costTime = 0;
var d_frameCount = 0;
var d_statInterval = 3000;

var u_costTime = 0;
var u_frameCount = 0;
var u_statInterval = 10000;

// 接收指令
onmessage = async (event) => {
  if (event.data.operation == "decrypt") {
    let { operation, readableStream, writableStream, E2EE_PARAM, mediaType } = event.data;
    // MEDIA_TYPE
    MEDIA_TYPE = mediaType;
    console.log(`[mrtc E2EE decrypt ${MEDIA_TYPE}] new worker!`);
    // E2EE: E2EE_enable/ikm/algorithm/streamId
    E2EE = E2EE_PARAM;
    // SESSION_KEY
    SESSION_KEY = await getE2EESessionKey(E2EE_PARAM.ikm, E2EE_PARAM.streamId);
    // init algorithm lib
    await initAlgorithmLib();
    // decryptFunction
    let transformStream = new TransformStream({ transform: decryptFunction });
    readableStream.pipeThrough(transformStream).pipeTo(writableStream);

  } else if (event.data.operation == "close") {
    console.log(`[mrtc E2EE decrypt ${MEDIA_TYPE}] close`);
    preClose();
    self.close();
  }
}

// 解密函数
function decryptFunction(frame, controller) {
  try {
    let startTime = new Date().getTime();
    let view = new DataView(frame.data);

    let frameByteLength = frame.data.byteLength;
    if (frameByteLength <= 0) {
      console.log(`[mrtc E2EE decrypt ${MEDIA_TYPE}] frameByteLength = 0`, frame);
      controller.enqueue(frame);
      return;
    }

    let tailLength = view.getUint8(frameByteLength - 1);
    if (frameByteLength <= tailLength) {
      console.log(`[mrtc E2EE decrypt ${MEDIA_TYPE}] frameByteLength = tailLength`, frame);
      controller.enqueue(frame);
      return;
    }

    // TAIL: v(8) + codec_type(8) + algorithm_type(8) + offset(8) + timestamp(32) + tail_length(8)
    let tail_v = view.getUint8(frameByteLength - tailLength);
    let codec_type = view.getUint8(frameByteLength - tailLength + 1);
    let algorithm_type = view.getUint8(frameByteLength - tailLength + 2);
    let offset = view.getUint8(frameByteLength - tailLength + 3);
    // let timestamp = view.getUint32(frameByteLength - tailLength + 4);

    // // TODO yutou test 解析AV1
    // if (codec_type == VIDEO_CODEC_AV1) {
    //   let index = 0;
    //   let data = frame.data;
    //   while (index < data.byteLength) {
    //     // obu_header (8bit)
    //     let obu_header = view.getUint8(index);
    //     let obu_forbidden_bit = obu_header >> 7;
    //     let obu_type = (obu_header >> 3) & 0x0f;
    //     let obu_extension_flag = (obu_header >> 2) & 0x01;
    //     let obu_has_size_field = (obu_header >> 1) & 0x01;
    //     let obu_reserved_1bit = obu_header & 0x01;
    //     // update read: obu_header
    //     index = index + 1;
    //     // obu_size (leb128)
    //     let {value, byte_num} = leb128_decode(view, index);
    //     let obu_size = value;
    //     let obu_size_byte_num = byte_num;
    //     // update read: obu_size_byte_num + obu_payload(obu_size)
    //     index = index + obu_size_byte_num + obu_size;
    //     // log
    //     console.log(`[mrtc E2EE] AV1 ${data.byteLength}, ${frame.type}, timestamp=${frame.timestamp}, obu_forbidden_bit=${obu_forbidden_bit}, obu_type=${obu_type},
    //           obu_extension_flag=${obu_extension_flag}, obu_has_size_field=${obu_has_size_field}, obu_reserved_1bit=${obu_reserved_1bit}, obu_size_byte_num=${obu_size_byte_num}, obu_size=${obu_size}`);
    //   }
    // }

    // offset=255是个特殊含义，表示这一帧数据不需要解密
    if (offset == 255) {
      console.log(`[mrtc E2EE decrypt ${MEDIA_TYPE}] decrypt no need`, frame);
      frame.data = frame.data.slice(0, frameByteLength - tailLength);
      controller.enqueue(frame);
      return;
    }

    // 不需要解密的部分
    let noDecryptArray = new Array(offset);
    for (let i = 0; i < offset; i++) {
      noDecryptArray[i] = view.getUint8(i);
    }

    // 需要解密的部分
    let toDecryptArray = new Array(frameByteLength - offset - tailLength);
    for (let i = 0; i < frameByteLength - tailLength - offset; i++) {
      toDecryptArray[i] = view.getUint8(i + offset);
    }
    // 丢弃adaptorArray
    toDecryptArray = dropAdaptorArray(codec_type, toDecryptArray);

    // 解密
    let plainArray = null;
    // 解密 SM4_ECB_PKCS5Padding
    if (algorithm_type == ALGORITHM_TYPE_SM4_ECB_PKCS5Padding) {
      plainArray = JS_AK_ECB_Decrypt_array(key_ctx_sm4_ecb, null, null, toDecryptArray, null);

      // 解密 SM4_GCM_NoPadding
    } else if (algorithm_type == ALGORITHM_TYPE_SM4_GCM_NoPadding) {
      // iv = timestamp
      let iv = new Array(4);
      for (let i = 0; i < iv.length; i++) {
        iv[i] = view.getUint8(frameByteLength - tailLength + 4 + i);
      }
      // add = noDecryptArray + TAIL
      let add = new Array(offset + tailLength);
      for (let i = 0; i < offset; i++) {
        add[i] = noDecryptArray[i];
      }
      for (let i = 0; i < tailLength; i++) {
        add[offset + i] = view.getUint8(frameByteLength - tailLength + i);
      }
      // tag 16bit
      let tag_d = new Array(16);
      // plainArray_1 (Uint8Array)
      let plainArray_1 = JS_AK_GCM_Decrypt_array(key_ctx_sm4_gcm, iv, add, toDecryptArray, tag_d);
      // plainArray_1 (Uint8Array -> Array)
      let plainArray_2 = Array.from(plainArray_1);
      // plainArray = plainArray_2 - tag_d
      plainArray = plainArray_2.slice(0, plainArray_2.length - 16);
    }

    // 重新组装数据
    let newData = new ArrayBuffer(offset + plainArray.length);
    let newView = new DataView(newData);
    for (let i = 0; i < offset; i++) {
      newView.setUint8(i, noDecryptArray[i]);
    }
    for (let i = 0; i < plainArray.length; i++) {
      newView.setUint8(i + offset, plainArray[i]);
    }
    frame.data = newData;

    // 统计耗时
    let costTime = new Date().getTime() - startTime;
    total_costTime += costTime;
    total_frameCount++;
    if (total_frameCount % total_statInterval == 0) {
      console.log(`[mrtc E2EE decrypt ${MEDIA_TYPE}] total_costTime=${(total_costTime / total_statInterval)}ms`);
      total_costTime = 0;
    }
    if (frame.type == "key") {
      k_costTime += costTime;
      k_frameCount++;
      if (k_frameCount % k_statInterval == 0) {
        console.log(`[mrtc E2EE decrypt ${MEDIA_TYPE}] k_costTime=${(k_costTime / k_statInterval)}ms`);
        k_costTime = 0;
      }
    } else if (frame.type == "delta") {
      d_costTime += costTime;
      d_frameCount++;
      if (d_frameCount % d_statInterval == 0) {
        console.log(`[mrtc E2EE decrypt ${MEDIA_TYPE}] d_costTime=${(d_costTime / d_statInterval)}ms`);
        d_costTime = 0;
      }
    } else {
      u_costTime += costTime;
      u_frameCount++;
      if (u_frameCount % u_statInterval == 0) {
        console.log(`[mrtc E2EE decrypt ${MEDIA_TYPE}] u_costTime=${(u_costTime / u_statInterval)}ms`);
        u_costTime = 0;
      }
    }

    controller.enqueue(frame);

  } catch (e) {
    console.log(`[mrtc E2EE decrypt ${MEDIA_TYPE}] decryptFunction exception!`, frame);
    console.log(e);
    controller.enqueue(frame);
  }
}

function dropAdaptorArray(codec_type, toDecryptArray) {
  if (codec_type == VIDEO_CODEC_AV1) {
    // AV1: 此处toDecryptArray的前N个字节是为了防止截断加密数组而伪造的适配obu_size, 解密前需要干掉
    // obu_size (leb128)
    let { value, byte_num } = leb128_decode(toDecryptArray);
    return toDecryptArray.slice(byte_num);
  }
  return toDecryptArray;
}