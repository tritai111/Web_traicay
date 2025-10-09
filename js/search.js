document.addEventListener("DOMContentLoaded", () => {
  const productsContainer = document.getElementById("productsContainer");
  const loading = document.getElementById("loading");
  const noResults = document.getElementById("noResults");
  const searchInput = document.querySelector(".search-input");
  const searchButton = document.querySelector(".search-button");
  const categorySelect = document.querySelector(".category-select");

  // Biến toàn cục để chia sẻ với cart.js
  window.productsData = [];

  // Hàm đọc file JSON
  async function loadProducts() {
    try {
      loading.style.display = "block";
      const response = await fetch("../data/products.json");
      window.productsData = await response.json();
      loading.style.display = "none";
      displayProducts(window.productsData);

      // Khởi tạo giỏ hàng sau khi tải sản phẩm
      if (typeof App !== "undefined" && App.Cart) {
        App.Cart.init();
        App.Cart.updateCount();
      }
    } catch (error) {
      loading.style.display = "none";
      productsContainer.innerHTML = `<p style="color: red; text-align: center;">Lỗi khi tải dữ liệu: ${error.message}</p>`;
    }
  }

  // Hàm hiển thị sản phẩm
  function displayProducts(filteredProducts) {
    productsContainer.innerHTML = "";
    noResults.style.display = "none";

    if (filteredProducts.length === 0) {
      noResults.style.display = "block";
      return;
    }

    filteredProducts.forEach((product) => {
      const productCard = document.createElement("div");
      productCard.className = "product-card";
      productCard.innerHTML = `
        <div class="product-image">
          <img src="${product.image}" alt="${product.name}">
        </div>
        <div class="product-info">
          <h3 class="product-name">${product.name}</h3>
          <span class="product-category">${product.category}</span>
          <p class="product-description">${product.description}</p>
          <div class="product-price">${parseFloat(product.price).toLocaleString(
            "vi-VN"
          )} VNĐ</div>
          <div class="product-actions">
            <button class="buy-now-btn" data-product-id="${
              product.id
            }">MUA NGAY</button>
            <button class="add-to-cart-btn" data-product-id="${product.id}">
              <i class="fas fa-shopping-cart"></i>
              Thêm vào giỏ
            </button>
          </div>
        </div>
      `;
      productsContainer.appendChild(productCard);
    });

    // Cập nhật lại giỏ hàng sau khi hiển thị sản phẩm mới
    if (typeof App !== "undefined" && App.Cart) {
      App.Cart.updateCount();
    }
  }

  // Hàm tìm kiếm sản phẩm
  function searchProducts(query, category) {
    let filteredProducts = window.productsData;

    if (query) {
      filteredProducts = filteredProducts.filter(
        (product) =>
          product.name.toLowerCase().includes(query.toLowerCase()) ||
          product.description.toLowerCase().includes(query.toLowerCase())
      );
    }

    if (category && category !== "ALL") {
      filteredProducts = filteredProducts.filter(
        (product) => product.category === category
      );
    }

    displayProducts(filteredProducts);
  }

  // Sự kiện tìm kiếm
  searchButton.addEventListener("click", () => {
    const query = searchInput.value.trim();
    const category = categorySelect.value;
    searchProducts(query, category);
  });

  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      const query = searchInput.value.trim();
      const category = categorySelect.value;
      searchProducts(query, category);
    }
  });

  searchInput.addEventListener("input", () => {
    const query = searchInput.value.trim();
    const category = categorySelect.value;
    searchProducts(query, category);
  });

  categorySelect.addEventListener("change", () => {
    const query = searchInput.value.trim();
    const category = categorySelect.value;
    searchProducts(query, category);
  });

  // Tải sản phẩm khi trang được load
  loadProducts();
});
