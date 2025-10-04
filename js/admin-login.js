// ---------- Nạp dữ liệu từ JSON ---------- //
fetch("../data/users.json")
  .then((response) => response.json())
  .then((data) => {
    // Lấy dữ liệu đã tồn tại
    const existingUsers =
      JSON.parse(localStorage.getItem("registeredUsers")) || {};

    // Merge dữ liệu JSON mới với dữ liệu cũ
    const mergedUsers = { ...existingUsers, ...data };
    localStorage.setItem("registeredUsers", JSON.stringify(mergedUsers));

    console.log("Đã nạp file JSON vào localStorage (merge với dữ liệu cũ)");

    // ---------- Gắn sự kiện đăng nhập admin ---------- //
    const adminForm = document.getElementById("adminLoginForm");

    adminForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const email = document.getElementById("adminEmail").value.trim();
      const password = document.getElementById("adminPassword").value;

      const users = JSON.parse(localStorage.getItem("registeredUsers")) || {};

      // Kiểm tra email và password
      if (
        users[email] &&
        users[email].password === password &&
        email === "admin@gmail.com"
      ) {
        // Chỉ set role + admin riêng
        localStorage.setItem("currentUserRole", "admin");
        localStorage.setItem("adminUser", users[email].name);
        localStorage.setItem("adminEmail", email);

        alert("Đăng nhập Admin thành công!");

        // Mở admin trong tab mới
        window.open("../admin/index.html", "_blank");
      } else {
        alert("Sai tài khoản hoặc mật khẩu admin");
      }
    });
  })
  .catch((error) => console.error("Lỗi khi nạp JSON:", error));
