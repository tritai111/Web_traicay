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

// Xử lý mở popup giỏ hàng
document
  .getElementById("openCartPopup")
  ?.addEventListener("click", function () {
    const popup = window.open(
      "../pages/cart-popup.html",
      "cart_popup",
      "width=450,height=500,resizable,scrollbars"
    );
    if (!popup) {
      alert("Vui lòng cho phép popup để xem giỏ hàng!");
    }
  });
