// checkout.js - Xử lý thanh toán trong popup
document.addEventListener("DOMContentLoaded", function () {
  console.log("Payment popup loaded");

  // Tự động lấy giỏ hàng từ chính user đang đăng nhập
  function loadCartForPayment() {
    const userEmail = localStorage.getItem("currentUserEmail");
    let cart = [];

    if (userEmail) {
      const userCartKey = `cart_${userEmail}`;
      cart = JSON.parse(localStorage.getItem(userCartKey)) || [];
    } else {
      cart = JSON.parse(localStorage.getItem("temp_cart")) || [];
    }

    console.log("Cart loaded in payment popup:", cart);

    if (cart.length === 0) {
      document.body.innerHTML = `
        <div style="padding: 20px; text-align: center;">
          <h2>Giỏ hàng trống!</h2>
          <p>Không có sản phẩm nào để thanh toán.</p>
          <button onclick="window.close()">Đóng</button>
        </div>
      `;
      return;
    }

    // Hiển thị giỏ hàng
    renderPaymentCart(cart);
  }

  function renderPaymentCart(cart) {
    let total = 0;
    let html = `
      <div class="payment-header">
        <h2>Thanh Toán Đơn Hàng</h2>
        <p>Xin chào: <strong>${localStorage.getItem("currentUser")}</strong></p>
      </div>
      <div class="payment-items">
        <h3>Sản phẩm trong giỏ hàng:</h3>
    `;

    cart.forEach((item) => {
      const price = parseFloat(item.price) || 0;
      const itemTotal = price * item.qty;
      total += itemTotal;

      html += `
        <div class="payment-item">
          <div class="item-name">${item.name} x ${item.qty}</div>
          <div class="item-price">${itemTotal.toLocaleString("vi-VN")} VNĐ</div>
        </div>
      `;
    });

    html += `
      </div>
      <div class="payment-total">
        <strong>Tổng cộng: ${total.toLocaleString("vi-VN")} VNĐ</strong>
      </div>
      <div class="payment-actions">
        <button onclick="processPayment()" class="pay-btn">Thanh Toán</button>
        <button onclick="window.close()" class="cancel-btn">Hủy</button>
      </div>
    `;

    document.body.innerHTML = html;
  }

  // Gọi hàm load cart
  loadCartForPayment();
});

function processPayment() {
  alert("Thanh toán thành công! Cảm ơn bạn đã mua hàng.");

  // Xóa giỏ hàng sau khi thanh toán
  const userEmail = localStorage.getItem("currentUserEmail");
  if (userEmail) {
    localStorage.removeItem(`cart_${userEmail}`);
  } else {
    localStorage.removeItem("temp_cart");
  }

  setTimeout(() => {
    window.close();
    // Refresh trang chính để cập nhật giỏ hàng
    if (window.opener && !window.opener.closed) {
      window.opener.location.reload();
    }
  }, 1500);
}
// checkout.js - Xử lý thanh toán trong popup
document.addEventListener("DOMContentLoaded", function () {
  console.log("Payment popup loaded");

  function loadCartForPayment() {
    const userEmail = localStorage.getItem("currentUserEmail");
    let cart = [];

    if (userEmail) {
      const userCartKey = `cart_${userEmail}`;
      cart = JSON.parse(localStorage.getItem(userCartKey)) || [];
    } else {
      cart = JSON.parse(localStorage.getItem("temp_cart")) || [];
    }

    console.log("Cart loaded in payment popup:", cart);

    if (cart.length === 0) {
      document.body.innerHTML = `
        <div style="padding: 20px; text-align: center;">
          <h2>Giỏ hàng trống!</h2>
          <p>Không có sản phẩm nào để thanh toán.</p>
          <button onclick="window.close()" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">Đóng</button>
        </div>
      `;
      return;
    }

    renderPaymentCart(cart);
  }

  function renderPaymentCart(cart) {
    let total = 0;
    let html = `
      <div class="payment-header" style="text-align: center; margin-bottom: 20px;">
        <h2>Thanh Toán Đơn Hàng</h2>
        <p>Xin chào: <strong>${localStorage.getItem("currentUser")}</strong></p>
      </div>
      
      <div class="payment-items" style="margin-bottom: 20px;">
        <h3>Sản phẩm:</h3>
    `;

    cart.forEach((item) => {
      const price = parseFloat(item.price) || 0;
      const itemTotal = price * item.qty;
      total += itemTotal;

      html += `
        <div class="payment-item" style="display: flex; justify-content: space-between; padding: 10px; border-bottom: 1px solid #eee;">
          <div class="item-name">${item.name} x ${item.qty}</div>
          <div class="item-price">${itemTotal.toLocaleString("vi-VN")} VNĐ</div>
        </div>
      `;
    });

    html += `
      </div>
      
      <div class="payment-total" style="text-align: right; font-size: 1.2em; margin: 20px 0; padding: 15px; background: #f8f9fa; border-radius: 5px;">
        <strong>Tổng cộng: ${total.toLocaleString("vi-VN")} VNĐ</strong>
      </div>
      
      <div class="payment-methods" style="margin: 20px 0;">
        <h3>Chọn phương thức thanh toán:</h3>
        
        <div class="payment-option" style="margin: 10px 0; padding: 15px; border: 2px solid #e0e0e0; border-radius: 8px; cursor: pointer;" onclick="selectPaymentMethod('banking')">
          <input type="radio" id="banking" name="paymentMethod" value="banking" style="margin-right: 10px;">
          <label for="banking" style="cursor: pointer; font-weight: bold;">
            Chuyển khoản ngân hàng
          </label>
        </div>
        
        <div class="payment-option" style="margin: 10px 0; padding: 15px; border: 2px solid #e0e0e0; border-radius: 8px; cursor: pointer;" onclick="selectPaymentMethod('cash')">
          <input type="radio" id="cash" name="paymentMethod" value="cash" style="margin-right: 10px;">
          <label for="cash" style="cursor: pointer; font-weight: bold;">
            Tiền mặt khi nhận hàng
          </label>
        </div>
      </div>
      
      <div class="shipping-address" style="margin: 20px 0;">
        <h3>Địa chỉ nhận hàng:</h3>
        
        <div class="address-option" style="margin: 10px 0; padding: 15px; border: 2px solid #e0e0e0; border-radius: 8px; cursor: pointer;" onclick="selectAddress('saved')">
          <input type="radio" id="savedAddress" name="addressMethod" value="saved" style="margin-right: 10px;">
          <label for="savedAddress" style="cursor: pointer; font-weight: bold;">
            Dùng địa chỉ từ tài khoản
          </label>
        </div>
        
        <div class="address-option" style="margin: 10px 0; padding: 15px; border: 2px solid #e0e0e0; border-radius: 8px; cursor: pointer;" onclick="selectAddress('new')">
          <input type="radio" id="newAddress" name="addressMethod" value="new" style="margin-right: 10px;">
          <label for="newAddress" style="cursor: pointer; font-weight: bold;">
            Địa chỉ mới
          </label>
        </div>
        
        <div id="newAddressForm" style="display: none; margin-top: 10px; padding: 15px; background: #f8f9fa; border-radius: 5px;">
          <textarea id="customerAddress" placeholder="Nhập địa chỉ mới..." style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; height: 60px;"></textarea>
        </div>
      </div>
      
      <div class="payment-actions" style="text-align: center; margin-top: 30px;">
        <button onclick="processPayment()" class="pay-btn" style="padding: 12px 30px; background: #28a745; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 1.1em; margin: 0 10px;">
          Xác nhận thanh toán
        </button>
        <button onclick="window.close()" class="cancel-btn" style="padding: 12px 30px; background: #dc3545; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 1.1em; margin: 0 10px;">
          Hủy
        </button>
      </div>
      
      <div id="paymentMessage" style="margin-top: 20px; text-align: center;"></div>
    `;

    document.body.innerHTML = html;
  }

  loadCartForPayment();
});

// Biến toàn cục
let selectedPaymentMethod = "";
let selectedAddressMethod = "";
let savedUserAddress = "123 Đường ABC, Quận 1, TP.HCM"; // Địa chỉ mặc định

function selectPaymentMethod(method) {
  selectedPaymentMethod = method;

  document.querySelectorAll(".payment-option").forEach((option) => {
    option.style.borderColor = "#e0e0e0";
    option.style.background = "white";
  });

  const selectedOption = document.querySelector(
    `[onclick="selectPaymentMethod('${method}')"]`
  );
  if (selectedOption) {
    selectedOption.style.borderColor = "#007bff";
    selectedOption.style.background = "#f0f8ff";
  }

  document.querySelectorAll('input[name="paymentMethod"]').forEach((radio) => {
    radio.checked = radio.value === method;
  });
}

function selectAddress(method) {
  selectedAddressMethod = method;

  document.querySelectorAll(".address-option").forEach((option) => {
    option.style.borderColor = "#e0e0e0";
    option.style.background = "white";
  });

  const selectedOption = document.querySelector(
    `[onclick="selectAddress('${method}')"]`
  );
  if (selectedOption) {
    selectedOption.style.borderColor = "#007bff";
    selectedOption.style.background = "#f0f8ff";
  }

  document.querySelectorAll('input[name="addressMethod"]').forEach((radio) => {
    radio.checked = radio.value === method;
  });

  // Hiển thị form nhập địa chỉ mới nếu chọn
  const newAddressForm = document.getElementById("newAddressForm");
  if (newAddressForm) {
    newAddressForm.style.display = method === "new" ? "block" : "none";
  }
}

function processPayment() {
  if (!selectedPaymentMethod) {
    showMessage("Vui lòng chọn phương thức thanh toán!", "error");
    return;
  }

  if (!selectedAddressMethod) {
    showMessage("Vui lòng chọn phương thức địa chỉ!", "error");
    return;
  }

  // Lấy địa chỉ giao hàng
  let shippingAddress = "";
  if (selectedAddressMethod === "saved") {
    shippingAddress = savedUserAddress;
  } else {
    const newAddress = document.getElementById("customerAddress")?.value.trim();
    if (!newAddress) {
      showMessage("Vui lòng nhập địa chỉ mới!", "error");
      return;
    }
    shippingAddress = newAddress;
  }

  const paymentMethods = {
    cash: "Tiền mặt khi nhận hàng",
    banking: "Chuyển khoản ngân hàng",
  };

  const confirmMessage = `
XÁC NHẬN THANH TOÁN

Phương thức: ${paymentMethods[selectedPaymentMethod]}
Tổng tiền: ${calculateTotal().toLocaleString("vi-VN")} VNĐ
Địa chỉ: ${shippingAddress}

Bạn có chắc chắn muốn thanh toán?
  `;

  if (confirm(confirmMessage)) {
    showMessage("Đang xử lý thanh toán...", "processing");

    setTimeout(() => {
      completePayment(shippingAddress);
    }, 1000);
  }
}

function calculateTotal() {
  const userEmail = localStorage.getItem("currentUserEmail");
  let cart = [];

  if (userEmail) {
    const userCartKey = `cart_${userEmail}`;
    cart = JSON.parse(localStorage.getItem(userCartKey)) || [];
  } else {
    cart = JSON.parse(localStorage.getItem("temp_cart")) || [];
  }

  return cart.reduce(
    (total, item) => total + (parseFloat(item.price) || 0) * item.qty,
    0
  );
}

function completePayment(shippingAddress) {
  const order = {
    id: Date.now(),
    date: new Date().toISOString(),
    customerName: localStorage.getItem("currentUser"),
    customerEmail: localStorage.getItem("currentUserEmail"),
    shippingAddress: shippingAddress,
    paymentMethod: selectedPaymentMethod,
    total: calculateTotal(),
    items: getCartItems(),
    status: "pending",
  };

  saveOrderToHistory(order);

  const userEmail = localStorage.getItem("currentUserEmail");
  if (userEmail) {
    localStorage.removeItem(`cart_${userEmail}`);
  } else {
    localStorage.removeItem("temp_cart");
  }

  showMessage("Thanh toán thành công! Cảm ơn bạn đã mua hàng.", "success");

  setTimeout(() => {
    window.close();
    if (window.opener && !window.opener.closed) {
      window.opener.location.reload();
    }
  }, 2000);
}

function getCartItems() {
  const userEmail = localStorage.getItem("currentUserEmail");
  if (userEmail) {
    const userCartKey = `cart_${userEmail}`;
    return JSON.parse(localStorage.getItem(userCartKey)) || [];
  } else {
    return JSON.parse(localStorage.getItem("temp_cart")) || [];
  }
}

function saveOrderToHistory(order) {
  const userEmail = localStorage.getItem("currentUserEmail");
  if (!userEmail) return;

  const orderHistoryKey = `orders_${userEmail}`;
  const orders = JSON.parse(localStorage.getItem(orderHistoryKey)) || [];
  orders.push(order);
  localStorage.setItem(orderHistoryKey, JSON.stringify(orders));
}

function showMessage(message, type) {
  // Xóa overlay cũ nếu có
  let overlay = document.getElementById("paymentOverlay");
  if (overlay) overlay.remove();

  // Tạo overlay mới
  overlay = document.createElement("div");
  overlay.id = "paymentOverlay";
  overlay.style.position = "fixed";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.background =
    type === "processing" ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.4)";
  overlay.style.display = "flex";
  overlay.style.justifyContent = "center";
  overlay.style.alignItems = "center";
  overlay.style.zIndex = "9999";

  // Tạo hộp thông báo
  const msgDiv = document.createElement("div");
  msgDiv.innerHTML = message;
  msgDiv.style.background =
    type === "error"
      ? "#f8d7da"
      : type === "success"
      ? "#d4edda"
      : type === "processing"
      ? "#d1ecf1"
      : "#f8f9fa";
  msgDiv.style.color =
    type === "error"
      ? "#dc3545"
      : type === "success"
      ? "#28a745"
      : type === "processing"
      ? "#007bff"
      : "#666";
  msgDiv.style.padding = "20px 30px";
  msgDiv.style.borderRadius = "12px";
  msgDiv.style.fontWeight = "bold";
  msgDiv.style.fontSize = "18px";
  msgDiv.style.textAlign = "center";
  msgDiv.style.minWidth = "300px";
  msgDiv.style.boxShadow = "0 4px 12px rgba(0,0,0,0.2)";

  overlay.appendChild(msgDiv);
  document.body.appendChild(overlay);

  // Nếu là success hoặc error thì tự động ẩn sau 2s
  if (type === "success" || type === "error") {
    setTimeout(() => {
      overlay.remove();
    }, 2000);
  }
}
