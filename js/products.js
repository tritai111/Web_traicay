// products.js - Quản lý sản phẩm và hiển thị danh sách sản phẩm
let productsData = [];
let categoriesData = [];
let filteredProducts = [];
let currentCategory = "ALL";
let currentSort = "default";
let searchQuery = "";

// 1. Load dữ liệu từ JSON
function loadProductsData() {
  return Promise.all([
    fetch("../data/products.json").then((response) => response.json()),
    fetch("../data/categories.json").then((response) => response.json()),
  ])
    .then(([products, categories]) => {
      productsData = products;
      categoriesData = categories;
      filteredProducts = [...productsData];
      console.log("Đã tải dữ liệu sản phẩm và danh mục");
      return { products, categories };
    })
    .catch((error) => {
      console.error("Lỗi khi tải dữ liệu:", error);
      showNotification("Không thể tải dữ liệu sản phẩm", "error");
      return { products: [], categories: [] };
    });
}

// 2. Lấy sản phẩm theo ID
function getProductById(id) {
  return productsData.find((product) => product.id == id) || null;
}

// 3. Lấy tất cả sản phẩm
function getAllProducts() {
  return [...productsData];
}

// 4. Lấy sản phẩm theo danh mục
function getProductsByCategory(category) {
  if (category === "ALL") return [...productsData];
  return productsData.filter((product) => product.category === category);
}

// 5. Tìm kiếm sản phẩm
function searchProducts(query) {
  searchQuery = query.toLowerCase().trim();
  applyFilters();
}

// 6. Lọc sản phẩm theo nhiều tiêu chí
function applyFilters() {
  // Bắt đầu với tất cả sản phẩm
  filteredProducts = [...productsData];

  // Lọc theo danh mục
  if (currentCategory !== "ALL") {
    filteredProducts = filteredProducts.filter(
      (product) => product.category === currentCategory
    );
  }

  // Lọc theo từ khóa tìm kiếm
  if (searchQuery) {
    filteredProducts = filteredProducts.filter(
      (product) =>
        product.name.toLowerCase().includes(searchQuery) ||
        product.description.toLowerCase().includes(searchQuery)
    );
  }

  // Sắp xếp
  sortProducts(currentSort);

  // Hiển thị kết quả
  renderProducts();
}

// 7. Sắp xếp sản phẩm
function sortProducts(sortType) {
  currentSort = sortType;

  switch (sortType) {
    case "price-asc":
      filteredProducts.sort(
        (a, b) => parseFloat(a.price) - parseFloat(b.price)
      );
      break;
    case "price-desc":
      filteredProducts.sort(
        (a, b) => parseFloat(b.price) - parseFloat(a.price)
      );
      break;
    case "name-asc":
      filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "name-desc":
      filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
      break;
    default:
      // Sắp xếp mặc định (có thể theo id hoặc thứ tự trong file)
      filteredProducts.sort((a, b) => parseInt(a.id) - parseInt(b.id));
  }
}

// 8. Hiển thị danh sách sản phẩm
function renderProducts() {
  const container = document.getElementById("productsContainer");
  if (!container) return;

  if (filteredProducts.length === 0) {
    container.innerHTML = `
      <div class="no-products">
        <i class="fas fa-search"></i>
        <h3>Không tìm thấy sản phẩm nào</h3>
        <p>Vui lòng thử lại với điều kiện tìm kiếm khác</p>
      </div>
    `;
    return;
  }

  let productsHTML = "";

  filteredProducts.forEach((product) => {
    const price = parseFloat(product.price).toLocaleString("vi-VN");
    const imageUrl = product.image || "../images/placeholder.png";

    productsHTML += `
      <div class="product-card" data-id="${product.id}">
        <div class="product-image">
          <img src="${imageUrl}" alt="${product.name}" loading="lazy">
          ${product.isNew ? '<span class="product-badge new">Mới</span>' : ""}
          ${
            product.isSale
              ? `<span class="product-badge sale">-${product.discount}%</span>`
              : ""
          }
        </div>
        <div class="product-info">
          <h3 class="product-name">${product.name}</h3>
          <p class="product-category">${getCategoryName(product.category)}</p>
          <div class="product-price">
            ${
              product.isSale
                ? `<span class="original-price">${price} VNĐ</span>
               <span class="sale-price">${calculateSalePrice(
                 product.price,
                 product.discount
               ).toLocaleString("vi-VN")} VNĐ</span>`
                : `<span class="current-price">${price} VNĐ</span>`
            }
          </div>
          <div class="product-actions">
            <button class="btn-view-detail" onclick="viewProductDetail(${
              product.id
            })">
              <i class="fas fa-eye"></i> Xem chi tiết
            </button>
            <button class="btn-add-to-cart" onclick="addProductToCart(${
              product.id
            })">
              <i class="fas fa-cart-plus"></i> Thêm vào giỏ
            </button>
          </div>
        </div>
      </div>
    `;
  });

  container.innerHTML = productsHTML;
}

// 9. Lấy tên danh mục theo ID
function getCategoryName(categoryId) {
  const category = categoriesData.find((cat) => cat.id === categoryId);
  return category ? category.name : "Khác";
}

// 10. Tính giá sau khi giảm giá
function calculateSalePrice(originalPrice, discount) {
  const price = parseFloat(originalPrice);
  return price * (1 - discount / 100);
}

// 11. Xem chi tiết sản phẩm
function viewProductDetail(productId) {
  const product = getProductById(productId);
  if (!product) {
    showNotification("Không tìm thấy sản phẩm", "error");
    return;
  }

  // Lưu sản phẩm hiện tại vào localStorage để trang chi tiết có thể lấy
  localStorage.setItem("currentProduct", JSON.stringify(product));

  // Mở trang chi tiết
  window.location.href = `product-detail.html?id=${productId}`;
}

// 12. Thêm sản phẩm vào giỏ hàng
function addProductToCart(productId) {
  if (!isUserLoggedIn()) {
    showNotification(
      "Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng",
      "error"
    );
    window.location.href = "../pages/login.html";
    return;
  }

  const product = getProductById(productId);
  if (!product) {
    showNotification("Không tìm thấy sản phẩm", "error");
    return;
  }

  let cart = getCurrentUserCart();

  // Kiểm tra xem sản phẩm đã có trong giỏ chưa
  const existingItem = cart.find((item) => item.id == productId);

  if (existingItem) {
    existingItem.qty += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.isSale
        ? calculateSalePrice(product.price, product.discount)
        : product.price,
      image: product.image,
      qty: 1,
    });
  }

  saveCurrentUserCart(cart);
  updateCartUI();
  showNotification(`Đã thêm ${product.name} vào giỏ hàng`, "success");
}

// 13. Khởi tạo sự kiện cho trang sản phẩm
function initProductsPage() {
  // Load dữ liệu
  loadProductsData().then(() => {
    // Hiển thị sản phẩm
    renderProducts();

    // Khởi tạo sự kiện lọc và sắp xếp
    initFilterEvents();
  });
}

// 14. Khởi tạo sự kiện lọc và sắp xếp
function initFilterEvents() {
  // Sự kiện chọn danh mục
  const categorySelect = document.getElementById("categorySelect");
  if (categorySelect) {
    categorySelect.addEventListener("change", function () {
      currentCategory = this.value;
      applyFilters();
    });
  }

  // Sự kiện sắp xếp
  const sortSelect = document.getElementById("sortSelect");
  if (sortSelect) {
    sortSelect.addEventListener("change", function () {
      currentSort = this.value;
      applyFilters();
    });
  }

  // Sự kiện tìm kiếm
  const searchInput = document.getElementById("searchInput");
  const searchButton = document.getElementById("searchButton");

  if (searchInput) {
    searchInput.addEventListener("input", function () {
      searchProducts(this.value);
    });
  }

  if (searchButton) {
    searchButton.addEventListener("click", function () {
      if (searchInput) searchProducts(searchInput.value);
    });
  }
}

// 15. Tạo HTML cho danh mục
function renderCategories() {
  const categorySelect = document.getElementById("categorySelect");
  if (!categorySelect || categoriesData.length === 0) return;

  let optionsHTML = '<option value="ALL">Tất cả danh mục</option>';

  categoriesData.forEach((category) => {
    optionsHTML += `<option value="${category.id}">${category.name}</option>`;
  });

  categorySelect.innerHTML = optionsHTML;
}

// Khởi tạo khi DOM tải xong
document.addEventListener("DOMContentLoaded", function () {
  // Kiểm tra xem có phải trang sản phẩm không
  if (document.getElementById("productsContainer")) {
    initProductsPage();
  }

  // Kiểm tra xem có phải trang chi tiết sản phẩm không
  if (document.getElementById("productDetailContainer")) {
    initProductDetailPage();
  }
});

// Hàm khởi tạo trang chi tiết sản phẩm
function initProductDetailPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get("id");

  let product;

  // Ưu tiên lấy từ localStorage (nếu có)
  const savedProduct = localStorage.getItem("currentProduct");
  if (savedProduct) {
    product = JSON.parse(savedProduct);
  } else if (productId) {
    // Nếu không có trong localStorage, lấy theo ID từ URL
    product = getProductById(productId);
  }

  if (!product) {
    document.getElementById("productDetailContainer").innerHTML = `
      <div class="product-not-found">
        <h2>Sản phẩm không tồn tại</h2>
        <p>Sản phẩm bạn tìm kiếm không tồn tại hoặc đã bị xóa.</p>
        <a href="products.html" class="btn">Quay lại danh sách sản phẩm</a>
      </div>
    `;
    return;
  }

  renderProductDetail(product);
}

// Hàm hiển thị chi tiết sản phẩm
function renderProductDetail(product) {
  const container = document.getElementById("productDetailContainer");
  if (!container) return;

  const price = parseFloat(product.price).toLocaleString("vi-VN");
  const salePrice = product.isSale
    ? calculateSalePrice(product.price, product.discount).toLocaleString(
        "vi-VN"
      )
    : null;

  container.innerHTML = `
    <div class="product-detail">
      <div class="product-detail-image">
        <img src="${product.image || "../images/placeholder.png"}" alt="${
    product.name
  }">
        ${product.isNew ? '<span class="product-badge new">Mới</span>' : ""}
        ${
          product.isSale
            ? `<span class="product-badge sale">-${product.discount}%</span>`
            : ""
        }
      </div>
      
      <div class="product-detail-info">
        <h1 class="product-detail-name">${product.name}</h1>
        <p class="product-detail-category">Danh mục: ${getCategoryName(
          product.category
        )}</p>
        
        <div class="product-detail-price">
          ${
            product.isSale
              ? `<span class="original-price">${price} VNĐ</span>
             <span class="sale-price">${salePrice} VNĐ</span>`
              : `<span class="current-price">${price} VNĐ</span>`
          }
        </div>
        
        <div class="product-detail-description">
          <h3>Mô tả sản phẩm</h3>
          <p>${product.description || "Chưa có mô tả cho sản phẩm này."}</p>
        </div>
        
        <div class="product-detail-actions">
          <div class="quantity-selector">
            <button id="decreaseQty" class="qty-btn">-</button>
            <input type="number" id="productQty" value="1" min="1" max="99" readonly>
            <button id="increaseQty" class="qty-btn">+</button>
          </div>
          
          <button id="addToCartBtn" class="btn btn-primary">
            <i class="fas fa-cart-plus"></i> Thêm vào giỏ hàng
          </button>
          
          <button id="buyNowBtn" class="btn btn-accent">
            <i class="fas fa-bolt"></i> Mua ngay
          </button>
        </div>
      </div>
    </div>
  `;

  // Khởi tạo sự kiện cho trang chi tiết
  initProductDetailEvents(product);
}

// Hàm khởi tạo sự kiện trang chi tiết sản phẩm
function initProductDetailEvents(product) {
  const decreaseBtn = document.getElementById("decreaseQty");
  const increaseBtn = document.getElementById("increaseQty");
  const qtyInput = document.getElementById("productQty");
  const addToCartBtn = document.getElementById("addToCartBtn");
  const buyNowBtn = document.getElementById("buyNowBtn");

  // Sự kiện tăng/giảm số lượng
  if (decreaseBtn) {
    decreaseBtn.addEventListener("click", function () {
      const currentQty = parseInt(qtyInput.value);
      if (currentQty > 1) {
        qtyInput.value = currentQty - 1;
      }
    });
  }

  if (increaseBtn) {
    increaseBtn.addEventListener("click", function () {
      const currentQty = parseInt(qtyInput.value);
      if (currentQty < 99) {
        qtyInput.value = currentQty + 1;
      }
    });
  }

  // Sự kiện thêm vào giỏ hàng
  if (addToCartBtn) {
    addToCartBtn.addEventListener("click", function () {
      if (!isUserLoggedIn()) {
        showNotification(
          "Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng",
          "error"
        );
        window.location.href = "../pages/login.html";
        return;
      }

      const qty = parseInt(qtyInput.value);
      addProductToCartWithQty(product.id, qty);
    });
  }

  // Sự kiện mua ngay
  if (buyNowBtn) {
    buyNowBtn.addEventListener("click", function () {
      if (!isUserLoggedIn()) {
        showNotification("Vui lòng đăng nhập để mua sản phẩm", "error");
        window.location.href = "../pages/login.html";
        return;
      }

      const qty = parseInt(qtyInput.value);
      buyProductNow(product.id, qty);
    });
  }
}

// Hàm thêm sản phẩm vào giỏ hàng với số lượng cụ thể
function addProductToCartWithQty(productId, qty) {
  const product = getProductById(productId);
  if (!product) {
    showNotification("Không tìm thấy sản phẩm", "error");
    return;
  }

  let cart = getCurrentUserCart();

  // Kiểm tra xem sản phẩm đã có trong giỏ chưa
  const existingItem = cart.find((item) => item.id == productId);

  if (existingItem) {
    existingItem.qty += qty;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.isSale
        ? calculateSalePrice(product.price, product.discount)
        : product.price,
      image: product.image,
      qty: qty,
    });
  }

  saveCurrentUserCart(cart);
  updateCartUI();
  showNotification(`Đã thêm ${qty} ${product.name} vào giỏ hàng`, "success");
}

// Hàm mua sản phẩm ngay
function buyProductNow(productId, qty) {
  const product = getProductById(productId);
  if (!product) {
    showNotification("Không tìm thấy sản phẩm", "error");
    return;
  }

  const finalPrice = product.isSale
    ? calculateSalePrice(product.price, product.discount)
    : product.price;

  const productForPayment = {
    id: product.id,
    name: product.name,
    price: finalPrice,
    image: product.image,
    qty: qty,
  };

  localStorage.setItem("paymentProduct", JSON.stringify(productForPayment));

  // Mở popup thanh toán
  openPaymentPopup();
}
