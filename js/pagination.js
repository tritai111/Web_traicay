// pagination.js - Đã sửa lỗi event listeners khi chuyển trang

class ProductPagination {
  constructor() {
    this.currentPage = 1;
    this.productsPerPage = 6;
    this.allProducts = [];

    this.init();
  }

  init() {
    this.bindEvents();
    this.loadProducts();
    this.updateCartCount();
  }

  bindEvents() {
    // Sự kiện phân trang
    document
      .getElementById("prev-page")
      .addEventListener("click", () => this.previousPage());
    document
      .getElementById("next-page")
      .addEventListener("click", () => this.nextPage());

    // Sự kiện toàn cục cho các nút thêm giỏ hàng (Event Delegation)
    document.addEventListener("click", (e) => {
      this.handleGlobalClick(e);
    });
  }

  // Sử dụng Event Delegation để xử lý click toàn cục
  handleGlobalClick(e) {
    // Xử lý nút "Thêm giỏ hàng"
    if (e.target.closest(".add-to-cart-btn")) {
      const button = e.target.closest(".add-to-cart-btn");
      const productId = parseInt(button.dataset.productId);
      this.handleAddToCart(productId, false);
      return;
    }

    // Xử lý nút "Mua ngay"
    if (e.target.closest(".buy-now-btn")) {
      const button = e.target.closest(".buy-now-btn");
      const productId = parseInt(button.dataset.productId);
      this.handleAddToCart(productId, true);
      return;
    }
  }

  async loadProducts() {
    try {
      document.getElementById("loading").style.display = "block";
      document.getElementById("noResults").style.display = "none";

      const products = await this.fetchProductsFromJSON();
      this.allProducts = products;

      this.renderProducts();
      this.renderPagination();
    } catch (error) {
      console.error("Lỗi tải sản phẩm:", error.message);
      document.getElementById("noResults").style.display = "block";
      document.getElementById("noResults").textContent =
        "Lỗi tải sản phẩm. Vui lòng thử lại.";
      this.allProducts = [];
    } finally {
      document.getElementById("loading").style.display = "none";
    }
  }

  async fetchProductsFromJSON() {
    try {
      const response = await fetch("../data/products.json");
      if (!response.ok) {
        throw new Error("Không thể tải dữ liệu sản phẩm");
      }

      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error("Dữ liệu JSON không hợp lệ (không phải mảng)");
      }

      return data;
    } catch (error) {
      console.error("Lỗi fetch JSON:", error.message);
      return [];
    }
  }

  getCurrentPageProducts() {
    const startIndex = (this.currentPage - 1) * this.productsPerPage;
    const endIndex = startIndex + this.productsPerPage;
    return this.allProducts.slice(startIndex, endIndex);
  }

  renderProducts() {
    const container = document.getElementById("productsContainer");
    const products = this.getCurrentPageProducts();

    if (products.length === 0) {
      document.getElementById("noResults").style.display = "block";
      container.innerHTML = "";
      return;
    }

    document.getElementById("noResults").style.display = "none";

    container.innerHTML = products
      .map(
        (product) => `
      <div class="product-card" data-product-id="${product.id}">
        <div class="product-image">
          ${this.getProductImageHTML(product)}
        </div>
        <div class="product-info">
          <h3 class="product-name">${product.name}</h3>
          ${
            product.category
              ? `<span class="product-category">${product.category}</span>`
              : ""
          }
          <p class="product-description">${product.description}</p>
          <div class="product-price">${this.formatPrice(
            product.price
          )} VNĐ</div>
          <div class="product-actions">
            <button class="buy-now-btn" data-product-id="${
              product.id
            }" data-buy-now="true">Mua ngay</button>
            <button class="add-to-cart-btn" data-product-id="${product.id}">
              <i class="fas fa-shopping-cart"></i> Thêm giỏ
            </button>
          </div>
        </div>
      </div>
    `
      )
      .join("");

    // KHÔNG CẦN bindProductEvents() nữa vì đã dùng Event Delegation
    console.log(
      `Đã render ${products.length} sản phẩm cho trang ${this.currentPage}`
    );
  }

  handleAddToCart(productId, buyNow = false) {
    const product = this.allProducts.find((p) => p.id === productId);
    if (!product) {
      console.error("Không tìm thấy sản phẩm với ID:", productId);
      this.showErrorNotification("Không tìm thấy sản phẩm!");
      return;
    }

    console.log(
      "Thêm vào giỏ hàng:",
      product.name,
      "Trang:",
      this.currentPage,
      buyNow
    );

    if (typeof window.customAddToCart === "function") {
      window.customAddToCart(product, buyNow);
    } else {
      this.fallbackAddToCart(product, buyNow);
    }
  }

  fallbackAddToCart(product, buyNow = false) {
    try {
      let cart = JSON.parse(localStorage.getItem("cart")) || [];
      const existingItem = cart.find((item) => item.id === product.id);

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        cart.push({
          ...product,
          quantity: 1,
          // Đảm bảo có đầy đủ thuộc tính
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          description: product.description,
          category: product.category || "",
        });
      }

      localStorage.setItem("cart", JSON.stringify(cart));
      this.updateCartCount();
      this.showCartNotification(product.name, buyNow);

      if (buyNow) {
        this.openCartDrawer();
      }
    } catch (error) {
      console.error("Lỗi khi thêm vào giỏ hàng:", error);
      this.showErrorNotification("Lỗi khi thêm vào giỏ hàng!");
    }
  }

  updateCartCount() {
    try {
      const cart = JSON.parse(localStorage.getItem("cart")) || [];
      const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

      document.querySelectorAll(".cart-count").forEach((el) => {
        el.textContent = totalItems;
      });
    } catch (error) {
      console.error("Lỗi cập nhật số lượng giỏ hàng:", error);
    }
  }

  showCartNotification(productName, buyNow = false) {
    this.showNotification(`Đã thêm "${productName}" vào giỏ hàng!`, "success");
  }

  showErrorNotification(message) {
    this.showNotification(message, "error");
  }

  showNotification(message, type = "success") {
    let notification = document.querySelector(".cart-notification");

    if (!notification) {
      notification = document.createElement("div");
      notification.className = "cart-notification";
      document.body.appendChild(notification);

      const style = document.createElement("style");
      style.textContent = `
        .cart-notification {
          position: fixed;
          top: 20px;
          right: 20px;
          background: #4CAF50;
          color: white;
          padding: 15px 20px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          z-index: 10000;
          animation: slideIn 0.3s ease;
          display: flex;
          align-items: center;
          gap: 10px;
          font-family: Arial, sans-serif;
        }
        .cart-notification.error {
          background: #f44336;
        }
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `;
      document.head.appendChild(style);
    }

    // Cập nhật nội dung và style dựa trên type
    notification.innerHTML = `<i class="fas fa-${
      type === "success" ? "check-circle" : "exclamation-circle"
    }"></i> <span>${message}</span>`;
    notification.className = `cart-notification ${
      type === "error" ? "error" : ""
    }`;
    notification.style.display = "flex";

    setTimeout(() => {
      notification.style.display = "none";
    }, 3000);
  }

  openCartDrawer() {
    const cartDrawer = document.getElementById("cartDrawer");
    const cartOverlay = document.getElementById("cartOverlay");

    if (cartDrawer && cartOverlay) {
      cartDrawer.classList.add("active");
      cartOverlay.classList.add("active");
    } else {
      console.warn("Không tìm thấy cart drawer");
    }
  }

  getProductImageHTML(product) {
    if (product.image && product.image.endsWith(".glb")) {
      return `
        <model-viewer
          src="${product.image}"
          alt="${product.name}"
          auto-rotate
          camera-controls
          shadow-intensity="1"
          style="width: 100%; height: 100%;"
        ></model-viewer>
      `;
    } else {
      return `<img src="${product.image}" alt="${product.name}" loading="lazy">`;
    }
  }

  renderPagination() {
    const totalPages = Math.ceil(
      this.allProducts.length / this.productsPerPage
    );
    const currentPageElement = document.getElementById("current-page");
    const totalPagesElement = document.getElementById("total-pages");
    const prevButton = document.getElementById("prev-page");
    const nextButton = document.getElementById("next-page");

    currentPageElement.textContent = this.currentPage;
    totalPagesElement.textContent = totalPages;

    prevButton.disabled = this.currentPage === 1;
    nextButton.disabled = this.currentPage === totalPages || totalPages === 0;

    document.getElementById("paginationContainer").style.display =
      totalPages > 1 ? "flex" : "none";

    console.log(`Phân trang: Trang ${this.currentPage}/${totalPages}`);
  }

  goToPage(page) {
    this.currentPage = page;
    this.renderProducts();
    this.renderPagination();

    const section = document.querySelector(".products-section");
    if (section) {
      window.scrollTo({
        top: section.offsetTop - 100,
        behavior: "smooth",
      });
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.goToPage(this.currentPage - 1);
    }
  }

  nextPage() {
    const totalPages = Math.ceil(
      this.allProducts.length / this.productsPerPage
    );
    if (this.currentPage < totalPages) {
      this.goToPage(this.currentPage + 1);
    }
  }

  formatPrice(price) {
    return new Intl.NumberFormat("vi-VN").format(price);
  }
}

// Khởi tạo phân trang sản phẩm
const productPagination = new ProductPagination();

// ✅ Hàm thêm sản phẩm tuỳ chỉnh (nếu cần)
window.customAddToCart = function (product, buyNow = false) {
  console.log("Custom cart logic:", product.name, buyNow);
  // Sử dụng fallback logic
  productPagination.fallbackAddToCart(product, buyNow);
};

// ✅ Hàm toàn cục để tích hợp với cart.js cũ (nếu có)
window.addToCart = function (productId, buyNow = false) {
  productPagination.handleAddToCart(productId, buyNow);
};

// Debug: Kiểm tra xem script đã load
console.log("pagination.js đã được load thành công!");
