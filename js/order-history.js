document.addEventListener("DOMContentLoaded", function () {
  // Kiểm tra đăng nhập
  if (!localStorage.getItem("currentUser")) {
    window.location.href = "login.html";
    return;
  }

  // Lấy email người dùng hiện tại
  const userEmail = localStorage.getItem("currentUserEmail");

  // Lấy danh sách đơn hàng từ localStorage hoặc server
  let orders = getUserOrders(userEmail);

  // Hiển thị danh sách đơn hàng
  displayOrders(orders);

  // Xử lý đóng drawer
  document
    .getElementById("closeOrderDrawer")
    .addEventListener("click", closeOrderDrawer);
  document
    .getElementById("orderDetailOverlay")
    .addEventListener("click", closeOrderDrawer);
});

// Lấy danh sách đơn hàng của người dùng
function getUserOrders(userEmail) {
  // Thử lấy từ localStorage trước
  const localOrders = localStorage.getItem(`orders_${userEmail}`);
  if (localOrders) {
    return JSON.parse(localOrders);
  }

  // Nếu không có, tạo dữ liệu mẫu
  const sampleOrders = [
    {
      id: "ORD001",
      date: "2023-11-20",
      status: "delivered",
      items: [
        {
          id: 1,
          name: "Banana",
          price: 2000000000,
          quantity: 1,
          image: "../images/banana_duct_taped_to_the_wall.glb",
        },
      ],
      total: 2000000000,
      shippingAddress: "123 Đường ABC, Quận 1, TP.HCM",
      paymentMethod: "Thanh toán khi nhận hàng",
      tracking: [
        {
          title: "Đơn hàng đã được tạo",
          date: "2023-11-20 10:30",
          completed: true,
        },
        {
          title: "Đơn hàng đã được xác nhận",
          date: "2023-11-20 14:20",
          completed: true,
        },
        {
          title: "Đơn hàng đang được xử lý",
          date: "2023-11-21 09:15",
          completed: true,
        },
        {
          title: "Đơn hàng đang được vận chuyển",
          date: "2023-11-22 16:45",
          completed: true,
        },
        {
          title: "Đơn hàng đã được giao",
          date: "2023-11-23 10:20",
          completed: true,
        },
      ],
    },
    {
      id: "ORD002",
      date: "2023-11-25",
      status: "processing",
      items: [
        {
          id: 2,
          name: "Táo Vàng",
          price: 1500000000,
          quantity: 2,
          image: "https://picsum.photos/seed/apple/400/300.jpg",
        },
        {
          id: 3,
          name: "Cam Ngọt",
          price: 800000000,
          quantity: 1,
          image: "https://picsum.photos/seed/orange/400/300.jpg",
        },
      ],
      total: 3800000000,
      shippingAddress: "456 Đường XYZ, Quận 3, TP.HCM",
      paymentMethod: "Thẻ tín dụng",
      tracking: [
        {
          title: "Đơn hàng đã được tạo",
          date: "2023-11-25 11:45",
          completed: true,
        },
        {
          title: "Đơn hàng đã được xác nhận",
          date: "2023-11-25 15:30",
          completed: true,
        },
        {
          title: "Đơn hàng đang được xử lý",
          date: "2023-11-26 08:20",
          completed: true,
        },
        {
          title: "Đơn hàng đang được vận chuyển",
          date: "",
          completed: false,
        },
        {
          title: "Đơn hàng đã được giao",
          date: "",
          completed: false,
        },
      ],
    },
  ];

  // Lưu vào localStorage để dùng cho lần sau
  localStorage.setItem(`orders_${userEmail}`, JSON.stringify(sampleOrders));

  return sampleOrders;
}

// Hiển thị danh sách đơn hàng
function displayOrders(orders) {
  const orderList = document.getElementById("orderList");
  const emptyOrders = document.getElementById("emptyOrders");

  if (orders.length === 0) {
    orderList.style.display = "none";
    emptyOrders.style.display = "block";
    return;
  }

  orderList.style.display = "grid";
  emptyOrders.style.display = "none";

  orderList.innerHTML = "";

  orders.forEach((order) => {
    const orderCard = createOrderCard(order);
    orderList.appendChild(orderCard);
  });
}

// Tạo card đơn hàng
function createOrderCard(order) {
  const card = document.createElement("div");
  card.className = "order-card";

  // Tạo HTML cho các sản phẩm trong đơn hàng
  const itemsHTML = order.items
    .map(
      (item) => `
        <div class="order-item">
            <div class="order-item-details">
                <div class="order-item-name">${item.name}</div>
                <div class="order-item-price">${formatPrice(
                  item.price
                )} VNĐ</div>
            </div>
            <div class="order-item-quantity">x${item.quantity}</div>
        </div>
    `
    )
    .join("");

  // Xác định class cho trạng thái
  let statusClass = "";
  switch (order.status) {
    case "pending":
      statusClass = "status-pending";
      break;
    case "processing":
      statusClass = "status-processing";
      break;
    case "shipped":
      statusClass = "status-shipped";
      break;
    case "delivered":
      statusClass = "status-delivered";
      break;
    case "cancelled":
      statusClass = "status-cancelled";
      break;
  }

  // Xác định văn bản cho trạng thái
  let statusText = "";
  switch (order.status) {
    case "pending":
      statusText = "Chờ xử lý";
      break;
    case "processing":
      statusText = "Đang xử lý";
      break;
    case "shipped":
      statusText = "Đang vận chuyển";
      break;
    case "delivered":
      statusText = "Đã giao";
      break;
    case "cancelled":
      statusText = "Đã hủy";
      break;
  }

  card.innerHTML = `
        <div class="order-header">
            <div>
                <div class="order-id">Mã đơn hàng: ${order.id}</div>
                <div class="order-date">Ngày đặt: ${formatDate(
                  order.date
                )}</div>
            </div>
            <div class="order-status ${statusClass}">${statusText}</div>
        </div>
        <div class="order-items">
            ${itemsHTML}
        </div>
        <div class="order-footer">
            <div class="order-total">Tổng cộng: ${formatPrice(
              order.total
            )} VNĐ</div>
            <div class="order-actions">
                <button class="btn btn-secondary" onclick="viewOrderDetail('${
                  order.id
                }')">Xem chi tiết</button>
                ${
                  order.status === "delivered"
                    ? `<button class="btn btn-primary" onclick="reorderItems('${order.id}')">Đặt lại</button>`
                    : ""
                }
                ${
                  order.status === "pending" || order.status === "processing"
                    ? `<button class="btn btn-secondary" onclick="cancelOrder('${order.id}')">Hủy đơn</button>`
                    : ""
                }
            </div>
        </div>
    `;

  return card;
}

// Xem chi tiết đơn hàng (sử dụng drawer)
function viewOrderDetail(orderId) {
  const userEmail = localStorage.getItem("currentUserEmail");
  const orders = getUserOrders(userEmail);
  const order = orders.find((o) => o.id === orderId);

  if (!order) return;

  const drawerContent = document.getElementById("orderDetailContent");

  // Tạo HTML cho các sản phẩm
  const itemsHTML = order.items
    .map(
      (item) => `
        <div class="order-detail-item">
            <div class="order-detail-item-info">
                <div class="order-detail-item-name">${item.name}</div>
                <div class="order-detail-item-price">${formatPrice(
                  item.price
                )} VNĐ</div>
                <div class="order-detail-item-quantity">Số lượng: ${
                  item.quantity
                }</div>
            </div>
            <div class="order-detail-item-total">${formatPrice(
              item.price * item.quantity
            )} VNĐ</div>
        </div>
    `
    )
    .join("");

  // Xác định văn bản cho trạng thái
  let statusText = "";
  switch (order.status) {
    case "pending":
      statusText = "Chờ xử lý";
      break;
    case "processing":
      statusText = "Đang xử lý";
      break;
    case "shipped":
      statusText = "Đang vận chuyển";
      break;
    case "delivered":
      statusText = "Đã giao";
      break;
    case "cancelled":
      statusText = "Đã hủy";
      break;
  }

  // Tạo HTML cho tracking
  const trackingHTML = order.tracking
    .map((step, index) => {
      let stepClass = "";
      if (step.completed) {
        stepClass = "completed";
      } else if (index === order.tracking.findIndex((s) => !s.completed)) {
        stepClass = "active";
      }

      return `
            <div class="tracking-step">
                <div class="step-icon ${stepClass}">
                    ${
                      step.completed
                        ? '<i class="fas fa-check"></i>'
                        : '<i class="fas fa-clock"></i>'
                    }
                </div>
                <div class="step-content">
                    <div class="step-title">${step.title}</div>
                    <div class="step-date">${step.date || "Chưa cập nhật"}</div>
                </div>
            </div>
        `;
    })
    .join("");

  drawerContent.innerHTML = `
        <div class="order-detail-section">
            <h3>Thông tin đơn hàng</h3>
            <div class="order-detail-info">
                <p><strong>Mã đơn hàng:</strong> ${order.id}</p>
                <p><strong>Ngày đặt:</strong> ${formatDate(order.date)}</p>
                <p><strong>Trạng thái:</strong> <span class="order-status status-${
                  order.status
                }">${statusText}</span></p>
                <p><strong>Phương thức thanh toán:</strong> ${
                  order.paymentMethod
                }</p>
                <p><strong>Địa chỉ giao hàng:</strong> ${
                  order.shippingAddress
                }</p>
            </div>
        </div>
        
        <div class="order-detail-section">
            <h3>Sản phẩm</h3>
            ${itemsHTML}
        </div>
        
        <div class="order-detail-section">
            <h3>Tóm tắt đơn hàng</h3>
            <div class="order-detail-summary">
                <span>Tạm tính:</span>
                <span>${formatPrice(order.total)} VNĐ</span>
            </div>
            <div class="order-detail-summary">
                <span>Phí vận chuyển:</span>
                <span>0 VNĐ</span>
            </div>
            <div class="order-detail-summary total">
                <span>Tổng cộng:</span>
                <span>${formatPrice(order.total)} VNĐ</span>
            </div>
        </div>
        
        <div class="order-detail-section">
            <h3>Theo dõi đơn hàng</h3>
            <div class="tracking-container">
                <div class="tracking-line"></div>
                ${trackingHTML}
            </div>
        </div>
    `;

  // Hiển thị drawer
  document.getElementById("orderDetailOverlay").style.display = "block";
  document.getElementById("orderDetailDrawer").classList.add("active");
}

// Đóng drawer
function closeOrderDrawer() {
  document.getElementById("orderDetailOverlay").style.display = "none";
  document.getElementById("orderDetailDrawer").classList.remove("active");
}

// Hủy đơn hàng
function cancelOrder(orderId) {
  if (confirm("Đang xử lý hủy đơn")) {
    const userEmail = localStorage.getItem("currentUserEmail");
    let orders = getUserOrders(userEmail);

    // Cập nhật trạng thái đơn hàng
    const orderIndex = orders.findIndex((o) => o.id === orderId);
    if (orderIndex !== -1) {
      orders[orderIndex].status = "cancelled";

      // Lưu lại danh sách đơn hàng
      localStorage.setItem(`orders_${userEmail}`, JSON.stringify(orders));

      // Cập nhật lại giao diện
      displayOrders(orders);

      alert("Đơn hàng đã được hủy thành công!");
    }
  }
}

// Đặt lại sản phẩm
function reorderItems(orderId) {
  const userEmail = localStorage.getItem("currentUserEmail");
  const orders = getUserOrders(userEmail);
  const order = orders.find((o) => o.id === orderId);

  if (!order) return;

  // Lấy giỏ hàng hiện tại
  let cart = JSON.parse(localStorage.getItem(`cart_${userEmail}`)) || [];

  // Thêm các sản phẩm từ đơn hàng vào giỏ hàng
  order.items.forEach((item) => {
    // Kiểm tra xem sản phẩm đã có trong giỏ chưa
    const existingItem = cart.find((cartItem) => cartItem.id === item.id);

    if (existingItem) {
      existingItem.quantity += item.quantity;
    } else {
      cart.push({
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        quantity: item.quantity,
      });
    }
  });

  // Lưu giỏ hàng
  localStorage.setItem(`cart_${userEmail}`, JSON.stringify(cart));

  // Cập nhật số lượng trên UI
  updateCartCount();

  alert("Các sản phẩm đã được thêm vào giỏ hàng!");

  // Chuyển đến trang chính
  window.location.href = "../index.html";
}

// Cập nhật số lượng giỏ hàng trên UI
function updateCartCount() {
  const userEmail = localStorage.getItem("currentUserEmail");
  const cart = JSON.parse(localStorage.getItem(`cart_${userEmail}`)) || [];
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const cartCount = document.querySelector(".cart-count");
  if (cartCount) {
    cartCount.textContent = totalItems;
  }
}

// Định dạng giá tiền
function formatPrice(price) {
  return new Intl.NumberFormat("vi-VN").format(price);
}

// Định dạng ngày tháng
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN");
}
