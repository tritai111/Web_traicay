/*xu ly dang nhap */
// Khởi tạo danh sách người dùng nếu chưa có
if (!localStorage.getItem("registeredUsers")) {
  localStorage.setItem("registeredUsers", JSON.stringify({}));
}

const emailInput = document.getElementById("email");
const passwordGroup = document.getElementById("passwordGroup");
const passwordInput = document.getElementById("password");
const statusHint = document.getElementById("statusHint");
const emailForm = document.getElementById("emailForm");
const submitBtn = document.getElementById("submitBtn");

let isNewAccount = false;

// ==================== HÀM QUẢN LÝ GIỎ HÀNG THEO USER ====================

// Lấy giỏ hàng của user hiện tại
function getCurrentUserCart() {
  const userEmail = localStorage.getItem("currentUserEmail");
  if (!userEmail) {
    // Chưa đăng nhập: lấy giỏ hàng tạm
    return JSON.parse(localStorage.getItem("temp_cart")) || [];
  }

  const userCartKey = `cart_${userEmail}`;
  return JSON.parse(localStorage.getItem(userCartKey)) || [];
}

// Lưu giỏ hàng của user hiện tại
function saveCurrentUserCart(cart) {
  const userEmail = localStorage.getItem("currentUserEmail");
  if (!userEmail) {
    // Chưa đăng nhập: lưu giỏ hàng tạm
    localStorage.setItem("temp_cart", JSON.stringify(cart));
    return;
  }

  const userCartKey = `cart_${userEmail}`;
  localStorage.setItem(userCartKey, JSON.stringify(cart));
}

// Chuyển giỏ hàng tạm sang user (khi đăng nhập)
function transferTempCartToUser(userEmail) {
  const tempCart = JSON.parse(localStorage.getItem("temp_cart")) || [];
  if (tempCart.length === 0) return;

  const userCartKey = `cart_${userEmail}`;
  const userCart = JSON.parse(localStorage.getItem(userCartKey)) || [];

  // Gộp giỏ hàng
  tempCart.forEach((tempItem) => {
    const existingItem = userCart.find(
      (userItem) => userItem.id === tempItem.id
    );
    if (existingItem) {
      existingItem.qty += tempItem.qty;
    } else {
      userCart.push(tempItem);
    }
  });

  localStorage.setItem(userCartKey, JSON.stringify(userCart));
  localStorage.removeItem("temp_cart"); // Xóa giỏ hàng tạm

  console.log(
    `Đã chuyển ${tempCart.length} sản phẩm từ giỏ tạm sang user ${userEmail}`
  );
}

// Kiểm tra user đã đăng nhập chưa
function isUserLoggedIn() {
  return localStorage.getItem("currentUser") !== null;
}

// ==================== XỬ LÝ ĐĂNG NHẬP ====================

// Khi người dùng nhập email
emailInput.addEventListener("input", () => {
  const email = emailInput.value.trim();

  if (!email || !isValidEmail(email)) {
    statusHint.textContent = "";
    passwordGroup.style.display = "none";
    submitBtn.textContent = "Continue";
    return;
  }

  const allUsers = JSON.parse(localStorage.getItem("registeredUsers")) || {};
  // Loại bỏ admin để chỉ còn khách
  const users = Object.fromEntries(
    Object.entries(allUsers).filter(
      ([email, user]) => email !== "admin@gmail.com"
    )
  );
  if (users[email]) {
    // Nếu đã có tài khoản → chỉ hiện mật khẩu, không hiện thông báo
    passwordGroup.style.display = "block";
    submitBtn.textContent = "Đăng nhập";
    isNewAccount = false;
  } else {
    // Nếu chưa có tài khoản → hiện mật khẩu để tạo mới
    statusHint.textContent =
      "Email chưa có tài khoản. Hãy nhập mật khẩu để tạo tài khoản mới.";
    passwordGroup.style.display = "block";
    submitBtn.textContent = "Tạo tài khoản";
    isNewAccount = true;
  }
});

// Khi submit form
emailForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  const users = JSON.parse(localStorage.getItem("registeredUsers"));

  if (!isValidEmail(email)) {
    alert("Vui lòng nhập email hợp lệ.");
    return;
  }

  if (isNewAccount) {
    if (!password) {
      statusHint.textContent = "Bạn chưa nhập mật khẩu để tạo tài khoản mới!";
      passwordInput.focus();
      return;
    }
    // Tạo tài khoản mới
    const username = email.split("@")[0];
    users[email] = {
      name: username,
      email: email,
      password: password,
      created: new Date().toISOString(),
    };
    localStorage.setItem("registeredUsers", JSON.stringify(users));
    localStorage.setItem("currentUser", username);
    localStorage.setItem("currentUserEmail", email);
    localStorage.setItem("currentUserRole", "customer");

    // Chuyển giỏ hàng tạm sang user mới
    transferTempCartToUser(email);

    alert(` Tài khoản mới đã được tạo cho ${email}!`);
    window.location.href = "../pages/index.html";
  } else {
    // Đăng nhập
    if (users[email].password === password) {
      localStorage.setItem("currentUser", users[email].name);
      localStorage.setItem("currentUserEmail", email);
      localStorage.setItem("currentUserRole", "customer");

      // Chuyển giỏ hàng tạm sang user
      transferTempCartToUser(email);

      alert(` Chào mừng trở lại, ${users[email].name}!`);
      window.location.href = "../pages/index.html";
    } else {
      alert(" Sai mật khẩu, vui lòng thử lại.");
    }
  }
});

// Hàm kiểm tra email hợp lệ
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Xử lý social login
function handleSocialLogin(provider) {
  const email = `user@${provider.toLowerCase()}.com`;
  const username = `${provider} User`;

  const users = JSON.parse(localStorage.getItem("registeredUsers"));

  // Kiểm tra nếu email đã tồn tại
  if (!users[email]) {
    users[email] = {
      name: username,
      email: email,
      provider: provider,
      created: new Date().toISOString(),
      isVerified: true,
    };
    localStorage.setItem("registeredUsers", JSON.stringify(users));
    alert(`Tài khoản mới đã được tạo qua ${provider}!`);
  } else {
    alert(`Chào mừng trở lại, ${users[email].name}!`);
  }

  localStorage.setItem("currentUser", users[email].name);
  localStorage.setItem("currentUserEmail", email);

  // Chuyển giỏ hàng tạm sang user
  transferTempCartToUser(email);

  if (window.opener && !window.opener.closed) {
    window.close();
  } else {
    window.location.href = "../pages/index.html";
  }
}

// Hàm kiểm tra xem user hiện tại đã đăng nhập chưa
function checkCurrentUser() {
  const currentUser = localStorage.getItem("currentUser");
  const currentUserEmail = localStorage.getItem("currentUserEmail");

  if (currentUser && currentUserEmail) {
    console.log(`User hiện tại: ${currentUser} (${currentUserEmail})`);
    return {
      name: currentUser,
      email: currentUserEmail,
    };
  }
  return null;
}

// Hàm đăng xuất
function logout() {
  localStorage.removeItem("currentUser");
  localStorage.removeItem("currentUserEmail");
  localStorage.removeItem("currentUserRole");
  alert("Đã đăng xuất!");
  window.location.href = "login.html";
}

// Hàm kiểm tra email đã được sử dụng chưa
function isEmailRegistered(email) {
  const users = JSON.parse(localStorage.getItem("registeredUsers"));
  return !!users[email];
}

// Hàm lấy thông tin user bằng email
function getUserByEmail(email) {
  const users = JSON.parse(localStorage.getItem("registeredUsers"));
  return users[email] || null;
}
