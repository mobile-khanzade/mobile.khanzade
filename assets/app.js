const products = [
  {id:1,brand:"Apple",name:"iPhone 15 Pro",cat:"iphone",desc:"قدرت بالا، دوربین حرفه‌ای و بدنه تیتانیومی",price:"استعلام قیمت",image:"https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=900&q=90"},
  {id:2,brand:"Samsung",name:"Galaxy S24 Ultra",cat:"samsung",desc:"پرچمدار قدرتمند با دوربین و نمایشگر فوق‌العاده",price:"استعلام قیمت",image:"https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=900&q=90"},
  {id:3,brand:"Xiaomi",name:"Xiaomi 14",cat:"xiaomi",desc:"سریع، خوش‌دست و مناسب استفاده روزمره و حرفه‌ای",price:"استعلام قیمت",image:"https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=900&q=90"},
  {id:4,brand:"Apple",name:"iPhone 13",cat:"iphone",desc:"یکی از محبوب‌ترین انتخاب‌ها برای استفاده روزمره",price:"استعلام قیمت",image:"https://images.unsplash.com/photo-1603891128711-11b4b03bb138?auto=format&fit=crop&w=900&q=90"},
  {id:5,brand:"Samsung",name:"Galaxy A55",cat:"samsung",desc:"ارزش خرید عالی با نمایشگر باکیفیت و باتری قوی",price:"استعلام قیمت",image:"https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=900&q=90"},
  {id:6,brand:"Xiaomi",name:"Redmi Note 13 Pro",cat:"xiaomi",desc:"گزینه‌ای اقتصادی با امکانات کامل و جذاب",price:"استعلام قیمت",image:"https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=90"}
];

const grid = document.querySelector("#productGrid");
function render(filter="all"){
  grid.innerHTML = products.filter(p=>filter==="all"||p.cat===filter).map(p=>`
    <article class="product">
      <div class="product-img">
        <span class="product-badge">${p.brand}</span>
        <img src="${p.image}" alt="${p.name}" loading="lazy">
      </div>
      <div class="product-info">
        <div class="brandline">${p.brand}</div>
        <h3>${p.name}</h3>
        <p>${p.desc}</p>
        <div class="product-bottom">
          <div class="price-tag">${p.price}<small>برای قیمت روز پیام بده</small></div>
          <button class="product-btn" onclick="askPrice('${p.name}')">قیمت</button>
        </div>
      </div>
    </article>`).join("");
}
window.askPrice = function(model){
  const msg = encodeURIComponent(`سلام، قیمت ${model} رو می‌خواستم. لطفاً موجودی و قیمت روز رو اعلام کنید.`);
  window.open(`https://wa.me/989925457503?text=${msg}`,"_blank");
};
document.querySelectorAll(".filter").forEach(btn=>{
  btn.addEventListener("click",()=>{
    document.querySelectorAll(".filter").forEach(x=>x.classList.remove("active"));
    btn.classList.add("active");
    render(btn.dataset.filter);
  });
});
document.querySelector("#waForm").addEventListener("submit",e=>{
  e.preventDefault();
  const name=document.querySelector("#name").value.trim();
  const model=document.querySelector("#model").value.trim()||"یک گوشی مناسب";
  const details=document.querySelector("#details").value.trim();
  const msg=encodeURIComponent(`سلام موبایل خانزاده 🌟\nمن ${name} هستم.\nدر مورد ${model} راهنمایی می‌خواستم.\n${details}`);
  window.open(`https://wa.me/989925457503?text=${msg}`,"_blank");
});
render();
