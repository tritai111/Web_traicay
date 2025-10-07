/**
 * products-page.js - Quản lý toàn bộ chức năng trang danh sách sản phẩm
 *
 * CÁC TÍNH NĂNG CHÍNH:
 * 1. Phân trang sản phẩm.
 * 2. Tìm kiếm sản phẩm theo tên.
 * 3. Lọc sản phẩm theo danh mục.
 * 4. Sắp xếp sản phẩm (theo giá, tên).
 * 5. Quản lý trạng thái (trang, tìm kiếm, bộ lọc) trên URL.
 * 6. Thêm sản phẩm vào giỏ hàng (sử dụng localStorage).
 * 7. Hỗ trợ hiển thị hình ảnh 3D (.glb).
 * 8. Thông báo cho người dùng.
 *
 * YÊU CẦU HTML (trong file products.html hoặc tương tự):
 * - <input type="text" id="searchInput" placeholder="Tìm kiếm sản phẩm...">
 * - <select id="categoryFilter">
 *     <option value="">Tất cả danh mục</option>
 *     <!-- Các tùy chọn danh mục sẽ được thêm tự động -->
 *   </select>
 * - <select id="sortSelect">
 *     <option value="default">Mặc định</option>
 *     <option value="price-asc">Giá: Thấp đến Cao</option>
 *     <option value="price-desc">Giá: Cao đến Thấp</option>
 *     <option value="name-asc">Tên: A-Z</option>
 *   </select>
 * - <div id="loading">Đang tải...</div>
 * - <div id="noResults" style="display:none;">Không tìm thấy sản phẩm nào.</div>
 * - <div id="productsContainer" class="product-grid"></div>
 * - <div id="paginationContainer" style="display:none;">
 *     <button id="prev-page">&laquo; Trang trước</button>
 *     <span>Trang <span id="current-page">1</span> / <span id="total-pages">1</span></span>
 *     <button id="next-page">Trang sau &raquo;</button>
 *   </div>
 */

class ProductsPageManager {
  constructor() {
    // --- Trạng thái ---
    this.allProducts = []; // Tất cả sản phẩm từ JSON
    this.filteredProducts = []; // Sản phẩm sau khi đã lọc và tìm kiếm
    this.categories = new Set(); // Lưu trữ các danh mục duy nhất

    // --- Cấu hình phân trang ---
    this.currentPage = 1;
    this.productsPerPage = 9; // Tăng lên 9 cho layout 3 cột

    // --- DOM Elements ---
    this.searchInput = document.getElementById("searchInput");
    this.categoryFilter = document.getElementById("categoryFilter");
    this.sortSelect = document.getElementById("sortSelect");
    this.productsContainer = document.getElementById("productsContainer");
    this.loadingElement = document.getElementById("loading");
    this.noResultsElement = document.getElementById("noResults");
    this.paginationContainer = document.getElementById("paginationContainer");
    this.currentPageElement = document.getElementById("current-page");
    this.totalPagesElement = document.getElementById("total-pages");
    this.prevButton = document.getElementById("prev-page");
    this.nextButton = document.getElementById("next-page");

    this.init();
  }

  /**
   * Khởi tạo ứng dụng
   */
  async init() {
    this.bindEvents();
    await this.loadInitialData();
    this.updateCartCount(); // Cập nhật số lượng giỏ hàng khi load trang
  }

  /**
   * Gắn các sự kiện lắng nghe
   */
  bindEvents() {
    // Sự kiện tìm kiếm, lọc, sắp xếp
    this.searchInput?.addEventListener("input", () =>
      this.handleFilterChange()
    );
    this.categoryFilter?.addEventListener("change", () =>
      this.handleFilterChange()
    );
    this.sortSelect?.addEventListener("change", () =>
      this.handleFilterChange()
    );

    // Sự kiện phân trang
    this.prevButton?.addEventListener("click", () =>
      this.goToPage(this.currentPage - 1)
    );
    this.nextButton?.addEventListener("click", () =>
      this.goToPage(this.currentPage + 1)
    );

    // Sự kiện toàn cục cho các nút thêm giỏ hàng (Event Delegation)
    document.addEventListener("click", (e) => this.handleGlobalClick(e));

    // Lắng nghe sự kiện thay đổi URL (khi người dùng nhấn back/forward)
    window.addEventListener("popstate", () => {
      this.applyStateFromURL();
    });
  }

  /**
   * Xử lý click toàn cục cho các nút trong sản phẩm
   */
  handleGlobalClick(e) {
    const addToCartBtn = e.target.closest(".add-to-cart-btn");
    const buyNowBtn = e.target.closest(".buy-now-btn");

    if (addToCartBtn) {
      e.preventDefault();
      const productId = parseInt(addToCartBtn.dataset.productId);
      this.handleAddToCart(productId, false);
    } else if (buyNowBtn) {
      e.preventDefault();
      const productId = parseInt(buyNowBtn.dataset.productId);
      this.handleAddToCart(productId, true);
    }
  }

  /**
   * Tải dữ liệu ban đầu (sản phẩm và danh mục)
   */
  async loadInitialData() {
    this.showLoading(true);
    try {
      const [productsData, categoriesData] = await Promise.all([
        this.fetchData("../data/products.json"),
        this.fetchData("../data/categories.json"),
      ]);

      this.allProducts = productsData;
      this.categories = new Set(categoriesData.map((cat) => cat.name || cat));
      this.populateCategoryFilter();

      // Áp dụng trạng thái từ URL và render lần đầu
      this.applyStateFromURL();
    } catch (error) {
      console.error("Lỗi tải dữ liệu ban đầu:", error);
      this.showError("Không thể tải sản phẩm. Vui lòng tải lại trang.");
    } finally {
      this.showLoading(false);
    }
  }

  /**
   * Fetch dữ liệu từ file JSON
   */
  async fetchData(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  }

  /**
   * Điền các tùy chọn vào bộ lọc danh mục
   */
  populateCategoryFilter() {
    if (!this.categoryFilter) return;
    this.categoryFilter.innerHTML = '<option value="">Tất cả danh mục</option>';
    this.categories.forEach((category) => {
      const option = document.createElement("option");
      option.value = category;
      option.textContent = category;
      this.categoryFilter.appendChild(option);
    });
  }

  /**
   * Xử lý khi bộ lọc hoặc tìm kiếm thay đổi
   */
  handleFilterChange() {
    this.currentPage = 1; // Reset về trang 1
    this.applyFiltersAndSort();
    this.updateURL();
  }

  /**
   * Áp dụng tất cả các bộ lọc, tìm kiếm và sắp xếp
   */
  applyFiltersAndSort() {
    // 1. Lọc
    const searchTerm = this.searchInput?.value.toLowerCase().trim() || "";
    const selectedCategory = this.categoryFilter?.value || "";

    this.filteredProducts = this.allProducts.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm);
      const matchesCategory =
        !selectedCategory || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    // 2. Sắp xếp
    const sortValue = this.sortSelect?.value || "default";
    this.filteredProducts.sort((a, b) => {
      switch (sortValue) {
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "name-asc":
          return a.name.localeCompare(b.name);
        default:
          return 0; // Mặc định (không sắp xếp)
      }
    });

    // 3. Render lại giao diện
    this.renderProducts();
    this.renderPagination();
  }

  /**
   * Render danh sách sản phẩm ra DOM
   */
  renderProducts() {
    if (!this.productsContainer) return;

    const productsToRender = this.getPaginatedProducts();

    if (productsToRender.length === 0) {
      this.productsContainer.innerHTML = "";
      this.showNoResults(true);
      return;
    }

    this.showNoResults(false);
    this.productsContainer.innerHTML = productsToRender
      .map((product) => this.createProductCardHTML(product))
      .join("");
  }

  /**
   * Lấy sản phẩm cho trang hiện tại
   */
  getPaginatedProducts() {
    const startIndex = (this.currentPage - 1) * this.productsPerPage;
    const endIndex = startIndex + this.productsPerPage;
    return this.filteredProducts.slice(startIndex, endIndex);
  }

  /**
   * Tạo HTML cho một thẻ sản phẩm
   */
  createProductCardHTML(product) {
    return `
      <div class="product-card" data-product-id="${product.id}">
        <a href="pages/product-detail.html?id=${
          product.id
        }" class="product-link">
          <div class="product-image">
            ${this.getProductImageHTML(product)}
          </div>
        </a>
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
            }">Mua ngay</button>
            <button class="add-to-cart-btn" data-product-id="${product.id}">
              <i class="fas fa-shopping-cart"></i> Thêm giỏ
            </button>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render các nút phân trang
   */
  renderPagination() {
    if (!this.paginationContainer) return;
    const totalPages = Math.ceil(
      this.filteredProducts.length / this.productsPerPage
    );

    if (totalPages <= 1) {
      this.paginationContainer.style.display = "none";
      return;
    }

    this.paginationContainer.style.display = "flex";
    this.currentPageElement.textContent = this.currentPage;
    this.totalPagesElement.textContent = totalPages;

    this.prevButton.disabled = this.currentPage === 1;
    this.nextButton.disabled = this.currentPage === totalPages;
  }

  /**
   * Chuyển đến một trang cụ thể
   */
  goToPage(page) {
    const totalPages = Math.ceil(
      this.filteredProducts.length / this.productsPerPage
    );
    if (page < 1 || page > totalPages) return;

    this.currentPage = page;
    this.renderProducts();
    this.renderPagination();
    this.updateURL();

    // Cuộn lên đầu danh sách sản phẩm
    this.productsContainer?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  /**
   * Cập nhật URL với trạng thái hiện tại
   */
  updateURL() {
    const params = new URLSearchParams();
    if (this.currentPage > 1) params.set("page", this.currentPage);
    if (this.searchInput?.value) params.set("search", this.searchInput.value);
    if (this.categoryFilter?.value)
      params.set("category", this.categoryFilter.value);
    if (this.sortSelect?.value && this.sortSelect.value !== "default")
      params.set("sort", this.sortSelect.value);

    const newURL = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState({ path: newURL }, "", newURL);
  }

  /**
   * Áp dụng trạng thái từ URL khi tải trang hoặc khi popstate
   */
  applyStateFromURL() {
    const params = new URLSearchParams(window.location.search);

    this.currentPage = parseInt(params.get("page")) || 1;
    if (this.searchInput) this.searchInput.value = params.get("search") || "";
    if (this.categoryFilter)
      this.categoryFilter.value = params.get("category") || "";
    if (this.sortSelect)
      this.sortSelect.value = params.get("sort") || "default";

    this.applyFiltersAndSort();
  }

  // --- CART & UTILITY FUNCTIONS ---

  /**
   * Xử lý thêm sản phẩm vào giỏ hàng
   */
  handleAddToCart(productId, buyNow = false) {
    const product = this.allProducts.find((p) => p.id === productId);
    if (!product) {
      this.showError("Không tìm thấy sản phẩm!");
      return;
    }

    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const existingItem = cart.find((item) => item.id === productId);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    this.updateCartCount();
    this.showNotification(`Đã thêm "${product.name}" vào giỏ hàng!`);

    if (buyNow) {
      // Nếu có chức năng mở giỏ hàng, gọi ở đây
      // window.openCartDrawer?.();
      window.location.href = "pages/checkout.html"; // Hoặc chuyển trang checkout
    }
  }

  /**
   * Cập nhật số lượng trên icon giỏ hàng
   */
  updateCartCount() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    document
      .querySelectorAll(".cart-count")
      .forEach((el) => (el.textContent = totalItems));
  }

  /**
   * Hiển thị/ẩn trạng thái tải
   */
  showLoading(show) {
    if (this.loadingElement)
      this.loadingElement.style.display = show ? "block" : "none";
  }

  /**
   * Hiển thị/ẩn thông báo không có kết quả
   */
  showNoResults(show) {
    if (this.noResultsElement)
      this.noResultsElement.style.display = show ? "block" : "none";
  }

  /**
   * Hiển thị thông báo lỗi
   */
  showError(message) {
    this.showNotification(message, "error");
  }

  /**
   * Hiển thị thông báo cho người dùng
   */
  showNotification(message, type = "success") {
    // Logic hiển thị thông báo (giữ nguyên từ code gốc)
    let notification = document.querySelector(".cart-notification");
    if (!notification) {
      notification = document.createElement("div");
      notification.className = "cart-notification";
      document.body.appendChild(notification);
      // ... (phần style cho notification)
    }
    notification.innerHTML = `<i class="fas fa-${
      type === "success" ? "check-circle" : "exclamation-circle"
    }"></i> <span>${message}</span>`;
    notification.className = `cart-notification ${
      type === "error" ? "error" : ""
    }`;
    notification.style.display = "flex";
    setTimeout(() => (notification.style.display = "none"), 3000);
  }

  /**
   * Lấy HTML cho hình ảnh sản phẩm (hỗ trợ 3D)
   */
  getProductImageHTML(product) {
    if (product.image && product.image.endsWith(".glb")) {
      return `<model-viewer src="${product.image}" alt="${product.name}" auto-rotate camera-controls shadow-intensity="1" style="width: 100%; height: 100%;"></model-viewer>`;
    } else {
      return `<img src="${product.image}" alt="${product.name}" loading="lazy">`;
    }
  }

  /**
   * Định dạng giá tiền
   */
  formatPrice(price) {
    return new Intl.NumberFormat("vi-VN").format(price);
  }
}

// Khởi tạo quản lý trang sản phẩm khi DOM đã sẵn sàng
document.addEventListener("DOMContentLoaded", () => {
  // Kiểm tra xem có đang ở trang sản phẩm không để tránh chạy script ở nơi khác
  if (document.getElementById("productsContainer")) {
    new ProductsPageManager();
  }
});

// Debug
console.log("products-page.js đã được load thành công!");
