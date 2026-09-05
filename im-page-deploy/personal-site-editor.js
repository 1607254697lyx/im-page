(function(){
  'use strict';

  var DEFAULT_CONFIG = {
    themeColor:'#8478D2',
    profile:{
      avatar:'yaxin-assets/avatar-final.png',
      name:'yaxin',
      nameLink:'https://github.com/',
      circleText:'自留地',
      intro:'你好，我是yaxin，一个正在快速成长的 AI 产品练习生，欢迎来到我的自留地。'
    },
    modules:[
      {id:'experience-main',type:'experience',title:'我的经历',visible:true,items:[
        {date:'2026 · 夏',title:'智谱',description:'很幸运进入智谱，做桌面Agent产品AutoClaw的实习生，在这里浸泡在AI的氛围中，每天都在学习很多新而有趣的东西。',image:'story-assets/story-1.jpg',layout:'stack'},
        {date:'2026 · 春',title:'网易',description:'网易是我接触AI产品的开端，让我开始看到这个神秘又神奇的领域，思考AI满足用户需求的可能性。',image:'story-assets/story-2.jpg',layout:'stack'},
        {date:'2025 · 秋冬',title:'乐信圣文',description:'我做产品的起点，这里有很好的mentor、很成熟的团队、很规范且高效的业务流程，是我会怀念的地方。',image:'story-assets/story-3.jpg',layout:'side'},
        {date:'2024 · 夏',title:'四姑娘山',description:'毕业后在四姑娘山下做了一个月义工，是我生命中美好、充满生机的夏天。',image:'story-assets/story-4.jpg',layout:'side'}
      ]},
      {id:'products-main',type:'products',title:'我的产品',visible:true,items:[
        {title:'QuickNote',description:'随手记一切的轻量笔记，我的第一个独立产品',image:'yaxin-assets/quicknote-icon-final.png',url:'https://github.com/'}
      ]},
      {id:'xhs-main',type:'xhs',title:'我的小红书',visible:true,items:[
        {title:'价格困惑',image:'yaxin-assets/xhs-card-1.jpg',url:'https://www.xiaohongshu.com/'},
        {title:'商店 vs 仓库',image:'yaxin-assets/xhs-card-2.jpg',url:'https://www.xiaohongshu.com/'},
        {title:'平衡感',image:'yaxin-assets/xhs-card-3.jpg',url:'https://www.xiaohongshu.com/'}
      ]},
      {id:'album-main',type:'album',title:'我的摄影',visible:true,cover:'album-preview-assets/cover-photo.jpg',pages:[
        {layout:'wide',images:['album-preview-assets/photo-1.jpg']},
        {layout:'tall',images:['album-preview-assets/photo-5.jpg']},
        {layout:'wide',images:['album-preview-assets/photo-2.jpg']},
        {layout:'pair',images:['album-preview-assets/photo-4.jpg','album-preview-assets/photo-3.jpg']}
      ]},
      {id:'notes-main',type:'notes',title:'我的笔记',visible:true,items:[
        {title:'[笔记标题一]',url:'#'},{title:'[笔记标题二]',url:'#'},{title:'[笔记标题三]',url:'#'}
      ]}
    ],
    footer:{
      links:[{label:'小红书',url:'https://www.xiaohongshu.com/'},{label:'GitHub',url:'https://github.com/'},{label:'Email',url:'mailto:hello@example.com'}],
      ctaLabel:'来找我聊聊',ctaUrl:'mailto:hello@example.com'
    }
  };

  var typeNames={experience:'经历',products:'产品',xhs:'小红书',album:'摄影',notes:'笔记'};
  var config=JSON.parse(JSON.stringify(DEFAULT_CONFIG));
  var selectedId='experience-main';
  var collapsedModules=new Set();
  var previewReady=false;
  var saveTimer=null;
  var publishing=false;
  var preview=document.getElementById('sitePreview');
  var themeEditor=document.getElementById('themeEditor');
  var profileEditor=document.getElementById('profileEditor');
  var moduleEditor=document.getElementById('moduleEditor');
  var footerEditor=document.getElementById('footerEditor');
  var ctaEditor=document.getElementById('ctaEditor');
  var statusNode=document.getElementById('saveStatus');

  function esc(value){return String(value==null?'':value).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
  function clone(value){return JSON.parse(JSON.stringify(value));}
  function makeId(type){return type+'-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,6);}
  function getModule(id){return config.modules.find(function(item){return item.id===id;});}
  function setStatus(text){statusNode.textContent=text;}

  function imageField(src,attributes){
    return '<div class="upload-row"><img class="image-thumb" src="'+esc(src)+'" alt=""><label class="upload-button">选择图片<input type="file" accept="image/*" '+attributes+'></label></div>';
  }

  function renderTheme(){
    var color=/^#[0-9a-f]{6}$/i.test(config.themeColor||'')?config.themeColor:'#8478D2';
    themeEditor.innerHTML='<div class="theme-picker"><label class="color-picker-control" title="选择颜色"><input type="color" value="'+color+'" data-action="theme-color-picker" aria-label="打开颜色面板"></label><input class="color-value" type="text" value="'+color.toUpperCase()+'" data-action="theme-color-text" maxlength="7" aria-label="当前主题色色值"></div>';
  }

  function managementControls(kind,id,index,total,visible){
    var actions={
      module:{up:'move-up',down:'move-down',toggle:'toggle-visible',copy:'duplicate-module',remove:'delete-module'},
      item:{up:'move-item-up',down:'move-item-down',toggle:'toggle-item-visible',copy:'duplicate-item',remove:'delete-item'},
      page:{up:'move-page-up',down:'move-page-down',toggle:'toggle-page-visible',copy:'duplicate-page',remove:'delete-page'},
      footer:{up:'move-footer-up',down:'move-footer-down',toggle:'toggle-footer-visible',copy:'duplicate-footer-link',remove:'delete-footer-link'}
    }[kind];
    var attrs=(id?' data-id="'+esc(id)+'"':'')+' data-index="'+index+'"';
    return '<button class="icon-button" type="button" data-action="'+actions.up+'"'+attrs+' data-tip="上移" aria-label="上移" '+(index===0?'disabled':'')+'>↑</button><button class="icon-button" type="button" data-action="'+actions.down+'"'+attrs+' data-tip="下移" aria-label="下移" '+(index===total-1?'disabled':'')+'>↓</button><details class="more-menu"><summary class="icon-button" data-tip="更多" aria-label="更多操作">…</summary><div class="more-menu-list"><button type="button" data-action="'+actions.toggle+'"'+attrs+'>'+(visible?'隐藏':'显示')+'</button><button type="button" data-action="'+actions.copy+'"'+attrs+'>复制</button><button class="danger" type="button" data-action="'+actions.remove+'"'+attrs+'>删除</button></div></details>';
  }
  function field(label,value,attributes,type){return '<label class="field"><span>'+label+'</span><input type="'+(type||'text')+'" value="'+esc(value)+'" '+attributes+'></label>';}
  function textarea(label,value,attributes){return '<label class="field"><span>'+label+'</span><textarea '+attributes+'>'+esc(value)+'</textarea></label>';}

  function renderProfile(){
    profileEditor.innerHTML='<div class="field"><span>头像</span>'+imageField(config.profile.avatar,'data-image="profile" data-field="avatar"')+'</div>'+field('名字',config.profile.name,'data-action="profile-field" data-field="name"')+field('名字链接',config.profile.nameLink,'data-action="profile-field" data-field="nameLink"','url')+textarea('简短介绍',config.profile.intro,'data-action="profile-field" data-field="intro"');
  }

  function itemHeader(label,module,index){
    var item=module.items[index],visible=item.visible!==false;
    return '<div class="item-head"><strong>'+label+'</strong><div class="item-actions">'+managementControls('item',module.id,index,module.items.length,visible)+'</div></div>';
  }
  function itemAttrs(module,index,fieldName){return 'data-action="item-field" data-id="'+module.id+'" data-index="'+index+'" data-field="'+fieldName+'"';}
  function itemImageAttrs(module,index,fieldName){return 'data-image="item" data-id="'+module.id+'" data-index="'+index+'" data-field="'+fieldName+'"';}

  function renderExperienceEditor(module){
    return module.items.map(function(item,index){return '<div class="item-card '+(item.visible===false?'is-hidden':'')+'">'+itemHeader('经历 '+(index+1),module,index)+'<div class="field"><span>图片</span>'+imageField(item.image,itemImageAttrs(module,index,'image'))+'</div><div class="inline-grid">'+field('时间',item.date,itemAttrs(module,index,'date'))+field('标题',item.title,itemAttrs(module,index,'title'))+'</div><label class="field"><span>布局</span><select '+itemAttrs(module,index,'layout')+'><option value="stack" '+(item.layout==='stack'?'selected':'')+'>图上文字下</option><option value="stack-reverse" '+(item.layout==='stack-reverse'?'selected':'')+'>文字上图下</option><option value="side" '+(item.layout==='side'?'selected':'')+'>图左文字右</option><option value="side-reverse" '+(item.layout==='side-reverse'?'selected':'')+'>文字左图右</option></select></label>'+textarea('描述',item.description,itemAttrs(module,index,'description'))+'</div>';}).join('')+'<button class="add-button" type="button" data-action="add-item" data-id="'+module.id+'">＋ 添加经历</button>';
  }
  function renderProductsEditor(module){
    return module.items.map(function(item,index){return '<div class="item-card '+(item.visible===false?'is-hidden':'')+'">'+itemHeader('产品 '+(index+1),module,index)+'<div class="field"><span>图标</span>'+imageField(item.image,itemImageAttrs(module,index,'image'))+'</div>'+field('名称',item.title,itemAttrs(module,index,'title'))+textarea('描述',item.description,itemAttrs(module,index,'description'))+field('链接',item.url,itemAttrs(module,index,'url'),'url')+'</div>';}).join('')+'<button class="add-button" type="button" data-action="add-item" data-id="'+module.id+'">＋ 添加产品</button>';
  }
  function renderXhsEditor(module){
    return module.items.map(function(item,index){return '<div class="item-card '+(item.visible===false?'is-hidden':'')+'">'+itemHeader('卡片 '+(index+1),module,index)+'<div class="field"><span>图片</span>'+imageField(item.image,itemImageAttrs(module,index,'image'))+'</div>'+field('标题',item.title,itemAttrs(module,index,'title'))+field('链接',item.url,itemAttrs(module,index,'url'),'url')+'</div>';}).join('')+'<button class="add-button" type="button" data-action="add-item" data-id="'+module.id+'">＋ 添加卡片</button>';
  }
  function renderNotesEditor(module){
    return module.items.map(function(item,index){return '<div class="item-card '+(item.visible===false?'is-hidden':'')+'">'+itemHeader('笔记 '+(index+1),module,index)+field('标题',item.title,itemAttrs(module,index,'title'))+field('链接',item.url,itemAttrs(module,index,'url'),'url')+'</div>';}).join('')+'<button class="add-button" type="button" data-action="add-item" data-id="'+module.id+'">＋ 添加笔记</button>';
  }
  function renderAlbumEditor(module){
    var html='<div class="field"><span>封面图片</span>'+imageField(module.cover,'data-image="album-cover" data-id="'+module.id+'"')+'</div>';
    html+=module.pages.map(function(page,index){
      var second=page.layout==='pair'?'<div class="field"><span>第二张图片</span>'+imageField(page.images[1]||'','data-image="album-page" data-id="'+module.id+'" data-index="'+index+'" data-image-index="1"')+'</div>':'';
      var visible=page.visible!==false;
      return '<div class="item-card '+(visible?'':'is-hidden')+'"><div class="item-head"><strong>页面 '+(index+1)+'</strong><div class="item-actions">'+managementControls('page',module.id,index,module.pages.length,visible)+'</div></div><label class="field"><span>页面模板</span><select data-action="album-layout" data-id="'+module.id+'" data-index="'+index+'"><option value="tall" '+(page.layout==='tall'?'selected':'')+'>单张竖图</option><option value="wide" '+(page.layout==='wide'||page.layout==='quiet'?'selected':'')+'>单张横图</option><option value="pair" '+(page.layout==='pair'?'selected':'')+'>上下双图</option></select></label><div class="field"><span>第一张图片</span>'+imageField(page.images[0]||'','data-image="album-page" data-id="'+module.id+'" data-index="'+index+'" data-image-index="0"')+'</div>'+second+'</div>';
    }).join('');
    return html+'<button class="add-button" type="button" data-action="add-page" data-id="'+module.id+'">＋ 添加相册页面</button>';
  }

  function moduleEditorBody(module){
    if(module.type==='experience') return renderExperienceEditor(module);
    if(module.type==='products') return renderProductsEditor(module);
    if(module.type==='xhs') return renderXhsEditor(module);
    if(module.type==='album') return renderAlbumEditor(module);
    if(module.type==='notes') return renderNotesEditor(module);
    return '';
  }

  function renderModuleEditor(){
    document.getElementById('contentHeading').textContent='模块内容';
    moduleEditor.innerHTML=config.modules.map(function(module,index){
      var collapsed=collapsedModules.has(module.id);
      return '<section class="module-editor-block '+(module.id===selectedId?'is-selected ':'')+(module.visible===false?'is-hidden ':'')+(collapsed?'is-collapsed':'')+'" data-module-panel="'+esc(module.id)+'"><div class="module-card-head"><div class="module-card-title"><input value="'+esc(module.title)+'" data-action="module-title" data-id="'+esc(module.id)+'" aria-label="模块标题"><button class="icon-button collapse-toggle" type="button" data-action="toggle-collapse" data-id="'+esc(module.id)+'" data-tip="'+(collapsed?'展开':'折叠')+'" aria-label="'+(collapsed?'展开':'折叠')+'">▾</button></div><div class="module-card-actions">'+managementControls('module',module.id,index,config.modules.length,module.visible!==false)+'</div></div><div class="module-editor-body">'+moduleEditorBody(module)+'</div></section>';
    }).join('')+'<button class="add-module-button" type="button" data-action="open-module-picker">＋ 添加模块</button>';
  }

  function renderFooter(){
    footerEditor.innerHTML=config.footer.links.map(function(link,index){var visible=link.visible!==false;return '<div class="item-card '+(visible?'':'is-hidden')+'"><div class="item-head"><strong>链接 '+(index+1)+'</strong><div class="item-actions">'+managementControls('footer','',index,config.footer.links.length,visible)+'</div></div>'+field('展示文案',link.label,'data-action="footer-link" data-index="'+index+'" data-field="label"')+field('链接',link.url,'data-action="footer-link" data-index="'+index+'" data-field="url"','url')+'</div>';}).join('')+'<button class="add-button" type="button" data-action="add-footer-link">＋ 添加页脚链接</button>';
  }

  function renderCta(){ctaEditor.innerHTML='<div class="item-card">'+field('按钮文案',config.footer.ctaLabel,'data-action="footer-field" data-field="ctaLabel"')+field('按钮链接',config.footer.ctaUrl,'data-action="footer-field" data-field="ctaUrl"','url')+'</div>';}

  function renderEditors(){renderTheme();renderProfile();renderModuleEditor();renderFooter();renderCta();}
  function sendPreview(){if(previewReady&&preview.contentWindow)preview.contentWindow.postMessage({type:'SITE_CONFIG',config:config},'*');}

  function openDb(){return new Promise(function(resolve,reject){var request=indexedDB.open('personal-site-editor',1);request.onupgradeneeded=function(){request.result.createObjectStore('drafts');};request.onsuccess=function(){resolve(request.result);};request.onerror=function(){reject(request.error);};});}
  async function saveDraft(){
    try{var db=await openDb();var tx=db.transaction('drafts','readwrite');tx.objectStore('drafts').put(clone(config),'main');await new Promise(function(resolve,reject){tx.oncomplete=resolve;tx.onerror=function(){reject(tx.error);};});setStatus('草稿已保存');}
    catch(error){setStatus('草稿保存失败');}
  }
  async function loadDraft(){
    try{var db=await openDb();var tx=db.transaction('drafts','readonly');var request=tx.objectStore('drafts').get('main');var draft=await new Promise(function(resolve,reject){request.onsuccess=function(){resolve(request.result);};request.onerror=function(){reject(request.error);};});if(draft){config=draft;selectedId=config.modules[0]&&config.modules[0].id;setStatus('已恢复草稿');}}
    catch(error){setStatus('使用初始内容');}
  }
  function changed(structural){
    sendPreview();setStatus('正在保存…');clearTimeout(saveTimer);saveTimer=setTimeout(saveDraft,650);
    if(structural) renderEditors();
  }

  function readImage(file){return new Promise(function(resolve,reject){var reader=new FileReader();reader.onload=function(){resolve(reader.result);};reader.onerror=reject;reader.readAsDataURL(file);});}
  async function handleImage(input){
    if(!input.files||!input.files[0])return;
    var data=await readImage(input.files[0]);
    if(input.dataset.image==='profile') config.profile[input.dataset.field]=data;
    if(input.dataset.image==='album-cover') getModule(input.dataset.id).cover=data;
    if(input.dataset.image==='item') getModule(input.dataset.id).items[Number(input.dataset.index)][input.dataset.field]=data;
    if(input.dataset.image==='album-page') getModule(input.dataset.id).pages[Number(input.dataset.index)].images[Number(input.dataset.imageIndex)]=data;
    changed(true);
  }

  function newItem(type){
    if(type==='experience')return {date:'时间',title:'标题',description:'填写你的经历描述',image:'',layout:'stack'};
    if(type==='products')return {title:'新产品',description:'产品描述',image:'',url:'#'};
    if(type==='xhs')return {title:'新卡片',image:'',url:'#'};
    return {title:'新笔记',url:'#'};
  }

  document.querySelector('.editor-pane').addEventListener('input',function(event){
    var target=event.target,action=target.dataset.action;
    if(action==='profile-field')config.profile[target.dataset.field]=target.value;
    if(action==='theme-color-text'&&/^#[0-9a-f]{6}$/i.test(target.value)){config.themeColor=target.value.toUpperCase();var typedPicker=document.querySelector('[data-action="theme-color-picker"]');if(typedPicker)typedPicker.value=config.themeColor;changed(false);return;}
    if(action==='theme-color-picker'){config.themeColor=target.value.toUpperCase();var valueInput=document.querySelector('[data-action="theme-color-text"]');if(valueInput)valueInput.value=config.themeColor;changed(false);return;}
    if(action==='module-title'){var module=getModule(target.dataset.id);module.title=target.value;if(module.id===selectedId)document.getElementById('contentHeading').textContent=target.value;}
    if(action==='item-field')getModule(target.dataset.id).items[Number(target.dataset.index)][target.dataset.field]=target.value;
    if(action==='footer-field')config.footer[target.dataset.field]=target.value;
    if(action==='footer-link')config.footer.links[Number(target.dataset.index)][target.dataset.field]=target.value;
    if(action)changed(false);
  });
  document.querySelector('.editor-pane').addEventListener('change',function(event){
    var target=event.target;
    if(target.type==='file'){handleImage(target);return;}
    if(target.dataset.action==='album-layout'){var page=getModule(target.dataset.id).pages[Number(target.dataset.index)];page.layout=target.value;if(target.value==='pair'&&!page.images[1])page.images[1]='';changed(true);}
  });
  document.querySelector('.editor-pane').addEventListener('click',async function(event){
    var button=event.target.closest('button[data-action]');if(!button)return;
    var action=button.dataset.action,id=button.dataset.id,module=getModule(id),index=Number(button.dataset.index);
    if(action==='open-module-picker'){document.getElementById('modulePicker').showModal();return;}
    if(action==='close-module-picker'){document.getElementById('modulePicker').close();return;}
    if(action==='add-module-template'){
      var template=DEFAULT_CONFIG.modules.find(function(item){return item.type===button.dataset.type;});
      var added=clone(template),sameCount=config.modules.filter(function(item){return item.type===added.type;}).length;
      added.id=makeId(added.type);if(sameCount)added.title=added.title+' '+(sameCount+1);
      config.modules.push(added);selectedId=added.id;document.getElementById('modulePicker').close();changed(true);
      var addedPanel=document.querySelector('[data-module-panel="'+added.id+'"]');if(addedPanel)addedPanel.scrollIntoView({behavior:'smooth',block:'start'});
      return;
    }
    if(action==='toggle-collapse'){if(collapsedModules.has(id))collapsedModules.delete(id);else collapsedModules.add(id);renderModuleEditor();return;}
    if(action==='toggle-visible'){module.visible=module.visible===false;changed(true);return;}
    if(action==='move-up'||action==='move-down'){var from=config.modules.findIndex(function(item){return item.id===id;});var to=from+(action==='move-up'?-1:1);if(to>=0&&to<config.modules.length){var moved=config.modules.splice(from,1)[0];config.modules.splice(to,0,moved);changed(true);}return;}
    if(action==='duplicate-module'){var copied=clone(module);copied.id=makeId(copied.type);copied.title=copied.title+' 副本';var at=config.modules.indexOf(module);config.modules.splice(at+1,0,copied);selectedId=copied.id;changed(true);return;}
    if(action==='delete-module'){var sameTypeCount=config.modules.filter(function(item){return item.type===module.type;}).length;if(sameTypeCount===1&&!confirm('这是最后一个“'+(typeNames[module.type]||module.title)+'”模块，确认删除吗？'))return;var moduleIndex=config.modules.findIndex(function(item){return item.id===id;});config.modules.splice(moduleIndex,1);collapsedModules.delete(id);if(selectedId===id)selectedId=(config.modules[moduleIndex]||config.modules[moduleIndex-1]||{}).id||'';changed(true);return;}
    if(action==='add-item'){module.items.push(newItem(module.type));changed(true);return;}
    if(action==='toggle-item-visible'){module.items[index].visible=module.items[index].visible===false;changed(true);return;}
    if(action==='move-item-up'||action==='move-item-down'){var itemTo=index+(action==='move-item-up'?-1:1);if(itemTo>=0&&itemTo<module.items.length){var itemMoved=module.items.splice(index,1)[0];module.items.splice(itemTo,0,itemMoved);changed(true);}return;}
    if(action==='duplicate-item'){module.items.splice(index+1,0,clone(module.items[index]));changed(true);return;}
    if(action==='delete-item'){module.items.splice(index,1);changed(true);return;}
    if(action==='add-page'){module.pages.push({layout:'wide',images:['']});changed(true);return;}
    if(action==='toggle-page-visible'){module.pages[index].visible=module.pages[index].visible===false;changed(true);return;}
    if(action==='move-page-up'||action==='move-page-down'){var pageTo=index+(action==='move-page-up'?-1:1);if(pageTo>=0&&pageTo<module.pages.length){var pageMoved=module.pages.splice(index,1)[0];module.pages.splice(pageTo,0,pageMoved);changed(true);}return;}
    if(action==='duplicate-page'){module.pages.splice(index+1,0,clone(module.pages[index]));changed(true);return;}
    if(action==='delete-page'){module.pages.splice(index,1);changed(true);return;}
    if(action==='add-footer-link'){config.footer.links.push({label:'新链接',url:'#'});changed(true);return;}
    if(action==='toggle-footer-visible'){config.footer.links[index].visible=config.footer.links[index].visible===false;changed(true);return;}
    if(action==='move-footer-up'||action==='move-footer-down'){var footerTo=index+(action==='move-footer-up'?-1:1);if(footerTo>=0&&footerTo<config.footer.links.length){var footerMoved=config.footer.links.splice(index,1)[0];config.footer.links.splice(footerTo,0,footerMoved);changed(true);}return;}
    if(action==='duplicate-footer-link'){config.footer.links.splice(index+1,0,clone(config.footer.links[index]));changed(true);return;}
    if(action==='delete-footer-link'){config.footer.links.splice(index,1);changed(true);}
  });

  document.querySelector('.view-switch').addEventListener('click',function(event){var button=event.target.closest('button[data-view]');if(!button)return;document.querySelectorAll('.view-switch button').forEach(function(item){item.classList.toggle('is-active',item===button);});document.getElementById('previewStage').classList.toggle('is-mobile',button.dataset.view==='mobile');});
  document.getElementById('resetButton').addEventListener('click',function(){if(!confirm('恢复初始内容？当前编辑会被覆盖。'))return;config=clone(DEFAULT_CONFIG);selectedId=config.modules[0].id;changed(true);saveDraft();});
  document.getElementById('exportConfigButton').addEventListener('click',function(){downloadBlob(JSON.stringify(config,null,2),'个人主页配置.json','application/json');});
  document.getElementById('exportHtmlButton').addEventListener('click',function(){setStatus('正在生成网页…');preview.contentWindow.postMessage({type:'SITE_EXPORT_HTML'},'*');});
  document.getElementById('publishButton').addEventListener('click',function(){document.getElementById('publishResult').hidden=true;document.getElementById('publishMessage').textContent='正在保存 index.html…';document.getElementById('publishDialog').showModal();publishing=true;setStatus('正在生成发布文件…');preview.contentWindow.postMessage({type:'SITE_EXPORT_HTML'},'*');});
  document.getElementById('closePublishButton').addEventListener('click',function(){document.getElementById('publishDialog').close();});
  document.getElementById('copyPublishPathButton').addEventListener('click',async function(){var input=document.getElementById('publishFilePath');try{await navigator.clipboard.writeText(input.value);}catch(error){input.select();document.execCommand('copy');}this.textContent='已复制';setTimeout(function(){document.getElementById('copyPublishPathButton').textContent='复制地址';},1200);});
  preview.addEventListener('load',function(){previewReady=true;sendPreview();});

  function downloadBlob(content,name,type){var blob=new Blob([content],{type:type});var url=URL.createObjectURL(blob);var anchor=document.createElement('a');anchor.href=url;anchor.download=name;anchor.click();setTimeout(function(){URL.revokeObjectURL(url);},1000);}

  window.addEventListener('message',function(event){
    if(!event.data)return;
    if(event.data.type==='SITE_PREVIEW_READY'){previewReady=true;sendPreview();}
    if(event.data.type==='SITE_SELECT_MODULE'&&getModule(event.data.id)){selectedId=event.data.id;collapsedModules.delete(event.data.id);renderModuleEditor();var panel=document.querySelector('[data-module-panel="'+event.data.id+'"]');if(panel)panel.scrollIntoView({behavior:'smooth',block:'start'});}
    if(event.data.type==='SITE_EXPORT_HTML_RESULT'){
      if(publishing){
        downloadBlob(event.data.html,'index.html','text/html');
        document.getElementById('publishMessage').textContent='文件已保存，可复制地址后继续发布。';
        document.getElementById('publishResult').hidden=false;
        setStatus('发布文件已生成');
      }else{
        downloadBlob(event.data.html,'我的个人主页.html','text/html');setStatus('网页已下载');
      }
      publishing=false;
    }
  });

  (async function init(){await loadDraft();renderEditors();sendPreview();})();
})();
