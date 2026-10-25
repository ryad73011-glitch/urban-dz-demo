(()=>{
  const $=(s,root=document)=>root.querySelector(s);
  const $$=(s,root=document)=>[...root.querySelectorAll(s)];
  const slides=$$('.slide'),dots=$$('.dot'),num=$('.slide-num'),hero=$('.hero');
  let current=0,timer,touchStartX=0;
  function show(i){
    if(!slides.length)return;
    current=(i+slides.length)%slides.length;
    slides.forEach((s,n)=>s.classList.toggle('active',n===current));
    dots.forEach((d,n)=>d.classList.toggle('active',n===current));
    if(num)num.innerHTML=String(current+1).padStart(2,'0')+' <i>/ '+String(slides.length).padStart(2,'0')+'</i>';
  }
  function restart(){clearInterval(timer);timer=setInterval(()=>show(current+1),6500)}
  $('.next')?.addEventListener('click',()=>{show(current+1);restart()});
  $('.prev')?.addEventListener('click',()=>{show(current-1);restart()});
  dots.forEach((d,i)=>d.addEventListener('click',()=>{show(i);restart()}));
  if(slides.length)restart();
  if(hero){
    hero.addEventListener('touchstart',e=>{touchStartX=e.changedTouches[0].clientX},{passive:true});
    hero.addEventListener('touchend',e=>{const delta=e.changedTouches[0].clientX-touchStartX;if(Math.abs(delta)>45){show(current+(delta<0?1:-1));restart()}},{passive:true});
  }
  const toggle=$('.menu'),nav=$('.nav');
  toggle?.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')==='true';toggle.setAttribute('aria-expanded',String(!open));nav?.classList.toggle('open',!open);toggle.textContent=open?'☰':'×'});
  nav&&$$('a',nav).forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');toggle?.setAttribute('aria-expanded','false');if(toggle)toggle.textContent='☰'}));
  if('IntersectionObserver'in window){
    const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in-view');observer.unobserve(e.target)}}),{threshold:.12});
    $$('.reveal').forEach(el=>observer.observe(el));
    document.documentElement.classList.add('js-reveal');
  }
  const filters=$$('.filter'),products=$$('.product');
  function filter(name){filters.forEach(b=>b.classList.toggle('active',b.dataset.filter===name));products.forEach(p=>p.classList.toggle('hidden',name!=='Tous'&&p.dataset.kind!==name))}
  filters.forEach(b=>b.addEventListener('click',()=>filter(b.dataset.filter)));
  $$('.cat').forEach(c=>c.addEventListener('click',()=>filter(c.dataset.category)));
  const toast=$('.toast');let toastTimer;
  function notify(msg){if(!toast)return;toast.textContent=msg;toast.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('show'),2400)}
  const cart=new Map();
  const money=n=>new Intl.NumberFormat('fr-DZ').format(n)+' DA';
  const cartCount=$('#cart-count');
  const drawer=document.createElement('aside');
  drawer.className='cart-drawer';drawer.setAttribute('aria-label','Panier de démonstration');drawer.setAttribute('aria-hidden','true');
  drawer.innerHTML='<div class="cart-backdrop" data-cart-close></div><section class="cart-panel"><div class="cart-head"><div><p class="eyebrow dark">URBAN DZ / SHOP</p><h2>Ton panier<span>.</span></h2></div><button class="cart-close" data-cart-close aria-label="Fermer">×</button></div><div class="cart-items"></div><div class="cart-empty">Ton panier est encore vide.<br><small>Choisis une pièce pour commencer.</small></div><div class="cart-summary"><div><span>Total démo</span><strong class="cart-total">0 DA</strong></div><p>Les prix et produits sont fictifs. Aucune commande ni aucun paiement ne sera effectué.</p><button class="cart-continue" data-cart-close>Continuer mes achats ↗</button></div></section>';
  document.body.appendChild(drawer);
  function renderCart(){
    const items=$('.cart-items',drawer);items.innerHTML='';let count=0,total=0;
    cart.forEach((item,name)=>{count+=item.qty;total+=item.price*item.qty;const row=document.createElement('div');row.className='cart-item';row.innerHTML='<div class="cart-item-copy"><strong></strong><small></small><div class="qty"><button data-step="-1" aria-label="Diminuer">−</button><span></span><button data-step="1" aria-label="Augmenter">+</button><button class="remove-item">Supprimer</button></div></div><b class="cart-item-price"></b>';$('.cart-item-copy strong',row).textContent=name;$('.cart-item-copy small',row).textContent=item.category;$('.qty span',row).textContent=item.qty;$('.cart-item-price',row).textContent=money(item.price*item.qty);row.querySelectorAll('[data-step]').forEach(b=>b.addEventListener('click',()=>{item.qty+=Number(b.dataset.step);if(item.qty<1)cart.delete(name);renderCart()}));$('.remove-item',row).addEventListener('click',()=>{cart.delete(name);renderCart()});items.appendChild(row)});
    if(cartCount)cartCount.textContent=count;$('.cart-total',drawer).textContent=money(total);$('.cart-empty',drawer).style.display=count?'none':'block';items.style.display=count?'block':'none';
  }
  function openCart(){renderCart();drawer.classList.add('open');drawer.setAttribute('aria-hidden','false');document.body.classList.add('cart-open')}
  function closeCart(){drawer.classList.remove('open');drawer.setAttribute('aria-hidden','true');document.body.classList.remove('cart-open')}
  drawer.querySelectorAll('[data-cart-close]').forEach(b=>b.addEventListener('click',closeCart));
  $('.cart')?.addEventListener('click',openCart);
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeCart()});
  $$('.add').forEach(b=>b.addEventListener('click',()=>{const card=b.closest('.product'),name=b.dataset.name||$('.product-meta h3',card)?.textContent||'Produit';const priceText=$('.product-meta strong',card)?.textContent||'0';const price=Number(priceText.replace(/[^0-9]/g,''));const category=card?.dataset.kind||'Sélection';const old=cart.get(name);cart.set(name,{qty:(old?.qty||0)+1,price,category});renderCart();notify(name+' ajouté au panier');const oldText=b.textContent;b.textContent='✓ Ajouté';setTimeout(()=>b.textContent=oldText,1200)}));
  // Product quick-view with size and color choices (demo only).
  const quickView=document.createElement('div');
  quickView.className='quick-view';
  quickView.innerHTML='<div class="quick-backdrop" data-qclose></div><section class="quick-panel" role="dialog" aria-modal="true" aria-label="Détails du produit"><button class="quick-close" data-qclose aria-label="Fermer">×</button><div class="quick-image"></div><div class="quick-info"><p class="eyebrow dark">URBAN DZ / DÉTAILS</p><h2 class="quick-title"></h2><p class="quick-price"></p><p class="quick-description">Une pièce de la sélection URBAN DZ. Choisis la taille et la couleur pour personnaliser ton panier de démonstration.</p><label for="quick-size">Taille</label><div class="quick-sizes"><button type="button">S</button><button type="button">M</button><button type="button">L</button><button type="button">XL</button></div><label for="quick-color">Couleur</label><div class="quick-colors"><button type="button" data-color="Noir"><i style="background:#171919"></i>Noir</button><button type="button" data-color="Beige"><i style="background:#d7c6a7"></i>Beige</button><button type="button" data-color="Blanc"><i style="background:#f5f4ef"></i>Blanc</button></div><button class="quick-add">Ajouter au panier — démo</button><small>Aucun paiement ni commande réelle.</small></div></section>';
  document.body.appendChild(quickView);
  let selectedProduct=null,selectedSize='M',selectedColor='Noir';
  const closeQuick=()=>{quickView.classList.remove('open');document.body.classList.remove('cart-open')};
  quickView.querySelectorAll('[data-qclose]').forEach(el=>el.addEventListener('click',closeQuick));
  function openQuick(card){
    selectedProduct=card;selectedSize='M';selectedColor='Noir';
    const name=$('.product-meta h3',card)?.textContent||'Produit';
    const priceText=$('.product-meta strong',card)?.textContent||'0';
    const price=Number(priceText.replace(/[^0-9]/g,''));
    const img=$('.product-img img',card);
    $('.quick-title',quickView).textContent=name;
    $('.quick-price',quickView).textContent=money(price);
    $('.quick-image',quickView).style.backgroundImage=img?'url("'+img.src+'")':'none';
    $('.quick-sizes button',quickView).forEach(b=>b.classList.toggle('selected',b.textContent===selectedSize));
    $('.quick-colors button',quickView).forEach(b=>b.classList.toggle('selected',b.dataset.color===selectedColor));
    quickView.classList.add('open');document.body.classList.add('cart-open');
  }
  $('.quick-sizes button',quickView).forEach(b=>b.addEventListener('click',()=>{selectedSize=b.textContent;$('.quick-sizes button',quickView).forEach(x=>x.classList.toggle('selected',x===b))}));
  $('.quick-colors button',quickView).forEach(b=>b.addEventListener('click',()=>{selectedColor=b.dataset.color;$('.quick-colors button',quickView).forEach(x=>x.classList.toggle('selected',x===b))}));
  products.forEach(card=>{const img=$('.product-img',card);if(!img)return;const detail=document.createElement('button');detail.className='quick-trigger';detail.type='button';detail.textContent='Voir les détails ↗';detail.addEventListener('click',()=>openQuick(card));img.appendChild(detail)});
  $('.quick-add',quickView).addEventListener('click',()=>{if(!selectedProduct)return;const name=$('.quick-title',quickView).textContent+' · '+selectedSize+' · '+selectedColor;const price=Number(($('.quick-price',quickView).textContent||'0').replace(/[^0-9]/g,''));const category=selectedProduct.dataset.kind||'Sélection';const old=cart.get(name);cart.set(name,{qty:(old?.qty||0)+1,price,category+' / '+selectedSize+' / '+selectedColor});renderCart();closeQuick();notify('Ajouté : '+name);openCart()});
  $('.heart').forEach(b=>b.addEventListener('click',()=>{b.classList.toggle('liked');b.textContent=b.classList.contains('liked')?'♥':'♡';notify(b.classList.contains('liked')?'Ajouté aux favoris':'Retiré des favoris')}));
  $('#view-all')?.addEventListener('click',()=>{filter('Tous');notify('Toute la sélection est affichée')});
  const WHATSAPP_NUMBER='';
  const url=WHATSAPP_NUMBER?'https://wa.me/'+WHATSAPP_NUMBER+'?text='+encodeURIComponent('Bonjour, je souhaite en savoir plus sur vos produits URBAN DZ.'):'';
  ['wa','contact-link'].forEach(id=>{const el=document.getElementById(id);if(!el)return;if(url){el.href=url;el.target='_blank';el.rel='noopener'}else el.addEventListener('click',e=>{e.preventDefault();notify('Démo : ajoutez le numéro WhatsApp dans script.js')})});
  if($('#year'))$('#year').textContent=new Date().getFullYear();
  if(matchMedia('(hover:hover) and (pointer:fine)').matches)$$('.product,.cat').forEach(card=>{card.addEventListener('mousemove',e=>{const r=card.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;card.style.transform='perspective(900px) rotateY('+(x*2)+'deg) rotateX('+(-y*1.7)+'deg) translateY(-3px)'});card.addEventListener('mouseleave',()=>card.style.transform='')});
})();