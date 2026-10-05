/*
  فقط این شماره را با شماره واتساپ فروشگاه عوض کنید.
  فرمت: کد کشور بدون + و بدون فاصله
  مثال ایران: 989121234567
*/
const WHATSAPP_NUMBER = "989000000000";

const products = [
  {
    id: 1, name: "iPhone 15 Pro", category: "iphone", label: "آیفون",
    description: "گوشی پرچمدار اپل با طراحی حرفه‌ای و عملکرد قدرتمند.",
    image: "assets/iphone15-pro.jpg"
  },
  {
    id: 2, name: "iPhone 13", category: "iphone", label: "آیفون",
    description: "آیفون محبوب اپل؛ مناسب استفاده روزمره و حرفه‌ای.",
    image: "assets/iphone13.jpg"
  },
  {
    id: 3, name: "Galaxy S24 Ultra", category: "android", label: "سامسونگ",
    description: "پرچمدار سامسونگ با دوربین حرفه‌ای و نمایشگر قدرتمند.",
    image: "assets/galaxy-s24-ultra.jpg"
  },
  {
    id: 4, name: "Redmi Note 13 Pro", category: "android", label: "شیائومی",
    description: "گوشی قدرتمند با ارزش خرید بالا و امکانات کامل.",
    image: "assets/redmi-note-13-pro.jpg"
  },
  {
    id: 5, name: "AirPods Pro", category: "accessory", label: "Apple",
    description: "هندزفری بی‌سیم اپل با حذف نویز و کیفیت صدای عالی.",
    image: "assets/airpods-pro.jpg"
  },
  {
    id: 6, name: "شارژر و کابل", category: "accessory", label: "Accessory",
    description: "لوازم جانبی کاربردی برای گوشی‌های موبایل.",
    image: "assets/iphone-accessory.jpg"
  }
];

function whatsappUrl(product) {
  const text =
`سلام موبایل خانزاده 👋
برای استعلام قیمت و موجودی این محصول پیام می‌دم:

📱 محصول: ${product.name}
🏷️ دسته‌بندی: ${product.label}
📝 مشخصات: ${product.description}

لطفاً قیمت روز و موجودی این محصول را اعلام کنید.`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

function renderProducts(filter = "all") {
  const grid = document.getElementById("productGrid");
  const list = filter === "all" ? products : products.filter(p => p.category === filter);
  grid.innerHTML = list.map(p => `
    <article class="product-card">
      <div class="product-media">
        <img src="${p.image}" alt="${p.name}" loading="lazy">
        <span class="badge">استعلام قیمت</span>
      </div>
      <div class="product-body">
        <span class="category-label">${p.label}</span>
        <h3>${p.name}</h3>
        <p>${p.description}</p>
        <div class="product-bottom">
          <button class="wa-btn" type="button" data-id="${p.id}">استعلام قیمت در واتساپ ↗</button>
          <button class="details-btn" type="button" title="ارسال مشخصات">↗</button>
        </div>
      </div>
    </article>
  `).join("");

  grid.querySelectorAll("[data-id]").forEach(btn => {
    btn.addEventListener("click", () => {
      const product = products.find(p => p.id === Number(btn.dataset.id));
      window.open(whatsappUrl(product), "_blank", "noopener");
    });
  });
}

document.querySelectorAll(".filter").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filter").forEach(x => x.classList.remove("active"));
    btn.classList.add("active");
    renderProducts(btn.dataset.filter);
  });
});

const generalWhatsApp = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("سلام موبایل خانزاده، برای مشاوره و استعلام قیمت مزاحم شدم.")}`;
["navWhatsapp", "heroWhatsapp", "footerWhatsapp"].forEach(id => {
  document.getElementById(id).href = generalWhatsApp;
});

renderProducts();
