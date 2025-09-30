/*xu ly dang nhap */
// Khởi tạo danh sách người dùng nếu chưa có
if (!localStorage.getItem("registeredUsers")) {
  localStorage.setItem("registeredUsers", JSON.stringify({}));
}

const emailInput = document.getElementById("email");
const statusHint = document.getElementById("statusHint");
const emailForm = document.getElementById("emailForm");

// Kiểm tra email khi gõ
emailInput.addEventListener("input", checkEmailStatus);

function checkEmailStatus() {
  const email = emailInput.value.trim().toLowerCase();
  if (!email || !isValidEmail(email)) {
    statusHint.textContent = "";
    statusHint.className = "status-hint";
    return;
  }

  const users = JSON.parse(localStorage.getItem("registeredUsers"));
  if (users[email]) {
    statusHint.className = "status-hint existing";
  } else {
    statusHint.className = "status-hint new";
  }
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Xử lý form email
emailForm.addEventListener("submit", function (e) {
  e.preventDefault();
  const email = emailInput.value.trim().toLowerCase();
  if (!isValidEmail(email)) {
    alert("Vui lòng nhập email hợp lệ.");
    return;
  }

  const users = JSON.parse(localStorage.getItem("registeredUsers"));

  if (users[email]) {
    // ĐÃ CÓ TÀI KHOẢN → chỉ đăng nhập
    const username = users[email].name || email.split("@")[0];
    localStorage.setItem("currentUser", username);
    localStorage.setItem("currentUserEmail", email); // Lưu email để kiểm tra sau
    alert(`Chào mừng trở lại, ${username}!`);
    window.location.href = "../pages/index.html";
  } else {
    // CHƯA CÓ → tạo mới
    const username = email.split("@")[0];
    users[email] = {
      name: username,
      email: email, // Lưu email để dễ truy xuất
      created: new Date().toISOString(),
      isVerified: false, // Thêm trạng thái xác minh
    };
    localStorage.setItem("registeredUsers", JSON.stringify(users));
    localStorage.setItem("currentUser", username);
    localStorage.setItem("currentUserEmail", email);
    alert(`Tài khoản mới đã được tạo cho ${email}!`);
    //window.location.href = "../pages/index.html";
    // Nếu được mở từ popup, đóng login và quay lại popup
    if (window.opener && !window.opener.closed) {
      window.close();
    } else {
      window.location.href = "../pages/index.html";
    }
  }
});

// Xử lý social login - ĐÃ SỬA: không tạo mới nếu đã tồn tại
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
      isVerified: true, // Social login thường đã xác minh
    };
    localStorage.setItem("registeredUsers", JSON.stringify(users));
    alert(`Tài khoản mới đã được tạo qua ${provider}!`);
  } else {
    // Nếu đã tồn tại, chỉ thông báo đăng nhập
    alert(`Chào mừng trở lại, ${users[email].name}!`);
  }

  localStorage.setItem("currentUser", users[email].name);
  localStorage.setItem("currentUserEmail", email);
  // Nếu được mở từ popup, đóng login và quay lại popup
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
