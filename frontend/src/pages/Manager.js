// pages/Manager.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

axios.defaults.withCredentials = true;


function Manager() {
  const statusSteps = ["OPEN", "ASSIGNED", "IN_PROGRESS", "DONE"];
  const getStatusIndex = (status) => statusSteps.indexOf(status);




  const [searchTerm, setSearchTerm] = useState("");
  const [searchCategory, setSearchCategory] = useState("title");


  const [activeBlock, setActiveBlock] = useState("add_job");
  const changeBlockAddJob = () => setActiveBlock("add_job");
  const changeBlockViewJobs = () => setActiveBlock("view_job");
  const changeBlockChangePassword = () => setActiveBlock("change_password");

  const [selectedFile, setSelectedFile] = useState(null);
  const [description, setDescription] = useState("");
  const [employee, setEmployee] = useState("");
  const [title, setTitle] = useState("");
  const [employees, setEmployees] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Password change states
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    axios
      .get("http://localhost:5000/manager/jobs", {
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
        console.error("İşler alınırken hata:", err);
      });
  }, [currentPage, searchCategory, searchTerm]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/manager/my-employees", { withCredentials: true })
      .then((res) => setEmployees(res.data))
      .catch((err) => {
        console.error(err);
        toast.error("Çalışanlar yüklenemedi.");
      });
  }, []);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basit doğrulama
    if (!title.trim()) {
      toast.error("Başlık zorunlu.");
      return;
    }

    // FormData hazırlığı
    const formData = new FormData();
    if (selectedFile) formData.append("file", selectedFile);  // attachments → file
    formData.append("title", title);
    formData.append("description", description);
    // Serbest ise boş ("") gönderiyoruz, backend null'a dönüştürecek
    formData.append("assignedTo", employee === "null" || !employee ? "" : employee);

    try {
      await axios.post("http://localhost:5000/manager/add", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true               // session cookie'yi gönder
      });
      toast.success("Görev başarıyla oluşturuldu!");

      // Formu temizle
      setSelectedFile(null);
      setTitle("");
      setDescription("");
      setEmployee("");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Görev oluşturulamadı.");
    }
  };

  const renderAttachment = (attachment) => {
    if (!attachment) return null;

    const { mimetype, data, filename } = attachment;
    const fileUrl = `data:${mimetype};base64,${data}`;

    if (mimetype.startsWith("image/")) {
      return (
        <img
          src={fileUrl}
          alt={filename}
          className="rounded-sm object-cover w-full h-48 sm:w-96"
        />
      );
    } else if (mimetype === "application/pdf") {
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
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{filename}</p>
          <a
            href={fileUrl}
            download={filename}
            className="text-blue-600 hover:underline dark:text-blue-400"
          >
            Dosyayı indir
          </a>
        </div>
      );
    }
  };
  const MySwal = withReactContent(Swal);

  const handleDeleteJob = async (id) => {
    const result = await MySwal.fire({
      title: 'Emin misiniz?',
      text: 'Bu işi silmek istediğinize emin misiniz?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Evet, sil',
      cancelButtonText: 'Vazgeç',
      confirmButtonColor: '#14b8a6',
      cancelButtonColor: '#ef4444',
    });

    if (!result.isConfirmed) return;

    try {
      const res = await axios.delete(`http://localhost:5000/manager/deletejob/${id}`);

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

  const handleLogout = (e) => {
    axios.post("http://localhost:5000/logout", {}, { withCredentials: true });
    localStorage.removeItem("userToken");
    window.location.reload(); // sayfayı yeniden yükle
  };

  // Helper for Sidebar Items
  const NavItem = ({ id, label, icon, onClick }) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${activeBlock === id
        ? "bg-gray-100 text-gray-900 shadow-sm"
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
              Manager Panel
            </h1>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-4 mt-2">Yönetim</div>

          <NavItem
            id="add_job"
            label="İş Ekle"
            onClick={changeBlockAddJob}
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>}
          />
          <NavItem
            id="view_job"
            label="İşleri Görüntüle"
            onClick={changeBlockViewJobs}
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>}
          />
          <NavItem
            id="change_password"
            label="Şifre Değiştir"
            onClick={changeBlockChangePassword}
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>}
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
                  {activeBlock === "add_job" && (
                    <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                  )}
                  {activeBlock === "view_job" && (
                    <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                  )}
                  {activeBlock === "change_password" && (
                    <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                  )}
                </div>
              </div>

              {/* Text Content */}
              <div className="flex-1">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-teal-900 to-cyan-900 bg-clip-text text-transparent tracking-tight">
                  {activeBlock === "add_job" && "Yeni İş Ekle"}
                  {activeBlock === "view_job" && "İş Listesi ve Durumları"}
                  {activeBlock === "change_password" && "Şifre Değiştir"}
                </h2>
                <p className="mt-3 text-gray-600 leading-relaxed">
                  {activeBlock === "add_job" && "Çalışanlarınıza yeni görevler atayın ve dosya ekleyin."}
                  {activeBlock === "view_job" && "Tüm işleri, atamaları ve ilerleme durumlarını takip edin."}
                  {activeBlock === "change_password" && "Hesap güvenliğiniz için şifrenizi güncelleyin."}
                </p>

                {/* Breadcrumb */}
                <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <span>Manager Panel</span>
                  <span>/</span>
                  <span className="text-teal-600 font-medium">
                    {activeBlock === "add_job" && "İş Ekle"}
                    {activeBlock === "view_job" && "İşler"}
                    {activeBlock === "change_password" && "Şifre Değiştir"}
                  </span>
                </div>
              </div>
            </div>
          </header>

          {/* Content Blocks */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Add Job Form */}
            {activeBlock === "add_job" && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-4xl mx-auto">
                <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-8">
                  {/* File Upload Section */}
                  <div className="w-full md:w-1/2">
                    <label
                      htmlFor="dropzone-file"
                      className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg
                          className="w-10 h-10 mb-4 text-gray-400"
                          fill="none"
                          viewBox="0 0 20 16"
                        >
                          <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5A5.5 5.5 0 0 0 5.2 5.02C5.13 5.02 5.07 5 5 5a4 4 0 0 0 0 8h2.17M10 15V6m0 0L8 8m2-2 2 2"
                          />
                        </svg>
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Tıklayarak yükleyin</span> ya da sürükleyin
                        </p>
                        <p className="text-xs text-gray-400">
                          PDF, DOCX, ZIP, EXE, JPG... (Tüm dosya türleri desteklenir)
                        </p>
                      </div>
                      <input
                        id="dropzone-file"
                        type="file"
                        className="hidden"
                        onChange={(e) => setSelectedFile(e.target.files[0])}
                      />
                    </label>

                    {selectedFile && (
                      <p className="mt-3 text-sm text-green-600 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        Seçilen dosya: {selectedFile.name}
                      </p>
                    )}
                  </div>

                  {/* Form Fields Section */}
                  <div className="w-full md:w-1/2 flex flex-col gap-6">
                    <div>
                      <label htmlFor="employee" className="block mb-2 text-sm font-medium text-gray-700">
                        Çalışan Seç
                      </label>
                      <select
                        id="employee"
                        name="employee"
                        value={employee}
                        onChange={(e) => setEmployee(e.target.value)}
                        className="w-full px-4 py-3 bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-300 rounded-xl shadow-sm hover:shadow-md focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all duration-200 font-medium text-gray-700 cursor-pointer"
                      >
                        <option value="">Bir çalışan seçin</option>
                        <option value="null">Serbest</option>
                        {employees.map((emp) => (
                          <option key={emp._id} value={emp._id}>
                            {emp.username}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="title" className="block mb-2 text-sm font-medium text-gray-700">
                        Başlık
                      </label>
                      <input
                        id="title"
                        name="title"
                        type="text"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors"
                        placeholder="İş başlığı giriniz"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                      />
                    </div>

                    <div>
                      <label htmlFor="description" className="block mb-2 text-sm font-medium text-gray-700">
                        Açıklama
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        rows="4"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors resize-none"
                        placeholder="İşin detaylarını yazınız."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
                    >
                      Gönder
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* View Jobs */}
            {activeBlock === "view_job" && (
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
                              <span className="font-semibold">Atanan:</span>
                              <span className="bg-gray-100 px-2 py-0.5 rounded-full text-gray-700">
                                {job.assignedTo?.username || job.assignedTo?.name || "Serbest"}
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

            {/* Change Password */}
            {activeBlock === "change_password" && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-2xl mx-auto">
                <form onSubmit={async (e) => {
                  e.preventDefault();

                  // Validation
                  if (!oldPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
                    toast.error("Tüm alanları doldurun.");
                    return;
                  }

                  if (newPassword !== confirmPassword) {
                    toast.error("Yeni şifreler eşleşmiyor.");
                    return;
                  }

                  if (newPassword.length < 6) {
                    toast.error("Yeni şifre en az 6 karakter olmalıdır.");
                    return;
                  }

                  try {
                    await axios.put(
                      "http://localhost:5000/worker/update_password",
                      {
                        oldPassword,
                        newPassword
                      },
                      { withCredentials: true }
                    );
                    toast.success("Şifreniz başarıyla değiştirildi!");
                    setOldPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                  } catch (err) {
                    console.error(err);
                    toast.error(err.response?.data?.message || "Şifre değiştirilemedi.");
                  }
                }} className="space-y-6">
                  <div>
                    <label htmlFor="oldPassword" className="block mb-2 text-sm font-medium text-gray-700">
                      Eski Şifre
                    </label>
                    <input
                      id="oldPassword"
                      name="oldPassword"
                      type="password"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors"
                      placeholder="Mevcut şifrenizi giriniz"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                    />
                  </div>

                  <div>
                    <label htmlFor="newPassword" className="block mb-2 text-sm font-medium text-gray-700">
                      Yeni Şifre
                    </label>
                    <input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors"
                      placeholder="Yeni şifrenizi giriniz"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block mb-2 text-sm font-medium text-gray-700">
                      Yeni Şifre (Tekrar)
                    </label>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors"
                      placeholder="Yeni şifrenizi tekrar giriniz"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>

                  {newPassword && confirmPassword && newPassword !== confirmPassword && (
                    <p className="text-sm text-red-600 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Şifreler eşleşmiyor
                    </p>
                  )}

                  {newPassword && confirmPassword && newPassword === confirmPassword && (
                    <p className="text-sm text-green-600 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Şifreler eşleşiyor
                    </p>
                  )}

                  <button
                    type="submit"
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
                  >
                    Şifreyi Değiştir
                  </button>
                </form>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}

export default Manager;
