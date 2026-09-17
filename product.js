(function(){
  'use strict';
  var deferredPrompt=null;
  var installButtons=Array.prototype.slice.call(document.querySelectorAll('[data-install-app]'));
  var installNotice=document.getElementById('installNotice');
  function showInstallNotice(text){if(!installNotice){alert(text);return;}installNotice.textContent=text;installNotice.hidden=false;clearTimeout(showInstallNotice.timer);showInstallNotice.timer=setTimeout(function(){installNotice.hidden=true;},4200);}
  window.addEventListener('beforeinstallprompt',function(event){event.preventDefault();deferredPrompt=event;});
  installButtons.forEach(function(button){button.addEventListener('click',async function(){if(deferredPrompt){deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;return;}var ios=/iphone|ipad|ipod/i.test(navigator.userAgent||'');showInstallNotice(ios?'请使用 Safari 的分享按钮，选择“添加到主屏幕”':'请使用浏览器菜单中的“安装应用”或“添加到主屏幕”');});});
  window.addEventListener('appinstalled',function(){showInstallNotice('应用已安装');});
  if('serviceWorker' in navigator&&location.protocol.indexOf('http')===0){window.addEventListener('load',function(){navigator.serviceWorker.register('service-worker.js');});}
})();
