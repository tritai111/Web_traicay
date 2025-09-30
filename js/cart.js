let productsData = [];

// 1. Load JSON
fetch("../data/products.json")
  .then((response) => response.json())
  .then((data) => {
    productsData = data;
  })
  .catch((error) => console.error("Lỗi tải file JSON:", error));

// 2. Hàm lấy sản phẩm theo ID (hoặc lấy sản phẩm đầu tiên nếu chỉ có 1)
function getCurrentProduct() {
  // Giả sử bạn đang ở trang sản phẩm ID=1 (hoặc lấy sản phẩm đầu tiên)
  const product = productsData.find((p) => p.id === 1) || productsData[0];

  if (!product) {
    return null;
  }

  return {
    id: product.id,
    name: product.name,
    price: parseFloat(product.price), // Chuyển sang số để tính toán
    qty: 1,
  };
}

// 3. Xử lý nút "MUA NGAY"
document.querySelector(".buy-now-btn").addEventListener("click", function () {
  const currentUser = localStorage.getItem("currentUser");

  if (!currentUser) {
    window.location.href = "../pages/login.html";
    return;
  }

  // Lấy sản phẩm thật từ JSON
  const currentProduct = getCurrentProduct();
  if (!currentProduct) {
    alert("Không tìm thấy sản phẩm để mua!");
    return;
  }

  localStorage.setItem("paymentProduct", JSON.stringify(currentProduct));

  const popup = window.open(
    "../pages/payment-popup.html",
    "payment_window",
    "width=850,height=700,resizable,scrollbars"
  );

  if (!popup) {
    alert("Vui lòng cho phép popup để thanh toán!");
  }
});

// 4. Xử lý nút "THÊM VÀO GIỎ HÀNG"
// Xử lý nút "THÊM VÀO GIỎ HÀNG"
document
  .querySelector(".add-to-cart-btn")
  .addEventListener("click", function () {
    const product = getCurrentProduct();
    if (!product) {
      alert("Không tìm thấy sản phẩm!");
      return;
    }

    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    // Kiểm tra xem sản phẩm đã có trong giỏ chưa (theo id)
    const existingItem = cart.find((item) => item.id === product.id);

    if (existingItem) {
      // Tăng số lượng
      existingItem.qty += 1;
    } else {
      // Thêm mới
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        qty: 1,
      });
    }

    localStorage.setItem("cart", JSON.stringify(cart));

    // Cập nhật số lượng trên navbar (tổng số sản phẩm, không phải tổng dòng)
    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
    const cartCount = document.querySelector(".cart-count");
    if (cartCount) {
      cartCount.textContent = totalItems;
    }

    // Hiển thị thông báo
    const notif = document.getElementById("cartNotification");
    if (notif) {
      notif.classList.add("show");
      setTimeout(() => notif.classList.remove("show"), 2000);
    }
  });
// thanh toán giỏ hàng
// Xử lý nút "THANH TOÁN GIỎ HÀNG"
document;
document
  .querySelector(".checkout-cart-btn.nav-button")
  ?.addEventListener("click", function () {
    const currentUser = localStorage.getItem("currentUser");
    if (!currentUser) {
      window.location.href = "../pages/login.html";
      return;
    }

    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    if (cart.length === 0) {
      alert("Giỏ hàng của bạn đang trống!");
      return;
    }

    // Không cần lưu paymentProduct, vì popup sẽ đọc trực tiếp từ 'cart'
    const popup = window.open(
      "../pages/payment-popup.html",
      "payment_window",
      "width=850,height=700"
    );
  });
