'use strict';var _typeof3=typeof Symbol==="function"&&typeof Symbol.iterator==="symbol"?function(obj){return typeof obj;}:function(obj){return obj&&typeof Symbol==="function"&&obj.constructor===Symbol&&obj!==Symbol.prototype?"symbol":typeof obj;};/**
 * @licstart The following is the entire license notice for the
 * Javascript code in this page
 *
 * Copyright 2017 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @licend The above is the entire license notice for the
 * Javascript code in this page
 */(function webpackUniversalModuleDefinition(root,factory){if((typeof exports==='undefined'?'undefined':_typeof3(exports))==='object'&&(typeof module==='undefined'?'undefined':_typeof3(module))==='object')module.exports=factory();else if(typeof define==='function'&&define.amd)define("pdfjs-dist/build/pdf.worker",[],factory);else if((typeof exports==='undefined'?'undefined':_typeof3(exports))==='object')exports["pdfjs-dist/build/pdf.worker"]=factory();else root["pdfjs-dist/build/pdf.worker"]=root.pdfjsWorker=factory();})(typeof self!=='undefined'?self:undefined,function(){return(/******/function(modules){// webpackBootstrap
    /******/// The module cache
    /******/var installedModules={};/******//******/// The require function
    /******/function __w_pdfjs_require__(moduleId){/******//******/// Check if module is in cache
        /******/if(installedModules[moduleId]){/******/return installedModules[moduleId].exports;/******/}/******/// Create a new module (and put it into the cache)
        /******/var module=installedModules[moduleId]={/******/i:moduleId,/******/l:false,/******/exports:{}/******/};/******//******/// Execute the module function
        /******/modules[moduleId].call(module.exports,module,module.exports,__w_pdfjs_require__);/******//******/// Flag the module as loaded
        /******/module.l=true;/******//******/// Return the exports of the module
        /******/return module.exports;/******/}/******//******//******/// expose the modules object (__webpack_modules__)
    /******/__w_pdfjs_require__.m=modules;/******//******/// expose the module cache
    /******/__w_pdfjs_require__.c=installedModules;/******//******/// define getter function for harmony exports
    /******/__w_pdfjs_require__.d=function(exports,name,getter){/******/if(!__w_pdfjs_require__.o(exports,name)){/******/Object.defineProperty(exports,name,{/******/configurable:false,/******/enumerable:true,/******/get:getter/******/});/******/}/******/};/******//******/// getDefaultExport function for compatibility with non-harmony modules
    /******/__w_pdfjs_require__.n=function(module){/******/var getter=module&&module.__esModule?/******/function getDefault(){return module['default'];}:/******/function getModuleExports(){return module;};/******/__w_pdfjs_require__.d(getter,'a',getter);/******/return getter;/******/};/******//******/// Object.prototype.hasOwnProperty.call
    /******/__w_pdfjs_require__.o=function(object,property){return Object.prototype.hasOwnProperty.call(object,property);};/******//******/// __webpack_public_path__
    /******/__w_pdfjs_require__.p="";/******//******/// Load entry module and return exports