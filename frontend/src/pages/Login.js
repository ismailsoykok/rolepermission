// Login.jsx
import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

import "./login.css";

function Login({ setUserToken }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const { data, status } = await axios.post("http://localhost:5000/login", {
        username,
        password,
      });

      if (status === 200) {
        const { token } = data;
        localStorage.setItem("userToken", token);
        setUserToken(token);

        const { roleName } = jwtDecode(token); // { …, roleName }

        toast.success("Giriş başarılı!");

        // Role göre yönlendirme (küçük harfli yollar)
        switch (roleName) {
          case "admin":
            navigate("/admin", { replace: true });
            break;
          case "manager":
            navigate("/manager", { replace: true });
            break;
          default: // worker veya diğerleri
            navigate("/worker", { replace: true });
        }
      }
    } catch (err) {
       console.error("Login error:", err.response?.data || err.message);

  const message = err.response?.data?.message || "Bir hata oluştu";
  toast.error(message);
    } 
  };

  return (
    <div className="form-container">
      <h3 className="text-xl font-semibold mb-4">Giriş Yap</h3>

      <form onSubmit={handleLogin}>
        {/* Username */}
        <div className="mb-4">
          <label htmlFor="username" className="form-label">
            Kullanıcı Adı
          </label>
          <input
            type="text"
            id="username"
            className="w-full p-2 border rounded"
            placeholder="Kullanıcı Adı"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        {/* Password */}
        <div className="mb-4">
          <label htmlFor="password" className="form-label">
            Şifre
          </label>
          <input
            type="password"
            id="password"
            className="w-full p-2 border rounded"
            placeholder="•••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Giriş Yap
        </button>
      </form>
    </div>
  );
}

export default Login;
