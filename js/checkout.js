// checkout.js - Xử lý thanh toán trong popup
document.addEventListener("DOMContentLoaded", function () {
  console.log("Payment popup loaded");

  // Kiểm tra xem có sản phẩm đơn lẻ hay không
  const singleProduct = localStorage.getItem("singleProductForPayment");

  if (singleProduct) {
    // Thanh toán cho một sản phẩm
    loadSingleProductForPayment();
  } else {
    // Thanh toán cho giỏ hàng
    loadCartForPayment();
  }
});

// Tải sản phẩm đơn lẻ để thanh toán
// Tải giỏ hàng để thanh toán
// Tải sản phẩm đơn lẻ để thanh toán
function loadSingleProductForPayment() {
  const productData = localStorage.getItem("singleProductForPayment");
  if (!productData) {
    document.body.innerHTML = `
      <div class="checkout-container">
        <div class="checkout-header">
          <h2>Không tìm thấy sản phẩm!</h2>
        </div>
        <div class="checkout-body">
          <p>Không có thông tin sản phẩm để thanh toán.</p>
          <button onclick="window.close()" class="btn btn-primary">Đóng</button>
        </div>
      </div>
    `;
    return;
  }

  const product = JSON.parse(productData);
  renderSingleProductPayment(product);
}

// Hiển thị form thanh toán cho sản phẩm đơn lẻ
function renderSingleProductPayment(product) {
  const html = `
    <div class="checkout-container">
      <div class="checkout-header">
        <h2>Thanh Toán Sản Phẩm</h2>
        <p>Xin chào: <strong>${localStorage.getItem("currentUser")}</strong></p>
      </div>
      
      <div class="checkout-body">
        <div class="checkout-section">
          <h3>Thông tin sản phẩm</h3>
          <div class="product-info">
            <div class="product-image">
              ${
                product.model
                  ? `<model-viewer src="${product.image}" alt="${product.name}" style="width: 100%; height: 200px; border-radius: 8px;" auto-rotate camera-controls></model-viewer>`
                  : `<img src="${product.image}" alt="${product.name}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px;">`
              }
            </div>
            <div class="product-details">
              <h3>${product.name}</h3>
              <div class="product-price">${formatPrice(product.price)} VNĐ</div>
              <div class="quantity-selector">
                <label>Số lượng:</label>
                <div class="quantity-controls">
                  <button class="qty-btn" id="decreaseQty">-</button>
                  <input type="number" id="productQuantity" min="1" value="1">
                  <button class="qty-btn" id="increaseQty">+</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="checkout-section">
          <h3>Thông tin khách hàng</h3>
          <div class="form-group">
            <label for="fullName">Họ và tên</label>
            <input type="text" id="fullName" required>
          </div>
          
          <div class="form-group">
            <label for="phone">Số điện thoại</label>
            <input type="tel" id="phone" required>
          </div>
        </div>
        
        <div class="checkout-section">
          <h3>Chọn phương thức thanh toán</h3>
          <div class="payment-methods">
            <div class="payment-option" onclick="selectPaymentMethod('banking')">
              <input type="radio" id="banking" name="paymentMethod" value="banking">
              <label for="banking">Chuyển khoản ngân hàng</label>
            </div>
            
            <div class="payment-option" onclick="selectPaymentMethod('cash')">
              <input type="radio" id="cash" name="paymentMethod" value="cash">
              <label for="cash">Tiền mặt khi nhận hàng</label>
            </div>
          </div>
        </div>
        
        <div class="checkout-section">
          <h3>Địa chỉ nhận hàng</h3>
          <div class="address-options">
            <div class="address-option" onclick="selectAddress('saved')">
              <input type="radio" id="savedAddress" name="addressMethod" value="saved">
              <label for="savedAddress">Dùng địa chỉ từ tài khoản</label>
            </div>
            
            <div class="address-option" onclick="selectAddress('new')">
              <input type="radio" id="newAddress" name="addressMethod" value="new">
              <label for="newAddress">Địa chỉ mới</label>
            </div>
          </div>
          
          <div id="newAddressForm" class="address-form">
            <textarea id="customerAddress" placeholder="Nhập địa chỉ mới..."></textarea>
          </div>
        </div>
        
        <div class="checkout-summary">
          <div class="summary-row">
            <span>Tạm tính:</span>
            <span id="subtotal">${formatPrice(product.price)} VNĐ</span>
          </div>
          <div class="summary-row">
            <span>Phí vận chuyển:</span>
            <span>0 VNĐ</span>
          </div>
          <div class="summary-row total">
            <span>Tổng cộng:</span>
            <span id="total">${formatPrice(product.price)} VNĐ</span>
          </div>
        </div>
        
        <div class="checkout-actions">
          <button onclick="processSingleProductPayment()" class="btn btn-primary">Xác nhận thanh toán</button>
          <button onclick="window.close()" class="btn btn-secondary">Hủy</button>
        </div>
        
        <div id="paymentMessage"></div>
      </div>
    </div>
  `;

  document.body.innerHTML = html;

  // Thiết lập sự kiện cho form
  setupSingleProductForm(product);
}

// Thiết lập sự kiện cho form thanh toán sản phẩm đơn lẻ
function setupSingleProductForm(product) {
  // Sự kiện thay đổi số lượng
  document.getElementById("decreaseQty").onclick = function () {
    const qtyInput = document.getElementById("productQuantity");
    const currentValue = parseInt(qtyInput.value) || 1;
    if (currentValue > 1) {
      qtyInput.value = currentValue - 1;
      updateSingleProductTotal(product);
    }
  };

  document.getElementById("increaseQty").onclick = function () {
    const qtyInput = document.getElementById("productQuantity");
    const currentValue = parseInt(qtyInput.value) || 1;
    qtyInput.value = currentValue + 1;
    updateSingleProductTotal(product);
  };

  document.getElementById("productQuantity").onchange = function () {
    updateSingleProductTotal(product);
  };

  // Sự kiện chọn phương thức thanh toán
  const paymentMethods = document.querySelectorAll(".payment-option");
  paymentMethods.forEach((method) => {
    method.addEventListener("click", function () {
      paymentMethods.forEach((m) => m.classList.remove("selected"));
      this.classList.add("selected");
      this.querySelector("input").checked = true;
    });
  });

  // Sự kiện chọn địa chỉ
  const addressOptions = document.querySelectorAll(".address-option");
  addressOptions.forEach((option) => {
    option.addEventListener("click", function () {
      addressOptions.forEach((o) => o.classList.remove("selected"));
      this.classList.add("selected");
      this.querySelector("input").checked = true;

      // Hiển thị form nhập địa chỉ mới nếu chọn
      const newAddressForm = document.getElementById("newAddressForm");
      if (newAddressForm) {
        newAddressForm.style.display =
          this.querySelector("input").value === "new" ? "block" : "none";
      }
    });
  });
}

// Cập nhật tổng tiền cho sản phẩm đơn lẻ
function updateSingleProductTotal(product) {
  const quantity =
    parseInt(document.getElementById("productQuantity").value) || 1;
  const subtotal = product.price * quantity;

  document.getElementById("subtotal").textContent =
    formatPrice(subtotal) + " VNĐ";
  document.getElementById("total").textContent = formatPrice(subtotal) + " VNĐ";
}

// Xử lý thanh toán cho sản phẩm đơn lẻ
function processSingleProductPayment() {
  const productData = JSON.parse(
    localStorage.getItem("singleProductForPayment")
  );
  if (!productData) {
    showMessage("Không tìm thấy thông tin sản phẩm!", "error");
    return;
  }

  const quantity =
    parseInt(document.getElementById("productQuantity").value) || 1;
  const paymentMethod = document.querySelector(
    'input[name="paymentMethod"]:checked'
  )?.value;
  const addressMethod = document.querySelector(
    'input[name="addressMethod"]:checked'
  )?.value;

  if (!paymentMethod) {
    showMessage("Vui lòng chọn phương thức thanh toán!", "error");
    return;
  }

  if (!addressMethod) {
    showMessage("Vui lòng chọn phương thức địa chỉ!", "error");
    return;
  }

  // Lấy địa chỉ giao hàng
  let shippingAddress = "";
  if (addressMethod === "saved") {
    shippingAddress = "123 Đường ABC, Quận 1, TP.HCM"; // Địa chỉ mặc định
  } else {
    shippingAddress = document.getElementById("customerAddress")?.value.trim();
    if (!shippingAddress) {
      showMessage("Vui lòng nhập địa chỉ giao hàng!", "error");
      return;
    }
  }

  const orderData = {
    items: [
      {
        id: productData.id,
        name: productData.name,
        price: productData.price,
        quantity: quantity,
        image: productData.image,
      },
    ],
    total: productData.price * quantity,
    customerInfo: {
      fullName: document.getElementById("fullName").value,
      phone: document.getElementById("phone").value,
      address: shippingAddress,
    },
    paymentMethod: paymentMethod,
  };

  // Lưu đơn hàng
  const orderId = saveOrderToHistory(orderData);

  // Xóa sản phẩm khỏi localStorage
  localStorage.removeItem("singleProductForPayment");

  // Hiển thị thông báo thành công
  showMessage("Thanh toán thành công! Cảm ơn bạn đã mua hàng.", "success");

  setTimeout(() => {
    window.close();
    if (window.opener && !window.opener.closed) {
      window.opener.location.reload();
    }
  }, 2000);
}

function renderPaymentCart(cart) {
  let total = 0;
  let itemsHTML = "";

  cart.forEach((item) => {
    const price = parseFloat(item.price) || 0;
    const itemTotal = price * item.qty;
    total += itemTotal;

    itemsHTML += `
      <div class="checkout-item">
        <div class="item-info">
          <div class="item-name">${item.name}</div>
          <div class="item-price">${price.toLocaleString("vi-VN")} VNĐ</div>
        </div>
        <div class="item-quantity">x${item.qty}</div>
        <div class="item-total">${itemTotal.toLocaleString("vi-VN")} VNĐ</div>
      </div>
    `;
  });

  const html = `
    <div class="checkout-container">
      <div class="checkout-header">
        <h2>Thanh Toán Đơn Hàng</h2>
        <p>Xin chào: <strong>${localStorage.getItem("currentUser")}</strong></p>
      </div>
      
      <div class="checkout-body">
        <div class="checkout-section">
          <h3>Sản phẩm trong giỏ hàng</h3>
          <div class="checkout-items">
            ${itemsHTML}
          </div>
        </div>
        
        <div class="checkout-section">
          <h3>Chọn phương thức thanh toán</h3>
          <div class="payment-methods">
            <div class="payment-option" onclick="selectPaymentMethod('banking')">
              <input type="radio" id="banking" name="paymentMethod" value="banking">
              <label for="banking">Chuyển khoản ngân hàng</label>
            </div>
            
            <div class="payment-option" onclick="selectPaymentMethod('cash')">
              <input type="radio" id="cash" name="paymentMethod" value="cash">
              <label for="cash">Tiền mặt khi nhận hàng</label>
            </div>
          </div>
        </div>
        
        <div class="checkout-section">
          <h3>Địa chỉ nhận hàng</h3>
          <div class="address-options">
            <div class="address-option" onclick="selectAddress('saved')">
              <input type="radio" id="savedAddress" name="addressMethod" value="saved">
              <label for="savedAddress">Dùng địa chỉ từ tài khoản</label>
            </div>
            
            <div class="address-option" onclick="selectAddress('new')">
              <input type="radio" id="newAddress" name="addressMethod" value="new">
              <label for="newAddress">Địa chỉ mới</label>
            </div>
          </div>
          
          <div id="newAddressForm" class="address-form">
            <textarea id="customerAddress" placeholder="Nhập địa chỉ mới..."></textarea>
          </div>
        </div>
        
        <div class="checkout-summary">
          <div class="summary-row">
            <span>Tạm tính:</span>
            <span>${total.toLocaleString("vi-VN")} VNĐ</span>
          </div>
          <div class="summary-row">
            <span>Phí vận chuyển:</span>
            <span>0 VNĐ</span>
          </div>
          <div class="summary-row total">
            <span>Tổng cộng:</span>
            <span>${total.toLocaleString("vi-VN")} VNĐ</span>
          </div>
        </div>
        
        <div class="checkout-actions">
          <button onclick="processPayment()" class="btn btn-primary">Xác nhận thanh toán</button>
          <button onclick="window.close()" class="btn btn-secondary">Hủy</button>
        </div>
        
        <div id="paymentMessage"></div>
      </div>
    </div>
  `;

  document.body.innerHTML = html;
}

// Hiển thị form thanh toán cho sản phẩm đơn lẻ
function renderSingleProductPayment(product) {
  const html = `
    <div class="checkout-container">
      <div class="checkout-header">
        <h2>Thanh Toán Sản Phẩm</h2>
        <p>Xin chào: <strong>${localStorage.getItem("currentUser")}</strong></p>
      </div>
      
      <div class="checkout-body">
        <div class="checkout-section">
          <h3>Thông tin sản phẩm</h3>
          <div class="product-info">
            <div class="product-image">
              ${
                product.model
                  ? `<model-viewer src="${product.image}" alt="${product.name}" style="width: 100%; height: 200px; border-radius: 8px;" auto-rotate camera-controls></model-viewer>`
                  : `<img src="${product.image}" alt="${product.name}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px;">`
              }
            </div>
            <div class="product-details">
              <h3>${product.name}</h3>
              <div class="product-price">${formatPrice(product.price)} VNĐ</div>
              <div class="quantity-selector">
                <label>Số lượng:</label>
                <div class="quantity-controls">
                  <button class="qty-btn" id="decreaseQty">-</button>
                  <input type="number" id="productQuantity" min="1" value="1">
                  <button class="qty-btn" id="increaseQty">+</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="checkout-section">
          <h3>Thông tin khách hàng</h3>
          <div class="form-group">
            <label for="fullName">Họ và tên</label>
            <input type="text" id="fullName" required>
          </div>
          
          <div class="form-group">
            <label for="phone">Số điện thoại</label>
            <input type="tel" id="phone" required>
          </div>
        </div>
        
        <div class="checkout-section">
          <h3>Chọn phương thức thanh toán</h3>
          <div class="payment-methods">
            <div class="payment-option" onclick="selectPaymentMethod('banking')">
              <input type="radio" id="banking" name="paymentMethod" value="banking">
              <label for="banking">Chuyển khoản ngân hàng</label>
            </div>
            
            <div class="payment-option" onclick="selectPaymentMethod('cash')">
              <input type="radio" id="cash" name="paymentMethod" value="cash">
              <label for="cash">Tiền mặt khi nhận hàng</label>
            </div>
          </div>
        </div>
        
        <div class="checkout-section">
          <h3>Địa chỉ nhận hàng</h3>
          <div class="address-options">
            <div class="address-option" onclick="selectAddress('saved')">
              <input type="radio" id="savedAddress" name="addressMethod" value="saved">
              <label for="savedAddress">Dùng địa chỉ từ tài khoản</label>
            </div>
            
            <div class="address-option" onclick="selectAddress('new')">
              <input type="radio" id="newAddress" name="addressMethod" value="new">
              <label for="newAddress">Địa chỉ mới</label>
            </div>
          </div>
          
          <div id="newAddressForm" class="address-form">
            <textarea id="customerAddress" placeholder="Nhập địa chỉ mới..."></textarea>
          </div>
        </div>
        
        <div class="checkout-summary">
          <div class="summary-row">
            <span>Tạm tính:</span>
            <span id="subtotal">${formatPrice(product.price)} VNĐ</span>
          </div>
          <div class="summary-row">
            <span>Phí vận chuyển:</span>
            <span>0 VNĐ</span>
          </div>
          <div class="summary-row total">
            <span>Tổng cộng:</span>
            <span id="total">${formatPrice(product.price)} VNĐ</span>
          </div>
        </div>
        
        <div class="checkout-actions">
          <button onclick="processSingleProductPayment()" class="btn btn-primary">Xác nhận thanh toán</button>
          <button onclick="window.close()" class="btn btn-secondary">Hủy</button>
        </div>
        
        <div id="paymentMessage"></div>
      </div>
    </div>
  `;

  document.body.innerHTML = html;

  // Thiết lập sự kiện cho form
  setupSingleProductForm(product);
}

// Thiết lập sự kiện cho form thanh toán sản phẩm đơn lẻ
function setupSingleProductForm(product) {
  // Sự kiện thay đổi số lượng
  document.getElementById("decreaseQty").onclick = function () {
    const qtyInput = document.getElementById("productQuantity");
    const currentValue = parseInt(qtyInput.value) || 1;
    if (currentValue > 1) {
      qtyInput.value = currentValue - 1;
      updateSingleProductTotal(product);
    }
  };

  document.getElementById("increaseQty").onclick = function () {
    const qtyInput = document.getElementById("productQuantity");
    const currentValue = parseInt(qtyInput.value) || 1;
    qtyInput.value = currentValue + 1;
    updateSingleProductTotal(product);
  };

  document.getElementById("productQuantity").onchange = function () {
    updateSingleProductTotal(product);
  };

  // Sự kiện chọn phương thức thanh toán
  const paymentMethods = document.querySelectorAll(".payment-option");
  paymentMethods.forEach((method) => {
    method.addEventListener("click", function () {
      paymentMethods.forEach((m) => m.classList.remove("selected"));
      this.classList.add("selected");
      this.querySelector("input").checked = true;
    });
  });

  // Sự kiện chọn địa chỉ
  const addressOptions = document.querySelectorAll(".address-option");
  addressOptions.forEach((option) => {
    option.addEventListener("click", function () {
      addressOptions.forEach((o) => o.classList.remove("selected"));
      this.classList.add("selected");
      this.querySelector("input").checked = true;

      // Hiển thị form nhập địa chỉ mới nếu chọn
      const newAddressForm = document.getElementById("newAddressForm");
      if (newAddressForm) {
        newAddressForm.style.display =
          this.querySelector("input").value === "new" ? "block" : "none";
      }
    });
  });
}

// Cập nhật tổng tiền cho sản phẩm đơn lẻ
function updateSingleProductTotal(product) {
  const quantity =
    parseInt(document.getElementById("productQuantity").value) || 1;
  const subtotal = product.price * quantity;

  document.getElementById("subtotal").textContent =
    formatPrice(subtotal) + " VNĐ";
  document.getElementById("total").textContent = formatPrice(subtotal) + " VNĐ";
}

// Xử lý thanh toán cho sản phẩm đơn lẻ
function processSingleProductPayment() {
  const productData = JSON.parse(
    localStorage.getItem("singleProductForPayment")
  );
  if (!productData) {
    showMessage("Không tìm thấy thông tin sản phẩm!", "error");
    return;
  }

  const quantity =
    parseInt(document.getElementById("productQuantity").value) || 1;
  const paymentMethod = document.querySelector(
    'input[name="paymentMethod"]:checked'
  )?.value;
  const addressMethod = document.querySelector(
    'input[name="addressMethod"]:checked'
  )?.value;

  if (!paymentMethod) {
    showMessage("Vui lòng chọn phương thức thanh toán!", "error");
    return;
  }

  if (!addressMethod) {
    showMessage("Vui lòng chọn phương thức địa chỉ!", "error");
    return;
  }

  // Lấy địa chỉ giao hàng
  let shippingAddress = "";
  if (addressMethod === "saved") {
    shippingAddress = "123 Đường ABC, Quận 1, TP.HCM"; // Địa chỉ mặc định
  } else {
    shippingAddress = document.getElementById("customerAddress")?.value.trim();
    if (!shippingAddress) {
      showMessage("Vui lòng nhập địa chỉ giao hàng!", "error");
      return;
    }
  }

  const orderData = {
    items: [
      {
        id: productData.id,
        name: productData.name,
        price: productData.price,
        quantity: quantity,
        image: productData.image,
      },
    ],
    total: productData.price * quantity,
    customerInfo: {
      fullName: document.getElementById("fullName").value,
      phone: document.getElementById("phone").value,
      address: shippingAddress,
    },
    paymentMethod: paymentMethod,
  };

  // Lưu đơn hàng
  const orderId = saveOrderToHistory(orderData);

  // Xóa sản phẩm khỏi localStorage
  localStorage.removeItem("singleProductForPayment");

  // Hiển thị thông báo thành công
  showMessage("Thanh toán thành công! Cảm ơn bạn đã mua hàng.", "success");

  setTimeout(() => {
    window.close();
    if (window.opener && !window.opener.closed) {
      window.opener.location.reload();
    }
  }, 2000);
}

// Tải giỏ hàng để thanh toán
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
      <div class="checkout-container">
        <div class="checkout-header">
          <h2>Giỏ hàng trống!</h2>
        </div>
        <div class="checkout-body">
          <p>Không có sản phẩm nào để thanh toán.</p>
          <button onclick="window.close()" class="btn btn-primary">Đóng</button>
        </div>
      </div>
    `;
    return;
  }

  renderPaymentCart(cart);
}

function renderPaymentCart(cart) {
  let total = 0;
  let itemsHTML = "";

  cart.forEach((item) => {
    const price = parseFloat(item.price) || 0;
    const itemTotal = price * item.qty;
    total += itemTotal;

    itemsHTML += `
      <div class="checkout-item">
        <div class="item-info">
          <div class="item-name">${item.name}</div>
          <div class="item-price">${price.toLocaleString("vi-VN")} VNĐ</div>
        </div>
        <div class="item-quantity">x${item.qty}</div>
        <div class="item-total">${itemTotal.toLocaleString("vi-VN")} VNĐ</div>
      </div>
    `;
  });

  const html = `
    <div class="checkout-container">
      <div class="checkout-header">
        <h2>Thanh Toán Đơn Hàng</h2>
        <p>Xin chào: <strong>${localStorage.getItem("currentUser")}</strong></p>
      </div>
      
      <div class="checkout-body">
        <div class="checkout-section">
          <h3>Sản phẩm trong giỏ hàng</h3>
          <div class="checkout-items">
            ${itemsHTML}
          </div>
        </div>
        
        <div class="checkout-section">
          <h3>Chọn phương thức thanh toán</h3>
          <div class="payment-methods">
            <div class="payment-option" onclick="selectPaymentMethod('banking')">
              <input type="radio" id="banking" name="paymentMethod" value="banking">
              <label for="banking">Chuyển khoản ngân hàng</label>
            </div>
            
            <div class="payment-option" onclick="selectPaymentMethod('cash')">
              <input type="radio" id="cash" name="paymentMethod" value="cash">
              <label for="cash">Tiền mặt khi nhận hàng</label>
            </div>
          </div>
        </div>
        
        <div class="checkout-section">
          <h3>Địa chỉ nhận hàng</h3>
          <div class="address-options">
            <div class="address-option" onclick="selectAddress('saved')">
              <input type="radio" id="savedAddress" name="addressMethod" value="saved">
              <label for="savedAddress">Dùng địa chỉ từ tài khoản</label>
            </div>
            
            <div class="address-option" onclick="selectAddress('new')">
              <input type="radio" id="newAddress" name="addressMethod" value="new">
              <label for="newAddress">Địa chỉ mới</label>
            </div>
          </div>
          
          <div id="newAddressForm" class="address-form">
            <textarea id="customerAddress" placeholder="Nhập địa chỉ mới..."></textarea>
          </div>
        </div>
        
        <div class="checkout-summary">
          <div class="summary-row">
            <span>Tạm tính:</span>
            <span>${total.toLocaleString("vi-VN")} VNĐ</span>
          </div>
          <div class="summary-row">
            <span>Phí vận chuyển:</span>
            <span>0 VNĐ</span>
          </div>
          <div class="summary-row total">
            <span>Tổng cộng:</span>
            <span>${total.toLocaleString("vi-VN")} VNĐ</span>
          </div>
        </div>
        
        <div class="checkout-actions">
          <button onclick="processPayment()" class="btn btn-primary">Xác nhận thanh toán</button>
          <button onclick="window.close()" class="btn btn-secondary">Hủy</button>
        </div>
        
        <div id="paymentMessage"></div>
      </div>
    </div>
  `;

  document.body.innerHTML = html;
}

// Các hàm chung
function selectPaymentMethod(method) {
  selectedPaymentMethod = method;

  document.querySelectorAll(".payment-option").forEach((option) => {
    option.classList.remove("selected");
  });

  const selectedOption = document.querySelector(
    `[onclick="selectPaymentMethod('${method}')"]`
  );
  if (selectedOption) {
    selectedOption.classList.add("selected");
  }

  document.querySelectorAll('input[name="paymentMethod"]').forEach((radio) => {
    radio.checked = radio.value === method;
  });
}

function selectAddress(method) {
  selectedAddressMethod = method;

  document.querySelectorAll(".address-option").forEach((option) => {
    option.classList.remove("selected");
  });

  const selectedOption = document.querySelector(
    `[onclick="selectAddress('${method}')"]`
  );
  if (selectedOption) {
    selectedOption.classList.add("selected");
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
  overlay.className = "payment-overlay";
  overlay.innerHTML = `
    <div class="payment-message ${type}">
      ${message}
    </div>
  `;

  document.body.appendChild(overlay);

  // Nếu là success hoặc error thì tự động ẩn sau 2s
  if (type === "success" || type === "error") {
    setTimeout(() => {
      overlay.remove();
    }, 2000);
  }
}

// Biến toàn cục
let selectedPaymentMethod = "";
let selectedAddressMethod = "";
let savedUserAddress = "123 Đường ABC, Quận 1, TP.HCM"; // Địa chỉ mặc định

// Định dạng giá tiền
function formatPrice(price) {
  return new Intl.NumberFormat("vi-VN").format(price);
}
