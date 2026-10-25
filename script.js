/*
 * URBAN DZ demo site.
 * Before delivery to a real shop, replace the WhatsApp number below.
 * Use international format without +, spaces, or dashes (Algeria example: 213XXXXXXXXX).
 */
const WHATSAPP_NUMBER = ""; // Example format only: "213XXXXXXXXX"

function makeWhatsAppUrl(message) {
  if (!WHATSAPP_NUMBER) return "https://wa.me/";
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

document.getElementById("year").textContent = new Date().getFullYear();

const topWhatsapp = document.getElementById("topWhatsapp");
const contactWhatsapp = document.getElementById("contactWhatsapp");
topWhatsapp.href = makeWhatsAppUrl("Salam, nheb نستفسر على منتجات URBAN DZ.");
contactWhatsapp.href = makeWhatsAppUrl("Salam, nheb نستفسر على منتجات URBAN DZ.");

document.querySelectorAll(".product-link").forEach((button) => {
  button.addEventListener("click", () => {
    const product = button.dataset.product;
    if (!WHATSAPP_NUMBER) {
      alert("Maquette de démonstration : configurez le numéro WhatsApp officiel dans script.js avant publication.");
      return;
    }
    window.open(makeWhatsAppUrl(`Salam, nheb nestaفسر على ${product}. Est-ce disponible ?`), "_blank", "noopener");
  });
});

document.querySelectorAll(".filter").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".filter").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    const category = button.dataset.filter;
    document.querySelectorAll(".product").forEach((product) => {
      product.hidden = category !== "all" && product.dataset.category !== category;
    });
  });
});
