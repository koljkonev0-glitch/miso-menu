(() => {
 'use strict';
 const cfg=window.MISO_CONFIG, dishes=window.MISO_DISHES, cats=window.MISO_CATEGORIES;
 const $=s=>document.querySelector(s), money=n=>new Intl.NumberFormat('ru-RU').format(n)+' ₽';
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let category=cats[0].id, query='', basket={}, detailId=null, timer;
 const byId=id=>dishes.find(d=>d.id===id);
 function toast(text){$('#toast').textContent=text;$('#toast').classList.add('visible');if($('#cart').open){let status=$('#cart-status');if(!status){status=document.createElement('p');status.id='cart-status';status.setAttribute('role','status');status.className='demo-note';$('#cart').append(status);}status.textContent=text;}clearTimeout(timer);timer=setTimeout(()=>$('#toast').classList.remove('visible'),3200);}
 try { const saved=JSON.parse(localStorage.getItem(cfg.storageKey)||'{}');if(saved && typeof saved==='object' && !Array.isArray(saved))for(const [id,q] of Object.entries(saved))if(byId(id)&&Number.isInteger(q)&&q>0)basket[id]=Math.min(q,99); } catch {toast('Не удалось восстановить корзину. Начните новый заказ.');}
 $('#brand').textContent=cfg.name;$('#subtitle').textContent=cfg.subtitle;$('#logo').src=cfg.logo;document.title=cfg.name+' — '+cfg.subtitle;document.documentElement.style.setProperty('--accent',cfg.accent);
 // Кнопка, а не ссылка: URL, фильтр и корзина остаются прежними.
 $('.brand').addEventListener('click',()=>{
   window.scrollTo({top:0,left:0,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
 });
 const total=()=>Object.entries(basket).reduce((s,[id,q])=>s+byId(id).price*q,0);
 const count=()=>Object.values(basket).reduce((s,q)=>s+q,0);
 function quantity(d){return basket[d.id]?`<div class="stepper" aria-label="Количество ${esc(d.name)}"><button data-change="${d.id}" data-delta="-1" aria-label="Убрать одну порцию ${esc(d.name)}">−</button><output aria-live="polite">${basket[d.id]}</output><button data-change="${d.id}" data-delta="1" ${basket[d.id]>=99?'disabled':''} aria-label="Добавить одну порцию ${esc(d.name)}">+</button></div>`:`<button class="add" data-change="${d.id}" data-delta="1" aria-label="Добавить ${esc(d.name)}">Добавить ＋</button>`;}
 function renderMenu(){
 $('#categories').innerHTML=cats.map(c=>`<button data-category="${c.id}" aria-pressed="${!query&&category===c.id}">${esc(c.name)}</button>`).join('');
 const shown=dishes.filter(d=>query?d.name.toLocaleLowerCase('ru').includes(query):d.category===category), c=cats.find(c=>c.id===category);
 $('#category-title').textContent=query?'Результаты поиска':c.name;$('#section-label').textContent=query?'НАЙДИТЕ СВОЙ ВКУС':c.caption;$('#result-count').textContent=shown.length+' поз.';$('#empty').hidden=!!shown.length;$('#clear-search').hidden=!$('#search').value;
 $('#grid').innerHTML=shown.map((d,i)=>`<article class="card"><button class="photo-button" data-detail="${d.id}" aria-label="Подробнее: ${esc(d.name)}"><img src="${d.image}" alt="${esc(d.name)} — пример подачи" loading="${i<3?'eager':'lazy'}" width="640" height="480">${d.tag?`<span class="badge">${esc(d.tag)}</span>`:''}<span class="photo-arrow" aria-hidden="true">↗</span></button><div class="card-body"><button class="name-button" data-detail="${d.id}">${esc(d.name)}</button><p class="card-description">${esc(d.description)}</p><span class="weight">${d.weight}</span><div class="card-bottom"><span class="price">${money(d.price)}</span><div data-quantity="${d.id}">${quantity(d)}</div></div></div></article>`).join('');
 }
 function renderCart(){
 $('#cart-count').textContent=count();$('#cart-total').textContent=money(total());$('#open-cart').setAttribute('aria-label',`Открыть корзину: ${count()} порций, ${money(total())}`);
 $('#cart-content').innerHTML=count()?Object.entries(basket).map(([id,q])=>{const d=byId(id);return `<div class="cart-row"><img src="${d.image}" alt=""><div><h3>${esc(d.name)}</h3><div class="row-bottom"><span>${money(d.price*q)}</span><div data-quantity="${id}">${quantity(d)}</div></div><button class="remove" data-remove="${id}" aria-label="Удалить ${esc(d.name)} из корзины">Удалить</button></div></div>`;}).join('')+`<div class="total"><span>Итого</span><span>${money(total())}</span></div>`:'<div class="empty"><h3>Здесь будет что-то вкусное</h3><p class="muted">Добавьте любимые блюда из меню.</p><button class="primary" data-close="cart">Выбрать блюда</button></div>';
 $('#checkout').hidden=!count()||!$('#receipt').hidden;
 }
 function change(id,delta,remove=false){if(!byId(id))return;const next=remove?0:Math.max(0,Math.min(99,(basket[id]||0)+delta));if(next)basket[id]=next;else delete basket[id];try{localStorage.setItem(cfg.storageKey,JSON.stringify(basket));}catch{toast('Хранилище недоступно. Корзина сохранится только до закрытия страницы.');}
 const active=document.activeElement;const activeId=active?.dataset.change,activeDelta=active?.dataset.delta;
 document.querySelectorAll('[data-quantity]').forEach(el=>{el.innerHTML=quantity(byId(el.dataset.quantity));});renderCart();
 if(activeId){const scope=$('#cart').open?$('#cart'):$('#detail').open?$('#detail'):$('#grid');const replacement=scope.querySelector(`[data-change="${activeId}"][data-delta="${activeDelta}"]`)||scope.querySelector(`[data-change="${activeId}"]`);if(replacement)replacement.focus({preventScroll:true});else if($('#cart').open)$('#cart .icon-button').focus();}
 }
 function showDetail(id){const d=byId(id);detailId=id;$('#detail-content').innerHTML=`<img src="${d.image}" alt="${esc(d.name)} — пример подачи"><div class="detail-body"><p class="eyebrow">${esc(cats.find(c=>c.id===d.category).name)} · ${d.weight}</p><h2 id="detail-title">${esc(d.name)}</h2><p>${esc(d.description)}</p><p class="allergens">Аллергены: ${esc(d.allergens)}.</p><p class="muted" style="font-size:12px">Фотография иллюстрирует подачу. Демонстрационное блюдо.</p><div class="card-bottom"><span class="price">${money(d.price)}</span><div data-quantity="${id}">${quantity(d)}</div></div></div>`;$('#detail').showModal();}
 document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.category){category=b.dataset.category;query='';$('#search').value='';const scroll=$('#categories').scrollLeft;renderMenu();$('#categories').scrollLeft=scroll;$('#categories').querySelector(`[data-category="${category}"]`).focus({preventScroll:true});}if(b.dataset.detail)showDetail(b.dataset.detail);if(b.dataset.change)change(b.dataset.change,Number(b.dataset.delta));if(b.dataset.remove){change(b.dataset.remove,0,true);$('#cart .icon-button').focus();}if(b.dataset.close)$('#'+b.dataset.close).close();});
 $('#search').addEventListener('input',e=>{query=e.target.value.trim().toLocaleLowerCase('ru');renderMenu();});
 function reset(){query='';$('#search').value='';renderMenu();$('#search').focus();}$('#reset').onclick=reset;$('#clear-search').onclick=reset;
 $('#open-cart').onclick=()=>{$('#receipt').hidden=true;$('#cart-content').hidden=false;renderCart();$('#cart').showModal();};
 $('#checkout').onsubmit=e=>{e.preventDefault();const name=$('#customer').value.trim();if(!name){$('#customer').setCustomValidity('Введите имя, а не только пробелы.');$('#customer').reportValidity();return;}if(!count())return;const text=[`${cfg.name} — ДЕМОНСТРАЦИОННЫЙ ЗАКАЗ`,'Заказ не отправлен.',`Имя: ${name}`,`Получение: ${$('#checkout input[name=method]:checked').value}`,'',...Object.entries(basket).map(([id,q])=>`${byId(id).name} × ${q} — ${money(byId(id).price*q)}`),'',`Итого: ${money(total())}`,$('#comment').value.trim()?`Комментарий: ${$('#comment').value.trim()}`:''].filter(Boolean).join('\n');$('#receipt-text').value=text;$('#checkout').hidden=true;$('#cart-content').hidden=true;$('#receipt').hidden=false;$('#cart').scrollTop=0;$('#copy').focus();};
 $('#customer').oninput=()=>$('#customer').setCustomValidity('');
 $('#copy').onclick=async()=>{try{if(!navigator.clipboard)throw Error();await navigator.clipboard.writeText($('#receipt-text').value);toast('Заказ скопирован');$('#copy').textContent='Скопировано ✓';setTimeout(()=>$('#copy').textContent='Скопировать заказ',2500);}catch{$('#receipt-text').focus();$('#receipt-text').select();toast('Копирование недоступно. Выделите текст и скопируйте вручную.');}};
 $('#edit').onclick=()=>{$('#receipt').hidden=true;$('#cart-content').hidden=false;renderCart();$('#customer').focus();};
 document.querySelectorAll('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}}));
 document.addEventListener('error',e=>{if(e.target.tagName==='IMG'&&!e.target.dataset.failed){e.target.dataset.failed='true';e.target.src='assets/fallback.svg';}},true);
 renderMenu();renderCart();
})();
