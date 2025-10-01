const userToggle = document.querySelector(".user-toggle");
const dropdownMenu = document.querySelector(".dropdown-menu");
const userText = document.querySelector(".user-text");
const logoutBtn = document.querySelector(".logout-btn");

// Cập nhật giao diện theo trạng thái đăng nhập
function updateAuthUI() {
  const user = localStorage.getItem("currentUser");
  if (user) {
    userText.textContent = user;
  } else {
    userText.textContent = "Đăng nhập";
  }
}

// Xử lý click vào nút user
if (userToggle) {
  userToggle.addEventListener("click", function (e) {
    e.stopPropagation();
    const isLoggedIn = localStorage.getItem("currentUser");

    if (isLoggedIn) {
      // Đã đăng nhập → bật/tắt dropdown
      dropdownMenu.classList.toggle("show");
    } else {
      // Chưa đăng nhập → chuyển đến trang login
      window.location.href = "../pages/login.html";
    }
  });
}

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
    updateAuthUI();
    if (dropdownMenu) dropdownMenu.classList.remove("show");
    // Không reload, chỉ cập nhật UI
  });
}

// Khởi chạy khi tải trang
document.addEventListener("DOMContentLoaded", updateAuthUI);

//MO BAI
function toggleLayout() {
  document.querySelector(".container").classList.toggle("active");
}
// Thêm hàm này vào main.js
function updateCartUI() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  const cartCount = document.querySelector(".cart-count");
  if (cartCount) {
    cartCount.textContent = totalItems;
  }
}

// Gọi khi load trang (thêm vào cuối file)
document.addEventListener("DOMContentLoaded", function () {
  updateAuthUI();
  updateCartUI(); // ← Thêm dòng này
});

// Xử lý mở drawer giỏ hàng

document
  .getElementById("openCartPopup")
  ?.addEventListener("click", function () {
    document.getElementById("cartDrawer").classList.add("active");
    document.getElementById("cartOverlay").style.display = "block";
    renderCartDrawer(); // Gọi hàm render mới
  });

// Đóng drawer
document
  .getElementById("closeCartDrawer")
  ?.addEventListener("click", function () {
    closeCartDrawer();
  });

document.getElementById("cartOverlay")?.addEventListener("click", function () {
  closeCartDrawer();
});

function closeCartDrawer() {
  document.getElementById("cartDrawer").classList.remove("active");
  document.getElementById("cartOverlay").style.display = "none";
}
function renderCartDrawer() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const contentDiv = document.getElementById("cartDrawerContent");
  const footerDiv = document.getElementById("cartDrawerFooter");

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

    itemsHTML += `
        <div class="cart-item" data-id="${item.id}">
          <div class="item-image">
            <i class="fas fa-shopping-bag"></i>
          </div>
          <div class="item-info">
            <div class="item-name">${item.name}</div>
            <div class="item-price">${priceNum.toLocaleString(
              "vi-VN"
            )} VNĐ</div>
            <div class="quantity-controls">
              <button class="qty-btn" onclick="updateQtyInDrawer(${
                item.id
              }, -1)">-</button>
              <span class="quantity">${item.qty}</span>
              <button class="qty-btn" onclick="updateQtyInDrawer(${
                item.id
              }, 1)">+</button>
              <button class="remove-btn" onclick="removeItemInDrawer(${
                item.id
              })">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
      `;
  });

  contentDiv.innerHTML = itemsHTML;

  footerDiv.innerHTML = `
      <div class="total-section">
        <span class="total-label">Tổng cộng:</span>
        <span class="total-amount">${total.toLocaleString("vi-VN")} VNĐ</span>
      </div>
      <button class="checkout-btn" onclick="checkoutFromDrawer()">Thanh toán</button>
    `;
}

// Các hàm xử lý trong drawer
function updateQtyInDrawer(id, change) {
  // Logic giống updateQty nhưng không cần window.opener
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const item = cart.find((i) => i.id == id);

  if (item) {
    item.qty += change;
    if (item.qty <= 0) {
      cart = cart.filter((i) => i.id != id);
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    renderCartDrawer();

    // Cập nhật số lượng trên navbar
    const totalItems = cart.reduce((sum, i) => sum + i.qty, 0);
    const cartCount = document.querySelector(".cart-count");
    if (cartCount) cartCount.textContent = totalItems;
  }
}

function removeItemInDrawer(id) {
  // Logic giống removeItem nhưng không cần window.opener
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart = cart.filter((i) => i.id != id);
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCartDrawer();

  // Cập nhật số lượng trên navbar
  const totalItems = cart.reduce((sum, i) => sum + i.qty, 0);
  const cartCount = document.querySelector(".cart-count");
  if (cartCount) cartCount.textContent = totalItems;
}

function checkoutFromDrawer() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  if (cart.length === 0) return;

  closeCartDrawer();
  setTimeout(() => {
    window.open(
      "../pages/payment-popup.html",
      "payment_window",
      "width=450,height=500"
    );
  }, 300);
}
