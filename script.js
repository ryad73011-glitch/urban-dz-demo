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
  let activeFilter='Tous';
  const searchInput=$('#product-search'),clearSearch=$('#clear-search'),searchResults=$('#search-results');
  function applyProductFilters(){
    const query=(searchInput?.value||'').trim().toLocaleLowerCase('fr');let shown=0;
    filters.forEach(b=>b.classList.toggle('active',b.dataset.filter===activeFilter));
    products.forEach(p=>{const categoryMatch=activeFilter==='Tous'||p.dataset.kind===activeFilter;const text=[$('.product-meta h3',p)?.textContent,$('.product-meta p',p)?.textContent,p.dataset.kind].join(' ').toLocaleLowerCase('fr');const searchMatch=!query||text.includes(query);const visible=categoryMatch&&searchMatch;p.classList.toggle('hidden',!visible);if(visible)shown++});
    if(searchResults){searchResults.textContent=shown?shown+' pièce'+(shown>1?'s':'')+' affichée'+(shown>1?'s':''):(query?'Aucun produit ne correspond à « '+query+' ».':'Aucun produit dans cette catégorie.');searchResults.classList.toggle('visible',Boolean(query)||shown===0)}
    if(clearSearch)clearSearch.style.visibility=query?'visible':'hidden';
  }
  function filter(name){activeFilter=name;applyProductFilters()}
  filters.forEach(b=>b.addEventListener('click',()=>filter(b.dataset.filter)));
  searchInput?.addEventListener('input',applyProductFilters);
  clearSearch?.addEventListener('click',()=>{if(searchInput){searchInput.value='';searchInput.focus()}applyProductFilters()});
  $$('.cat').forEach(c=>c.addEventListener('click',()=>filter(c.dataset.category)));
  const toast=$('.toast');let toastTimer;
  function notify(msg){if(!toast)return;toast.textContent=msg;toast.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('show'),2400)}
  const CART_KEY='urban-dz-demo-cart-v1';
  const FAV_KEY='urban-dz-demo-favorites-v1';
  function readStorage(key,fallback){try{const value=localStorage.getItem(key);return value?JSON.parse(value):fallback}catch(_){return fallback}}
  function writeStorage(key,value){try{localStorage.setItem(key,JSON.stringify(value))}catch(_){notify('Stockage local indisponible sur ce navigateur')}}
  const savedCart=readStorage(CART_KEY,[]);
  const cart=new Map(Array.isArray(savedCart)?savedCart.filter(x=>Array.isArray(x)&&x.length===2&&x[1]&&Number.isFinite(Number(x[1].price))&&Number.isFinite(Number(x[1].qty))&&Number(x[1].qty)>0):[]);
  const savedFavorites=new Set(readStorage(FAV_KEY,[]).filter(x=>typeof x==='string'));
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
    writeStorage(CART_KEY,[...cart.entries()]);
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
    $$('.quick-sizes button',quickView).forEach(b=>b.classList.toggle('selected',b.textContent===selectedSize));
    $$('.quick-colors button',quickView).forEach(b=>b.classList.toggle('selected',b.dataset.color===selectedColor));
    quickView.classList.add('open');document.body.classList.add('cart-open');
  }
  $$('.quick-sizes button',quickView).forEach(b=>b.addEventListener('click',()=>{selectedSize=b.textContent;$$('.quick-sizes button',quickView).forEach(x=>x.classList.toggle('selected',x===b))}));
  $$('.quick-colors button',quickView).forEach(b=>b.addEventListener('click',()=>{selectedColor=b.dataset.color;$$('.quick-colors button',quickView).forEach(x=>x.classList.toggle('selected',x===b))}));
  products.forEach(card=>{const img=$('.product-img',card);if(!img)return;const detail=document.createElement('button');detail.className='quick-trigger';detail.type='button';detail.textContent='Voir les détails ↗';detail.addEventListener('click',()=>openQuick(card));img.appendChild(detail)});
  $('.quick-add',quickView).addEventListener('click',()=>{if(!selectedProduct)return;const name=$('.quick-title',quickView).textContent+' · '+selectedSize+' · '+selectedColor;const price=Number(($('.quick-price',quickView).textContent||'0').replace(/[^0-9]/g,''));const category=selectedProduct.dataset.kind||'Sélection';const old=cart.get(name);cart.set(name,{qty:(old?.qty||0)+1,price,category+' / '+selectedSize+' / '+selectedColor});renderCart();closeQuick();notify('Ajouté : '+name);openCart()});
  $$('.heart').forEach((b,i)=>{const card=b.closest('.product');const key=card?($('.product-meta h3',card)?.textContent||String(i)):String(i);b.classList.toggle('liked',savedFavorites.has(key));b.textContent=b.classList.contains('liked')?'♥':'♡';b.setAttribute('aria-pressed',String(b.classList.contains('liked')));b.addEventListener('click',()=>{const liked=b.classList.toggle('liked');b.textContent=liked?'♥':'♡';b.setAttribute('aria-pressed',String(liked));if(liked)savedFavorites.add(key);else savedFavorites.delete(key);writeStorage(FAV_KEY,[...savedFavorites]);notify(liked?'Ajouté aux favoris':'Retiré des favoris')})});
  $('#view-all')?.addEventListener('click',()=>{filter('Tous');if(searchInput)searchInput.value='';applyProductFilters();notify('Toute la sélection est affichée')});
  // Demo checkout form: validates customer details but never submits a real order.
  const checkoutButton=document.createElement('button');
  checkoutButton.className='cart-checkout';checkoutButton.type='button';checkoutButton.textContent='Préparer ma commande ↗';
  $('.cart-summary',drawer).insertBefore(checkoutButton,$('.cart-continue',drawer));
  const checkout=document.createElement('form');
  checkout.className='checkout-form';
  checkout.innerHTML='<div class="checkout-head"><button type="button" class="checkout-back">← Retour au panier</button><h3>Infos de livraison</h3><p>Remplis ces informations pour préparer un récapitulatif. Aucun achat ne sera envoyé.</p></div><label>Nom complet<input name="customer" autocomplete="name" required minlength="2" placeholder="Ton nom"></label><label>Téléphone<input name="phone" autocomplete="tel" inputmode="tel" required pattern="[0-9+() .-]{8,20}" placeholder="05 / 06 / 07…"></label><label>Wilaya / commune<input name="city" autocomplete="address-level2" required placeholder="Ex. Oran, Es Sénia"></label><label>Adresse de livraison<textarea name="address" autocomplete="street-address" required rows="2" placeholder="Adresse complète"></textarea></label><label>Note (facultatif)<textarea name="note" rows="2" placeholder="Taille, créneau de livraison…"></textarea></label><button class="checkout-submit" type="submit">Créer le récapitulatif</button><p class="checkout-feedback" role="status"></p>';
  $('.cart-panel',drawer).appendChild(checkout);
  checkoutButton.addEventListener('click',()=>{if(!cart.size){notify('Ajoute au moins un produit au panier');return}$('.cart-items',drawer).style.display='none';$('.cart-empty',drawer).style.display='none';$('.cart-summary',drawer).style.display='none';checkout.classList.add('visible');checkout.scrollTop=0});
  $('.checkout-back',checkout).addEventListener('click',()=>{checkout.classList.remove('visible');$('.cart-summary',drawer).style.display='block';renderCart()});
  checkout.addEventListener('submit',e=>{e.preventDefault();if(!checkout.reportValidity())return;const data=new FormData(checkout);let lines=[];cart.forEach((item,name)=>lines.push(name+' × '+item.qty+' — '+money(item.price*item.qty)));const total=[...cart.values()].reduce((sum,item)=>sum+item.price*item.qty,0);const message='URBAN DZ — RÉCAPITULATIF DÉMO\nNom: '+data.get('customer')+'\nTéléphone: '+data.get('phone')+'\nCommune: '+data.get('city')+'\nAdresse: '+data.get('address')+'\nProduits:\n'+lines.join('\n')+'\nTotal indicatif: '+money(total)+'\nNote: '+(data.get('note')||'—')+'\n\nAucune commande réelle n’a été envoyée.';const feedback=$('.checkout-feedback',checkout);feedback.textContent='Récapitulatif créé. Copie-le pour le conserver; aucun message ni commande n’a été envoyé.';let preview=$('.checkout-preview',checkout);if(!preview){preview=document.createElement('textarea');preview.className='checkout-preview';preview.readOnly=true;preview.rows=8;checkout.insertBefore(preview,feedback)}preview.value=message;});
  const WHATSAPP_NUMBER='';
  const url=WHATSAPP_NUMBER?'https://wa.me/'+WHATSAPP_NUMBER+'?text='+encodeURIComponent('Bonjour, je souhaite en savoir plus sur vos produits URBAN DZ.'):'';
  ['wa','contact-link'].forEach(id=>{const el=document.getElementById(id);if(!el)return;if(url){el.href=url;el.target='_blank';el.rel='noopener'}else el.addEventListener('click',e=>{e.preventDefault();notify('Démo : ajoutez le numéro WhatsApp dans script.js')})});
  if($('#year'))$('#year').textContent=new Date().getFullYear();
  if(matchMedia('(hover:hover) and (pointer:fine)').matches)$$('.product,.cat').forEach(card=>{card.addEventListener('mousemove',e=>{const r=card.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;card.style.transform='perspective(900px) rotateY('+(x*2)+'deg) rotateX('+(-y*1.7)+'deg) translateY(-3px)'});card.addEventListener('mouseleave',()=>card.style.transform='')});
})();