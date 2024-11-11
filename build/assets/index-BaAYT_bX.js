import{r as c,a as P,c as m}from"./vendor-DsqJrNAV.js";(function(){const r=document.createElement("link").relList;if(r&&r.supports&&r.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))t(e);new MutationObserver(e=>{for(const o of e)if(o.type==="childList")for(const s of o.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&t(s)}).observe(document,{childList:!0,subtree:!0});function n(e){const o={};return e.integrity&&(o.integrity=e.integrity),e.referrerPolicy&&(o.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?o.credentials="include":e.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function t(e){if(e.ep)return;e.ep=!0;const o=n(e);fetch(e.href,o)}})();var f={};/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var _=c,b=Symbol.for("react.element"),O=Symbol.for("react.fragment"),x=Object.prototype.hasOwnProperty,C=_.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,j={key:!0,ref:!0,__self:!0,__source:!0};function y(i,r,n){var t,e={},o=null,s=null;n!==void 0&&(o=""+n),r.key!==void 0&&(o=""+r.key),r.ref!==void 0&&(s=r.ref);for(t in r)x.call(r,t)&&!j.hasOwnProperty(t)&&(e[t]=r[t]);if(i&&i.defaultProps)for(t in r=i.defaultProps,r)e[t]===void 0&&(e[t]=r[t]);return{$$typeof:b,type:i,key:o,ref:s,props:e,_owner:C.current}}f.Fragment=O;f.jsx=y;f.jsxs=y;var p=P;p.createRoot,p.hydrateRoot;typeof window<"u"&&!window.global&&(window.global=typeof m>"u"?window:m);c.createContext(void 0);c.createContext(void 0);new Audio("/sounds/error.mp3"),new Audio("/sounds/warning.mp3"),new Audio("/sounds/success.mp3"),new Audio("/sounds/info.mp3");var h="https://js.stripe.com/v3",A=/^https:\/\/js\.stripe\.com\/v3\/?(\?.*)?$/,v="loadStripe.setLoadParameters was called but an existing Stripe.js script already exists in the document; existing script parameters will be used",R=function(){for(var r=document.querySelectorAll('script[src^="'.concat(h,'"]')),n=0;n<r.length;n++){var t=r[n];if(A.test(t.src))return t}return null},w=function(r){var n="",t=document.createElement("script");t.src="".concat(h).concat(n);var e=document.head||document.body;if(!e)throw new Error("Expected document.body not to be null. Stripe.js requires a <body> element.");return e.appendChild(t),t},X=function(r,n){!r||!r._registerWrapper||r._registerWrapper({name:"stripe-js",version:"4.8.0",startTime:n})},a=null,l=null,d=null,I=function(r){return function(){r(new Error("Failed to load Stripe.js"))}},T=function(r,n){return function(){window.Stripe?r(window.Stripe):n(new Error("Stripe.js not available"))}},N=function(r){return a!==null?a:(a=new Promise(function(n,t){if(typeof window>"u"||typeof document>"u"){n(null);return}if(window.Stripe&&r&&console.warn(v),window.Stripe){n(window.Stripe);return}try{var e=R();if(e&&r)console.warn(v);else if(!e)e=w(r);else if(e&&d!==null&&l!==null){var o;e.removeEventListener("load",d),e.removeEventListener("error",l),(o=e.parentNode)===null||o===void 0||o.removeChild(e),e=w(r)}d=T(n,t),l=I(t),e.addEventListener("load",d),e.addEventListener("error",l)}catch(s){t(s);return}}),a.catch(function(n){return a=null,Promise.reject(n)}))},q=function(r,n,t){if(r===null)return null;var e=r.apply(void 0,n);return X(e,t),e},u,S=!1,E=function(){return u||(u=N(null).catch(function(r){return u=null,Promise.reject(r)}),u)};Promise.resolve().then(function(){return E()}).catch(function(i){S||console.warn(i)});var W=function(){for(var r=arguments.length,n=new Array(r),t=0;t<r;t++)n[t]=arguments[t];S=!0;var e=Date.now();return E().then(function(o){return q(o,n,e)})};W(void 0);const $=`
@keyframes slide-in {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slide-out {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}

.animate-slide-in {
  animation: slide-in 0.3s ease-out forwards;
}

.animate-slide-out {
  animation: slide-out 0.3s ease-in forwards;
}
`,g=document.createElement("style");g.textContent=$;document.head.appendChild(g);c.createContext(void 0);new Audio("/sounds/error.mp3"),new Audio("/sounds/warning.mp3"),new Audio("/sounds/success.mp3");const D=`
@keyframes slide-in {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.animate-slide-in {
  animation: slide-in 0.3s ease-out forwards;
}
`,L=document.createElement("style");L.textContent=D;document.head.appendChild(L);throw new Error("Missing Clerk Publishable Key");
//# sourceMappingURL=index-BaAYT_bX.js.map
