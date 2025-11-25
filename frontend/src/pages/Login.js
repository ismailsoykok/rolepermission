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
    <div className="min-h-screen w-full flex items-center justify-center bg-[#eef2f6] p-4 font-sans">
      <div className="w-full max-w-[1000px] bg-white rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col lg:flex-row min-h-[600px] border border-gray-100">

        {/* Visual Side (Left) */}
        <div className="relative w-full lg:w-1/2 bg-black overflow-hidden flex flex-col justify-between p-12 text-white">
          {/* Background Gradients */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_#4338ca_0%,_#000000_70%)] opacity-90"></div>
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>

          {/* Abstract Shapes */}
          <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-purple-600 rounded-full mix-blend-screen filter blur-[100px] opacity-30 animate-pulse"></div>
          <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] bg-indigo-500 rounded-full mix-blend-screen filter blur-[100px] opacity-30 animate-pulse delay-1000"></div>

          {/* Logo / Brand Placeholder */}
          <div className="relative z-10">
            <div className="h-10 w-10 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 flex items-center justify-center shadow-inner">
              <div className="h-4 w-4 bg-white rounded-full opacity-80"></div>
            </div>
          </div>

          {/* Hero Text */}
          <div className="relative z-10 space-y-6 mt-auto mb-auto">
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight leading-[1.1]">
              Yönetim <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300">
                Paneli
              </span>
            </h1>
            <p className="text-lg text-gray-400 font-light max-w-sm leading-relaxed">
              İş akışınızı optimize edin, verilerinizi güvenle yönetin.
            </p>
          </div>

          {/* Footer */}
          <div className="relative z-10 text-xs text-gray-500 font-medium tracking-widest uppercase mt-auto">
            © 2024 RolePermission
          </div>
        </div>

        {/* Form Side (Right) */}
        <div className="w-full lg:w-1/2 bg-[#f8fafc] p-8 sm:p-12 lg:p-16 flex flex-col justify-center relative">
          <div className="w-full max-w-sm mx-auto space-y-8">
            <div className="space-y-2 text-center lg:text-left">
              <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">
                Tekrar Hoşgeldiniz
              </h2>
              <p className="text-sm text-gray-500">
                Hesabınıza erişmek için bilgilerinizi girin
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleLogin}>
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <label
                    htmlFor="username"
                    className="block text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1"
                  >
                    Kullanıcı Adı
                  </label>
                  <input
                    type="text"
                    id="username"
                    required
                    className="block w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200 hover:bg-white focus:bg-white"
                    placeholder="Kullanıcı adınız"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="password"
                    className="block text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1"
                  >
                    Şifre
                  </label>
                  <input
                    type="password"
                    id="password"
                    required
                    className="block w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200 hover:bg-white focus:bg-white"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex justify-center items-center py-3.5 px-4 bg-gray-900 hover:bg-black text-white text-sm font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-all duration-200 shadow-lg shadow-gray-900/20 hover:shadow-gray-900/30 hover:-translate-y-0.5"
              >
                Giriş Yap
              </button>
            </form>

            <div className="pt-2 text-center">
              <p className="text-xs text-gray-400">
                Güvenli giriş sistemi
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
