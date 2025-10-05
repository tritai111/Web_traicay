const userToggle = document.querySelector(".user-toggle");
const dropdownMenu = document.querySelector(".dropdown-menu");
const userText = document.querySelector(".user-text");
const logoutBtn = document.querySelector(".logout-btn");

// ==================== HÀM QUẢN LÝ GIỎ HÀNG THEO USER ====================

// Lấy giỏ hàng của user hiện tại
function getCurrentUserCart() {
  const userEmail = localStorage.getItem("currentUserEmail");
  if (!userEmail) {
    return JSON.parse(localStorage.getItem("temp_cart")) || [];
  }

  const userCartKey = `cart_${userEmail}`;
  return JSON.parse(localStorage.getItem(userCartKey)) || [];
}

// Lưu giỏ hàng của user hiện tại
function saveCurrentUserCart(cart) {
  const userEmail = localStorage.getItem("currentUserEmail");
  if (!userEmail) {
    localStorage.setItem("temp_cart", JSON.stringify(cart));
    return;
  }

  const userCartKey = `cart_${userEmail}`;
  localStorage.setItem(userCartKey, JSON.stringify(cart));
}

// ==================== XỬ LÝ AUTHENTICATION ====================

// Cập nhật giao diện theo trạng thái đăng nhập
function updateAuthUI() {
  const role = localStorage.getItem("currentUserRole");
  const user = localStorage.getItem("currentUser");

  if (role === "customer" && user) {
    userText.textContent = user;
  } else {
    userText.textContent = "Đăng nhập";
  }
}

// Xử lý click vào nút user
userToggle.addEventListener("click", function (e) {
  e.stopPropagation();
  const isLoggedIn = localStorage.getItem("currentUser");
  if (isLoggedIn) {
    dropdownMenu.classList.toggle("show");
  } else {
    window.location.href = "../pages/login.html";
  }
});

// Đóng dropdown khi click ngoài
document.addEventListener("click", () => {
  if (dropdownMenu) dropdownMenu.classList.remove("show");
});

// Ngăn đóng khi click trong menu
if (dropdownMenu) {
  dropdownMenu.addEventListener("click", (e) => e.stopPropagation());
}

// Xử lý đăng xuất
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("currentUserEmail");
    localStorage.removeItem("currentUserRole");
    updateAuthUI();
    updateCartUI();
    if (dropdownMenu) dropdownMenu.classList.remove("show");
  });
}

// ==================== XỬ LÝ GIỎ HÀNG ====================

// Cập nhật UI giỏ hàng
function updateCartUI() {
  const cart = getCurrentUserCart();
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  const cartCount = document.querySelector(".cart-count");
  if (cartCount) {
    cartCount.textContent = totalItems;
  }
}

// Render giỏ hàng trong drawer (KHÔNG CÓ HÌNH ẢNH)
function renderCartDrawer() {
  const cart = getCurrentUserCart();
  const contentDiv = document.getElementById("cartDrawerContent");
  const footerDiv = document.getElementById("cartDrawerFooter");

  if (!contentDiv || !footerDiv) return;

  if (cart.length === 0) {
    contentDiv.innerHTML = `
      <div class="empty-cart">
        <i class="fas fa-shopping-cart"></i>
        <p>Giỏ hàng của bạn đang trống</p>
      </div>
    `;
    footerDiv.innerHTML = "";
    return;
  }

  let total = 0;
  let itemsHTML = "";

  cart.forEach((item) => {
    const priceNum = parseFloat(item.price) || 0;
    const itemTotal = priceNum * item.qty;
    total += itemTotal;

    // KHÔNG HIỂN THỊ HÌNH ẢNH, CHỈ HIỂN THỊ THÔNG TIN
    itemsHTML += `
      <div class="cart-item" data-id="${item.id}">
        <div class="item-info">
          <div class="item-name">${item.name}</div>
          <div class="item-price">${priceNum.toLocaleString("vi-VN")} VNĐ</div>
          <div class="quantity-controls">
            <button class="qty-btn" onclick="updateQtyInDrawer(${
              item.id
            }, -1)">-</button>
            <span class="quantity">${item.qty}</span>
            <button class="qty-btn" onclick="updateQtyInDrawer(${
              item.id
            }, 1)">+</button>
            <button class="remove-btn" onclick="removeItemInDrawer(${item.id})">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  });

  contentDiv.innerHTML = itemsHTML;

  // Kiểm tra đăng nhập
  const isLoggedIn = localStorage.getItem("currentUser") !== null;

  if (isLoggedIn) {
    footerDiv.innerHTML = `
      <div class="total-section">
        <span class="total-label">Tổng cộng:</span>
        <span class="total-amount">${total.toLocaleString("vi-VN")} VNĐ</span>
      </div>
      <button class="checkout-btn" onclick="checkoutFromDrawer()">Thanh toán</button>
    `;
  } else {
    footerDiv.innerHTML = `
      <div class="total-section">
        <span class="total-label">Tổng cộng:</span>
        <span class="total-amount">${total.toLocaleString("vi-VN")} VNĐ</span>
      </div>
      <button class="checkout-btn login-required" onclick="redirectToLogin()">
        Đăng nhập để thanh toán
      </button>
    `;
  }
}

// Chuyển hướng đến trang login
function redirectToLogin() {
  window.location.href = "../pages/login.html";
}

// Các hàm xử lý trong drawer
function updateQtyInDrawer(id, change) {
  let cart = getCurrentUserCart();
  const item = cart.find((i) => i.id == id);

  if (item) {
    item.qty += change;
    if (item.qty <= 0) {
      cart = cart.filter((i) => i.id != id);
    }
    saveCurrentUserCart(cart);
    renderCartDrawer();
    updateCartUI();
  }
}

function removeItemInDrawer(id) {
  let cart = getCurrentUserCart();
  cart = cart.filter((i) => i.id != id);
  saveCurrentUserCart(cart);
  renderCartDrawer();
  updateCartUI();
}

function checkoutFromDrawer() {
  const cart = getCurrentUserCart();
  if (cart.length === 0) return;

  const isLoggedIn = localStorage.getItem("currentUser") !== null;
  if (!isLoggedIn) {
    alert("Vui lòng đăng nhập để thanh toán!");
    window.location.href = "../pages/login.html";
    return;
  }

  closeCartDrawer();
  setTimeout(() => {
    window.open(
      "../pages/payment-popup.html",
      "payment_window",
      "width=850,height=700,scrollbars=yes,resizable=yes"
    );
  }, 300);
}

// ==================== XỬ LÝ DRAWER ====================

// Đóng drawer
function closeCartDrawer() {
  const cartDrawer = document.getElementById("cartDrawer");
  const cartOverlay = document.getElementById("cartOverlay");

  if (cartDrawer) cartDrawer.classList.remove("active");
  if (cartOverlay) cartOverlay.style.display = "none";
}

// Gắn sự kiện đóng drawer
document.addEventListener("DOMContentLoaded", function () {
  const closeCartBtn = document.getElementById("closeCartDrawer");
  const cartOverlay = document.getElementById("cartOverlay");

  if (closeCartBtn) {
    closeCartBtn.addEventListener("click", closeCartDrawer);
  }

  if (cartOverlay) {
    cartOverlay.addEventListener("click", closeCartDrawer);
  }
});

// ==================== CÁC HÀM KHÁC ====================

// MO BAI - toggle layout
function toggleLayout() {
  document.querySelector(".container").classList.toggle("active");
}

// ==================== KHỞI TẠO ====================

// Khởi chạy khi tải trang
document.addEventListener("DOMContentLoaded", function () {
  updateAuthUI();
  updateCartUI();
  console.log("Main.js loaded - User:", localStorage.getItem("currentUser"));
});
