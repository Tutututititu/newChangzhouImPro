'use strict';

importScripts('./E2EE_common.js');

// 编码类型(int)
var CODEC_TYPE = null;

// 媒体类型(string: audio/video)
var MEDIA_TYPE = null;

// E2EE参数
var E2EE = null;

// 算法类型(int)
var ALGORITHM_TYPE = null;

// 算法优先级(越小越高)
var ALGORITHM_PRIORITY = new Map();
ALGORITHM_PRIORITY.set(ALGORITHM_TYPE_SM4_GCM_NoPadding, 0);
ALGORITHM_PRIORITY.set(ALGORITHM_TYPE_SM4_ECB_PKCS5Padding, 1);

// key
var SESSION_KEY = null;
// key_ctx
var key_ctx_sm4_gcm = null;
var key_ctx_sm4_ecb = null;

// offset
var OFFSET_KEY_MAP = new Map();
var OFFSET_DELTA_MAP = new Map();
var OFFSET_UNDEFINED_MAP = new Map();

// TAIL
// var TAIL_CONSTRUCT_V = "000";   // 结构协议版本，3bit，当前最新为0
// var TAIL_LENGTH = 7;    // TAIL长度
var TAIL_LENGTH = 9;  // TAIL长度
var TAIL_VERSION = 0; // 结构协议版本，当前最新为0

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

  // 启动加密
  if (event.data.operation == "encrypt") {
    let { operation, readableStream, writableStream, E2EE_PARAM, codecName, mediaType } = event.data;
    // MEDIA_TYPE(string:video/audio)
    MEDIA_TYPE = mediaType;
    console.log(`[mrtc E2EE encrypt ${MEDIA_TYPE}] new worker!`);
    // E2EE: E2EE_enable/ikm/algorithm/streamId
    E2EE = E2EE_PARAM;
    // SESSION_KEY
    SESSION_KEY = await getE2EESessionKey(E2EE_PARAM.ikm, E2EE_PARAM.streamId);
    // ALGORITHM_TYPE(int)
    let { algorithm_type, algorithm_name } = getAlgorithm(E2EE_PARAM.algorithm);
    ALGORITHM_TYPE = algorithm_type;
    console.log(`[mrtc E2EE encrypt ${MEDIA_TYPE}] algorithm_array=${E2EE_PARAM.algorithm}, choose ${algorithm_name}`);
    // VIDEO_CODEC_OFFSET
    prepareCodecOffset(E2EE.offset);
    // codec(int)
    CODEC_TYPE = getCodecType(codecName);
    console.log(`[mrtc E2EE encrypt ${MEDIA_TYPE}] codecName=${codecName}, CODEC_TYPE=${CODEC_TYPE}`);
    // init algorithm lib
    await initAlgorithmLib();
    // encryptFunction
    let transformStream = new TransformStream({ transform: encryptFunction });
    readableStream.pipeThrough(transformStream).pipeTo(writableStream);

    // 关闭worker
  } else if (event.data.operation == "close") {
    console.log(`[mrtc E2EE encrypt ${MEDIA_TYPE}] close`);
    preClose();
    self.close();

    // 切换编码格式通知
  } else if (event.data.operation == "changeCodec") {
    let { operation, codec_name } = event.data;
    if (MEDIA_TYPE == "video") {
      CODEC_TYPE = getCodecType(codec_name);
      console.log(`[mrtc E2EE encrypt ${MEDIA_TYPE}] changeCodec codecName=${codecName}, CODEC_TYPE=${CODEC_TYPE}`);
    }

    // 切换加密算法
  } else if (event.data.operation == "changeAlgorithm") {
    let { operation, E2EE_PARAM } = event.data;
    let { algorithm_type, algorithm_name } = getAlgorithm(E2EE_PARAM.algorithm);
    if (algorithm_type != ALGORITHM_TYPE) {
      E2EE = E2EE_PARAM;
      ALGORITHM_TYPE = algorithm_type;
      console.log(`[mrtc E2EE encrypt ${MEDIA_TYPE}] changeAlgorithm algorithm_array=${E2EE_PARAM.algorithm}, choose ${algorithm_name}`);
    }
  }
}

// 加密函数
function encryptFunction(frame, controller) {
  try {
    let startTime = new Date().getTime();

    if (ALGORITHM_TYPE == null) {
      console.log(`[mrtc E2EE encrypt ${MEDIA_TYPE}] ALGORITHM_TYPE invalid! ALGORITHM_TYPE=${ALGORITHM_TYPE}`);
      noEncryption(frame);
      controller.enqueue(frame);
      return;
    }
    if (frame.data.byteLength <= 0) {
      console.log(`[mrtc E2EE encrypt ${MEDIA_TYPE}] frameByteLength=0`, frame);
      noEncryption(frame);
      controller.enqueue(frame);
      return;
    }

    // 裁剪数据
    cutData(frame);
    let view = new DataView(frame.data);
    let frameByteLength = frame.data.byteLength;

    // 计算加密偏移量: 此处不能完全加密，后续步骤会读取部分字节，根据不同编码格式读取字节数不同
    let offset = findOffset(frame, view);
    if (offset < 0 || offset >= frameByteLength) {
      console.log(`[mrtc E2EE encrypt ${MEDIA_TYPE}] offset invalid! offset=${offset}`);
      noEncryption(frame);
      controller.enqueue(frame);
      return;
    }

    // 不需要加密的部分
    let noEncryptArray = new Array(offset);
    for (let i = 0; i < offset; i++) {
      noEncryptArray[i] = view.getUint8(i);
    }

    // 需要加密的部分
    let toEncryptArray = new Array(frameByteLength - offset);
    for (let i = 0; i < frameByteLength - offset; i++) {
      toEncryptArray[i] = view.getUint8(i + offset);
    }

    // TAIL: v(8) + codec_type(8) + algorithm_type(8) + offset(8) + timestamp(32) + tail_length(8)
    let tailBuffer = new ArrayBuffer(TAIL_LENGTH);
    let tailView = new DataView(tailBuffer);
    tailView.setUint8(0, TAIL_VERSION);
    tailView.setUint8(1, CODEC_TYPE)
    tailView.setUint8(2, ALGORITHM_TYPE);
    tailView.setUint8(3, offset);
    tailView.setUint32(4, frame.timestamp);
    tailView.setUint8(8, TAIL_LENGTH);

    // 加密
    let cipherArray = null;
    // 加密 SM4_ECB_PKCS5Padding
    if (ALGORITHM_TYPE == ALGORITHM_TYPE_SM4_ECB_PKCS5Padding) {
      cipherArray = JS_AK_ECB_Encrypt_array(key_ctx_sm4_ecb, null, null, toEncryptArray, null);

      // 加密 SM4_GCM_NoPadding
    } else if (ALGORITHM_TYPE == ALGORITHM_TYPE_SM4_GCM_NoPadding) {
      // iv = timestamp
      let iv = new Array(4);
      for (let i = 0; i < iv.length; i++) {
        iv[i] = tailView.getUint8(i + 4);
      }
      // add = noEncryptArray + TAIL
      let add = new Array(offset + TAIL_LENGTH);
      for (let i = 0; i < offset; i++) {
        add[i] = noEncryptArray[i];
      }
      for (let i = 0; i < TAIL_LENGTH; i++) {
        add[offset + i] = tailView.getUint8(i);
      }
      // tag 16bit
      let tag_e = new Array(16);
      // cipherArray_1 (Uint8Array)
      let cipherArray_1 = JS_AK_GCM_Encrypt_array(key_ctx_sm4_gcm, iv, add, toEncryptArray, tag_e);
      // cipherArray_1 (Uint8Array -> Array)
      let cipherArray_2 = Array.from(cipherArray_1);
      // cipherArray = cipherArray_2 + tag_e
      cipherArray_2.push.apply(cipherArray_2, tag_e);
      cipherArray = cipherArray_2;
    }

    // 部分编码格式在noEncryptArray和cipherArray之间需要填充适配数据
    let adaptorArray = getAdaptorArray(CODEC_TYPE, cipherArray.length, TAIL_LENGTH);
    let adaptorArrayLength = adaptorArray ? adaptorArray.length : 0;

    // 重新组装数据
    let newData = new ArrayBuffer(offset + adaptorArrayLength + cipherArray.length + TAIL_LENGTH);
    let newView = new DataView(newData);
    // noEncryptArray
    let start_index = 0;
    for (let i = 0; i < offset; i++) {
      newView.setUint8(i + start_index, noEncryptArray[i]);
    }
    // adaptorArray(目前只有AV1才有)
    start_index = start_index + offset;
    for (let i = 0; i < adaptorArrayLength; i++) {
      newView.setUint8(i + start_index, adaptorArray[i]);
    }
    // cipherArray
    start_index = start_index + adaptorArrayLength;
    for (let i = 0; i < cipherArray.length; i++) {
      newView.setUint8(i + start_index, cipherArray[i]);
    }
    // tail
    start_index = start_index + cipherArray.length;
    for (let i = 0; i < TAIL_LENGTH; i++) {
      newView.setUint8(i + start_index, tailView.getUint8(i));
    }
    frame.data = newData;

    // // TODO yutou test 解析AV1
    // if (CODEC_TYPE == VIDEO_CODEC_AV1) {
    //   let index = 0;
    //   let data = frame.data;
    //   while (index < data.byteLength) {
    //     // obu_header (8bit)
    //     let obu_header = newView.getUint8(index);
    //     let obu_forbidden_bit = obu_header >> 7;
    //     let obu_type = (obu_header >> 3) & 0x0f;
    //     let obu_extension_flag = (obu_header >> 2) & 0x01;
    //     let obu_has_size_field = (obu_header >> 1) & 0x01;
    //     let obu_reserved_1bit = obu_header & 0x01;
    //     // update read: obu_header
    //     index = index + 1;
    //     // obu_size (leb128)
    //     let {value, byte_num} = leb128_decode(newView, index);
    //     let obu_size = value;
    //     let obu_size_byte_num = byte_num;
    //     // update read: obu_size_byte_num + obu_payload(obu_size)
    //     index = index + obu_size_byte_num + obu_size;
    //     // log
    //     console.log(`[mrtc E2EE] AV1 ${data.byteLength}, ${frame.type}, timestamp=${frame.timestamp}, obu_forbidden_bit=${obu_forbidden_bit}, obu_type=${obu_type},
    //       obu_extension_flag=${obu_extension_flag}, obu_has_size_field=${obu_has_size_field}, obu_reserved_1bit=${obu_reserved_1bit}, obu_size_byte_num=${obu_size_byte_num}, obu_size=${obu_size}`);
    //   }
    // }

    // 统计耗时
    let costTime = new Date().getTime() - startTime;
    total_costTime += costTime;
    total_frameCount++;
    if (total_frameCount % total_statInterval == 0) {
      console.log(`[mrtc E2EE encrypt ${MEDIA_TYPE}] total_costTime=${(total_costTime / total_statInterval)}ms`);
      total_costTime = 0;
    }
    if (frame.type == "key") {
      k_costTime += costTime;
      k_frameCount++;
      if (k_frameCount % k_statInterval == 0) {
        console.log(`[mrtc E2EE encrypt ${MEDIA_TYPE}] k_costTime=${(k_costTime / k_statInterval)}ms`);
        k_costTime = 0;
      }
    } else if (frame.type == "delta") {
      d_costTime += costTime;
      d_frameCount++;
      if (d_frameCount % d_statInterval == 0) {
        console.log(`[mrtc E2EE encrypt ${MEDIA_TYPE}] d_costTime=${(d_costTime / d_statInterval)}ms`);
        d_costTime = 0;
      }
    } else {
      u_costTime += costTime;
      u_frameCount++;
      if (u_frameCount % u_statInterval == 0) {
        console.log(`[mrtc E2EE encrypt ${MEDIA_TYPE}] u_costTime=${(u_costTime / u_statInterval)}ms`);
        u_costTime = 0;
      }
    }

    controller.enqueue(frame);

  } catch (e) {
    console.log(`[mrtc E2EE encrypt ${MEDIA_TYPE}] encryptFunction exception!`, frame);
    console.log(e);
    controller.enqueue(frame);
  }
}

function noEncryption(frame) {
  // TAIL: v(8) + codec_type(8) + algorithm_type(8) + offset(8) + timestamp(32) + tail_length(8)
  let tailBuffer = new ArrayBuffer(TAIL_LENGTH);
  let tailView = new DataView(tailBuffer);
  tailView.setUint8(0, TAIL_VERSION);
  tailView.setUint8(1, CODEC_TYPE)
  tailView.setUint8(2, ALGORITHM_TYPE);
  tailView.setUint8(3, 255);  // 255表示不加密
  tailView.setUint32(4, frame.timestamp);
  tailView.setUint8(8, TAIL_LENGTH);

  // 重新组装数据
  let view = new DataView(frame.data);
  let byteLength = frame.data.byteLength;
  let newData = new ArrayBuffer(byteLength + TAIL_LENGTH);
  let newView = new DataView(newData);
  for (let i = 0; i < byteLength; i++) {
    newView.setUint8(i, view.getUint8(i));
  }
  for (let i = 0; i < TAIL_LENGTH; i++) {
    newView.setUint8(i + byteLength, tailView.getUint8(i));
  }
  frame.data = newData;
}

function cutData(frame) {
  if (MEDIA_TYPE == "video") {
    if (CODEC_TYPE == VIDEO_CODEC_AV1) {
      // cut OBU_TEMPORAL_DELIMITER (2 bytes)
      let frameByteLength = frame.data.byteLength;
      let view_origin = new DataView(frame.data);
      let data_new = new ArrayBuffer(frameByteLength - 2);
      let view_new = new DataView(data_new);
      for (var i = 2; i < frameByteLength; i++) {
        view_new.setUint8(i - 2, view_origin.getUint8(i));
      }
      frame.data = data_new;
    }
  }
}

function findOffset(frame, view) {
  let frameType = frame.type;
  // 寻找offset
  if (MEDIA_TYPE == "audio") {
    let audio_offset = OFFSET_UNDEFINED_MAP.get(CODEC_TYPE);
    if (audio_offset != undefined) {
      return audio_offset;
    }
  } else {
    if (CODEC_TYPE == VIDEO_CODEC_H264) {
      return findOffsetForH264(frame, view);
    } else if (CODEC_TYPE == VIDEO_CODEC_AV1) {
      return findOffsetForAV1(frame, view);
    } else {
      if (frameType == "key") {
        let video_offset = OFFSET_KEY_MAP.get(CODEC_TYPE);
        if (video_offset != undefined) {
          return video_offset;
        }
      } else if (frameType == "delta") {
        let video_offset = OFFSET_DELTA_MAP.get(CODEC_TYPE);
        if (video_offset != undefined) {
          return video_offset;
        }
      }
    }
  }
  // fallback
  return -1;
}

function findOffsetForH264(frame, view) {
  let byteLength = frame.data.byteLength;
  // 多个NALU会被编成一帧，这里拆解帧，获取单个NALU的头部
  let start_code = "";
  for (let i = 0; i < byteLength; i++) {
    let temp = view.getUint8(i);
    // 当前为NALU的第一个字节（已去除startCode）
    if (start_code == "0001" || start_code == "001") {
      // 获取NALU的类型（后5位）
      let nalu_type = temp & 0x1f;
      switch (nalu_type) {
        case 1:
        case 2:
        case 3:
        case 4:
          return i + OFFSET_DELTA_MAP.get(VIDEO_CODEC_H264);
        case 5:
          return i + OFFSET_KEY_MAP.get(VIDEO_CODEC_H264);   // I帧偏移5个字节
      }
      start_code = "";
    }
    // 拼接startCode
    switch (temp) {
      case 0:
        if (start_code == "" || start_code == "0" || start_code == "00") {
          start_code += temp;
          break;
        }
      case 1:
        if (start_code == "00" || start_code == "000") {
          start_code += temp;
          break;
        }
      default:
        start_code = "";
    }
  }
  // 非法，返回-1
  return -1;
}

/**
 * obu_header | obu_size | obu_payload
 * offset偏移至obu(obu_type=6)的obu_header, 后面的obu_size需要变更
 * */
function findOffsetForAV1(frame, view) {
  let frameByteLength = frame.data.byteLength;
  let index = 0;
  while (index < frameByteLength) {
    // obu_header (8bit)
    let obu_header = view.getUint8(index);
    // let obu_forbidden_bit = obu_header >> 7;
    let obu_type = (obu_header >> 3) & 0x0f;
    // let obu_extension_flag = (obu_header >> 2) & 0x01;
    // let obu_has_size_field = (obu_header >> 1) & 0x01;
    // let obu_reserved_1bit = obu_header & 0x01;
    // update read: obu_header
    index = index + 1;
    // 6: OBU_FRAME
    if (obu_type == 6) {
      break;
    }
    // obu_size (leb128)
    let { value, byte_num } = leb128_decode(view, index);
    let obu_size = value;
    let obu_size_byte_num = byte_num;
    // update read: obu_size_byte_num + obu_payload(obu_size)
    index = index + obu_size_byte_num + obu_size;
  }
  return index;
}

// 根据优先级选择加密算法
function getAlgorithm(algorithm_array) {
  let algorithm = undefined;
  let algorithm_priority = 999999;
  for (let i = 0; i < algorithm_array.length; i++) {
    let temp_algorithm_name = algorithm_array[i];
    let temp_algorithm_type = getAlgorithmType(temp_algorithm_name);
    let temp_priority = ALGORITHM_PRIORITY.get(temp_algorithm_type);
    if (temp_priority < algorithm_priority) {
      algorithm = { "algorithm_type": temp_algorithm_type, "algorithm_name": temp_algorithm_name };
      algorithm_priority = temp_priority;
    }
  }
  // {algorithm_type(int),algorithm_name(string)}
  return algorithm;
}

function getAdaptorArray(codec_type, cipherArrayLength, tailLength) {
  if (codec_type == VIDEO_CODEC_AV1) {
    // AV1: 此处需要伪造obu_size, 防止后续步骤截断加密数组
    // obu_size = cipherArrayLength + tailLength, int -> leb128
    let totalLength = cipherArrayLength + tailLength;
    let adaptorArray = leb128_encode(totalLength);
    return adaptorArray;
  }
  return undefined;
}

function prepareCodecOffset(offset) {
  // 初始化 key
  OFFSET_KEY_MAP.set(VIDEO_CODEC_H264, 5);
  OFFSET_KEY_MAP.set(VIDEO_CODEC_VP8, 10);
  OFFSET_KEY_MAP.set(VIDEO_CODEC_VP9, 10);
  // OFFSET_KEY_MAP.set(VIDEO_CODEC_AV1, 0);
  // 初始化 delta
  OFFSET_DELTA_MAP.set(VIDEO_CODEC_H264, 1);
  OFFSET_DELTA_MAP.set(VIDEO_CODEC_VP8, 3);
  OFFSET_DELTA_MAP.set(VIDEO_CODEC_VP9, 3);
  // OFFSET_DELTA_MAP.set(VIDEO_CODEC_AV1, 0);
  // 初始化 undefined
  OFFSET_UNDEFINED_MAP.set(AUDIO_CODEC_OPUS, 0);
  // 用云控下发的值覆盖
  for (let i = 0; i < offset.length; i++) {
    let temp = offset[i];
    let codecType = getCodecType(temp.type);
    if (temp.k != undefined) {
      OFFSET_KEY_MAP.set(codecType, temp.k);
    }
    if (temp.d != undefined) {
      OFFSET_DELTA_MAP.set(codecType, temp.d);
    }
    if (temp.u != undefined) {
      OFFSET_UNDEFINED_MAP.set(codecType, temp.u);
    }
  }
  console.log(`[mrtc E2EE encrypt ${MEDIA_TYPE}] prepareCodecOffset`, OFFSET_KEY_MAP, OFFSET_DELTA_MAP, OFFSET_UNDEFINED_MAP);
}

// algorithm: string name -> integer type
function getAlgorithmType(algorithm) {
  if (algorithm == "SM4/ECB/PKCS5Padding") {
    return ALGORITHM_TYPE_SM4_ECB_PKCS5Padding;
  } else if (algorithm == "SM4/GCM/NoPadding") {
    return ALGORITHM_TYPE_SM4_GCM_NoPadding;
  }
  return -1;
}

// codec: string name -> integer type
function getCodecType(codecName) {
  if (codecName == "H264") {
    return VIDEO_CODEC_H264;
  } else if (codecName == "VP8") {
    return VIDEO_CODEC_VP8;
  } else if (codecName == "VP9") {
    return VIDEO_CODEC_VP9;
  } else if (codecName == "AV1") {
    return VIDEO_CODEC_AV1;
  } else if (codecName == "OPUS") {
    return AUDIO_CODEC_OPUS;
  }
  return -1;
}