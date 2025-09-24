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
      .get(`http://localhost:5000/worker/jobs`,  {
        params: {
          page: currentPage,
          limit: 3,
          searchCategory,
          searchTerm,
        }}, { withCredentials: true })
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
      .get(`http://localhost:5000/worker/jobsfree`,  {
        params: {
          page: currentPage,
          limit: 3,
          searchCategory: searchCategory2,  // backend tarafında parametre ismi böyle olmalı
          searchTerm: searchTerm2,
        }}, { withCredentials: true })
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



  return (
    <div>
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

      <div style={{ paddingTop: "60px", paddingRight: "10px" }}>
        <div className="flex justify-center mt-4">
          <div className="inline-flex rounded-md shadow-xs" role="group">
            <button
              onClick={changeBlockMyJobs}
              type="button"
              className="w-36 px-4 py-2 text-sm font-medium text-gray-900 bg-transparent border border-gray-900 rounded-s-lg hover:bg-gray-700 hover:text-white focus:z-10 focus:ring-2 focus:ring-gray-500 focus:bg-gray-700 focus:text-white dark:border-white dark:text-white dark:hover:text-white dark:hover:bg-gray-600 dark:focus:bg-gray-600"
            >
              Benim İşlerim
            </button>
            <button
              onClick={changeBlockFreeJobs}
              type="button"
              className="w-36 px-4 py-2 text-sm font-medium text-gray-900 bg-transparent border border-gray-900 rounded-e-lg hover:bg-gray-700 hover:text-white focus:z-10 focus:ring-2 focus:ring-gray-500 focus:bg-gray-700 focus:text-white dark:border-white dark:text-white dark:hover:text-white dark:hover:bg-gray-600 dark:focus:bg-gray-600"
            >
              Serbest İşler
            </button>
          </div>
        </div>
      </div>

      {activeBlock === "view_myjobs" && (
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
                placeholder={`${searchCategory === "title" ? "Başlığa" : searchCategory === "content" ? "İçeriğe" : "İçeriğe"} göre ara...`}
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
                <button
                  onClick={() => handleState(job._id, job.status)} // TIKLANINCA çağırır

                  className="inline-flex items-center justify-center w-10 h-10 bg-transparent border-none outline-none hover:bg-transparent focus:outline-none"
                  style={{ all: "unset", cursor: "pointer" }}
                >
                  <svg
                    className="w-10 h-10 text-gray-800 dark:text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="m7 16 4-4-4-4m6 8 4-4-4-4"
                    />
                  </svg>
                </button>




                <br></br>
                {job.assignedTo && (
                  <div className="text-left rtl:text-right text-gray-500 dark:text-gray-400">
                    İşi Gönderen : {job.createdBy.username}
                  </div>
                )}
              </div>
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


      {activeBlock === "view_freejobs" && (
        permissions.includes("view_freejobs") ? (
          <div className="flex flex-col items-center pt-6 px-4 space-y-6">
            <div className="w-full max-w-2xl flex justify-center">
              {/* Kategori seçimi (select) */}
                  <select
              value={searchCategory}
              onChange={(e) => setSearchCategory(e.target.value)}
              className="w-40 py-3 px-4 text-sm text-gray-700 bg-white border border-gray-300 rounded-l-lg
               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
               dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:focus:ring-blue-500 dark:focus:border-blue-500"
            >
              <option value="title">BAŞLIK</option>
              
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
                  value={searchTerm2}
                  onChange={(e) => setSearchTerm2(e.target.value)}
                 placeholder={`${searchCategory === "title" ? "Başlığa" : searchCategory === "content" ? "İçeriğe" : "İçeriğe"} göre ara...`}

                  className="block w-full py-3 pl-10 pr-4 text-sm text-gray-900 border border-gray-300 rounded-r-lg
                 bg-gray-50 focus:ring-blue-500 focus:border-blue-500
                 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white
                 dark:focus:ring-blue-500 dark:focus:border-blue-500"
                />
              </div>
            </div>
            {/* Kartlar */}
            {jobsfree.map((job) => (
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

                  <br />

                  <div className="text-left rtl:text-right text-gray-500 dark:text-gray-400">
                    İşi Gönderen : {job.createdBy.username}
                  </div>

                  <button
                    onClick={() => handleJob(job._id)}
                    className="inline-flex items-center justify-center w-10 h-10 bg-transparent border-none outline-none hover:bg-transparent focus:outline-none"
                    style={{ all: "unset", cursor: "pointer" }}
                  >
                    <svg
                      className="w-10 h-10 text-gray-800 dark:text-white transition-colors duration-200 hover:text-blue-400"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="grey"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M9 7V2.221a2 2 0 0 0-.5.365L4.586 6.5a2 2 0 0 0-.365.5H9Zm2 0V2h7a2 2 0 0 1 2 2v6.41A7.5 7.5 0 1 0 10.5 22H6a2 2 0 0 1-2-2V9h5a2 2 0 0 0 2-2Z"
                        clipRule="evenodd"
                      />
                      <path
                        fillRule="evenodd"
                        d="M9 16a6 6 0 1 1 12 0 6 6 0 0 1-12 0Zm6-3a1 1 0 0 1 1 1v1h1a1 1 0 1 1 0 2h-1v1a1 1 0 1 1-2 0v-1h-1a1 1 0 1 1 0-2h1v-1a1 1 0 0 1 1-1Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}

            {/* Pagination */}
            <nav className="flex items-center justify-center mt-4 mb-6">
              <ul className="inline-flex -space-x-px text-sm">
                {/* Önceki */}
                <li>
                  <button
                    disabled={currentPage2 === 1}
                    onClick={() => setCurrentPage2((p) => Math.max(p - 1, 1))}
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
        ) : (
          <div className="text-red-600 dark:text-red-400 text-center mt-6 text-lg font-semibold">
            Bu sayfayı görüntüleme yetkiniz yok.
          </div>
        )
      )}

    </div>


  );
}

export default Worker;
