document.addEventListener("DOMContentLoaded", () => {
  let productsData = [];

  // 1. Load JSON
  fetch("../data/products.json")
    .then((response) => response.json())
    .then((data) => {
      productsData = data;
      window.productsData = data; // Chia sẻ với search.js
      updateCartCount();
      renderCartDrawer();
    })
    .catch((error) => {
      console.error("Lỗi tải file JSON:", error);
      // Nếu không tải được file JSON, sử dụng dữ liệu mẫu
      productsData = [
        {
          id: 1,
          name: "Banana",
          image: "images/banana_duct_taped_to_the_wall.glb",
          price: "2000000000",
          description: "Chuối cao cấp",
          category: "đặc biệt",
          model: true,
        },
        {
          id: 2,
          name: "Táo Vàng",
          image: "https://picsum.photos/seed/apple/400/300.jpg",
          price: "1500000000",
          description:
            "Quả táo vàng óng, tượng trưng cho sự thịnh vượng và may mắn.",
          category: "trái cây",
        },
        {
          id: 3,
          name: "Cam Ngọt",
          image: "https://picsum.photos/seed/orange/400/300.jpg",
          price: "800000000",
          description:
            "Vị ngọt thanh của cam tươi mát, mang lại năng lượng tích cực.",
          category: "trái cây",
        },
        {
          id: 4,
          name: "Nho Tím",
          image: "https://picsum.photos/seed/grape/400/300.jpg",
          price: "1200000000",
          description:
            "Chùm nho tím mọng nước, biểu tượng của sự sang trọng và đẳng cấp.",
          category: "quà tặng",
        },
        {
          id: 5,
          name: "Dưa Hấu Đỏ",
          image: "https://picsum.photos/seed/watermelon/400/300.jpg",
          price: "2500000000",
          description: "Vị ngọt mát của dưa hấu trong ngày hè nóng bức.",
          category: "trái cây",
        },
        {
          id: 6,
          name: "Xoài Cát Hòa Lộc",
          image: "https://picsum.photos/seed/mango/400/300.jpg",
          price: "900000000",
          description:
            "Vị ngọt đậm đà và thơm lừng đặc trưng của xoài cát hoa lộc.",
          category: "quà tặng",
        },
        {
          id: 7,
          name: "Lựu Đỏ",
          image: "https://picsum.photos/seed/pomegranate/400/300.jpg",
          price: "1800000000",
          description:
            "Những hạt lựu ruby đỏ rực rỡ, đầy dinh dưỡng và sức sống.",
          category: "quà tặng",
        },
        {
          id: 8,
          name: "Cherry Đỏ",
          image: "https://picsum.photos/seed/cherry/400/300.jpg",
          price: "1300000000",
          description: "Những quả cherry đỏ mọng, ngọt ngào và đầy quyến rũ.",
          category: "quà tặng",
        },
        {
          id: 9,
          name: "Dứa Vàng",
          image: "https://picsum.photos/seed/pineapple/400/300.jpg",
          price: "700000000",
          description:
            "Vị chua ngọt hài hòa của dứa tươi, mang đến cảm giác nhiệt đới.",
          category: "trái cây",
        },
      ];
      window.productsData = productsData;
      updateCartCount();
      renderCartDrawer();
    });

  // 2. Hàm lấy sản phẩm theo ID
  function getProductById(productId) {
    if (!productId) {
      console.error("Product ID is null or undefined");
      return null;
    }

    const product = productsData.find((p) => p.id === parseInt(productId));
    if (!product) {
      console.error("Product not found with ID:", productId);
      return null;
    }

    return {
      id: product.id,
      name: product.name,
      price: parseFloat(product.price),
      image: product.image.endsWith(".glb")
        ? "images/placeholder.jpg"
        : product.image,
      category: product.category,
      description: product.description,
      model: product.model || false,
      qty: 1,
    };
  }

  // 3. Hàm lấy giỏ hàng hiện tại
  function getCurrentCart() {
    const userEmail = localStorage.getItem("currentUserEmail");
    const cartKey = userEmail ? `cart_${userEmail}` : "temp_cart";
    const cart = JSON.parse(localStorage.getItem(cartKey)) || [];
    return cart;
  }

  // 4. Hàm lưu giỏ hàng
  function saveCurrentCart(cart) {
    const userEmail = localStorage.getItem("currentUserEmail");
    const cartKey = userEmail ? `cart_${userEmail}` : "temp_cart";
    localStorage.setItem(cartKey, JSON.stringify(cart));
  }

  // 5. Hàm cập nhật số lượng giỏ hàng trên UI
  function updateCartCount() {
    const cart = getCurrentCart();
    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
    const cartCount = document.querySelector(".cart-count");
    if (cartCount) {
      cartCount.textContent = totalItems;
    } else {
      console.error("Không tìm thấy .cart-count");
    }
  }

  // 6. Hàm render giỏ hàng trong drawer
  function renderCartDrawer() {
    const cartDrawerContent = document.getElementById("cartDrawerContent");
    const cartDrawer = document.getElementById("cartDrawer");
    const cartOverlay = document.getElementById("cartOverlay");

    if (!cartDrawerContent || !cartDrawer || !cartOverlay) {
      console.error(
        "Không tìm thấy cartDrawerContent, cartDrawer hoặc cartOverlay"
      );
      return;
    }

    cartDrawerContent.innerHTML = "";

    const cart = getCurrentCart();
    console.log("Rendering cart with items:", cart); // Debug

    if (cart.length === 0) {
      cartDrawerContent.innerHTML = `
        <div class="empty-cart">
          <i class="fas fa-shopping-cart"></i>
          <p>Giỏ hàng trống</p>
        </div>
      `;
      document.getElementById("cartDrawerFooter").innerHTML = "";
      return;
    }

    cart.forEach((item) => {
      const cartItem = document.createElement("div");
      cartItem.className = "cart-item";
      cartItem.innerHTML = `
        <div class="item-image">
          <img src="${item.image}" alt="${item.name}">
        </div>
        <div class="item-info">
          <div class="item-name">${item.name}</div>
          <div class="item-price">${item.price.toLocaleString(
            "vi-VN"
          )} VNĐ</div>
          <div class="quantity-controls">
            <button class="qty-btn decrease-quantity" data-id="${
              item.id
            }">-</button>
            <span class="quantity">${item.qty}</span>
            <button class="qty-btn increase-quantity" data-id="${
              item.id
            }">+</button>
            <button class="remove-btn" data-id="${
              item.id
            }"><i class="fas fa-trash"></i></button>
          </div>
        </div>
      `;
      cartDrawerContent.appendChild(cartItem);
    });

    const totalPrice = cart.reduce(
      (sum, item) => sum + item.price * item.qty,
      0
    );
    document.getElementById("cartDrawerFooter").innerHTML = `
      <div class="total-section">
        <span class="total-label">Tổng cộng:</span>
        <span class="total-amount">${totalPrice.toLocaleString(
          "vi-VN"
        )} VNĐ</span>
      </div>
      <button class="checkout-btn" id="checkoutCartBtn">
        <i class="fas fa-credit-card"></i> Thanh toán
      </button>
    `;
  }

  // 7. Hàm xử lý thêm vào giỏ hàng
  function addToCart(productId) {
    const product = getProductById(productId);
    if (!product) {
      alert("Không tìm thấy sản phẩm!");
      return;
    }

    let cart = getCurrentCart();
    const existingItem = cart.find((item) => item.id === product.id);

    if (existingItem) {
      existingItem.qty += 1;
    } else {
      cart.push({ ...product, qty: 1 });
    }

    saveCurrentCart(cart);
    updateCartCount();
    renderCartDrawer();

    // Hiển thị thông báo thay vì mở drawer
    showCartNotification(`Đã thêm ${product.name} vào giỏ hàng!`);

    console.log("Đã thêm vào giỏ:", product.name);
  }

  // 8. Hàm xử lý mua ngay
  function buyNow(productId) {
    const product = getProductById(productId);
    if (!product) {
      alert("Không tìm thấy sản phẩm!");
      return;
    }

    if (!localStorage.getItem("currentUser")) {
      alert("Vui lòng đăng nhập để mua hàng!");
      window.location.href = "../pages/login.html";
      return;
    }

    localStorage.setItem("singleProductForPayment", JSON.stringify(product));
    const popup = window.open(
      "../pages/payment-popup.html",
      "payment_window",
      "width=850,height=700,scrollbars=yes,resizable=yes"
    );

    if (!popup) {
      alert("Vui lòng cho phép popup để thanh toán!");
    }
  }

  // 9. Event delegation cho các nút
  document.addEventListener("click", (e) => {
    const target = e.target.closest(
      ".buy-now-btn, .add-to-cart-btn, .remove-btn, .decrease-quantity, .increase-quantity, #openCartPopup, #closeCartDrawer, #checkoutCartBtn"
    );
    if (!target) return;

    const productId = target.getAttribute("data-id");

    if (target.classList.contains("buy-now-btn")) {
      buyNow(productId);
    } else if (target.classList.contains("add-to-cart-btn")) {
      addToCart(productId);
    } else if (target.classList.contains("remove-btn") && productId) {
      let cart = getCurrentCart();
      cart = cart.filter((item) => item.id !== parseInt(productId));
      saveCurrentCart(cart);
      updateCartCount();
      renderCartDrawer();
    } else if (target.classList.contains("decrease-quantity") && productId) {
      let cart = getCurrentCart();
      const item = cart.find((item) => item.id === parseInt(productId));
      if (item && item.qty > 1) {
        item.qty -= 1;
        saveCurrentCart(cart);
        updateCartCount();
        renderCartDrawer();
      } else if (item && item.qty === 1) {
        cart = cart.filter((item) => item.id !== parseInt(productId));
        saveCurrentCart(cart);
        updateCartCount();
        renderCartDrawer();
      }
    } else if (target.classList.contains("increase-quantity") && productId) {
      let cart = getCurrentCart();
      const item = cart.find((item) => item.id === parseInt(productId));
      if (item) {
        item.qty += 1;
        saveCurrentCart(cart);
        updateCartCount();
        renderCartDrawer();
      }
    } else if (target.id === "openCartPopup") {
      const cartDrawer = document.getElementById("cartDrawer");
      const cartOverlay = document.getElementById("cartOverlay");
      if (cartDrawer && cartOverlay) {
        cartDrawer.classList.add("active");
        cartOverlay.classList.add("active");
        renderCartDrawer();
      } else {
        console.error("Không tìm thấy cartDrawer hoặc cartOverlay");
      }
    } else if (target.id === "closeCartDrawer") {
      const cartDrawer = document.getElementById("cartDrawer");
      const cartOverlay = document.getElementById("cartOverlay");
      if (cartDrawer && cartOverlay) {
        cartDrawer.classList.remove("active");
        cartOverlay.classList.remove("active");
      } else {
        console.error("Không tìm thấy cartDrawer hoặc cartOverlay");
      }
    } else if (target.id === "checkoutCartBtn") {
      if (!localStorage.getItem("currentUser")) {
        alert("Vui lòng đăng nhập để thanh toán!");
        window.location.href = "../pages/login.html";
        return;
      }

      const cart = getCurrentCart();
      if (cart.length === 0) {
        alert("Giỏ hàng của bạn đang trống!");
        return;
      }

      localStorage.removeItem("singleProductForPayment");
      const popup = window.open(
        "../pages/payment-popup.html",
        "payment_window",
        "width=850,height=700,scrollbars=yes,resizable=yes"
      );

      if (!popup) {
        alert("Vui lòng cho phép popup để thanh toán!");
      }
    }
  });

  // 10. Đóng drawer khi click vào overlay
  document.addEventListener("click", (e) => {
    if (e.target.id === "cartOverlay") {
      const cartDrawer = document.getElementById("cartDrawer");
      const cartOverlay = document.getElementById("cartOverlay");
      if (cartDrawer && cartOverlay) {
        cartDrawer.classList.remove("active");
        cartOverlay.classList.remove("active");
      }
    }
  });

  // 11. Hàm hiển thị thông báo thêm vào giỏ hàng
  function showCartNotification(message) {
    // Xóa thông báo cũ nếu có
    const oldNotification = document.querySelector(".cart-notification");
    if (oldNotification) {
      oldNotification.remove();
    }

    // Tạo thông báo mới
    const notification = document.createElement("div");
    notification.className = "cart-notification";
    notification.innerHTML = `
      <i class="fas fa-check"></i> ${message}
    `;

    document.body.appendChild(notification);

    // Hiển thị thông báo
    setTimeout(() => {
      notification.classList.add("show");
    }, 100);

    // Ẩn thông báo sau 3 giây
    setTimeout(() => {
      notification.classList.remove("show");
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 3000);
  }

  // 12. Khởi tạo giỏ hàng khi tải trang
  updateCartCount();
  renderCartDrawer();
});
