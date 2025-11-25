// pages/Worker.jsx
import React, { useState, useEffect } from "react";
import axios from 'axios';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

function Worker() {
  const [activeBlock, setActiveBlock] = useState("view_myjobs");
  const changeBlockFreeJobs = () => setActiveBlock("view_freejobs");
  const changeBlockMyJobs = () => setActiveBlock("view_myjobs");
  const [jobs, setJobs] = useState([]);
  const [jobsfree, setJobsfree] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage2, setCurrentPage2] = useState(1);
  const [totalPages2, setTotalPages2] = useState(1);
  const statusSteps = ["OPEN", "ASSIGNED", "IN_PROGRESS", "DONE"];
  const getStatusIndex = (status) => statusSteps.indexOf(status);
  const [selectedStatus, setSelectedStatus] = useState();

  const [permissions, setPermissions] = useState([]);



  const [searchTerm, setSearchTerm] = useState("");
  const [searchCategory, setSearchCategory] = useState("title");

  const [searchTerm2, setSearchTerm2] = useState("");
  const [searchCategory2, setSearchCategory2] = useState("title");




  useEffect(() => {
    axios.get("http://localhost:5000/worker/permissions_name", { withCredentials: true })
      .then((res) => {
        console.log("Gelen izinler:", res.data.permissions);
        setPermissions(res.data.permissions);
      })
      .catch((err) => {
        console.error("İzinler alınamadı", err);
      });
  }, []);




  const handleLogout = (e) => {
    axios.post("http://localhost:5000/logout", {}, { withCredentials: true });
    localStorage.removeItem("userToken");
    window.location.reload(); // sayfayı yeniden yükle
  };

  useEffect(() => {
    axios
      .get(`http://localhost:5000/worker/jobs`, {
        params: {
          page: currentPage,
          limit: 3,
          searchCategory,
          searchTerm,
        }
      }, { withCredentials: true })
      .then((res) => {
        console.log("Gelen response:", res.data); // 👈 Buraya log ekledik
        setJobs(res.data.jobs);
        setTotalPages(res.data.pagination.totalPages);
      })
      .catch((err) => {
        console.error("İşler alınırken hata:", err);
      });
  }, [currentPage, searchCategory, searchTerm]);

  useEffect(() => {
    axios
      .get(`http://localhost:5000/worker/jobsfree`, {
        params: {
          page: currentPage,
          limit: 3,
          searchCategory: searchCategory2,  // backend tarafında parametre ismi böyle olmalı
          searchTerm: searchTerm2,
        }
      }, { withCredentials: true })
      .then((res) => {
        console.log("Gelen response:", res.data); // 👈 Buraya log ekledik
        setJobsfree(res.data.jobs);
        setTotalPages2(res.data.pagination.totalPages);
      })
      .catch((err) => {
        console.error("İşler alınırken hata:", err);
      });
  }, [currentPage2, searchCategory2, searchTerm2]);


  const MySwal = withReactContent(Swal);

  const handleState = async (jobId, currentStatus) => {
    const lastStatus = "DONE";

    // Eğer zaten son durumdaysa onay sorma, direkt return et (işlem yapma)
    if (currentStatus === lastStatus) {
      MySwal.fire({
        title: "Son durumda!",
        text: "Bu iş zaten son durumda, ilerletilemez.",
        icon: "info",
        confirmButtonText: "Tamam",
      });
      return;
    }

    // Değilse onay sor
    const result = await MySwal.fire({
      title: 'Emin misiniz?',
      text: 'Bu işi bir sonraki duruma geçirmek istediğinize emin misiniz?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Evet, devam et',
      cancelButtonText: 'Vazgeç',
      confirmButtonColor: '#14b8a6',
      cancelButtonColor: '#ef4444',
    });

    if (result.isConfirmed) {
      try {
        const res = await axios.put(`http://localhost:5000/worker/${jobId}/next-status`, { withCredentials: true });
        window.location.reload();
      } catch (err) {
        console.error("Durum güncellenemedi:", err);
        MySwal.fire({
          title: "Hata",
          text: "Durum güncellenirken bir hata oluştu.",
          icon: "error",
        });
      }
    }
  };

  const MySwal2 = withReactContent(Swal);

  const handleJob = async (jobId) => {
    console.log("Atanacak jobId:", jobId)
    const result = await MySwal2.fire({
      title: 'Emin misiniz?',
      text: 'İşi almak istediğinize emin misiniz?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Evet, devam et',
      cancelButtonText: 'Vazgeç',
      confirmButtonColor: '#14b8a6',
      cancelButtonColor: '#ef4444',
    });

    if (result.isConfirmed) {

      try {
        const response = await axios.put("http://localhost:5000/worker/assign", { jobId });

        await MySwal2.fire({
          icon: "success",
          title: "İş size atandı",
          confirmButtonText: "Tamam"
        });
        window.location.reload();
        // Gerekirse listeyi yenile
      } catch (error) {
        await MySwal2.fire({
          icon: "error",
          title: "Hata oluştu",
          text: "İş size atanamadı.",
          confirmButtonText: "Tamam"
        });

      }

    }
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
              Worker Panel
            </h1>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-4 mt-2">İşlerim</div>

          <NavItem
            id="view_myjobs"
            label="Benim İşlerim"
            onClick={changeBlockMyJobs}
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>}
          />
          <NavItem
            id="view_freejobs"
            label="Serbest İşler"
            onClick={changeBlockFreeJobs}
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
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
                  {activeBlock === "view_myjobs" && (
                    <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  )}
                  {activeBlock === "view_freejobs" && (
                    <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  )}
                </div>
              </div>

              {/* Text Content */}
              <div className="flex-1">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-teal-900 to-cyan-900 bg-clip-text text-transparent tracking-tight">
                  {activeBlock === "view_myjobs" && "Benim İşlerim"}
                  {activeBlock === "view_freejobs" && "Serbest İşler"}
                </h2>
                <p className="mt-3 text-gray-600 leading-relaxed">
                  {activeBlock === "view_myjobs" && "Size atanan işleri görüntüleyin ve durumlarını güncelleyin."}
                  {activeBlock === "view_freejobs" && "Serbest işleri görüntüleyin ve kendinize atayın."}
                </p>

                {/* Breadcrumb */}
                <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <span>Worker Panel</span>
                  <span>/</span>
                  <span className="text-teal-600 font-medium">
                    {activeBlock === "view_myjobs" && "Benim İşlerim"}
                    {activeBlock === "view_freejobs" && "Serbest İşler"}
                  </span>
                </div>
              </div>
            </div>
          </header>

          {/* Content Blocks */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* My Jobs */}
            {activeBlock === "view_myjobs" && (
              <div className="space-y-6">
                {/* Filters */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
                  <select
                    value={searchCategory}
                    onChange={(e) => setSearchCategory(e.target.value)}
                    className="px-4 py-2.5 bg-gradient-to-br from-white to-gray-50 border border-gray-300 rounded-lg text-sm shadow-sm hover:shadow focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all duration-200 font-medium text-gray-700 cursor-pointer"
                  >
                    <option value="title">Başlık</option>
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
                            <h3 className="text-lg font-bold text-gray-900 mb-2">{job.title}</h3>
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
                          <div className="flex items-center justify-between border-t border-gray-50 pt-4">
                            <div className="text-xs text-gray-500">
                              <span className="font-semibold">İşi Gönderen:</span> {job.createdBy?.username}
                            </div>
                            <button
                              onClick={() => handleState(job._id, job.status)}
                              className="flex items-center gap-2 px-4 py-2 bg-teal-50 text-teal-700 rounded-lg hover:bg-teal-100 transition-colors text-sm font-medium"
                            >
                              <span>Durumu İlerlet</span>
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                              </svg>
                            </button>
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

            {/* Free Jobs */}
            {activeBlock === "view_freejobs" && (
              permissions.includes("view_freejobs") ? (
                <div className="space-y-6">
                  {/* Filters */}
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
                    <select
                      value={searchCategory2}
                      onChange={(e) => setSearchCategory2(e.target.value)}
                      className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    >
                      <option value="title">Başlık</option>
                      <option value="content">İçerik</option>
                    </select>
                    <div className="relative flex-1">
                      <input
                        type="search"
                        value={searchTerm2}
                        onChange={(e) => setSearchTerm2(e.target.value)}
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
                    {jobsfree.map((job) => (
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
                              <h3 className="text-lg font-bold text-gray-900 mb-2">{job.title}</h3>
                              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{job.description || "Açıklama yok."}</p>
                            </div>

                            {/* Footer Info */}
                            <div className="flex items-center justify-between border-t border-gray-50 pt-4">
                              <div className="text-xs text-gray-500">
                                <span className="font-semibold">İşi Gönderen:</span> {job.createdBy?.username}
                              </div>
                              <button
                                onClick={() => handleJob(job._id)}
                                className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                </svg>
                                <span>İşi Al</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
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
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
                  <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <h3 className="text-lg font-semibold text-red-800 mb-2">Erişim Engellendi</h3>
                  <p className="text-red-600">Bu sayfayı görüntüleme yetkiniz yok.</p>
                </div>
              )
            )}

          </div>
        </div>
      </main>
    </div>
  );
}

export default Worker;
