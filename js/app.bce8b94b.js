(function(){"use strict";var e={1132:function(e,t,n){var i=n(7195),r=function(){var e=this,t=e._self._c;return t("div",{attrs:{id:"app"}},[t("router-view")],1)},o=[],a={name:"App",components:{}},s=a,c=n(3736),u=(0,c.Z)(s,r,o,!1,null,null,null),f=u.exports,l=n(2241),d=function(){var e=this,t=e._self._c;return t("div",{staticClass:"wrap"},[e._m(0),t("iframe",{ref:"iframe",attrs:{src:e.htmlSrc,width:"500px",height:"500px",frameborder:"0"}}),t("button",{on:{click:e.vueSendMsg}},[e._v("vue向iframe传递信息")]),t("button",{on:{click:e.iframeMethods}},[e._v("触发iframe中的方法")])])},v=[function(){var e=this,t=e._self._c;return t("div",[t("video",{attrs:{id:"gum-local",autoplay:"",playsinline:""}})])}],h={data(){return{as:null,htmlSrc:"/aa.html",facilityId:""}},components:{},created(){},methods:{async getVideoConfig(){navigator.mediaDevices.enumerateDevices().then((async e=>{if(alert("1"),e=e.reverse(),console.log(JSON.stringify(e,16),"全部数据列表"),0==e.length)return;let t=e.filter((e=>"videoinput"==e.kind));console.log(JSON.stringify(t,16),"所有后置摄像头列表");for(let o=0;o<t.length;o++)t?.label?.includes("0")&&(this.facilityId=t[o]?.deviceId||"");this.facilityId||(this.facilityId=t[0]?.deviceId||""),console.log(this.facilityId,"当前设备id");const n={audio:!1,video:{deviceId:this.facilityId?{exact:this.facilityId}:void 0}},i=await navigator.mediaDevices.getUserMedia(n),r=document.querySelector("video");r.srcObject=i}))},getiframeMsg(e){const t=e.data;console.log(e),"myIframe"==t.cmd&&(console.log(t,"iframe给组件传递"),this.vueSendMsg())},vueSendMsg(){const e=this.$refs.iframe.contentWindow;e.postMessage({cmd:"myVue",params:{info:"Vue向iframe传递的消息"}},"*")},iframeMethods(){this.$refs.iframe.contentWindow.triggerByVue("通过Vue触发iframe中的方法")}},mounted(){navigator.mediaDevices.getUserMedia({audio:!0,video:!0}).then((e=>{e.getTracks().forEach((e=>e.stop())),this.getVideoConfig()})).catch((e=>{console.log(e)})),window.addEventListener("message",this.getiframeMsg),this.vueSendMsg()}},g=h,m=(0,c.Z)(g,d,v,!1,null,"a3902314",null),p=m.exports;i.ZP.use(l.Z);const y=[{path:"/",redirect:"/ff"},{path:"/ff",component:p}],w=new l.Z({routes:y});var b=w,O=n(8871),M=n.n(O);let I=new(M());i.ZP.use(I),i.ZP.config.productionTip=!1,new i.ZP({router:b,render:e=>e(f)}).$mount("#app")}},t={};function n(i){var r=t[i];if(void 0!==r)return r.exports;var o=t[i]={exports:{}};return e[i].call(o.exports,o,o.exports,n),o.exports}n.m=e,function(){var e=[];n.O=function(t,i,r,o){if(!i){var a=1/0;for(f=0;f<e.length;f++){i=e[f][0],r=e[f][1],o=e[f][2];for(var s=!0,c=0;c<i.length;c++)(!1&o||a>=o)&&Object.keys(n.O).every((function(e){return n.O[e](i[c])}))?i.splice(c--,1):(s=!1,o<a&&(a=o));if(s){e.splice(f--,1);var u=r();void 0!==u&&(t=u)}}return t}o=o||0;for(var f=e.length;f>0&&e[f-1][2]>o;f--)e[f]=e[f-1];e[f]=[i,r,o]}}(),function(){n.n=function(e){var t=e&&e.__esModule?function(){return e["default"]}:function(){return e};return n.d(t,{a:t}),t}}(),function(){n.d=function(e,t){for(var i in t)n.o(t,i)&&!n.o(e,i)&&Object.defineProperty(e,i,{enumerable:!0,get:t[i]})}}(),function(){n.g=function(){if("object"===typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(e){if("object"===typeof window)return window}}()}(),function(){n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)}}(),function(){var e={143:0};n.O.j=function(t){return 0===e[t]};var t=function(t,i){var r,o,a=i[0],s=i[1],c=i[2],u=0;if(a.some((function(t){return 0!==e[t]}))){for(r in s)n.o(s,r)&&(n.m[r]=s[r]);if(c)var f=c(n)}for(t&&t(i);u<a.length;u++)o=a[u],n.o(e,o)&&e[o]&&e[o][0](),e[o]=0;return n.O(f)},i=self["webpackChunktest"]=self["webpackChunktest"]||[];i.forEach(t.bind(null,0)),i.push=t.bind(null,i.push.bind(i))}();var i=n.O(void 0,[998],(function(){return n(1132)}));i=n.O(i)})();
//# sourceMappingURL=app.bce8b94b.js.map