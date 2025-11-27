import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
axios.defaults.withCredentials = true;

function PermissionDropdown({ selectedPermissions, onChange }) {
  const [permissions, setPermissions] = useState([]);
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    axios.get("http://localhost:5000/permission")
      .then((res) => setPermissions(res.data))
      .catch(() => console.error("Permissions alınamadı"));
  }, []);

  const filtered = permissions.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="relative w-full">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-200"
        type="button"
      >
        <span className="truncate">
          {selectedPermissions.length > 0
            ? `${selectedPermissions.length} Yetki Seçildi`
            : "Yetkileri Seç"}
        </span>
        <svg className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-full bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <input
                type="text"
                placeholder="Yetki ara..."
                className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border-none rounded-lg focus:ring-2 focus:ring-teal-500/20 text-gray-900 placeholder-gray-400"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
          <ul className="max-h-60 overflow-y-auto p-2 space-y-1">
            {filtered.map((perm) => (
              <li key={perm._id}>
                <label className="flex items-center p-2 rounded-lg hover:bg-teal-50 cursor-pointer transition-colors duration-150 group">
                  <input
                    type="checkbox"
                    checked={selectedPermissions.includes(perm._id)}
                    onChange={() =>
                      onChange(
                        selectedPermissions.includes(perm._id)
                          ? selectedPermissions.filter((id) => id !== perm._id)
                          : [...selectedPermissions, perm._id]
                      )
                    }
                    className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500 transition duration-150 ease-in-out"
                  />
                  <span className="ml-3 text-sm font-medium text-gray-700 group-hover:text-teal-700">
                    {perm.name}
                  </span>
                </label>
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="p-4 text-center text-sm text-gray-500">Sonuç bulunamadı</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

function Admin() {
  const navigate = useNavigate();

  const [activeBlock, setActiveBlock] = useState("add_employee");

  // Navigation handlers
  const changeBlockEmployee = () => setActiveBlock("add_employee");
  const changeBlockRole = () => setActiveBlock("add_role");
  const changeBlockDepartment = () => setActiveBlock("add_department");
  const changeBlockDeleteDepartment = () => setActiveBlock("delete_department");
  const changeBlockPermission = () => setActiveBlock("add_permission");
  const changeBlockDeletePermission = () => setActiveBlock("delete_permission");
  const changeBlockViewJobs = () => setActiveBlock("view_jobs");
  const changeBlockViewUsers = () => setActiveBlock("view_users");

  const [searchTerm, setSearchTerm] = useState("");
  const [searchCategory, setSearchCategory] = useState("title");

  const [searchTerm2, setSearchTerm2] = useState("");
  const [searchCategory2, setSearchCategory2] = useState("username"); // Fixed default value

  const statusSteps = ["OPEN", "ASSIGNED", "IN_PROGRESS", "DONE"];
  const getStatusIndex = (status) => statusSteps.indexOf(status);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage2, setCurrentPage2] = useState(1);
  const [totalPages2, setTotalPages2] = useState(1);

  const [jobs, setJobs] = useState([]);
  const [user, setUser] = useState([]);

  const [departments, setDepartments] = useState([]);
  const [permissions, setPermission] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");

  // Data Fetching Effects
  useEffect(() => {
    axios.get("http://localhost:5000/admin/getalljobs", {
      params: {
        page: currentPage,
        limit: 3,
        searchCategory,
        searchTerm,
      },
      withCredentials: true,
    })
      .then((res) => {
        setJobs(res.data.jobs);
        setTotalPages(res.data.pagination.totalPages);
      })
      .catch((err) => {
        console.error(err);
        toast.error("İşler alınamadı");
      });
  }, [currentPage, searchCategory, searchTerm]);

  useEffect(() => {
    axios.get("http://localhost:5000/user", {
      params: {
        page: currentPage2,
        limit: 10,
        searchCategory: searchCategory2,
        searchTerm: searchTerm2,
      },
      withCredentials: true,
    })
      .then((res) => {
        setUser(res.data.users);
        setTotalPages2(res.data.pagination.totalPages);
      })
      .catch((err) => {
        toast.error("Kullanıcılar alınamadı");
      });
  }, [currentPage2, searchCategory2, searchTerm2]);

  useEffect(() => {
    axios.get("http://localhost:5000/departments")
      .then((res) => setDepartments(res.data))
      .catch((err) => toast.error("Departmanlar alınamadı"));
  }, []);

  useEffect(() => {
    axios.get("http://localhost:5000/permission")
      .then((res) => setPermission(res.data))
      .catch((err) => toast.error("Permission alınamadı"));
  }, []);

  useEffect(() => {
    axios.get("http://localhost:5000/role")
      .then((res) => setRoles(res.data))
      .catch((err) => toast.error("Roller alınamadı"));
  }, []);

  // Handlers
  const handleAddRole = async (e) => {
    e.preventDefault();
    const roleName = e.target.floating_first_name.value.trim();

    if (!roleName) {
      toast.warning("Rol adı boş bırakılamaz.");
      return;
    }
    if (selectedPermissions.length === 0) {
      toast.warning("En az bir yetki seçmelisiniz.");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/role/add", {
        name: roleName,
        permissions: selectedPermissions,
      }, { withCredentials: true });

      toast.success(`"${res.data.name}" rolü başarıyla eklendi!`);
      e.target.reset();
      setSelectedPermissions([]);
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || "Rol eklenirken bir hata oluştu.";
      toast.error(msg);
    }
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const username = formData.get("username");
    const password = formData.get("password");

    try {
      await axios.post("http://localhost:5000/user/add",
        {
          username,
          password,
          department: selectedDepartment,
          role: selectedRole
        },
        { withCredentials: true }
      );

      toast.success("Çalışan eklendi!");
      e.target.reset();
      setSelectedDepartment("");
      setSelectedRole("");
    } catch (err) {
      console.error(err.response?.data || err.message);
      toast.error(err.response?.data?.message ?? "Bir hata oluştu.");
    }
  };

  const handleAddPermission = async (e) => {
    e.preventDefault();
    const form = e.target;
    const PermissionName = form.departmentName.value.trim();

    if (!PermissionName) {
      toast.error("Permission adı boş olamaz!");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/permission/add", {
        name: PermissionName,
      }, { withCredentials: true });

      toast.success(response.data.message || "Permission başarıyla eklendi");
      form.reset();
    } catch (error) {
      toast.error(error.response?.data?.message || "Bir hata oluştu");
      console.error(error);
    }
  };

  const handleAddDepartment = async (e) => {
    e.preventDefault();
    const form = e.target;
    const departmentName = form.departmentName.value.trim();

    if (!departmentName) {
      toast.error("Departman adı boş olamaz!");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/departments/add", {
        name: departmentName,
      }, { withCredentials: true });

      toast.success(response.data.message || "Departman başarıyla eklendi");
      form.reset();
    } catch (error) {
      toast.error(error.response?.data?.message || "Bir hata oluştu");
      console.error(error);
    }
  };

  const MySwal = withReactContent(Swal);

  const handleDelete = async (id) => {
    const result = await MySwal.fire({
      title: 'Emin misiniz?',
      text: 'Bu kullanıcıyı silmek istediğinize emin misiniz?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Evet, sil',
      cancelButtonText: 'Vazgeç',
      confirmButtonColor: '#4f46e5',
      cancelButtonColor: '#ef4444',
    });

    if (!result.isConfirmed) return;

    try {
      const res = await axios.delete(`http://localhost:5000/admin/deleteuser/${id}`);

      if (res.status === 200) {
        setUser(user.filter((user) => user._id !== id));
        toast.success("Kullanıcı başarıyla silindi.");
      } else {
        toast.alert("Silme işlemi başarısız oldu.");
      }
    } catch (error) {
      console.error("Silme hatası:", error);
      toast.warning("Silme sırasında hata oluştu.");
    }
  };

  const handleDeleteJob = async (id) => {
    const result = await MySwal.fire({
      title: 'Emin misiniz?',
      text: 'Bu işi silmek istediğinize emin misiniz?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Evet, sil',
      cancelButtonText: 'Vazgeç',
      confirmButtonColor: '#4f46e5',
      cancelButtonColor: '#ef4444',
    });

    if (!result.isConfirmed) return;

    try {
      const res = await axios.delete(`http://localhost:5000/admin/deletejob/${id}`);

      if (res.status === 200) {
        setJobs(jobs.filter((job) => job._id !== id));
        toast.success("İş başarıyla silindi.");
      } else {
        toast.alert("Silme işlemi başarısız oldu.");
      }
    } catch (error) {
      console.error("Silme hatası:", error);
      toast.warning("Silme sırasında hata oluştu.");
    }
  };

  const handleDeletePermission = async (id) => {
    const result = await MySwal.fire({
      title: 'Emin misiniz?',
      text: 'Bu yetkiyi silmek istediğinize emin misiniz?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Evet, sil',
      cancelButtonText: 'Vazgeç',
      confirmButtonColor: '#4f46e5',
      cancelButtonColor: '#ef4444',
    });

    if (!result.isConfirmed) return;

    try {
      const res = await axios.delete(`http://localhost:5000/admin/deletepermission/${id}`);

      if (res.status === 200) {
        setPermission(permissions.filter((perm) => perm._id !== id));
        toast.success("Yetki başarıyla silindi.");
      } else {
        toast.alert("Silme işlemi başarısız oldu.");
      }
    } catch (error) {
      console.error("Silme hatası:", error);
      toast.warning("Silme sırasında hata oluştu.");
    }
  };

  const handleDeleteDepartment = async (id) => {
    const result = await MySwal.fire({
      title: 'Emin misiniz?',
      text: 'Bu departmanı silmek istediğinize emin misiniz?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Evet, sil',
      cancelButtonText: 'Vazgeç',
      confirmButtonColor: '#4f46e5',
      cancelButtonColor: '#ef4444',
    });

    if (!result.isConfirmed) return;

    try {
      const res = await axios.delete(`http://localhost:5000/admin/deletedepartment/${id}`);

      if (res.status === 200) {
        setDepartments(departments.filter((dept) => dept._id !== id));
        toast.success("Departman başarıyla silindi.");
      } else {
        toast.alert("Silme işlemi başarısız oldu.");
      }
    } catch (error) {
      console.error("Silme hatası:", error);
      toast.warning("Silme sırasında hata oluştu.");
    }
  };

  const handleLogout = (e) => {
    axios.post("http://localhost:5000/logout", {}, { withCredentials: true });
    localStorage.removeItem("userToken");
    window.location.reload();
  };

  // Helper for Sidebar Items
  const NavItem = ({ id, label, icon, onClick }) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${activeBlock === id
        ? "bg-gray-100 text-gray-900 shadow-sm" // Changed from teal-50 to gray-100
        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
        }`}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-gray-100 flex flex-col fixed h-full z-30 hidden lg:flex">
        <div className="p-6 border-b border-gray-50">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-teal-600 rounded-lg flex items-center justify-center shadow-teal-200 shadow-lg">
              <div className="h-3 w-3 bg-white rounded-full opacity-80"></div>
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
              Admin Panel
            </h1>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-4 mt-2">Yönetim</div>

          <NavItem
            id="add_employee"
            label="Çalışan Ekle"
            onClick={changeBlockEmployee}
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>}
          />
          <NavItem
            id="add_role"
            label="Rol Ekle"
            onClick={changeBlockRole}
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>}
          />
          <NavItem
            id="add_department"
            label="Departman Ekle"
            onClick={changeBlockDepartment}
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
          />
          <NavItem
            id="add_permission"
            label="Yetki Ekle"
            onClick={changeBlockPermission}
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>}
          />

          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-4 mt-8">Silme İşlemleri</div>

          <NavItem
            id="delete_department"
            label="Departman Sil"
            onClick={changeBlockDeleteDepartment}
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>}
          />
          <NavItem
            id="delete_permission"
            label="Yetki Sil"
            onClick={changeBlockDeletePermission}
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>}
          />

          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-4 mt-8">Görüntüleme</div>

          <NavItem
            id="view_jobs"
            label="İşleri Görüntüle"
            onClick={changeBlockViewJobs}
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>}
          />
          <NavItem
            id="view_users"
            label="Kullanıcıları Görüntüle"
            onClick={changeBlockViewUsers}
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
          />
        </div>

        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-colors duration-200"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Çıkış Yap
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-72 p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto">

          {/* Header */}
          <header className="mb-10 bg-gradient-to-r from-teal-50 via-white to-cyan-50 rounded-2xl p-8 border border-gray-100 shadow-sm">
            <div className="flex items-start gap-4">
              {/* Icon Section */}
              <div className="flex-shrink-0">
                <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-200">
                  {activeBlock === "add_employee" && (
                    <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                  )}
                  {activeBlock === "add_role" && (
                    <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  )}
                  {activeBlock === "add_department" && (
                    <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  )}
                  {activeBlock === "delete_department" && (
                    <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  )}
                  {activeBlock === "add_permission" && (
                    <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                  )}
                  {activeBlock === "delete_permission" && (
                    <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  )}
                  {activeBlock === "view_jobs" && (
                    <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                  )}
                  {activeBlock === "view_users" && (
                    <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  )}
                </div>
              </div>

              {/* Text Content */}
              <div className="flex-1">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-teal-900 to-cyan-900 bg-clip-text text-transparent tracking-tight">
                  {activeBlock === "add_employee" && "Yeni Çalışan Ekle"}
                  {activeBlock === "add_role" && "Yeni Rol Tanımla"}
                  {activeBlock === "add_department" && "Departman Oluştur"}
                  {activeBlock === "delete_department" && "Departman Sil"}
                  {activeBlock === "add_permission" && "Yetki Tanımla"}
                  {activeBlock === "delete_permission" && "Yetki Sil"}
                  {activeBlock === "view_jobs" && "İş Listesi ve Durumları"}
                  {activeBlock === "view_users" && "Kullanıcı Yönetimi"}
                </h2>
                <p className="mt-3 text-gray-600 leading-relaxed">
                  {activeBlock === "add_employee" && "Sisteme yeni bir personel kaydı oluşturun."}
                  {activeBlock === "add_role" && "Kullanıcı rolleri ve yetkilerini yapılandırın."}
                  {activeBlock === "add_department" && "Organizasyon şemasına yeni bir birim ekleyin."}
                  {activeBlock === "delete_department" && "Mevcut departmanları görüntüleyin ve silin."}
                  {activeBlock === "add_permission" && "Sistem genelinde yeni erişim izinleri tanımlayın."}
                  {activeBlock === "delete_permission" && "Mevcut yetkileri görüntüleyin ve silin."}
                  {activeBlock === "view_jobs" && "Tüm işleri, atamaları ve ilerleme durumlarını takip edin."}
                  {activeBlock === "view_users" && "Sistemdeki tüm kullanıcıları görüntüleyin ve yönetin."}
                </p>

                {/* Breadcrumb */}
                <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <span>Admin Panel</span>
                  <span>/</span>
                  <span className="text-teal-600 font-medium">
                    {activeBlock === "add_employee" && "Çalışan Ekle"}
                    {activeBlock === "add_role" && "Rol Ekle"}
                    {activeBlock === "add_department" && "Departman Ekle"}
                    {activeBlock === "delete_department" && "Departman Sil"}
                    {activeBlock === "add_permission" && "Yetki Ekle"}
                    {activeBlock === "delete_permission" && "Yetki Sil"}
                    {activeBlock === "view_jobs" && "İşler"}
                    {activeBlock === "view_users" && "Kullanıcılar"}
                  </span>
                </div>
              </div>
            </div>
          </header>

          {/* Content Blocks */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Add Employee Form */}
            {activeBlock === "add_employee" && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-2xl mx-auto">
                <form onSubmit={handleAddEmployee} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Kullanıcı Adı</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <input
                        name="username"
                        type="text"
                        className="block w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors"
                        placeholder="ornek_kullanici"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Şifre</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <input
                        name="password"
                        type="password"
                        className="block w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors"
                        placeholder="•••••••••"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Departman</label>
                      <select
                        value={selectedDepartment}
                        onChange={(e) => setSelectedDepartment(e.target.value)}
                        className="block w-full px-4 py-3 bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-300 rounded-xl shadow-sm hover:shadow-md focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all duration-200 font-medium text-gray-700 cursor-pointer"
                      >
                        <option value="">Seçiniz...</option>
                        {departments.map((dep) => (
                          <option key={dep._id} value={dep._id}>{dep.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Rol</label>
                      <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className="block w-full px-4 py-3 bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-300 rounded-xl shadow-sm hover:shadow-md focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all duration-200 font-medium text-gray-700 cursor-pointer"
                      >
                        <option value="">Seçiniz...</option>
                        {roles.map((rol) => (
                          <option key={rol._id} value={rol._id}>{rol.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5">
                      Çalışanı Kaydet
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Add Role Form */}
            {activeBlock === "add_role" && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-xl mx-auto">
                <form onSubmit={handleAddRole} className="space-y-8">
                  <div className="text-center mb-8">
                    <div className="mx-auto h-12 w-12 bg-teal-100 rounded-full flex items-center justify-center mb-4">
                      <svg className="h-6 w-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">Rol Detayları</h3>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rol Adı</label>
                    <input
                      type="text"
                      name="floating_first_name"
                      className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors"
                      placeholder="Örn: Süper Yönetici"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Yetkiler</label>
                    <PermissionDropdown
                      selectedPermissions={selectedPermissions}
                      onChange={setSelectedPermissions}
                    />
                    <p className="mt-2 text-xs text-gray-500">Bu role atanacak yetkileri listeden seçiniz.</p>
                  </div>

                  <button
                    type="submit"
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
                  >
                    Rolü Oluştur
                  </button>
                </form>
              </div>
            )}

            {/* Add Department Form */}
            {activeBlock === "add_department" && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-lg mx-auto">
                <div className="text-center mb-8">
                  <div className="mx-auto h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">Departman Bilgileri</h3>
                </div>
                <form onSubmit={handleAddDepartment} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Departman Adı</label>
                    <input
                      type="text"
                      name="departmentName"
                      className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors"
                      placeholder="Örn: İnsan Kaynakları"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
                  >
                    Ekle
                  </button>
                </form>
              </div>
            )}

            {/* Delete Department Block */}
            {activeBlock === "delete_department" && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-lg mx-auto">
                <div className="text-center mb-8">
                  <div className="mx-auto h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">Departman Listesi</h3>
                  <p className="mt-2 text-sm text-gray-500">Silmek istediğiniz departmanı seçin</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {departments.length === 0 ? (
                    <div className="col-span-full text-center py-8 text-gray-500">
                      <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <p className="text-sm">Henüz departman bulunmamaktadır</p>
                    </div>
                  ) : (
                    departments.map((dept) => {
                      const employeeCount = user.filter(u => u.department?._id === dept._id).length;
                      return (
                        <div
                          key={dept._id}
                          className="flex flex-col items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors group relative"
                        >
                          <div className="flex flex-col items-center gap-3 w-full">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                            </div>
                            <div className="text-center w-full">
                              <p className="text-sm font-medium text-gray-900 truncate">{dept.name}</p>
                              <p className="text-xs text-gray-500">
                                {employeeCount} Kişi
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteDepartment(dept._id)}
                            className="absolute top-2 right-2 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                            title="Sil"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* Add Permission Form */}
            {activeBlock === "add_permission" && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-lg mx-auto">
                <div className="text-center mb-8">
                  <div className="mx-auto h-12 w-12 bg-cyan-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="h-6 w-6 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">Yetki Tanımlama</h3>
                </div>
                <form onSubmit={handleAddPermission} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Yetki Adı</label>
                    <input
                      type="text"
                      name="departmentName"
                      className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors"
                      placeholder="Örn: user_delete"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
                  >
                    Ekle
                  </button>
                </form>
              </div>
            )}

            {/* Delete Permission Block */}
            {activeBlock === "delete_permission" && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-lg mx-auto">
                <div className="text-center mb-8">
                  <div className="mx-auto h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">Yetki Listesi</h3>
                  <p className="mt-2 text-sm text-gray-500">Silmek istediğiniz yetkiyi seçin</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {permissions.length === 0 ? (
                    <div className="col-span-full text-center py-8 text-gray-500">
                      <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      <p className="text-sm">Henüz yetki bulunmamaktadır</p>
                    </div>
                  ) : (
                    permissions.map((perm) => (
                      <div
                        key={perm._id}
                        className="flex flex-col items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors group relative"
                      >
                        <div className="flex flex-col items-center gap-3 w-full">
                          <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                            </svg>
                          </div>
                          <div className="text-center w-full">
                            <p className="text-sm font-medium text-gray-900 truncate">{perm.name}</p>
                            <p className="text-xs text-gray-500">ID: {perm._id.substring(0, 8)}...</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeletePermission(perm._id)}
                          className="absolute top-2 right-2 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                          title="Sil"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* View Jobs */}
            {activeBlock === "view_jobs" && (
              <div className="space-y-6">
                {/* Filters */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
                  <select
                    value={searchCategory}
                    onChange={(e) => setSearchCategory(e.target.value)}
                    className="px-4 py-2.5 bg-gradient-to-br from-white to-gray-50 border border-gray-300 rounded-lg text-sm shadow-sm hover:shadow focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all duration-200 font-medium text-gray-700 cursor-pointer"
                  >
                    <option value="title">Başlık</option>
                    <option value="personnel">Atanan</option>
                    <option value="content">İçerik</option>
                  </select>
                  <div className="relative flex-1">
                    <input
                      type="search"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Ara..."
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    />
                    <svg className="w-4 h-4 text-gray-400 absolute left-3 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>

                {/* Jobs List */}
                <div className="space-y-4">
                  {jobs.map((job) => (
                    <div key={job._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200">
                      <div className="flex flex-col md:flex-row">
                        {/* Image/Attachment Section */}
                        <div className="w-full md:w-64 h-48 md:h-auto bg-gray-100 flex-shrink-0 relative">
                          {(() => {
                            const attachment = job.attachments?.[0];
                            if (!attachment) {
                              return (
                                <div className="flex flex-col items-center justify-center h-full p-4 text-center bg-gray-50">
                                  <svg className="w-12 h-12 text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                  <span className="text-sm text-gray-400 font-medium">Dosya Yok</span>
                                </div>
                              );
                            }
                            const fileUrl = `data:${attachment.mimetype};base64,${attachment.data}`;
                            if (attachment.mimetype.startsWith("image/")) {
                              return <img src={fileUrl} alt={attachment.filename} className="w-full h-full object-cover" />;
                            } else {
                              return (
                                <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                                  <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                  <span className="text-xs text-gray-500 truncate w-full">{attachment.filename}</span>
                                </div>
                              );
                            }
                          })()}
                        </div>

                        {/* Content Section */}
                        <div className="p-6 flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start">
                              <h3 className="text-lg font-bold text-gray-900 mb-2">{job.title}</h3>
                              <button onClick={() => handleDeleteJob(job._id)} className="text-gray-400 hover:text-red-600 transition-colors p-1">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                              </button>
                            </div>
                            <p className="text-gray-600 text-sm mb-6 line-clamp-2">{job.description || "Açıklama yok."}</p>
                          </div>

                          {/* Progress Steps */}
                          <div className="mb-6">
                            <div className="flex items-center justify-between w-full relative">
                              <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-100 -z-10"></div>
                              {statusSteps.map((step, index) => {
                                const isDone = getStatusIndex(job.status) >= index;
                                return (
                                  <div key={step} className="flex flex-col items-center bg-white px-2">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors duration-300 ${isDone ? 'bg-teal-600 text-white shadow-lg shadow-teal-200' : 'bg-gray-100 text-gray-400'}`}>
                                      {isDone ? '✓' : index + 1}
                                    </div>
                                    <span className={`text-[10px] mt-1 font-medium ${isDone ? 'text-teal-600' : 'text-gray-400'}`}>{step}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Footer Info */}
                          <div className="flex items-center gap-4 text-xs text-gray-500 border-t border-gray-50 pt-4">
                            <div className="flex items-center gap-1">
                              <span className="font-semibold">Departman:</span> {job.department?.name}
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="font-semibold">Gönderen:</span> {job.createdBy?.username}
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="font-semibold">Atanan:</span>
                              <span className="bg-gray-100 px-2 py-0.5 rounded-full text-gray-700">
                                {job.assignedTo?.username || job.assignedTo?.name || "Yok"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                <div className="flex justify-center gap-2 mt-8">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                    className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Önceki
                  </button>
                  <span className="px-4 py-2 text-sm text-gray-600">Sayfa {currentPage} / {totalPages}</span>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                    className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Sonraki
                  </button>
                </div>
              </div>
            )}

            {/* View Users */}
            {activeBlock === "view_users" && (
              <div className="space-y-6">
                {/* Filters */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
                  <select
                    value={searchCategory2}
                    onChange={(e) => setSearchCategory2(e.target.value)}
                    className="px-4 py-2.5 bg-gradient-to-br from-white to-gray-50 border border-gray-300 rounded-lg text-sm shadow-sm hover:shadow focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all duration-200 font-medium text-gray-700 cursor-pointer"
                  >
                    <option value="username">Kullanıcı Adı</option>
                    <option value="department">Departman</option>
                  </select>
                  <div className="relative flex-1">
                    <input
                      type="search"
                      value={searchTerm2}
                      onChange={(e) => setSearchTerm2(e.target.value)}
                      placeholder="Kullanıcı ara..."
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    />
                    <svg className="w-4 h-4 text-gray-400 absolute left-3 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>

                {/* Users Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                      <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-100">
                        <tr>
                          <th className="px-6 py-4 font-semibold">Kullanıcı Adı</th>
                          <th className="px-6 py-4 font-semibold">Rol</th>
                          <th className="px-6 py-4 font-semibold">Departman</th>
                          <th className="px-6 py-4 font-semibold">Durum</th>
                          <th className="px-6 py-4 font-semibold text-center">İşlemler</th>
                        </tr>
                      </thead>
                      <tbody>
                        {user?.map((u) => (
                          <tr key={u._id} className="bg-white border-b border-gray-50 hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 font-medium text-gray-900">{u.username}</td>
                            <td className="px-6 py-4">
                              <span className="bg-teal-50 text-teal-700 px-2 py-1 rounded-md text-xs font-medium border border-teal-100">
                                {u.role?.name || "—"}
                              </span>
                            </td>
                            <td className="px-6 py-4">{u.department?.name || "—"}</td>
                            <td className="px-6 py-4">
                              {u.isActive ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
                                  <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span>
                                  Aktif
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700">
                                  <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                                  Pasif
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex justify-center gap-2">
                                <button
                                  onClick={() => navigate(`/user/edit/${u._id}`)}
                                  className="p-2 text-gray-500 hover:text-teal-600 hover:bg-gray-100 rounded-lg transition-colors"
                                  title="Düzenle"
                                >
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                </button>
                                <button
                                  onClick={() => handleDelete(u._id)}
                                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded-lg transition-colors"
                                  title="Sil"
                                >
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Pagination */}
                <div className="flex justify-center gap-2 mt-8">
                  <button
                    disabled={currentPage2 === 1}
                    onClick={() => setCurrentPage2(p => Math.max(p - 1, 1))}
                    className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Önceki
                  </button>
                  <span className="px-4 py-2 text-sm text-gray-600">Sayfa {currentPage2} / {totalPages2}</span>
                  <button
                    disabled={currentPage2 === totalPages2}
                    onClick={() => setCurrentPage2(p => Math.min(p + 1, totalPages2))}
                    className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Sonraki
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}

export default Admin;

