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

  const [selectedFile, setSelectedFile] = useState(null);
  const [description, setDescription] = useState("");
  const [employee, setEmployee] = useState("");
  const [title, setTitle] = useState("");
  const [employees, setEmployees] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

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
    // Serbest ise boş (“”) gönderiyoruz, backend null’a dönüştürecek
    formData.append("assignedTo", employee === "null" || !employee ? "" : employee);

    try {
      await axios.post("http://localhost:5000/manager/add", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true               // session cookie’yi gönder
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
              onClick={changeBlockAddJob}
              type="button"
              className="w-36 px-4 py-2 text-sm font-medium text-gray-900 bg-transparent border border-gray-900 rounded-s-lg hover:bg-gray-700 hover:text-white focus:z-10 focus:ring-2 focus:ring-gray-500 focus:bg-gray-700 focus:text-white dark:border-white dark:text-white dark:hover:text-white dark:hover:bg-gray-600 dark:focus:bg-gray-600"
            >
              İş Ekle
            </button>
            <button
              onClick={changeBlockViewJobs}
              type="button"
              className="w-36 px-4 py-2 text-sm font-medium text-gray-900 bg-transparent border border-gray-900 rounded-e-lg hover:bg-gray-700 hover:text-white focus:z-10 focus:ring-2 focus:ring-gray-500 focus:bg-gray-700 focus:text-white dark:border-white dark:text-white dark:hover:text-white dark:hover:bg-gray-600 dark:focus:bg-gray-600"
            >
              İşleri Görüntüle
            </button>
          </div>
        </div>
      </div>




      {activeBlock === "add_job" && (<form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto flex flex-col gap-6 p-6 bg-white rounded-lg shadow-md dark:bg-gray-800 md:flex-row md:items-start md:justify-center">


        <div className="w-full md:w-1/2">
          <label
            htmlFor="dropzone-file"
            className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg
                className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
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
              <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                <span className="font-semibold">Tıklayarak yükleyin</span> ya da sürükleyin
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
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

          {/* Dosya adı gösterimi */}
          {selectedFile && (
            <p className="mt-2 text-sm text-green-600 dark:text-green-400">
              Seçilen dosya: {selectedFile.name}
            </p>
          )}
        </div>





        <div class="w-full md:w-1/2 flex flex-col gap-4">
          <h2 class="text-lg font-semibold text-gray-800 dark:text-white">Yeni Görsel Yükle</h2>


          <div>
            <label htmlFor="employee" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              Çalışan Seç
            </label>
            <select
              id="employee"
              name="employee"
              value={employee} // seçili değeri kontrol ediyorsan
              onChange={(e) => setEmployee(e.target.value)} // seçildiğinde ID'si state'e aktarılır
              className="w-full p-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 dark:bg-gray-700 dark:text-white dark:border-gray-600"
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
            <div>
              <label htmlFor="title" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                Başlık
              </label>
              <input
                id="title"
                name="title"
                type="text"
                className="w-full p-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                placeholder="İş başlığı giriniz"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <label htmlFor="description" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              Açıklama
            </label>
            <textarea
              id="description"
              name="description"
              rows="4"
              className="w-full p-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 dark:bg-gray-700 dark:text-white dark:border-gray-600"
              placeholder="İşin detaylarını yazınız."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>



          <button type="submit" class="px-4 py-2 mt-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-700">
            Gönder
          </button>
        </div>
      </form>)}

      {activeBlock === "view_job" && (
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
                <br></br>
                <br></br>
                {job.assignedTo && (
                  <div className="text-left rtl:text-right text-gray-500 dark:text-gray-400">
                    Atanan: {job.assignedTo.username || job.assignedTo.name || "Bilinmiyor"}
                  </div>
                )}
              </div>
              <button onClick={() => handleDeleteJob(job._id)} className="inline-flex items-center justify-center w-10 h-10 bg-transparent border-none outline-none hover:bg-transparent focus:outline-none"> <svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 7h14m-9 3v8m4-8v8M10 3h4a1 1 0 0 1 1 1v3H9V4a1 1 0 0 1 1-1ZM6 7h12v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7Z" />
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



    </div>
  );
}

export default Manager;
