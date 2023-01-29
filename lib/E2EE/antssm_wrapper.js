// stack crap test
function cwrap_int_sqrt(number1, number2) {
  //int_sqrt = Module.cwrap('int_sqrt', 'number', ['number'], ['number']);
  //return int_sqrt(number1, number2);
  return _int_sqrt(number1, number2);
}

function ccall_int_sqrt(number) {
  var result = Module.ccall('int_sqrt', // name of C function
    'number', // return type
    ['number'], // argument types
    [number]); // arguments
  return result;
}

function JS_AK_Login_with_whitebox() {
  var AK_DIRECTORY = 0x00080002;
  var session_self_ptr = Module._malloc(8);
  var ret = _AK_Login_with_whitebox(AK_DIRECTORY, null, session_self_ptr, null);
  if (ret != 0) {
    console.error("AK_Login_with_whitebox fail, Ret = ", ret);
    return null;
  }
  var session_ptr = getValue(session_self_ptr, "*");
  _free(session_self_ptr);
  return session_ptr;

}

function JS_AK_GetRandom(session, keylen) {
  var random_buf = Module._malloc(keylen);
  var ret = _AK_GetRandom(session, random_buf, keylen);
  console.log("JS_AK_GetRandom ret = ", ret);
  return random_buf;
}

function JS_AK_ImportObject_SM4(session, key) {
  var AK_TEMP_SYMMETRIC_KEY = 0x00000008;
  var AK_SM4 = 0x00011007;
  var AK_KEY_FORMAT_RAW = 0x00090001;
  var AK_ATTR_CIPHER_MODE = 0x000a0007;
  var AK_ECB = 0x00030002;
  var AK_ATTR_PADDING_MODE = 0x000a0006;
  var AK_PADDING_MODE_NONE = 0x00000000;
  var object_buf = _malloc(8);
  var key_name = _malloc(16);
  stringToUTF8("SM4TestKey", key_name, 16);

  var key_buf = _malloc(64);
  var key_js = Module.HEAPU8.subarray(key_buf, key_buf + 16);
  key_js.set(key);

  var ret = _AK_ImportObject(session, key_name, AK_TEMP_SYMMETRIC_KEY, AK_SM4,
    AK_KEY_FORMAT_RAW, key_buf, 16, object_buf);
  if (ret != 0) {
    console.error("AK_ImportObject fail, Ret = ", ret);
    return null;
  }

  var object_ptr = getValue(object_buf, "*");

  var option = _malloc(5);
  setValue(option, AK_ECB, "i32");
  ret = _AK_SetAttr(object_ptr, AK_ATTR_CIPHER_MODE, option, 4);
  if (ret != 0) {
    console.error("AK_SetAttr fail, Ret = ", ret);
    return null;
  }

  _free(key_buf);
  _free(object_buf);
  _free(key_name);
  return object_ptr;
}

function JS_AK_ReleaseObjectHandle(object) {

  var ret = _AK_DeleteObject(object);
  return ret;
}

function JS_AK_Logout(session) {

  var ret = _AK_Logout(session);
  return ret;
}


function JS_AK_Encrypt_string(object, plain) {
  var cipher_buf = _malloc(plain.length + 16);
  var cipher_buf_len = _malloc(4);
  setValue(cipher_buf_len, plain.length + 16, "i32");

  var plain_buf = _malloc(plain.length * 2);
  //HEAP8.set(plain, plain_buf);
  stringToUTF8(plain, plain_buf, plain.length * 2);
  var iv = _malloc(17);
  for (var i = 0; i < 16; i++) {
    setValue(iv + i, 0, "i8");
  }

  var iv_len = _malloc(4);
  setValue(iv_len, 16, "i32");
  var ret = _AK_Encrypt_exIV(object, plain_buf, plain.length, iv, iv_len, cipher_buf, cipher_buf_len);

  ret = getValue(cipher_buf_len, "i32");

  setValue(cipher_buf + ret, 0, "i8");

  var cipher_buf_string = AsciiToString(cipher_buf);

  _free(cipher_buf_len);
  _free(cipher_buf);
  _free(plain_buf);
  _free(iv);
  _free(iv_len);

  return cipher_buf_string;
}

function JS_AK_Decrypt_string(object, cipher) {
  //console.log("cipher", cipher);
  var plain_buf = _malloc(cipher.length + 16);
  var plain_buf_len = _malloc(4);
  setValue(plain_buf_len, cipher.length + 16, "i32");

  //console.log("the cipher len = ", cipher.length);
  var cipher_buf = _malloc(cipher.length + 16);

  stringToAscii(cipher, cipher_buf);
  //HEAPU8.set(cipher, cipher_buf);

  var iv = _malloc(17);
  stringToUTF8("0000000000000000", iv, 17);

  var i = 0;
  for (var i = 0; i < 16; i++) {
    setValue(iv + i, 0, "i8");
  }

  var iv_len = 16;

  var ret = _AK_Decrypt(object, cipher_buf, cipher.length, iv, iv_len, plain_buf, plain_buf_len);

  ret = getValue(plain_buf_len, "i32");

  setValue(plain_buf + ret, 0x00, "i8");
  var plain_string = UTF8ToString(plain_buf);
  _free(plain_buf);
  _free(plain_buf_len);
  _free(cipher_buf);
  _free(iv);

  return plain_string;
}
function JS_AK_GCM_Encrypt_string(object, plain_base64) {
  var sm4_gcm_iv = Module._malloc(16 + 1);
  var i = 0;
  for (var i = 0; i < 12; i++) {
    setValue(sm4_gcm_iv + i, 0x03, "i8");
  }

  var sm4_gcm_tag = Module._malloc(16 + 1);
  for (var i = 0; i < 16; i++) {
    setValue(sm4_gcm_tag + i, 0, "i8");
  }

  var cipher_buf = _malloc(plain_base64.length + 16);
  var plain_buf = _malloc(plain_base64.length + 16);
  stringToAscii(plain_base64, plain_buf, plain_base64.length + 16);

  var ANTSSM_GCM_ENCRYPT = 1;
  var ret = _antssm_gcm_crypt_and_tag(object, ANTSSM_GCM_ENCRYPT, plain_base64.length,
    sm4_gcm_iv, 12, null, 0,
    plain_buf, cipher_buf, sm4_gcm_tag, 16);
  if (ret != 0) {
    console.error("antssm_gcm_crypt_and_tag encrypt fail! Ret = ", ret);
    return null;
  }
  setValue(cipher_buf + plain_base64.length, 0, "i8");
  let cipher_buf_string_base64 = btoa(AsciiToString(cipher_buf));

  _free(sm4_gcm_iv);
  _free(sm4_gcm_tag);
  _free(plain_buf);
  _free(cipher_buf);

  return cipher_buf_string_base64;
}

function JS_AK_GCM_Decrypt_string(object, cipher_base64) {
  var sm4_gcm_iv = Module._malloc(16 + 1);
  var i = 0;
  for (var i = 0; i < 16; i++) {
    setValue(sm4_gcm_iv + i, 0, "i8");
  }

  var sm4_gcm_tag = Module._malloc(16 + 1);
  for (var i = 0; i < 16; i++) {
    setValue(sm4_gcm_tag + i, 0, "i8");
  }

  var cipher_buf = _malloc(cipher_base64.length + 16);

  var plain_buf = _malloc(cipher_base64.length + 16);
  let cipher = atob(cipher_base64);
  stringToAscii(cipher, cipher_buf, cipher_base64.length + 16);

  var ANTSSM_GCM_DECRYPT = 0;
  var ret = _antssm_gcm_crypt_and_tag(object, ANTSSM_GCM_DECRYPT, cipher.length, sm4_gcm_iv, 16, null, 0, cipher_buf, plain_buf, sm4_gcm_tag, 16);
  if (ret != 0) {
    console.error("antssm_gcm_crypt_and_tag decrypt fail! Ret = ", ret);
    return null;
  }

  setValue(plain_buf + cipher.length, 0, "i8");
  var plain_buf_string = AsciiToString(plain_buf);

  _free(sm4_gcm_iv);
  _free(sm4_gcm_tag);
  _free(plain_buf);
  _free(cipher_buf);

  return plain_buf_string;
}

/******************************** SM4 ECB Array Begin ********************************/
function JS_AK_Init_SM4_ECB_array(key) {

  var session = JS_AK_Login_with_whitebox();
  var object = JS_AK_ImportObject_SM4(session, key);

  return object;
}

function JS_AK_ECB_Encrypt_array(object, iv, add, plain_ascii, tag) {
  if (object == null) {
    console.error("JS_AK_ECB_Encrypt_array object is null!");
  }


  var plain_buf = _malloc(plain_ascii.length + 16);
  var cipher_buf = _malloc(plain_ascii.length + 16);

  var Data = Module.HEAPU8.subarray(plain_buf, plain_buf + plain_ascii.length);
  Data.set(plain_ascii);

  var cipher_buf_len_ptr = _malloc(4);
  setValue(cipher_buf_len_ptr, plain_ascii.length + 16, "i32");

  var ret = _AK_Encrypt_exIV(object, plain_buf, plain_ascii.length, null, 0, cipher_buf, cipher_buf_len_ptr);

  if (ret != 0) {
    console.error("antssm_gcm_crypt_and_tag encrypt fail! Ret = ", ret);
    return null;
  }

  var cipher_buf_len = getValue(cipher_buf_len_ptr, "i32");

  var cipher_buf_js = new ArrayBuffer(cipher_buf_len);
  var cipher_buf_view = new Uint8Array(cipher_buf_js);
  cipher_buf_view.set(Module.HEAPU8.subarray(cipher_buf, cipher_buf + cipher_buf_len));

  _free(cipher_buf_len_ptr);
  _free(cipher_buf);
  _free(plain_buf);

  return cipher_buf_view;
}

function JS_AK_ECB_Decrypt_array(object, iv, add, cipher_ascii, tag) {
  if (object == null) {
    console.error("JS_AK_GCM_Decrypt_array object is null!");
  }

  var cipher_buf = _malloc(cipher_ascii.length + 16);
  var plain_buf = _malloc(cipher_ascii.length + 16);
  var plain_buf_len_ptr = _malloc(4);
  setValue(plain_buf_len, cipher_ascii.length + 16, "i32");

  var Data = Module.HEAPU8.subarray(cipher_buf, cipher_buf + cipher_ascii.length);
  Data.set(cipher_ascii);

  var ret = _AK_Decrypt(object, cipher_buf, cipher_ascii.length, null, 0, plain_buf, plain_buf_len_ptr);

  var plain_buf_len = getValue(plain_buf_len_ptr, "i32");

  var plain_buf_js = new ArrayBuffer(plain_buf_len);
  var plain_buf_view = new Uint8Array(plain_buf_js);
  plain_buf_view.set(Module.HEAPU8.subarray(plain_buf, plain_buf + plain_buf_len));

  _free(plain_buf_len_ptr);
  _free(plain_buf);
  _free(cipher_buf);

  return plain_buf_view;
}

function JS_AK_Free_SM4_ECB(object) {
  if (object != null) {
    var ret = _AK_DeleteObject(object);
    if (ret != 0) {
      console.error("AK_DeleteObject fail, Ret = ", ret);
      return 1;
    }
    ret = _AK_Logout_by_key(object);
    if (ret != 0) {
      console.error("AK_Logout_by_key fail, Ret = ", ret);
      return 1;
    }
  } else {
    console.error("JS_AK_Free_SM4_ECB fail! object is null!");
    return 1;
  }

  return 0;
}

/******************************** SM4 ECB Array End ********************************/


/******************************** SM4 GCM Array Begin ********************************/
function JS_AK_Init_SM4_GCM_array(key) {

  var sm4_gcm_ctx = Module._malloc(1024);
  var key_buf = _malloc(64);
  var key_js = Module.HEAPU8.subarray(key_buf, key_buf + 16);
  key_js.set(key);

  var ret = _antssm_gcm_init(sm4_gcm_ctx);
  if (key.length != 16) {
    console.error("JS_AK_Init_SM4_GCM the key length is ", key.length, "not 16");
    return null;
  }

  var ANTSSM_CIPHER_ID_SM4 = 10;

  ret = _antssm_gcm_setkey(sm4_gcm_ctx, ANTSSM_CIPHER_ID_SM4, key_buf, 128);
  if (ret != 0) {
    console.error("antssm_gcm_setkey fail! Ret = ", ret);
    return null;
  }
  _free(key_buf);
  return sm4_gcm_ctx;
}



function JS_AK_GCM_Encrypt_array(object, iv, add, plain_ascii, tag) {
  if (object == null) {
    console.error("JS_AK_GCM_Encrypt_array object is null!");
  }

  if (iv.length < 1) {
    console.error("JS_AK_GCM_Encrypt_array iv.length is less then 1!");
    return null;
  }

  if (add.length < 1) {
    console.error("JS_AK_GCM_Encrypt_array add.length is less then 1!");
    return null;
  }

  if (tag.length < 4 || tag.length > 16) {
    console.error("JS_AK_GCM_Encrypt_array tag.length must between 4 and 16!");
    return null;
  }

  var sm4_gcm_iv = Module._malloc(16 + 1);
  var Data_iv = Module.HEAPU8.subarray(sm4_gcm_iv, sm4_gcm_iv + iv.length);
  Data_iv.set(iv);

  var sm4_gcm_add = Module._malloc(16 + 1);
  var Data_add = Module.HEAPU8.subarray(sm4_gcm_add, sm4_gcm_add + add.length);
  Data_add.set(add);

  var sm4_gcm_tag = Module._malloc(16 + 1);
  for (var i = 0; i < 16; i++) {
    setValue(sm4_gcm_tag + i, 0, "i8");
  }

  var plain_buf = _malloc(plain_ascii.length + 16);
  var cipher_buf = _malloc(plain_ascii.length + 16);

  var Data = Module.HEAPU8.subarray(plain_buf, plain_buf + plain_ascii.length);
  Data.set(plain_ascii);

  var ANTSSM_GCM_ENCRYPT = 1;
  var ret = _antssm_gcm_crypt_and_tag(object, ANTSSM_GCM_ENCRYPT, plain_ascii.length,
    sm4_gcm_iv, iv.length, sm4_gcm_add, add.length,
    plain_buf, cipher_buf, sm4_gcm_tag, tag.length);
  if (ret != 0) {
    console.error("antssm_gcm_crypt_and_tag encrypt fail! Ret = ", ret);
    return null;
  }

  var cipher_buf_js = new ArrayBuffer(plain_ascii.length);
  var cipher_buf_view = new Uint8Array(cipher_buf_js);
  cipher_buf_view.set(Module.HEAPU8.subarray(cipher_buf, cipher_buf + plain_ascii.length));

  var tag_js = new ArrayBuffer(tag.length);
  var tag_view = new Uint8Array(tag_js);
  tag_view.set(Module.HEAPU8.subarray(sm4_gcm_tag, sm4_gcm_tag + tag.length));


  for (var i = 0; i < tag.length; i++) {
    tag[i] = tag_view[i];
  }

  _free(sm4_gcm_iv);
  _free(sm4_gcm_add);
  _free(sm4_gcm_tag);
  _free(cipher_buf);
  _free(plain_buf);

  return cipher_buf_view;
}

function JS_AK_GCM_Decrypt_array(object, iv, add, cipher_ascii, tag) {
  if (object == null) {
    console.error("JS_AK_GCM_Decrypt_array object is null!");
  }

  if (iv.length < 1) {
    console.error("JS_AK_GCM_Decrypt_array iv.length is less then 1!");
    return null;
  }

  if (add.length < 1) {
    console.error("JS_AK_GCM_Decrypt_array add.length is less then 1!");
    return null;
  }

  if (tag.length < 4 || tag.length > 16) {
    console.error("JS_AK_GCM_Decrypt_array tag.length must between 4 and 16!");
    return null;
  }

  var sm4_gcm_iv = Module._malloc(16 + 1);
  var Data_iv = Module.HEAPU8.subarray(sm4_gcm_iv, sm4_gcm_iv + iv.length);
  Data_iv.set(iv);

  var sm4_gcm_add = Module._malloc(16 + 1);
  var Data_add = Module.HEAPU8.subarray(sm4_gcm_add, sm4_gcm_add + add.length);
  Data_add.set(add);

  var sm4_gcm_tag = Module._malloc(16 + 1);
  for (var i = 0; i < 16; i++) {
    setValue(sm4_gcm_tag + i, 0, "i8");
  }

  var cipher_buf = _malloc(cipher_ascii.length + 16);
  var plain_buf = _malloc(cipher_ascii.length + 16);

  var Data = Module.HEAPU8.subarray(cipher_buf, cipher_buf + cipher_ascii.length);
  Data.set(cipher_ascii);

  var ANTSSM_GCM_DECRYPT = 0;
  var ret = _antssm_gcm_crypt_and_tag(object, ANTSSM_GCM_DECRYPT, cipher_ascii.length, sm4_gcm_iv, iv.length, sm4_gcm_add, add.length, cipher_buf, plain_buf, sm4_gcm_tag, tag.length);
  if (ret != 0) {
    console.error("antssm_gcm_crypt_and_tag decrypt fail! Ret = ", ret);
    return null;
  }

  var plain_buf_js = new ArrayBuffer(cipher_ascii.length);
  var plain_buf_view = new Uint8Array(plain_buf_js);
  plain_buf_view.set(Module.HEAPU8.subarray(plain_buf, plain_buf + cipher_ascii.length));


  var tag_js = new ArrayBuffer(tag.length);
  var tag_view = new Uint8Array(tag_js);
  tag_view.set(Module.HEAPU8.subarray(sm4_gcm_tag, sm4_gcm_tag + tag.length));

  for (var i = 0; i < tag.length; i++) {
    tag[i] = tag_view[i];
  }

  _free(sm4_gcm_iv);
  _free(sm4_gcm_tag);
  _free(sm4_gcm_add);
  _free(plain_buf);
  _free(cipher_buf);

  return plain_buf_view;
}

function JS_AK_Free_SM4_GCM(object) {
  if (object != null) {
    _antssm_gcm_free(object);
    _free(object);
  } else {
    console.error("JS_AK_Finish_SM4_GCM fail! object is null!");
    return 1;
  }

  return 0;
}

/******************************** SM4 GCM Array End ********************************/
