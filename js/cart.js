let productsData = [];

// 1. Load JSON
fetch("data/products.json")
  .then((response) => response.json())
  .then((data) => {
    productsData = data;
    initCartEvents(); // KHỞI TẠO EVENT SAU KHI LOAD DATA
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
    initCartEvents();
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
    image: product.image,
    category: product.category,
    description: product.description,
    model: product.model || false,
    qty: 1,
  };
}

// 3. Hàm lấy giỏ hàng hiện tại (của user hoặc tạm thời)
function getCurrentCart() {
  const userEmail = localStorage.getItem("currentUserEmail");
  console.log("getCurrentCart - UserEmail:", userEmail);

  if (userEmail) {
    const userCartKey = `cart_${userEmail}`;
    const cart = JSON.parse(localStorage.getItem(userCartKey)) || [];
    console.log("getCurrentCart - User Cart:", cart);
    return cart;
  } else {
    const tempCart = JSON.parse(localStorage.getItem("temp_cart")) || [];
    console.log("getCurrentCart - Temp Cart:", tempCart);
    return tempCart;
  }
}

// 4. Hàm lưu giỏ hàng hiện tại
function saveCurrentCart(cart) {
  const userEmail = localStorage.getItem("currentUserEmail");
  if (userEmail) {
    const userCartKey = `cart_${userEmail}`;
    localStorage.setItem(userCartKey, JSON.stringify(cart));
  } else {
    localStorage.setItem("temp_cart", JSON.stringify(cart));
  }
}

// 5. Hàm cập nhật số lượng giỏ hàng trên UI
function updateCartCount() {
  const cart = getCurrentCart();
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  const cartCount = document.querySelector(".cart-count");
  if (cartCount) {
    cartCount.textContent = totalItems;
  }
}

// 6. KHỞI TẠO TẤT CẢ EVENT LISTENERS
function initCartEvents() {
  console.log("Đang khởi tạo cart events...");

  // Xử lý tất cả các nút "MUA NGAY"
  const buyNowBtns = document.querySelectorAll(".buy-now-btn");
  buyNowBtns.forEach((button) => {
    button.addEventListener("click", function () {
      const productId = this.getAttribute("data-id");

      if (!productId) {
        console.error("Không tìm thấy data-id trên nút MUA NGAY");
        alert("Không thể xác định sản phẩm!");
        return;
      }

      console.log("MUA NGAY clicked for product ID:", productId);

      if (!localStorage.getItem("currentUser")) {
        alert("Vui lòng đăng nhập để mua hàng!");
        window.location.href = "../pages/login.html";
        return;
      }

      const currentProduct = getProductById(productId);
      if (!currentProduct) {
        alert("Không tìm thấy sản phẩm để mua!");
        return;
      }

      localStorage.setItem("paymentProduct", JSON.stringify(currentProduct));

      const popup = window.open(
        "../pages/payment-popup.html",
        "payment_window",
        "width=850,height=700,scrollbars=yes,resizable=yes"
      );

      if (!popup) {
        alert("Vui lòng cho phép popup để thanh toán!");
      }
    });
  });

  // Xử lý tất cả các nút "THÊM VÀO GIỎ HÀNG"
  const addToCartBtns = document.querySelectorAll(".add-to-cart-btn");
  addToCartBtns.forEach((button) => {
    button.addEventListener("click", function () {
      const productId = this.getAttribute("data-id");

      if (!productId) {
        console.error("Không tìm thấy data-id trên nút THÊM VÀO GIỎ");
        alert("Không thể xác định sản phẩm!");
        return;
      }

      console.log("THÊM VÀO GIỎ clicked for product ID:", productId);

      const product = getProductById(productId);
      if (!product) {
        alert("Không tìm thấy sản phẩm!");
        return;
      }

      let cart = getCurrentCart();

      // Kiểm tra xem sản phẩm đã có trong giỏ chưa
      const existingItem = cart.find((item) => item.id === product.id);

      if (existingItem) {
        existingItem.qty += 1;
      } else {
        cart.push({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          category: product.category,
          description: product.description,
          model: product.model || false,
          qty: 1,
        });
      }

      saveCurrentCart(cart);
      updateCartCount();

      // Hiển thị thông báo
      const notif = document.getElementById("cartNotification");
      if (notif) {
        notif.classList.add("show");
        setTimeout(() => notif.classList.remove("show"), 2000);
      }

      console.log("Đã thêm vào giỏ:", product.name);
    });
  });

  // Xử lý nút "THANH TOÁN GIỎ HÀNG"
  const checkoutBtn = document.getElementById("checkoutCartBtn");
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", function () {
      console.log("THANH TOÁN GIỎ HÀNG clicked");

      if (!localStorage.getItem("currentUser")) {
        alert("Vui lòng đăng nhập để thanh toán!");
        window.location.href = "../pages/login.html";
        return;
      }

      // KHÔNG truyền cart data, để popup tự đọc từ localStorage của user
      console.log("Opening payment popup...");

      const popup = window.open(
        "../pages/payment-popup.html",
        "payment_window",
        "width=850,height=700,scrollbars=yes,resizable=yes"
      );

      if (popup) {
        popup.focus();
        console.log("Popup opened successfully");
      } else {
        console.log("Popup blocked by browser");
        alert("Popup bị chặn! Vui lòng cho phép popup.");
      }
    });
  }

  // Xử lý mở giỏ hàng drawer
  const openCartBtn = document.getElementById("openCartPopup");
  if (openCartBtn) {
    openCartBtn.addEventListener("click", function () {
      console.log("MỞ GIỎ HÀNG clicked");
      document.getElementById("cartDrawer").classList.add("active");
      document.getElementById("cartOverlay").style.display = "block";

      // Gọi hàm render từ main.js
      if (typeof renderCartDrawer === "function") {
        renderCartDrawer();
      }
    });
  }

  console.log("Cart events đã được khởi tạo");
}

// 7. Khởi tạo cart count khi load trang
document.addEventListener("DOMContentLoaded", function () {
  updateCartCount();

  // Nếu products.json load nhanh, vẫn đảm bảo events được gắn
  setTimeout(() => {
    if (productsData.length === 0) {
      initCartEvents();
    }
  }, 1000);
});

// 8. Hàm kiểm tra trạng thái đăng nhập
function checkLoginStatus() {
  return localStorage.getItem("currentUser") !== null;
}
