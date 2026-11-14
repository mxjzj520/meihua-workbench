'use strict';
(()=>{
 const installed=()=>matchMedia('(display-mode: standalone)').matches||matchMedia('(display-mode: fullscreen)').matches||navigator.standalone===true;
 let installPrompt=null,registration=null,acceptUpdate=false;
 const buttons=[...document.querySelectorAll('[data-wb-install]')];
 const syncInstall=()=>buttons.forEach(b=>b.hidden=installed());
 const startup=document.getElementById('wb-startup'),startupImage=startup?.querySelector('img');
 const imageReady=startupImage?.decode?startupImage.decode().catch(()=>{}):Promise.resolve();
 const visibleReady=imageReady.then(()=>new Promise(resolve=>requestAnimationFrame(()=>{const at=performance.now();if(startup){startup.classList.add('is-ready');startup.dataset.artVisibleAt=String(at);}resolve(at);})));
 const hideStartup=async()=>{const imageAt=await visibleReady;if(!startup)return;const remaining=Math.max(0,2200-(performance.now()-imageAt));setTimeout(()=>{startup.classList.add('is-leaving');setTimeout(()=>startup.remove(),340);},remaining);};
 Promise.resolve(window.__wbReady).then(hideStartup,hideStartup);
 window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;syncInstall();});
 window.addEventListener('appinstalled',()=>{installPrompt=null;syncInstall();toast('已安装美化工作台');});
 matchMedia('(display-mode: standalone)').addEventListener('change',syncInstall);
 buttons.forEach(button=>button.addEventListener('click',async()=>{
  if(installPrompt){const prompt=installPrompt;installPrompt=null;try{await prompt.prompt();await prompt.userChoice;}catch{showInstallGuide();}return;}
  showInstallGuide();
 }));
 function showInstallGuide(){
  const ios=/iPad|iPhone|iPod/.test(navigator.userAgent)||navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1;
  modal('安装美化工作台','<div class="wb-install-guide"><img src="./assets/icon-192.png" alt=""><p>安装后，可从桌面或主屏幕直接打开。</p>'+(ios?'<ol><li>在 Safari 中打开本页。</li><li>点击分享，选择“添加到主屏幕”。</li><li>确认名称后点击“添加”。</li></ol>':'<ol><li>在 Edge 或 Chrome 中打开本页。</li><li>点击地址栏中的安装图标，或从浏览器菜单选择“安装此网站为应用”。</li><li>确认安装，名称为“美化工作台”。</li></ol>')+'<p>安装后仍使用此浏览器保存的作品。全屏表现由设备和浏览器决定，也可使用顶栏的全屏按钮。</p></div>');
 }
 const banner=document.getElementById('wb-update');
 const updateButton=document.getElementById('wb-update-apply');
 const presentUpdate=()=>{if(registration?.waiting)banner.hidden=false;};
 document.getElementById('wb-update-later').addEventListener('click',()=>banner.hidden=true);
 updateButton.addEventListener('click',async()=>{
  if(typeof busy!=='undefined'&&busy){toast('正在生成，完成后再更新');return;}
  if(!registration?.waiting){banner.hidden=true;return;}
  updateButton.disabled=true;
  try{await persist();if(document.getElementById('saveState').classList.contains('error')){updateButton.disabled=false;toast('保存尚未成功，请先下载备份',true);return;}acceptUpdate=true;registration.waiting.postMessage({type:'ACTIVATE_UPDATE'});}catch{updateButton.disabled=false;toast('暂时无法更新，请稍后再试',true);}
 });
 if('serviceWorker' in navigator){
  navigator.serviceWorker.addEventListener('controllerchange',()=>{if(acceptUpdate)location.reload();});
  const register=()=>navigator.serviceWorker.register('./sw.js',{scope:'./',updateViaCache:'none'}).then(r=>{
   registration=r;presentUpdate();
   r.addEventListener('updatefound',()=>{const worker=r.installing;worker?.addEventListener('statechange',()=>{if(worker.state==='installed'&&navigator.serviceWorker.controller)presentUpdate();});});
   document.addEventListener('visibilitychange',()=>{if(!document.hidden)r.update().catch(()=>{});});
  }).catch(()=>{});
  if(document.readyState==='complete')register();else window.addEventListener('load',register,{once:true});
 }
 syncInstall();
})();
