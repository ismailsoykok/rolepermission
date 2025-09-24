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
    <div className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        type="button"
      >
        Dropdown search
        <svg className="w-2.5 h-2.5 ml-2.5" fill="none" viewBox="0 0 10 6">
          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1l4 4 4-4" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute left-1/2 -translate-x-1/2 z-10 mt-2 bg-white rounded-lg shadow-sm w-60 dark:bg-gray-700">

          <div className="p-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search permission"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 20 20">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                </svg>
              </div>
            </div>
          </div>
          <ul className="h-48 px-3 pb-3 overflow-y-auto text-sm text-gray-700 dark:text-gray-200">
            {filtered.map((perm) => (
              <li key={perm._id}>
                <div className="flex items-center p-2 rounded-sm hover:bg-gray-100 dark:hover:bg-gray-600">
                  <input
                    id={`perm-${perm._id}`}
                    type="checkbox"
                    checked={selectedPermissions.includes(perm._id)}
                    onChange={() =>
                      onChange(
                        selectedPermissions.includes(perm._id)
                          ? selectedPermissions.filter((id) => id !== perm._id)
                          : [...selectedPermissions, perm._id]
                      )
                    }
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:bg-gray-600 dark:border-gray-500"
                  />
                  <label
                    htmlFor={`perm-${perm._id}`}
                    className="w-full ml-2 text-sm font-medium text-gray-900 rounded-sm dark:text-gray-300"
                  >
                    {perm.name}
                  </label>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}



function Admin() {
  const navigate = useNavigate();

  const [activeBlock, setActiveBlock] = useState("add_employee");
  const changeBlockEmployee = () => setActiveBlock("add_employee");
  const changeBlockRole = () => setActiveBlock("add_role");
  const changeBlockDepartment = () => setActiveBlock("add_department");
  const changeBlockPermission = () => setActiveBlock("add_permission");
  const changeBlockViewJobs = () => setActiveBlock("view_jobs");
  const changeBlockViewUsers = () => setActiveBlock("view_users");


  const [searchTerm, setSearchTerm] = useState("");
  const [searchCategory, setSearchCategory] = useState("title");

  const [searchTerm2, setSearchTerm2] = useState("");
  const [searchCategory2, setSearchCategory2] = useState("title");


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


  useEffect(() => {
    axios
      .get("http://localhost:5000/admin/getalljobs", {
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
    axios
      .get("http://localhost:5000/user", {
        params: {
          page: currentPage2,
          limit: 10,
          searchCategory: searchCategory2,  // backend tarafında parametre ismi böyle olmalı
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
  }, [currentPage2, searchCategory2, searchTerm2]);  // bağımlılıklar tek dizi içinde olmalı


  useEffect(() => {
    axios
      .get("http://localhost:5000/departments")
      .then((res) => setDepartments(res.data))
      .catch((err) => {
        toast.error("Departmanlar alınamadı", err);
        // Hata yönetimi istersen buraya ekleyebilirsin
      });
  }, []);

  useEffect(() => {
    axios
      .get("http://localhost:5000/permission")
      .then((res) => setPermission(res.data))
      .catch((err) => {
        toast.error("Permission alınamadı", err);
        // Hata yönetimi istersen buraya ekleyebilirsin
      });
  }, []);

  useEffect(() => {
    axios
      .get("http://localhost:5000/role")
      .then((res) => setRoles(res.data))
      .catch((err) => {
        toast.error("Roller alınamadı", err);
        // Hata yönetimi istersen buraya ekleyebilirsin
      });
  }, []);


  const handleAddRole = async (e) => {
    e.preventDefault();

    // input’un name değeri: floating_first_name
    const roleName = e.target.floating_first_name.value.trim();

    // Basit doğrulama
    if (!roleName) {
      toast.warning("Rol adı boş bırakılamaz.");
      return;
    }
    if (selectedPermissions.length === 0) {
      toast.warning("En az bir yetki seçmelisiniz.");
      return;
    }

    try {
      // Yetkileri ObjectId dizisi olarak gönderiyoruz
      const res = await axios.post("http://localhost:5000/role/add", {
        name: roleName,
        permissions: selectedPermissions,
      }, { withCredentials: true });

      toast.success(`"${res.data.name}" rolü başarıyla eklendi!`);

      // Formu sıfırla
      e.target.reset();
      setSelectedPermissions([]);
    } catch (err) {
      console.error(err);
      const msg =
        err.response?.data?.message || "Rol eklenirken bir hata oluştu.";
      toast.error(msg);
    }
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();

    // Form‑alanlarını doğrudan topla
    const formData = new FormData(e.target);
    const username = formData.get("username");   // <input name="username" …>
    const password = formData.get("password");   // <input name="password" …>

    try {
      await axios.post(
        "http://localhost:5000/user/add",
        {
          username,            // string
          password,            // string
          department: selectedDepartment, // ObjectId
          role: selectedRole        // ObjectId
        },
        { withCredentials: true }
      );

      toast.success("Çalışan eklendi!");
      e.target.reset();          // formu sıfırla
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
    });

    if (!result.isConfirmed) return;

    try {
      const res = await axios.delete(`http://localhost:5000/admin/deletejob/${id}`);

      if (res.status === 200) {
        setJobs(jobs.filter((job) => job._id !== id));
        toast.success("Kullanıcı başarıyla silindi.");
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
    window.location.reload(); // sayfayı yeniden yükle
  };
  return (

    <div className="admin-page p-4">



      <nav className="bg-white dark:bg-gray-900 fixed w-full z-20 top-0 start-0 border-b border-gray-200 dark:border-gray-600" style={{ height: "60px" }}>
        <div className="navbar-content flex items-center justify-between px-4 h-full">
          <h1
            className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-900 to-blue-500"
            style={{ marginTop: 0, marginBottom: 0 }}
          >
            CRM
          </h1>

          <button
            onClick={handleLogout}
            style={{ width: '100px', height: '35px' }}
            className="text-white bg-red-400 hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-300 font-medium rounded-md text-sm px-3 py-1.5 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900"
          >
            Çıkış Yap
          </button>


        </div>
      </nav>



      {/* navbar yüksekliği kadar boşluk bırak */}
      <div style={{ paddingTop: "60px" }}>
        <div className="flex justify-center mt-4">
          <div className="inline-flex rounded-md shadow-xs" role="group">
            {/* Butonlar */}
            <button
              onClick={changeBlockEmployee}
              type="button"
              className="w-36 px-4 py-2 text-sm font-medium text-gray-900 bg-transparent border border-gray-900 rounded-s-lg hover:bg-gray-700 hover:text-white focus:z-10 focus:ring-2 focus:ring-gray-500 focus:bg-gray-700 focus:text-white dark:border-white dark:text-white dark:hover:text-white dark:hover:bg-gray-600 dark:focus:bg-gray-600"
            >
              Çalışan Ekle
            </button>
            <button
              onClick={changeBlockDepartment}
              type="button"
              className="w-36 px-4 py-2 text-sm font-medium text-gray-900 bg-transparent border-t border-b border-gray-900 hover:bg-gray-700 hover:text-white focus:z-10 focus:ring-2 focus:ring-gray-500 focus:bg-gray-700 focus:text-white dark:border-white dark:text-white dark:hover:text-white dark:hover:bg-gray-600 dark:focus:bg-gray-600"
            >
              Departman Ekle
            </button>
            <button
              onClick={changeBlockRole}
              type="button"
              className="w-36 px-4 py-2 text-sm font-medium text-gray-900 bg-transparent border-t border-b border-gray-900 hover:bg-gray-700 hover:text-white focus:z-10 focus:ring-2 focus:ring-gray-500 focus:bg-gray-700 focus:text-white dark:border-white dark:text-white dark:hover:text-white dark:hover:bg-gray-600 dark:focus:bg-gray-600"
            >
              Rol Ekle
            </button>
            <button
              onClick={changeBlockPermission}
              type="button"
              className="w-36 px-4 py-2 text-sm font-medium text-gray-900 bg-transparent border-t border-b border-gray-900 hover:bg-gray-700 hover:text-white focus:z-10 focus:ring-2 focus:ring-gray-500 focus:bg-gray-700 focus:text-white dark:border-white dark:text-white dark:hover:text-white dark:hover:bg-gray-600 dark:focus:bg-gray-600"
            >
              Yetki Ekle
            </button>
            <button
              onClick={changeBlockViewJobs}
              type="button"
              className="w-36 px-4 py-2 text-sm font-medium text-gray-900 bg-transparent border-t border-b border-gray-900 hover:bg-gray-700 hover:text-white focus:z-10 focus:ring-2 focus:ring-gray-500 focus:bg-gray-700 focus:text-white dark:border-white dark:text-white dark:hover:text-white dark:hover:bg-gray-600 dark:focus:bg-gray-600"
            >
              İşleri Görüntüle
            </button>
            <button
              onClick={changeBlockViewUsers}
              type="button"
              className="w-36 px-4 py-2 text-sm font-medium text-gray-900 bg-transparent border border-gray-900 rounded-e-lg hover:bg-gray-700 hover:text-white focus:z-10 focus:ring-2 focus:ring-gray-500 focus:bg-gray-700 focus:text-white dark:border-white dark:text-white dark:hover:text-white dark:hover:bg-gray-600 dark:focus:bg-gray-600"
            >
              Kullanıcıları Görüntüle
            </button>
          </div>
        </div>




        {activeBlock === "add_employee" && (
          <div className="flex justify-center items-start mt-10">
            <form onSubmit={handleAddEmployee} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md w-full max-w-md space-y-4">
              <label htmlFor="website-admin" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Username (Eşsiz bir yapıda olmalıdır)
              </label>
              <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 px-3">
                <svg
                  className="w-5 h-5 text-gray-500 dark:text-gray-400"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 0a10 10 0 1 0 10 10A10.011 10.011 0 0 0 10 0Zm0 5a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm0 13a8.949 8.949 0 0 1-4.951-1.488A3.987 3.987 0 0 1 9 13h2a3.987 3.987 0 0 1 3.951 3.512A8.949 8.949 0 0 1 10 18Z" />
                </svg>
                <input
                  name="username"
                  type="text"
                  id="website-admin"
                  className="flex-1 bg-transparent border-none focus:ring-0 text-gray-900 dark:text-white placeholder-gray-400 p-2.5 text-sm"
                  placeholder="Çalışan için bir username ekleyiniz"
                />
              </div>

              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Şifre
              </label>
              <input
                name="password"
                type="password"
                id="password"
                className="w-full p-2.5 text-sm text-gray-900 bg-gray-50 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="•••••••••"
                required
              />
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}  // Burada setSelectedDepartment kullanılacak
                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              >
                <option value="">Departman Seçiniz</option>
                {departments.map((dep) => (
                  <option key={dep._id} value={dep._id}>
                    {dep.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}  // Burada setSelectedDepartment kullanılacak
                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              >
                <option value="">Rol seçiniz</option>
                {roles.map((rol) => (
                  <option key={rol._id} value={rol._id}>
                    {rol.name}
                  </option>
                ))}
              </select>


              <button type="submit" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Çalışanı Ekle</button>


            </form>
          </div>

        )}

        {activeBlock === "add_role" && (
          <div className="flex justify-center items-center  pt-4">
            <form onSubmit={handleAddRole} className="flex flex-col gap-6 w-80 p-6 bg-white rounded-lg shadow-md border dark:bg-gray-800 dark:border-gray-700">

              <h2 className="text-lg font-semibold text-gray-900 dark:text-white text-center">
                Rol Ekle
              </h2>

              <PermissionDropdown
                selectedPermissions={selectedPermissions}
                onChange={setSelectedPermissions}
              />

              <div className="relative z-0 w-full group">
                <input
                  type="text"
                  name="floating_first_name"
                  id="floating_first_name"
                  className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                  placeholder=" "
                  required
                />
                <label
                  htmlFor="floating_first_name"
                  className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:scale-75 peer-focus:-translate-y-6"
                >
                  Rol Adı
                </label>
              </div>

              <button
                type="submit"
                className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              >
                Rolü Ekle
              </button>
            </form>
          </div>
        )}


        {activeBlock === "add_department" && (
          <div className="flex justify-center mt-6">
            <form
              onSubmit={handleAddDepartment}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md w-full max-w-md space-y-4"
            >
              <label
                htmlFor="department-name"
                className="block mb-1 text-sm font-medium text-gray-900 dark:text-white"
              >
                Departman Ekleyin
              </label>

              <input
                type="text"
                id="department-name"
                name="departmentName"
                placeholder="Departman adı"
                required
                className="block w-full p-2 text-gray-900 border border-gray-300 rounded-md bg-gray-50 text-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              />

              <button
                type="submit"
                class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              >
                Departmanı Ekle
              </button>
            </form>
          </div>
        )}


        {activeBlock === "add_permission" && (
          <div className="flex justify-center mt-6">
            <form
              onSubmit={handleAddPermission}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md w-full max-w-md space-y-4"
            >
              <label
                htmlFor="department-name"
                className="block mb-1 text-sm font-medium text-gray-900 dark:text-white"
              >
                Yetki Ekleyin
              </label>

              <input
                type="text"
                id="department-name"
                name="departmentName"
                placeholder="Departman adı"
                required
                className="block w-full p-2 text-gray-900 border border-gray-300 rounded-md bg-gray-50 text-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              />

              <button
                type="submit"
                class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              >
                Yetki Ekle
              </button>
            </form>






          </div>
        )}

        {activeBlock === "view_jobs" && (
          <div className="flex flex-col items-center pt-6 px-4 space-y-6">

            <div className="w-full max-w-2xl flex">
              {/* Kategori seçimi (select) */}
              <select
                value={searchCategory}
                onChange={(e) => setSearchCategory(e.target.value)}
                className="w-40 py-3 px-4 text-sm text-gray-700 bg-white border border-gray-300 rounded-l-lg
               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
               dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:focus:ring-blue-500 dark:focus:border-blue-500"
              >
                <option value="title">BAŞLIK</option>
                <option value="personnel">ATANAN</option>
                <option value="content">İÇERİK</option>
              </select>

              {/* Arama kutusu */}
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg
                    className="w-4 h-4 text-gray-500 dark:text-gray-400"
                    fill="none"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                    />
                  </svg>
                </div>
                <input
                  type="search"
                  id="default-search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={`${searchCategory === "title" ? "Başlığa" : searchCategory === "personnel" ? "Personele" : "İçeriğe"} göre ara...`}
                  className="block w-full py-3 pl-10 pr-4 text-sm text-gray-900 border border-gray-300 rounded-r-lg
                 bg-gray-50 focus:ring-blue-500 focus:border-blue-500
                 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white
                 dark:focus:ring-blue-500 dark:focus:border-blue-500"
                />
              </div>
            </div>


            {/* Kartlar */}
            {jobs.map((job) => (
              <div
                key={job._id}
                className="w-full max-w-4xl border border-gray-300 dark:border-gray-600 rounded-lg p-6 flex flex-col md:flex-row items-center bg-white dark:bg-gray-800 shadow-sm"
              >
                {/* Görsel */}
                <div className="w-full md:w-1/2 flex justify-center items-center mb-4 md:mb-0">
                  {(() => {
                    const attachment = job.attachments?.[0];

                    if (!attachment) {
                      return (
                        <img
                          className="rounded-sm object-cover w-full h-48 sm:w-96"
                          src="https://via.placeholder.com/300x200"
                          alt="Varsayılan görsel"
                        />
                      );
                    }

                    const fileUrl = `data:${attachment.mimetype};base64,${attachment.data}`;

                    if (attachment.mimetype.startsWith("image/")) {
                      return (
                        <img
                          src={fileUrl}
                          alt={attachment.filename}
                          className="rounded-sm object-cover w-full h-48 sm:w-96"
                        />
                      );
                    } else if (attachment.mimetype === "application/pdf") {
                      return (
                        <embed
                          src={fileUrl}
                          type="application/pdf"
                          width="100%"
                          height="400px"
                          className="rounded-sm"
                        />
                      );
                    } else {
                      return (
                        <div className="flex flex-col items-center justify-center w-full h-48 sm:w-96 bg-gray-100 dark:bg-gray-700 rounded-sm p-4 text-center">
                          <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{attachment.filename}</p>
                          <a
                            href={fileUrl}
                            download={attachment.filename}
                            className="text-blue-600 hover:underline dark:text-blue-400"
                          >
                            Dosyayı indir
                          </a>
                        </div>
                      );
                    }
                  })()}
                </div>


                {/* Metin + Adım Çubuğu */}
                <div className="w-full md:w-1/2 pl-0 md:pl-6">
                  <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                    {job.title}
                  </h2>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                    {job.description || "Açıklama bulunamadı."}
                  </p>

                  {/* Aşama Çubuğu */}
                  <ol className="flex items-center w-full">
                    {statusSteps.map((step, index) => {
                      const isDone = getStatusIndex(job.status) >= index;

                      return (
                        <li
                          key={step}
                          className={`flex flex-col items-center w-full ${index !== statusSteps.length - 1
                            ? "after:content-[''] after:w-full after:h-1 after:border-b after:border-4 after:inline-block " +
                            (isDone
                              ? "after:border-blue-600 dark:after:border-blue-400"
                              : "after:border-gray-300 dark:after:border-gray-600")
                            : ""
                            }`}
                        >
                          {/* Step adı */}
                          <span className="mb-1 text-xs text-gray-500 dark:text-gray-400">{step}</span>

                          {/* Daire */}
                          <span
                            className={`flex items-center justify-center w-8 h-8 rounded-full shrink-0 ${isDone
                              ? (index === statusSteps.length - 1
                                ? "bg-green-600 text-white"    // Son tamamlanan adım yeşil
                                : "bg-blue-600 text-white")    // Diğer tamamlananlar mavi
                              : "bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-300"
                              }`}

                          >
                            {isDone ? (
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            ) : (
                              index + 1
                            )}
                          </span>

                          <svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16.881 16H7.119a1 1 0 0 1-.772-1.636l4.881-5.927a1 1 0 0 1 1.544 0l4.88 5.927a1 1 0 0 1-.77 1.636Z" />
                          </svg>

                        </li>
                      );
                    })}
                  </ol>
                  <div className="text-left rtl:text-right text-gray-500 dark:text-gray-400">
                    Departman  : {job.department.name}
                  </div>
                  <div className="text-left rtl:text-right text-gray-500 dark:text-gray-400">
                    İşi Gönderen : {job.createdBy.username}
                  </div>
                  {job.assignedTo === null ? (
                    <div className="text-left rtl:text-right text-gray-500 dark:text-gray-400">
                      Atanan: {"Yok"}
                    </div>
                  ) : (<div className="text-left rtl:text-right text-gray-500 dark:text-gray-400">
                    Atanan: {job.assignedTo.username || job.assignedTo.name || "Bilinmiyor"}
                  </div>)}
                </div>

              <button onClick={() => handleDeleteJob(job._id)} className="inline-flex items-center justify-center w-10 h-10 bg-transparent border-none outline-none hover:bg-transparent focus:outline-none"> <svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 7h14m-9 3v8m4-8v8M10 3h4a1 1 0 0 1 1 1v3H9V4a1 1 0 0 1 1-1ZM6 7h12v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7Z"/>
</svg></button> 

              </div>
            ))}

            {/* Pagination */}
            <nav className="flex items-center justify-center mt-4 mb-6">
              <ul className="inline-flex -space-x-px text-sm">
                {/* Önceki */}
                <li>
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    className="px-3 py-2 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                  >
                    Önceki
                  </button>
                </li>

                {/* Sayfa Numaraları */}
                {[...Array(totalPages)].map((_, i) => (
                  <li key={i}>
                    <button
                      onClick={() => setCurrentPage(i + 1)}
                      className={`px-3 py-2 leading-tight border ${currentPage === i + 1
                        ? "text-white bg-blue-600 border-blue-600"
                        : "text-gray-500 bg-white border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                        }`}
                    >
                      {i + 1}
                    </button>
                  </li>
                ))}

                {/* Sonraki */}
                <li>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                    className="px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                  >
                    Sonraki
                  </button>
                </li>
              </ul>
            </nav>
          </div>



        )}

        {activeBlock === "view_users" && (
          <div>
            {/* Arama alanı */}
            <div className="w-full max-w-2xl flex justify-center">
              {/* Kategori seçimi (select) */}
              <select
                value={searchCategory2}
                onChange={(e) => setSearchCategory2(e.target.value)}
                className="w-40 py-3 px-4 text-sm text-gray-700 bg-white border border-gray-300 rounded-l-lg
               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
               dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:focus:ring-blue-500 dark:focus:border-blue-500"
              >
                <option value="username">Kullanıcı Adı</option>
                <option value="department">Departman </option>

              </select>

              {/* Arama kutusu */}
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg
                    className="w-4 h-4 text-gray-500 dark:text-gray-400"
                    fill="none"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                    />
                  </svg>
                </div>
                <input
                  type="search"
                  id="default-search"
                  value={searchTerm2}
                  onChange={(e) => setSearchTerm2(e.target.value)}
                  placeholder={`${searchCategory2 === "username"
                    ? "Kullanıcı adına"
                    : "Departmana"
                    } göre ara...`}

                  className="block w-full py-3 pl-10 pr-4 text-sm text-gray-900 border border-gray-300 rounded-r-lg
                 bg-gray-50 focus:ring-blue-500 focus:border-blue-500
                 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white
                 dark:focus:ring-blue-500 dark:focus:border-blue-500"
                />
              </div>
            </div>

            <div className="overflow-x-auto mt-6">
              <table className="min-w-full text-sm text-left text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-800 dark:text-gray-300">
                  <tr>
                    <th scope="col" className="px-6 py-3">Kullanıcı Adı</th>
                    <th scope="col" className="px-6 py-3">Rol</th>
                    <th scope="col" className="px-6 py-3">Departman</th>
                    <th scope="col" className="px-6 py-3">Durum</th>
                    <th scope="col" className="px-6 py-3 text-center">İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {user?.map((u) => (
                    <tr key={u._id} className="bg-white border-b dark:bg-gray-900 dark:border-gray-700">
                      <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                        {u.username}
                      </td>
                      <td className="px-6 py-4">
                        {u.role?.name || "—"}
                      </td>
                      <td className="px-6 py-4">
                        {u.department?.name || "—"}
                      </td>
                      <td className="px-6 py-4">
                        {u.isActive ? (
                          <span className="text-green-600 font-semibold">✓ Aktif</span>
                        ) : (
                          <span className="text-red-600 font-semibold">✗ Pasif</span>
                        )}
                      </td>
                      <td className="px-6 py-4 flex justify-center gap-1">
                        <button
                          onClick={() => navigate(`/user/edit/${u._id}`)}
                          className="px-1 py-0.5 text-[10px] font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
                        >
                          Düzenle
                        </button>
                        <button onClick={() => handleDelete(u._id)} className="px-1 py-0.5 text-[10px] font-medium text-white bg-red-600 rounded hover:bg-red-700">
                          Sil
                        </button>
                      </td>



                    </tr>
                  ))}
                </tbody>
              </table>
            </div>








            {/* Pagination */}
            <nav className="flex items-center justify-center mt-4 mb-6">
              <ul className="inline-flex -space-x-px text-sm">
                {/* Önceki */}
                <li>
                  <button
                    disabled={currentPage2 === 1}
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    className="px-3 py-2 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                  >
                    Önceki
                  </button>
                </li>

                {/* Sayfa Numaraları */}
                {[...Array(totalPages2)].map((_, i) => (
                  <li key={i}>
                    <button
                      onClick={() => setCurrentPage2(i + 1)}
                      className={`px-3 py-2 leading-tight border ${currentPage2 === i + 1
                        ? "text-white bg-blue-600 border-blue-600"
                        : "text-gray-500 bg-white border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                        }`}
                    >
                      {i + 1}
                    </button>
                  </li>
                ))}

                {/* Sonraki */}
                <li>
                  <button
                    disabled={currentPage2 === totalPages2}
                    onClick={() => setCurrentPage2((p) => Math.min(p + 1, totalPages2))}
                    className="px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                  >
                    Sonraki
                  </button>
                </li>
              </ul>
            </nav>
          </div>



        )}







      </div>






















    </div>
  );
}

export default Admin;
