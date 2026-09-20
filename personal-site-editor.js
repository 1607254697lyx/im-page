(function(){
  'use strict';

  var DEFAULT_CONFIG = {
    themeColor:'#8478D2',
    experienceStyle:'polaroid',
    profile:{
      avatar:'yaxin-assets/avatar-final.png',
      name:'yaxin',
      nameLink:'https://github.com/',
      circleText:'自留地',
      intro:'你好，我是yaxin，一个正在快速成长的 AI 产品练习生，欢迎来到我的自留地。'
    },
    notesLibrary:{categories:[
      {id:'category-product',name:'产品思考',notes:[
        {id:'note-product',title:'从需求开始思考产品',date:'2026 · 09',fileName:'从需求开始思考产品.md',content:'# 从需求开始思考产品\n\n真正值得做的需求，往往不是一句功能描述，而是用户在某个场景里反复遇到的问题。\n\n## 我会先问\n\n- 用户现在怎样解决？\n- 这个问题出现得有多频繁？\n- 做完之后，体验具体改变在哪里？'}
      ]},
      {id:'category-ai',name:'AI',notes:[
        {id:'note-ai',title:'我理解的 AI 产品',date:'2026 · 08',fileName:'我理解的 AI 产品.md',content:'# 我理解的 AI 产品\n\nAI 不只是一个能力按钮，它会改变用户完成任务的路径。\n\n> 好的 AI 产品，应该让复杂能力自然地进入用户的工作流。'}
      ]},
      {id:'category-daily',name:'日常记录',notes:[
        {id:'note-daily',title:'最近学到的小事',date:'2026 · 07',fileName:'最近学到的小事.md',content:'# 最近学到的小事\n\n保持好奇，持续记录，也允许自己的理解慢慢变化。'}
      ]}
    ]},
    modules:[
      {id:'experience-main',type:'experience',title:'我的经历',visible:true,items:[
        {date:'2026 · 夏',title:'智谱',description:'很幸运进入智谱，做桌面Agent产品AutoClaw的实习生，在这里浸泡在AI的氛围中，每天都在学习很多新而有趣的东西。',image:'story-assets/story-1.jpg',layout:'stack'},
        {date:'2026 · 春',title:'网易',description:'网易是我接触AI产品的开端，让我开始看到这个神秘又神奇的领域，思考AI满足用户需求的可能性。',image:'story-assets/story-2.jpg',layout:'stack'},
        {date:'2025 · 秋冬',title:'乐信圣文',description:'我做产品的起点，这里有很好的mentor、很成熟的团队、很规范且高效的业务流程，是我会怀念的地方。',image:'story-assets/story-3.jpg',layout:'side'},
        {date:'2024 · 夏',title:'四姑娘山',description:'毕业后在四姑娘山下做了一个月义工，是我生命中美好、充满生机的夏天。',image:'story-assets/story-4.jpg',layout:'side-reverse'}
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
      {id:'notes-main',type:'notes',title:'我的笔记',visible:true,featuredNoteIds:['note-product','note-ai','note-daily']}
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
  var iconCropDialog=document.getElementById('iconCropDialog');
  var iconCropStage=document.getElementById('iconCropStage');
  var iconCropImage=document.getElementById('iconCropImage');
  var iconCropBox=document.getElementById('iconCropBox');
  var iconCropCanvas=document.getElementById('iconCropCanvas');
  var iconCropContext=iconCropCanvas.getContext('2d');
  var iconCropTitle=document.getElementById('iconCropTitle');
  var iconCropHint=document.getElementById('iconCropHint');
  var iconCropState=null;
  var quickMode=new URLSearchParams(location.search).get('mode')==='quick';
  var historyDialog=document.getElementById('historyDialog');
  var historyList=document.getElementById('historyList');
  var lastAutoVersionAt=0;
  var lastVersionSignature='';
  var editorMode='home';
  var notesLibraryEditor=document.getElementById('notesLibraryEditor');

  function esc(value){return String(value==null?'':value).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
  function clone(value){return JSON.parse(JSON.stringify(value));}
  function makeId(type){return type+'-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,6);}
  function getModule(id){return config.modules.find(function(item){return item.id===id;});}
  function setStatus(text){statusNode.textContent=text;}
  function allNotes(){var list=[];(config.notesLibrary&&config.notesLibrary.categories||[]).forEach(function(category){(category.notes||[]).forEach(function(note){list.push({id:note.id,title:note.title,date:note.date,content:note.content,fileName:note.fileName,category:category.name,categoryId:category.id});});});return list;}
  function findNote(id){return allNotes().find(function(note){return note.id===id;});}
  function primaryNotesModule(){return config.modules.find(function(module){return module.type==='notes'&&module.visible!==false;})||config.modules.find(function(module){return module.type==='notes';});}
  function findNoteRecord(id){var found=null;(config.notesLibrary.categories||[]).some(function(category){var index=(category.notes||[]).findIndex(function(note){return note.id===id;});if(index!==-1){found={category:category,note:category.notes[index],index:index};return true;}return false;});return found;}
  function normalizeNotes(){
    var oldItems=[];
    config.modules.filter(function(module){return module.type==='notes';}).forEach(function(module){(module.items||[]).forEach(function(item){oldItems.push(item);});});
    if(!config.notesLibrary||!Array.isArray(config.notesLibrary.categories)){
      var grouped={};oldItems.forEach(function(item){var name=item.category||'未分类';if(!grouped[name])grouped[name]={id:makeId('category'),name:name,notes:[]};grouped[name].notes.push({id:item.id||makeId('note'),title:item.title||'未命名笔记',date:item.date||'',fileName:'',content:item.content||''});});
      config.notesLibrary={categories:Object.keys(grouped).map(function(name){return grouped[name];})};
      if(!config.notesLibrary.categories.length)config.notesLibrary=clone(DEFAULT_CONFIG.notesLibrary);
    }
    var ids={};config.notesLibrary.categories.forEach(function(category){if(!category.id)category.id=makeId('category');if(!category.name)category.name='未分类';if(!Array.isArray(category.notes))category.notes=[];category.notes.forEach(function(note){if(!note.id||ids[note.id])note.id=makeId('note');ids[note.id]=true;if(!note.title)note.title='未命名笔记';if(!note.date)note.date='';if(!note.fileName)note.fileName='';if(note.content==null)note.content='';delete note.summary;delete note.description;delete note.category;});});
    var validIds=allNotes().map(function(note){return note.id;});config.modules.filter(function(module){return module.type==='notes';}).forEach(function(module){if(!Array.isArray(module.featuredNoteIds))module.featuredNoteIds=(module.items||[]).map(function(item){return item.id;});module.featuredNoteIds=module.featuredNoteIds.filter(function(id,index,list){return validIds.indexOf(id)!==-1&&list.indexOf(id)===index;});delete module.items;});
  }

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
    profileEditor.innerHTML='<div class="field profile-avatar-field"><span>头像</span>'+imageField(config.profile.avatar,'data-image="profile" data-field="avatar"')+'</div>'+field('名字',config.profile.name,'data-action="profile-field" data-field="name"')+field('名字链接',config.profile.nameLink,'data-action="profile-field" data-field="nameLink"','url')+textarea('简短介绍',config.profile.intro,'data-action="profile-field" data-field="intro"');
  }

  function itemHeader(label,module,index){
    var item=module.items[index],visible=item.visible!==false;
    return '<div class="item-head"><strong>'+label+'</strong><div class="item-actions">'+managementControls('item',module.id,index,module.items.length,visible)+'</div></div>';
  }
  function itemAttrs(module,index,fieldName){return 'data-action="item-field" data-id="'+module.id+'" data-index="'+index+'" data-field="'+fieldName+'"';}
  function itemImageAttrs(module,index,fieldName){return 'data-image="item" data-id="'+module.id+'" data-index="'+index+'" data-field="'+fieldName+'"';}

  function renderExperienceEditor(module){
    return module.items.map(function(item,index){return '<div class="item-card '+(item.visible===false?'is-hidden':'')+'">'+itemHeader('经历 '+(index+1),module,index)+'<div class="field"><span>图片</span>'+imageField(item.image,itemImageAttrs(module,index,'image'))+'</div><div class="inline-grid">'+field('时间',item.date,itemAttrs(module,index,'date'))+field('标题',item.title,itemAttrs(module,index,'title'))+'</div><label class="field"><span>布局</span><select '+itemAttrs(module,index,'layout')+'><option value="stack" '+(item.layout==='stack'||item.layout==='stack-reverse'?'selected':'')+'>横图 · 文字下</option><option value="side" '+(item.layout==='side'?'selected':'')+'>竖图 · 文字右</option><option value="side-reverse" '+(item.layout==='side-reverse'?'selected':'')+'>竖图 · 文字左</option></select></label>'+textarea('描述',item.description,itemAttrs(module,index,'description'))+'</div>';}).join('')+'<button class="add-button" type="button" data-action="add-item" data-id="'+module.id+'">＋ 添加经历</button>';
  }
  function renderProductsEditor(module){
    return module.items.map(function(item,index){return '<div class="item-card '+(item.visible===false?'is-hidden':'')+'">'+itemHeader('产品 '+(index+1),module,index)+'<div class="field"><span>图标</span>'+imageField(item.image,itemImageAttrs(module,index,'image'))+'</div>'+field('名称',item.title,itemAttrs(module,index,'title'))+textarea('描述',item.description,itemAttrs(module,index,'description'))+field('链接',item.url,itemAttrs(module,index,'url'),'url')+'</div>';}).join('')+'<button class="add-button" type="button" data-action="add-item" data-id="'+module.id+'">＋ 添加产品</button>';
  }
  function renderXhsEditor(module){
    return module.items.map(function(item,index){return '<div class="item-card '+(item.visible===false?'is-hidden':'')+'">'+itemHeader('卡片 '+(index+1),module,index)+'<div class="field"><span>图片</span>'+imageField(item.image,itemImageAttrs(module,index,'image'))+'</div>'+field('标题',item.title,itemAttrs(module,index,'title'))+field('链接',item.url,itemAttrs(module,index,'url'),'url')+'</div>';}).join('')+'<button class="add-button" type="button" data-action="add-item" data-id="'+module.id+'">＋ 添加卡片</button>';
  }
  function renderNotesEditor(module){
    var count=(module.featuredNoteIds||[]).filter(function(id){return !!findNote(id);}).length;
    return '<div class="featured-note-editor"><div class="featured-note-heading"><span>主页展示</span><button class="button ghost" type="button" data-action="open-notes-editor">管理全部笔记</button></div><div class="featured-note-summary"><span class="featured-heart">♥</span><div><strong>已展示 '+count+' 篇笔记</strong><small>前往笔记中心，点击爱心选择展示内容</small></div></div></div>';
  }

  function renderNotesLibrary(){
    var categories=config.notesLibrary.categories||[];
    var homeModule=primaryNotesModule(),featuredIds=homeModule&&homeModule.featuredNoteIds||[];
    notesLibraryEditor.innerHTML=categories.map(function(category,categoryIndex){
      var notes=(category.notes||[]).map(function(note,noteIndex){var featured=featuredIds.indexOf(note.id)!==-1;return '<div class="library-note-card"><div class="item-head"><strong>笔记 '+(noteIndex+1)+'</strong><div class="item-actions"><button class="note-heart '+(featured?'is-active':'')+'" type="button" data-action="toggle-home-note" data-note-id="'+note.id+'" data-tip="'+(featured?'取消展示':'主页展示')+'" aria-label="'+(featured?'取消主页展示':'展示在主页')+'" aria-pressed="'+featured+'">'+(featured?'♥':'♡')+'</button><button class="icon-button" type="button" data-action="move-library-note-up" data-note-id="'+note.id+'" data-tip="上移" aria-label="上移" '+(noteIndex===0?'disabled':'')+'>↑</button><button class="icon-button" type="button" data-action="move-library-note-down" data-note-id="'+note.id+'" data-tip="下移" aria-label="下移" '+(noteIndex===category.notes.length-1?'disabled':'')+'>↓</button><button class="icon-button" type="button" data-action="delete-library-note" data-note-id="'+note.id+'" data-tip="删除" aria-label="删除">×</button></div></div><div class="inline-grid">'+field('标题',note.title,'data-action="library-note-field" data-note-id="'+note.id+'" data-field="title"')+field('时间',note.date,'data-action="library-note-field" data-note-id="'+note.id+'" data-field="date"')+'</div><div class="note-file-row"><div><span>Markdown 文件</span><strong>'+esc(note.fileName||'尚未导入')+'</strong></div><label class="upload-button note-upload-button">'+(note.fileName?'重新导入':'导入 .md')+'<input type="file" accept=".md,text/markdown,text/plain" data-library-note-file data-note-id="'+note.id+'"></label></div></div>';}).join('');
      return '<section class="note-category-card"><div class="note-category-head"><input value="'+esc(category.name)+'" data-action="category-name" data-category-id="'+category.id+'" aria-label="分类名称"><div class="item-actions"><button class="icon-button" type="button" data-action="move-category-up" data-category-id="'+category.id+'" data-tip="上移" aria-label="上移" '+(categoryIndex===0?'disabled':'')+'>↑</button><button class="icon-button" type="button" data-action="move-category-down" data-category-id="'+category.id+'" data-tip="下移" aria-label="下移" '+(categoryIndex===categories.length-1?'disabled':'')+'>↓</button><button class="icon-button" type="button" data-action="delete-category" data-category-id="'+category.id+'" data-tip="删除" aria-label="删除">×</button></div></div><div class="category-notes">'+(notes||'<div class="featured-empty">这个分类还没有笔记</div>')+'</div><button class="add-button" type="button" data-action="add-library-note" data-category-id="'+category.id+'">＋ 添加笔记</button></section>';
    }).join('')+'<button class="add-module-button" type="button" data-action="add-category">＋ 添加分类</button>';
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

  function renderEditorMode(){document.getElementById('homeEditorPanels').hidden=editorMode!=='home';document.getElementById('notesEditorPanels').hidden=editorMode!=='notes';document.querySelectorAll('[data-editor-mode]').forEach(function(button){button.classList.toggle('is-active',button.dataset.editorMode===editorMode);});var label=document.querySelector('.preview-toolbar>span');if(label)label.textContent=editorMode==='notes'?'笔记中心预览':'个人主页预览';}
  function renderEditors(){renderTheme();renderProfile();renderModuleEditor();renderFooter();renderCta();renderNotesLibrary();renderEditorMode();}
  function openFirstNotePreview(){var first=allNotes()[0];if(first&&preview.contentWindow&&preview.contentWindow.__OPEN_NOTES__)preview.contentWindow.__OPEN_NOTES__(first.id);}
  function sendPreview(){if(previewReady&&preview.contentWindow){preview.contentWindow.postMessage({type:'SITE_CONFIG',config:config},'*');if(editorMode==='notes')setTimeout(openFirstNotePreview,40);}}

  function openDb(){return new Promise(function(resolve,reject){var request=indexedDB.open('personal-site-editor',2);request.onupgradeneeded=function(){var db=request.result;if(!db.objectStoreNames.contains('drafts'))db.createObjectStore('drafts');if(!db.objectStoreNames.contains('versions'))db.createObjectStore('versions',{keyPath:'id'});};request.onsuccess=function(){resolve(request.result);};request.onerror=function(){reject(request.error);};});}
  function waitTransaction(tx){return new Promise(function(resolve,reject){tx.oncomplete=resolve;tx.onerror=function(){reject(tx.error);};tx.onabort=function(){reject(tx.error);};});}
  async function getVersions(){var db=await openDb(),tx=db.transaction('versions','readonly'),request=tx.objectStore('versions').getAll();var versions=await new Promise(function(resolve,reject){request.onsuccess=function(){resolve(request.result||[]);};request.onerror=function(){reject(request.error);};});return versions.sort(function(a,b){return b.createdAt-a.createdAt;});}
  async function saveVersion(label,automatic){
    var now=Date.now(),signature=JSON.stringify(config);
    if(automatic&&(now-lastAutoVersionAt<300000||signature===lastVersionSignature))return;
    var db=await openDb(),tx=db.transaction('versions','readwrite'),store=tx.objectStore('versions');
    store.put({id:now,label:label,createdAt:now,config:clone(config)});await waitTransaction(tx);
    lastAutoVersionAt=now;lastVersionSignature=signature;
    var versions=await getVersions();
    if(versions.length>10){var trimTx=db.transaction('versions','readwrite'),trimStore=trimTx.objectStore('versions');versions.slice(10).forEach(function(item){trimStore.delete(item.id);});await waitTransaction(trimTx);}
  }
  function formatVersionTime(timestamp){return new Date(timestamp).toLocaleString('zh-CN',{month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'});}
  async function renderHistory(){
    try{var versions=await getVersions();historyList.innerHTML=versions.length?versions.map(function(item){return '<div class="history-item"><div><strong>'+esc(item.label||'历史版本')+'</strong><time>'+formatVersionTime(item.createdAt)+'</time></div><div class="history-actions"><button type="button" data-history-action="restore" data-history-id="'+item.id+'">恢复</button><button class="danger" type="button" data-history-action="delete" data-history-id="'+item.id+'">删除</button></div></div>';}).join(''):'<div class="history-empty">还没有历史版本</div>';}
    catch(error){historyList.innerHTML='<div class="history-empty">历史记录暂时无法读取</div>';}
  }
  async function saveDraft(){
    if(quickMode){setStatus('临时模式');return;}
    try{var db=await openDb();var tx=db.transaction('drafts','readwrite');tx.objectStore('drafts').put(clone(config),'main');await waitTransaction(tx);await saveVersion('自动保存',true);setStatus('草稿已保存');}
    catch(error){setStatus('草稿保存失败');}
  }
  async function loadDraft(){
    if(quickMode){setStatus('临时模式 · 不保留历史');return;}
    try{var db=await openDb();var tx=db.transaction('drafts','readonly');var request=tx.objectStore('drafts').get('main');var draft=await new Promise(function(resolve,reject){request.onsuccess=function(){resolve(request.result);};request.onerror=function(){reject(request.error);};});if(draft){config=draft;if(!config.experienceStyle){config.modules.filter(function(module){return module.type==='experience';}).forEach(function(module){module.items.forEach(function(item){if(item.layout==='stack-reverse')item.layout='stack';});});var mainExperience=config.modules.find(function(module){return module.id==='experience-main';});if(mainExperience&&mainExperience.items[3]&&mainExperience.items[3].title==='四姑娘山')mainExperience.items[3].layout='side-reverse';config.experienceStyle='polaroid';}normalizeNotes();selectedId=config.modules[0]&&config.modules[0].id;lastVersionSignature=JSON.stringify(config);setStatus('已恢复草稿');}else normalizeNotes();}
    catch(error){setStatus('使用初始内容');}
  }
  function changed(structural){
    sendPreview();setStatus('正在保存…');clearTimeout(saveTimer);saveTimer=setTimeout(saveDraft,650);
    if(structural) renderEditors();
  }

  function readImage(file){return new Promise(function(resolve,reject){var reader=new FileReader();reader.onload=function(){resolve(reader.result);};reader.onerror=reject;reader.readAsDataURL(file);});}
  function drawIconCrop(){
    if(!iconCropState)return;
    var rect=iconCropState.imageRect,crop=iconCropState.crop;
    iconCropImage.style.left=rect.x+'px';iconCropImage.style.top=rect.y+'px';iconCropImage.style.width=rect.width+'px';iconCropImage.style.height=rect.height+'px';
    iconCropBox.style.left=crop.x+'px';iconCropBox.style.top=crop.y+'px';iconCropBox.style.width=crop.size+'px';iconCropBox.style.height=crop.size+'px';iconCropBox.style.setProperty('--crop-size',crop.size+'px');
  }
  async function openIconCrop(file,input){
    var data=await readImage(file),image=new Image();
    image.onload=function(){
      var isAvatar=input.dataset.image==='profile';
      iconCropDialog.classList.toggle('is-avatar',isAvatar);
      iconCropTitle.textContent=isAvatar?'裁剪头像':'裁剪产品图标';
      iconCropHint.textContent=isAvatar?'拖动圆形区域选择头像，拖动右下角调整大小':'拖动方框选择区域，拖动右下角调整大小';
      iconCropDialog.showModal();
      requestAnimationFrame(function(){var stageWidth=iconCropStage.clientWidth,stageHeight=iconCropStage.clientHeight,scale=Math.min(stageWidth/image.naturalWidth,stageHeight/image.naturalHeight),width=image.naturalWidth*scale,height=image.naturalHeight*scale,x=(stageWidth-width)/2,y=(stageHeight-height)/2,size=Math.min(width,height)*.72;iconCropImage.src=data;iconCropState={image:image,input:input,kind:isAvatar?'avatar':'product',moduleId:input.dataset.id,index:Number(input.dataset.index),field:input.dataset.field,imageRect:{x:x,y:y,width:width,height:height},crop:{x:x+(width-size)/2,y:y+(height-size)/2,size:size},dragging:false};drawIconCrop();});
    };
    image.src=data;
  }
  async function handleImage(input){
    if(!input.files||!input.files[0])return;
    if(input.dataset.image==='profile'||(input.dataset.image==='item'&&getModule(input.dataset.id).type==='products')){openIconCrop(input.files[0],input);return;}
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
    return {id:makeId('note'),title:'新笔记',date:'',fileName:'',content:''};
  }

  async function handleNoteFile(input){var file=input.files&&input.files[0],record=findNoteRecord(input.dataset.noteId);if(!file||!record)return;var text=(await file.text()).replace(/\r\n?/g,'\n'),note=record.note;note.content=text;note.fileName=file.name;var frontmatter=text.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/);if(frontmatter){var metadata=frontmatter[1];[['title','title'],['date','date']].forEach(function(pair){var match=metadata.match(new RegExp('^'+pair[0]+':\\s*["\\\']?(.+?)["\\\']?\\s*$','m'));if(match)note[pair[1]]=match[1];});note.content=text.slice(frontmatter[0].length);}else{var heading=text.match(/^#\s+(.+)$/m);if(heading)note.title=heading[1].trim();}input.value='';changed(true);setStatus('笔记已导入');}

  document.querySelector('.editor-pane').addEventListener('input',function(event){
    var target=event.target,action=target.dataset.action;
    if(action==='profile-field')config.profile[target.dataset.field]=target.value;
    if(action==='theme-color-text'&&/^#[0-9a-f]{6}$/i.test(target.value)){config.themeColor=target.value.toUpperCase();var typedPicker=document.querySelector('[data-action="theme-color-picker"]');if(typedPicker)typedPicker.value=config.themeColor;changed(false);return;}
    if(action==='theme-color-picker'){config.themeColor=target.value.toUpperCase();var valueInput=document.querySelector('[data-action="theme-color-text"]');if(valueInput)valueInput.value=config.themeColor;changed(false);return;}
    if(action==='module-title'){var module=getModule(target.dataset.id);module.title=target.value;if(module.id===selectedId)document.getElementById('contentHeading').textContent=target.value;}
    if(action==='item-field')getModule(target.dataset.id).items[Number(target.dataset.index)][target.dataset.field]=target.value;
    if(action==='category-name'){var category=config.notesLibrary.categories.find(function(item){return item.id===target.dataset.categoryId;});if(category)category.name=target.value;}
    if(action==='library-note-field'){var noteRecord=findNoteRecord(target.dataset.noteId);if(noteRecord)noteRecord.note[target.dataset.field]=target.value;}
    if(action==='footer-field')config.footer[target.dataset.field]=target.value;
    if(action==='footer-link')config.footer.links[Number(target.dataset.index)][target.dataset.field]=target.value;
    if(action)changed(false);
  });
  document.querySelector('.editor-pane').addEventListener('change',function(event){
    var target=event.target;
    if(target.dataset.libraryNoteFile!==undefined){handleNoteFile(target);return;}
    if(target.type==='file'){handleImage(target);return;}
    if(target.dataset.action==='album-layout'){var page=getModule(target.dataset.id).pages[Number(target.dataset.index)];page.layout=target.value;if(target.value==='pair'&&!page.images[1])page.images[1]='';changed(true);}
  });
  iconCropBox.addEventListener('pointerdown',function(event){if(!iconCropState)return;iconCropState.dragging=true;iconCropState.mode=event.target.classList.contains('icon-crop-handle')?'resize':'move';iconCropState.pointerId=event.pointerId;iconCropState.startX=event.clientX;iconCropState.startY=event.clientY;iconCropState.startCrop={x:iconCropState.crop.x,y:iconCropState.crop.y,size:iconCropState.crop.size};iconCropBox.setPointerCapture(event.pointerId);event.preventDefault();});
  iconCropBox.addEventListener('pointermove',function(event){if(!iconCropState||!iconCropState.dragging||iconCropState.pointerId!==event.pointerId)return;var dx=event.clientX-iconCropState.startX,dy=event.clientY-iconCropState.startY,rect=iconCropState.imageRect,start=iconCropState.startCrop;if(iconCropState.mode==='resize'){var maxSize=Math.min(rect.x+rect.width-start.x,rect.y+rect.height-start.y);iconCropState.crop.size=Math.max(60,Math.min(maxSize,start.size+Math.max(dx,dy)));}else{iconCropState.crop.x=Math.max(rect.x,Math.min(rect.x+rect.width-start.size,start.x+dx));iconCropState.crop.y=Math.max(rect.y,Math.min(rect.y+rect.height-start.size,start.y+dy));}drawIconCrop();});
  function stopIconCropDrag(event){if(iconCropState&&iconCropState.pointerId===event.pointerId)iconCropState.dragging=false;}
  iconCropBox.addEventListener('pointerup',stopIconCropDrag);
  iconCropBox.addEventListener('pointercancel',stopIconCropDrag);
  function closeIconCrop(){if(iconCropState&&iconCropState.input)iconCropState.input.value='';iconCropState=null;iconCropDialog.close();}
  document.getElementById('closeIconCropButton').addEventListener('click',closeIconCrop);
  document.getElementById('cancelIconCropButton').addEventListener('click',closeIconCrop);
  iconCropDialog.addEventListener('cancel',function(event){event.preventDefault();closeIconCrop();});
  document.getElementById('confirmIconCropButton').addEventListener('click',function(){if(!iconCropState)return;var state=iconCropState,rect=state.imageRect,crop=state.crop,sx=(crop.x-rect.x)/rect.width*state.image.naturalWidth,sy=(crop.y-rect.y)/rect.height*state.image.naturalHeight,sourceSize=crop.size/rect.width*state.image.naturalWidth;iconCropContext.clearRect(0,0,iconCropCanvas.width,iconCropCanvas.height);iconCropContext.save();if(state.kind==='avatar'){iconCropContext.beginPath();iconCropContext.arc(iconCropCanvas.width/2,iconCropCanvas.height/2,iconCropCanvas.width/2,0,Math.PI*2);iconCropContext.clip();}iconCropContext.drawImage(state.image,sx,sy,sourceSize,sourceSize,0,0,iconCropCanvas.width,iconCropCanvas.height);iconCropContext.restore();var result=iconCropCanvas.toDataURL('image/png');if(state.kind==='avatar')config.profile[state.field]=result;else{var module=getModule(state.moduleId);if(module&&module.items[state.index])module.items[state.index][state.field]=result;}iconCropState=null;iconCropDialog.close();changed(true);});
  document.querySelector('.editor-pane').addEventListener('click',async function(event){
    var button=event.target.closest('button[data-action]');if(!button)return;
    var action=button.dataset.action,id=button.dataset.id,module=getModule(id),index=Number(button.dataset.index);
    if(action==='open-module-picker'){document.getElementById('modulePicker').showModal();return;}
    if(action==='close-module-picker'){document.getElementById('modulePicker').close();return;}
    if(action==='add-module-template'){
      var template=DEFAULT_CONFIG.modules.find(function(item){return item.type===button.dataset.type;});
      var added=clone(template),sameCount=config.modules.filter(function(item){return item.type===added.type;}).length;
      added.id=makeId(added.type);if(added.type==='notes'){added.featuredNoteIds=allNotes().slice(0,3).map(function(note){return note.id;});delete added.items;}if(sameCount)added.title=added.title+' '+(sameCount+1);
      config.modules.push(added);selectedId=added.id;document.getElementById('modulePicker').close();changed(true);
      var addedPanel=document.querySelector('[data-module-panel="'+added.id+'"]');if(addedPanel)addedPanel.scrollIntoView({behavior:'smooth',block:'start'});
      return;
    }
    if(action==='open-notes-editor'||action==='preview-note-center'){editorMode='notes';renderEditorMode();sendPreview();return;}
    if(action==='toggle-home-note'){var notesHomeModule=primaryNotesModule();if(!notesHomeModule){setStatus('请先在个人主页添加“我的笔记”模块');return;}var toggleId=button.dataset.noteId,toggleIndex=notesHomeModule.featuredNoteIds.indexOf(toggleId);if(toggleIndex===-1)notesHomeModule.featuredNoteIds.push(toggleId);else notesHomeModule.featuredNoteIds.splice(toggleIndex,1);changed(true);return;}
    if(action==='add-featured'){var select=document.getElementById('featuredSelect-'+id);if(select&&select.value){module.featuredNoteIds.push(select.value);changed(true);}return;}
    if(action==='remove-featured'){module.featuredNoteIds=module.featuredNoteIds.filter(function(noteId){return noteId!==button.dataset.noteId;});changed(true);return;}
    if(action==='featured-up'||action==='featured-down'){var featuredIndex=module.featuredNoteIds.indexOf(button.dataset.noteId),featuredTo=featuredIndex+(action==='featured-up'?-1:1);if(featuredIndex!==-1&&featuredTo>=0&&featuredTo<module.featuredNoteIds.length){var featuredMoved=module.featuredNoteIds.splice(featuredIndex,1)[0];module.featuredNoteIds.splice(featuredTo,0,featuredMoved);changed(true);}return;}
    if(action==='add-category'){config.notesLibrary.categories.push({id:makeId('category'),name:'新分类',notes:[]});changed(true);return;}
    if(action==='move-category-up'||action==='move-category-down'){var categoryIndex=config.notesLibrary.categories.findIndex(function(item){return item.id===button.dataset.categoryId;}),categoryTo=categoryIndex+(action==='move-category-up'?-1:1);if(categoryIndex!==-1&&categoryTo>=0&&categoryTo<config.notesLibrary.categories.length){var categoryMoved=config.notesLibrary.categories.splice(categoryIndex,1)[0];config.notesLibrary.categories.splice(categoryTo,0,categoryMoved);changed(true);}return;}
    if(action==='delete-category'){var categoryDeleteIndex=config.notesLibrary.categories.findIndex(function(item){return item.id===button.dataset.categoryId;});if(categoryDeleteIndex!==-1){var categoryToDelete=config.notesLibrary.categories[categoryDeleteIndex];if(categoryToDelete.notes.length&&!confirm('删除分类会同时删除其中的 '+categoryToDelete.notes.length+' 篇笔记，确认删除吗？'))return;var removedIds=categoryToDelete.notes.map(function(note){return note.id;});config.notesLibrary.categories.splice(categoryDeleteIndex,1);config.modules.filter(function(item){return item.type==='notes';}).forEach(function(item){item.featuredNoteIds=item.featuredNoteIds.filter(function(noteId){return removedIds.indexOf(noteId)===-1;});});changed(true);}return;}
    if(action==='add-library-note'){var noteCategory=config.notesLibrary.categories.find(function(item){return item.id===button.dataset.categoryId;});if(noteCategory){noteCategory.notes.push(newItem('notes'));changed(true);}return;}
    if(action==='move-library-note-up'||action==='move-library-note-down'){var moveRecord=findNoteRecord(button.dataset.noteId);if(moveRecord){var noteTo=moveRecord.index+(action==='move-library-note-up'?-1:1);if(noteTo>=0&&noteTo<moveRecord.category.notes.length){var noteMoved=moveRecord.category.notes.splice(moveRecord.index,1)[0];moveRecord.category.notes.splice(noteTo,0,noteMoved);changed(true);}}return;}
    if(action==='delete-library-note'){var deleteRecord=findNoteRecord(button.dataset.noteId);if(deleteRecord&&confirm('确认删除这篇笔记吗？')){deleteRecord.category.notes.splice(deleteRecord.index,1);config.modules.filter(function(item){return item.type==='notes';}).forEach(function(item){item.featuredNoteIds=item.featuredNoteIds.filter(function(noteId){return noteId!==button.dataset.noteId;});});changed(true);}return;}
    if(action==='toggle-collapse'){if(collapsedModules.has(id))collapsedModules.delete(id);else collapsedModules.add(id);renderModuleEditor();return;}
    if(action==='toggle-visible'){module.visible=module.visible===false;changed(true);return;}
    if(action==='move-up'||action==='move-down'){var from=config.modules.findIndex(function(item){return item.id===id;});var to=from+(action==='move-up'?-1:1);if(to>=0&&to<config.modules.length){var moved=config.modules.splice(from,1)[0];config.modules.splice(to,0,moved);changed(true);}return;}
    if(action==='duplicate-module'){var copied=clone(module);copied.id=makeId(copied.type);copied.title=copied.title+' 副本';var at=config.modules.indexOf(module);config.modules.splice(at+1,0,copied);selectedId=copied.id;changed(true);return;}
    if(action==='delete-module'){var sameTypeCount=config.modules.filter(function(item){return item.type===module.type;}).length;if(sameTypeCount===1&&!confirm('这是最后一个“'+(typeNames[module.type]||module.title)+'”模块，确认删除吗？'))return;var moduleIndex=config.modules.findIndex(function(item){return item.id===id;});config.modules.splice(moduleIndex,1);collapsedModules.delete(id);if(selectedId===id)selectedId=(config.modules[moduleIndex]||config.modules[moduleIndex-1]||{}).id||'';changed(true);return;}
    if(action==='add-item'){module.items.push(newItem(module.type));changed(true);return;}
    if(action==='toggle-item-visible'){module.items[index].visible=module.items[index].visible===false;changed(true);return;}
    if(action==='move-item-up'||action==='move-item-down'){var itemTo=index+(action==='move-item-up'?-1:1);if(itemTo>=0&&itemTo<module.items.length){var itemMoved=module.items.splice(index,1)[0];module.items.splice(itemTo,0,itemMoved);changed(true);}return;}
    if(action==='duplicate-item'){var copiedItem=clone(module.items[index]);if(module.type==='notes')copiedItem.id=makeId('note');module.items.splice(index+1,0,copiedItem);changed(true);return;}
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
  document.querySelector('.editor-mode-switch').addEventListener('click',function(event){var button=event.target.closest('[data-editor-mode]');if(!button)return;editorMode=button.dataset.editorMode;if(editorMode==='home')renderModuleEditor();else renderNotesLibrary();renderEditorMode();sendPreview();document.querySelector('.panel-scroll').scrollTop=0;});
  document.getElementById('resetButton').addEventListener('click',function(){if(!confirm('恢复初始内容？当前编辑会被覆盖。'))return;config=clone(DEFAULT_CONFIG);normalizeNotes();selectedId=config.modules[0].id;editorMode='home';changed(true);saveDraft();});
  document.getElementById('historyButton').addEventListener('click',async function(){if(quickMode)return;await renderHistory();historyDialog.showModal();});
  document.getElementById('closeHistoryButton').addEventListener('click',function(){historyDialog.close();});
  document.getElementById('saveVersionButton').addEventListener('click',async function(){await saveVersion('手动保存',false);await renderHistory();setStatus('版本已保存');});
  historyDialog.addEventListener('click',async function(event){var button=event.target.closest('[data-history-action]');if(!button)return;var id=Number(button.dataset.historyId),versions=await getVersions(),version=versions.find(function(item){return item.id===id;});if(!version)return;if(button.dataset.historyAction==='restore'){if(!confirm('恢复这个版本？当前未保存的编辑会被覆盖。'))return;config=clone(version.config);normalizeNotes();selectedId=config.modules[0]&&config.modules[0].id||'';collapsedModules.clear();renderEditors();sendPreview();await saveDraft();historyDialog.close();setStatus('已恢复历史版本');}else{var db=await openDb(),tx=db.transaction('versions','readwrite');tx.objectStore('versions').delete(id);await waitTransaction(tx);await renderHistory();}});
  historyDialog.addEventListener('cancel',function(event){event.preventDefault();historyDialog.close();});
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
    if(event.data.type==='SITE_SELECT_MODULE'&&getModule(event.data.id)){editorMode='home';renderEditorMode();selectedId=event.data.id;collapsedModules.delete(event.data.id);renderModuleEditor();var panel=document.querySelector('[data-module-panel="'+event.data.id+'"]');if(panel)panel.scrollIntoView({behavior:'smooth',block:'start'});}
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

  (async function init(){if(quickMode){document.getElementById('historyButton').hidden=true;document.getElementById('saveStatus').textContent='临时模式 · 不保留历史';}await loadDraft();normalizeNotes();renderEditors();sendPreview();})();
})();
