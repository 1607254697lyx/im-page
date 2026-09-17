(function(){
  'use strict';

  var currentConfig = null;

  function esc(value){
    return String(value == null ? '' : value)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }

  function safeHref(value){
    var href = String(value || '#').trim();
    return /^(https?:|mailto:|#)/i.test(href) ? esc(href) : '#';
  }

  function safeSrc(value){
    var src = String(value || '').trim();
    return /^(data:image\/|blob:|https?:|[.\w\-/\u4e00-\u9fff])/i.test(src) ? esc(src) : '';
  }

  function uid(prefix){ return prefix + '-' + Math.random().toString(36).slice(2,9); }

  function mixColor(hex,target,amount){
    var value=String(hex||'').replace('#','');if(value.length!==6)return hex;
    var base=[parseInt(value.slice(0,2),16),parseInt(value.slice(2,4),16),parseInt(value.slice(4,6),16)];
    var mixed=base.map(function(channel){return Math.round(channel+(target-channel)*amount).toString(16).padStart(2,'0');});
    return '#'+mixed.join('');
  }

  function applyTheme(color){
    var accent=/^#[0-9a-f]{6}$/i.test(color||'')?color:'#8478D2';
    document.documentElement.style.setProperty('--accent',accent);
    document.documentElement.style.setProperty('--accent-deep',mixColor(accent,0,.18));
    document.documentElement.style.setProperty('--accent-soft',mixColor(accent,255,.58));
  }

  function introHtml(profile){
    var text = esc(profile.intro || '');
    var name = esc(profile.name || '');
    var circle = esc(profile.circleText || '');
    if(name){
      text = text.replace(name,'<a class="name" href="'+safeHref(profile.nameLink)+'" target="_blank" rel="noopener">'+name+'</a>');
    }
    if(circle){
      text = text.replace(circle,'<span class="circled">'+circle+'<svg viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true"><ellipse cx="50" cy="20" rx="48" ry="17"/></svg></span>');
    }
    return text;
  }

  function renderExperience(module){
    var items = (module.items || []).filter(function(item){return item.visible!==false;});
    return '<section class="site-module story" data-module-id="'+esc(module.id)+'" data-module-type="experience">'+
      '<div class="sec-head"><h2 class="sec-title">'+esc(module.title)+'</h2></div>'+
      (items.length ? '<div class="story-viewport"><svg class="story-line" viewBox="0 0 720 70" preserveAspectRatio="none" aria-hidden="true"><path d="M -10 10 Q 360 100 730 10"></path></svg><div class="story-window"><div class="story-track">'+items.map(function(item){
        var layoutClass = item.layout === 'side' ? ' portrait' : item.layout === 'side-reverse' ? ' portrait reverse' : ' landscape';
        return '<article class="story-card'+layoutClass+'"><div class="story-img contain"><img class="story-clip" src="story-assets/wood-clip-final.png" alt="" aria-hidden="true"><img class="story-photo" src="'+safeSrc(item.image)+'" alt=""></div>'+
          '<div class="story-info"><div class="story-head"><span class="story-time">'+esc(item.date)+'</span><span class="story-title">'+esc(item.title)+'</span></div>'+
          '<div class="story-desc">'+esc(item.description)+'</div></div></article>';
      }).join('')+'</div></div><div class="story-nav"><button class="story-arrow prev" type="button" aria-label="上一张经历">‹</button><span class="story-count">1 / '+items.length+'</span><button class="story-arrow next" type="button" aria-label="下一张经历">›</button></div></div>' : '<div class="empty-state">暂时没有经历卡片</div>')+
      '</section>';
  }

  function renderProducts(module){
    var items = (module.items || []).filter(function(item){return item.visible!==false;});
    return '<section class="site-module works" data-module-id="'+esc(module.id)+'" data-module-type="products"><p class="works-group-title">'+esc(module.title)+'</p>'+
      (items.length ? items.map(function(item){
        return '<a class="works-row" href="'+safeHref(item.url)+'" target="_blank" rel="noopener"><span class="works-icon"><img src="'+safeSrc(item.image)+'" alt=""></span><span class="works-mid"><span class="works-title">'+esc(item.title)+'</span><span class="works-desc">'+esc(item.description)+'</span></span><span class="arrow" aria-hidden="true">↗</span></a>';
      }).join('') : '<div class="empty-state">暂时没有产品</div>')+'</section>';
  }

  function renderXhs(module){
    var items = (module.items || []).filter(function(item){return item.visible!==false;});
    var cards=items.map(function(item){
        return '<a class="xhs-card" href="'+safeHref(item.url)+'" target="_blank" rel="noopener"><img src="'+safeSrc(item.image)+'" alt=""><span class="xhs-cap"><b>'+esc(item.title)+'</b></span></a>';
      }).join('');
    var content='';
    if(items.length>3) content='<div class="xhs-carousel"><button class="xhs-arrow xhs-prev" type="button" aria-label="上一组">‹</button><div class="xhs-window"><div class="xhs-track">'+cards+'</div></div><button class="xhs-arrow xhs-next" type="button" aria-label="下一组">›</button></div>';
    else if(items.length) content='<div class="xhs-cards">'+cards+'</div>';
    else content='<div class="empty-state">暂时没有小红书卡片</div>';
    return '<section class="site-module works" data-module-id="'+esc(module.id)+'" data-module-type="xhs"><p class="works-group-title">'+esc(module.title)+'</p>'+content+'</section>';
  }

  function albumPage(page){
    var layout = !page.layout || page.layout === 'quiet' ? 'wide' : page.layout;
    var images = page.images || [];
    var photos = images.slice(0,layout === 'pair' ? 2 : 1).map(function(src){
      return '<div class="ab-photo"><img src="'+safeSrc(src)+'" alt="相册照片"></div>';
    }).join('');
    return '<div class="ab-paper"><div class="ab-layout ab-layout-'+esc(layout)+'">'+photos+'</div></div>';
  }

  function renderAlbum(module){
    var pages = (module.pages || []).filter(function(page){return page.visible!==false;});
    var leaves = [];
    leaves.push('<div class="ab-page ab-cover" data-leaf="0"><div class="ab-face front"><div class="ab-cover-photo"><img src="'+safeSrc(module.cover)+'" alt="相册封面照片"></div></div><div class="ab-face back">'+(pages[0] ? albumPage(pages[0]) : '')+'</div></div>');
    for(var i=1;i<pages.length;i+=2){
      leaves.push('<div class="ab-page" data-leaf="'+leaves.length+'"><div class="ab-face front">'+albumPage(pages[i])+'</div><div class="ab-face back'+(pages[i+1] ? '' : ' ab-backcover')+'">'+(pages[i+1] ? albumPage(pages[i+1]) : '')+'</div></div>');
    }
    if(pages.length % 2 === 1){
      leaves.push('<div class="ab-page" data-leaf="'+leaves.length+'"><div class="ab-face front"></div><div class="ab-face back ab-backcover"></div></div>');
    }else if(leaves.length){
      leaves[leaves.length-1] = leaves[leaves.length-1].replace('class="ab-face back"','class="ab-face back ab-backcover"');
    }
    return '<section class="site-module works photo-book-wrap album-scope" data-module-id="'+esc(module.id)+'" data-module-type="album"><p class="works-group-title">'+esc(module.title)+'</p><div class="ab-shell"><div class="ab-scene"><div class="ab-book"><div class="ab-base left"></div><div class="ab-base right"></div>'+leaves.join('')+'</div></div><div class="ab-controls"><button class="ab-btn ab-prev" type="button" aria-label="上一页">‹</button><div class="ab-counter">封面</div><button class="ab-btn ab-next" type="button" aria-label="下一页">›</button></div></div></section>';
  }

  function renderNotes(module){
    var items = (module.items || []).filter(function(item){return item.visible!==false;});
    return '<section class="site-module works photo-book-wrap" data-module-id="'+esc(module.id)+'" data-module-type="notes"><p class="works-group-title">'+esc(module.title)+'</p><div class="notes-list">'+
      (items.length ? items.map(function(item){return '<a class="note-row" href="'+safeHref(item.url)+'" target="_blank" rel="noopener"><span class="note-title"><u>'+esc(item.title)+'</u></span><span class="arrow" aria-hidden="true">↗</span></a>';}).join('') : '<div class="empty-state">暂时没有笔记</div>')+
      '</div></section>';
  }

  function renderModule(module){
    if(module.visible === false) return '';
    if(module.type === 'experience') return renderExperience(module);
    if(module.type === 'products') return renderProducts(module);
    if(module.type === 'xhs') return renderXhs(module);
    if(module.type === 'album') return renderAlbum(module);
    if(module.type === 'notes') return renderNotes(module);
    return '';
  }

  function renderFooter(footer){
    var links = (footer.links || []).filter(function(link){return link.visible!==false;});
    var linkHtml = links.map(function(link,index){
      return (index ? '<span class="sep">/</span>' : '')+'<a href="'+safeHref(link.url)+'" target="_blank" rel="noopener">'+esc(link.label)+'</a>';
    }).join('');
    return '<footer class="footer"><div class="footer-links">'+linkHtml+'</div><a class="cta-btn" href="'+safeHref(footer.ctaUrl)+'"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a9 9 0 1 1-9-9"/><path d="M21 3v6h-6"/><path d="M8 12h.01"/><path d="M12 12h.01"/><path d="M16 12h.01"/></svg>'+esc(footer.ctaLabel)+'</a></footer>';
  }

  function render(config){
    currentConfig = config;
    applyTheme(config.themeColor);
    document.body.classList.add('editor-preview-mode');
    document.querySelector('.wrap').innerHTML = '<header class="hero"><div class="hero-scene"><img src="'+safeSrc(config.profile.avatar)+'" alt="头像" draggable="false"></div></header><section class="intro"><p>'+introHtml(config.profile)+'</p></section>'+
      (config.modules || []).map(renderModule).join('')+renderFooter(config.footer || {links:[]});
    initInteractions();
  }

  function initInteractions(){
    var isWechat=/MicroMessenger/i.test(navigator.userAgent||'');
    if(isWechat){
      document.documentElement.classList.add('is-wechat');
      document.documentElement.style.webkitTextSizeAdjust='100%';
      document.body.style.webkitTextSizeAdjust='100%';
      var lockWechatFont=function(){
        if(window.WeixinJSBridge&&window.WeixinJSBridge.invoke){
          window.WeixinJSBridge.invoke('setFontSizeCallback',{fontSize:0});
        }
      };
      if(window.WeixinJSBridge) lockWechatFont();
      else document.addEventListener('WeixinJSBridgeReady',lockWechatFont,false);
      document.addEventListener('menu:setfont',lockWechatFont,false);
    }
    document.querySelectorAll('.story').forEach(function(story){
      var track=story.querySelector('.story-track');
      if(!track) return;
      var cards=track.querySelectorAll('.story-card'), index=0, count=story.querySelector('.story-count');
      function show(next){index=(next+cards.length)%cards.length;track.style.transform='translateX(-'+(index*100)+'%)';count.textContent=(index+1)+' / '+cards.length;}
      story.querySelector('.prev').addEventListener('click',function(){show(index-1);});
      story.querySelector('.next').addEventListener('click',function(){show(index+1);});
    });
    document.querySelectorAll('[data-module-type="album"]').forEach(function(album){
      var book=album.querySelector('.ab-book'), pages=Array.prototype.slice.call(album.querySelectorAll('.ab-page'));
      var prev=album.querySelector('.ab-prev'), next=album.querySelector('.ab-next'), counter=album.querySelector('.ab-counter'), current=0;
      function show(){pages.forEach(function(page,i){page.classList.toggle('ab-flipped',i<current);page.style.zIndex=i<current?i:100+(pages.length-i);});book.classList.toggle('ab-open',current>0&&current<pages.length);book.classList.toggle('ab-end',current===pages.length);prev.disabled=current===0;next.disabled=current===pages.length;counter.textContent=current===0?'封面':current===pages.length?'封底':'第 '+current+' 页';}
      prev.addEventListener('click',function(){if(current>0){current--;show();}});
      next.addEventListener('click',function(){if(current<pages.length){current++;show();}});
      book.addEventListener('click',function(event){var rect=book.getBoundingClientRect();if(event.clientX>rect.left+rect.width/2&&current<pages.length)current++;else if(event.clientX<=rect.left+rect.width/2&&current>0)current--;show();});
      show();
    });
    document.querySelectorAll('.xhs-carousel').forEach(function(carousel){
      var track=carousel.querySelector('.xhs-track'),cards=Array.prototype.slice.call(track.querySelectorAll('.xhs-card'));
      var prev=carousel.querySelector('.xhs-prev'),next=carousel.querySelector('.xhs-next'),index=0,startX=null;
      function visibleCount(){return window.matchMedia('(max-width:560px)').matches?2:3;}
      function show(){
        var visible=visibleCount(),max=Math.max(0,cards.length-visible),gap=parseFloat(getComputedStyle(track).columnGap)||12;
        index=Math.min(index,max);
        var step=cards[0]?cards[0].getBoundingClientRect().width+gap:0;
        track.style.transform='translateX(-'+(index*step)+'px)';
        prev.hidden=index===0;next.hidden=index===max;
      }
      prev.addEventListener('click',function(){if(index>0){index--;show();}});
      next.addEventListener('click',function(){if(index<Math.max(0,cards.length-visibleCount())){index++;show();}});
      track.addEventListener('touchstart',function(event){startX=event.touches[0].clientX;},{passive:true});
      track.addEventListener('touchend',function(event){if(startX===null)return;var delta=event.changedTouches[0].clientX-startX;if(Math.abs(delta)>36){if(delta<0)next.click();else prev.click();}startX=null;},{passive:true});
      window.addEventListener('resize',show);
      show();
    });
  }

  async function exportStandalone(){
    var sourceImages=Array.prototype.slice.call(document.images);
    var imageData=await Promise.all(sourceImages.map(function(img){
      if(!img.complete||!img.naturalWidth)return Promise.resolve(null);
      if(/^data:image\//i.test(img.src))return Promise.resolve(img.src);
      try{
        var canvas=document.createElement('canvas');
        canvas.width=img.naturalWidth;canvas.height=img.naturalHeight;
        canvas.getContext('2d').drawImage(img,0,0);
        var png=/\.png(?:$|\?)/i.test(img.src);
        return Promise.resolve(canvas.toDataURL(png?'image/png':'image/jpeg',.9));
      }catch(error){return Promise.resolve(null);}
    }));
    var linkedCss='';
    try{
      var previewSheet=Array.prototype.slice.call(document.styleSheets).find(function(sheet){return sheet.href&&/editable-preview\.css(?:$|\?)/.test(sheet.href);});
      if(previewSheet)linkedCss=Array.prototype.slice.call(previewSheet.cssRules).map(function(rule){return rule.cssText;}).join('\n');
    }catch(error){}
    var clone=document.documentElement.cloneNode(true);
    var viewport=clone.querySelector('meta[name="viewport"]');
    if(viewport) viewport.setAttribute('content','width=device-width, initial-scale=1.0, viewport-fit=cover');
    Array.prototype.slice.call(clone.querySelectorAll('img')).forEach(function(img,index){if(imageData[index])img.setAttribute('src',imageData[index]);});
    Array.prototype.slice.call(clone.querySelectorAll('script')).forEach(function(node){node.remove();});
    var linked=clone.querySelector('link[href="editable-preview.css"]');if(linked)linked.remove();
    var extra=clone.ownerDocument.createElement('style');
    extra.textContent=linkedCss;
    clone.querySelector('head').appendChild(extra);
    var runtime=clone.ownerDocument.createElement('script');
    runtime.textContent='('+initInteractions.toString()+')();';
    clone.querySelector('body').appendChild(runtime);
    return '<!DOCTYPE html>\n'+clone.outerHTML;
  }

  document.addEventListener('click',function(event){
    var link=event.target.closest('a');
    if(link) event.preventDefault();
    var module=event.target.closest('[data-module-id]');
    if(module) parent.postMessage({type:'SITE_SELECT_MODULE',id:module.getAttribute('data-module-id')},'*');
  },true);

  window.addEventListener('message',async function(event){
    if(!event.data) return;
    if(event.data.type==='SITE_CONFIG') render(event.data.config);
    if(event.data.type==='SITE_EXPORT_CONFIG') parent.postMessage({type:'SITE_EXPORT_CONFIG_RESULT',config:currentConfig},'*');
    if(event.data.type==='SITE_EXPORT_HTML') parent.postMessage({type:'SITE_EXPORT_HTML_RESULT',html:await exportStandalone()},'*');
  });

  if(window.__SITE_CONFIG__) render(window.__SITE_CONFIG__);
  parent.postMessage({type:'SITE_PREVIEW_READY'},'*');
})();
