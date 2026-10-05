const WA='989925457503';
document.querySelectorAll('[data-group]').forEach(group=>{
  group.querySelectorAll('button').forEach(btn=>{
    btn.addEventListener('click',()=>{
      group.querySelectorAll('button').forEach(b=>b.classList.remove('selected'));
      btn.classList.add('selected');
    });
  });
});
function selectedService(){
  return document.querySelector('[data-group="service"] .selected')?.dataset.value || 'سایر خدمات';
}
function openOrder(service){
  document.querySelectorAll('[data-group="service"] button').forEach(b=>{
    b.classList.toggle('selected',b.dataset.value===service);
  });
  document.getElementById('order').scrollIntoView({behavior:'smooth',block:'start'});
}
function sendOrder(){
  const service=selectedService();
  const details=document.getElementById('details').value.trim();
  const budget=document.getElementById('budget').value.trim();
  const name=document.getElementById('name').value.trim();
  const phone=document.getElementById('phone').value.trim();
  if(!phone || !/^09\d{9}$/.test(phone)){
    alert('لطفاً شماره موبایل را با فرمت 0912xxxxxxxx وارد کنید.');
    document.getElementById('phone').focus();
    return;
  }
  let msg=`سلام، برای «${service}» از سایت موبایل خانزاده پیام دادم.%0A%0A`;
  msg+=`نام: ${encodeURIComponent(name||'وارد نشده')}%0A`;
  msg+=`شماره تماس: ${encodeURIComponent(phone)}%0A`;
  msg+=`توضیحات: ${encodeURIComponent(details||'ندارد')}%0A`;
  msg+=`بودجه: ${encodeURIComponent(budget||'مشخص نشده')}`;
  window.open(`https://wa.me/${WA}?text=${msg}`,'_blank');
}
// Dynamic inventory: edit inventory.js to change the phones shown on the site.
(function(){
  const grid = document.getElementById('inventoryGrid');
  const search = document.getElementById('inventorySearch');
  const empty = document.getElementById('inventoryEmpty');
  let filter = 'همه';
  function render(){
    const q = (search?.value || '').trim().toLowerCase();
    const list = (window.MOBILE_INVENTORY || []).filter(p => {
      const matchesFilter = filter === 'همه' || p.condition === filter;
      const text = [p.name,p.storage,p.color,p.condition,p.price].join(' ').toLowerCase();
      return matchesFilter && text.includes(q);
    });
    grid.innerHTML = list.map((p,i)=>`
      <article class="product-card">
        <div class="product-photo">${p.image ? `<img src="${p.image}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover">` : '📱'}</div>
        <div class="product-body">
          <h3>${p.name}</h3>
          <div class="specs"><span class="spec">${p.storage}</span><span class="spec">${p.color}</span><span class="spec">${p.condition}</span></div>
          <div class="price">${p.price}</div>
          <button class="buy-btn" onclick='orderProduct(${JSON.stringify(p)})'>💬 استعلام / سفارش</button>
        </div>
      </article>`).join('');
    empty.hidden = list.length !== 0;
  }
  window.orderProduct = function(p){
    const text = `سلام، برای ${p.name} ${p.storage} رنگ ${p.color} (${p.condition}) از سایت موبایل خانزاده درخواست استعلام/خرید دارم. لطفاً قیمت و موجودی را اعلام کنید.`;
    window.open('https://wa.me/989925457503?text='+encodeURIComponent(text),'_blank');
  };
  search?.addEventListener('input', render);
  document.querySelectorAll('.inv-filter').forEach(btn=>{
    btn.addEventListener('click',()=>{
      document.querySelectorAll('.inv-filter').forEach(b=>b.classList.remove('selected'));
      btn.classList.add('selected'); filter=btn.dataset.filter; render();
    });
  });
  render();
})();
