import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const EditUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    department: "",
    role: "",
    isActive: true,
  });

  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);

  // Kullanıcı verisini çek
  useEffect(() => {
    axios
      .get(`http://localhost:5000/admin/userduzenle/${id}`, { withCredentials: true })
      .then((res) => {
        const u = res.data;
        setForm({
          username: u.username,
          department: u.department?._id || "",
          role: u.role?._id || "",
          isActive: u.isActive,
        });
      })
      .catch(() => toast.error("Kullanıcı bilgileri alınamadı"));
  }, [id]);

  // Departmanları getir
  useEffect(() => {
    axios
      .get("http://localhost:5000/departments")
      .then((res) => setDepartments(res.data))
      .catch(() => toast.error("Departmanlar alınamadı"));
  }, []);

  // Rolleri getir
  useEffect(() => {
    axios
      .get("http://localhost:5000/role")
      .then((res) => setRoles(res.data))
      .catch(() => toast.error("Roller alınamadı"));
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .put(`http://localhost:5000/admin/duzenle/${id}`, form, { withCredentials: true })
      .then(() => {
        toast.success("Kullanıcı güncellendi");
        navigate("/admin");
      })
      .catch(() => toast.error("Güncelleme başarısız"));
  };

  return (
    <div className="p-6 max-w-xl mx-auto mt-8 bg-white rounded-lg shadow-md dark:bg-gray-800">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-100">Kullanıcıyı Düzenle</h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kullanıcı Adı</label>
          <input
            name="username"
            value={form.username}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-md focus:ring focus:ring-blue-300 dark:bg-gray-700 dark:text-white"
            placeholder="Kullanıcı Adı"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Departman</label>
          <select
            name="department"
            value={form.department}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-md focus:ring focus:ring-blue-300 dark:bg-gray-700 dark:text-white"
          >
            <option value="">Departman Seç</option>
            {departments.map((d) => (
              <option key={d._id} value={d._id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rol</label>
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-md focus:ring focus:ring-blue-300 dark:bg-gray-700 dark:text-white"
          >
            <option value="">Rol Seç</option>
            {roles.map((r) => (
              <option key={r._id} value={r._id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            name="isActive"
            checked={form.isActive}
            onChange={handleChange}
            className="w-4 h-4 text-blue-600 rounded border-gray-300 dark:bg-gray-700 dark:border-gray-600"
          />
          <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">Aktif</label>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
        >
          Kaydet
        </button>
      </form>
    </div>
  );
};

export default EditUser;
