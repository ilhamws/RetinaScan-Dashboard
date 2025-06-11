import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { uploadImage } from '../../services/api';
import PatientSelector from './PatientSelector';
import { FiUpload, FiFile, FiImage, FiX, FiCheck, FiAlertCircle } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

function UploadImage({ onUploadSuccess, autoUpload = true }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const fileInputRef = useRef(null);
  const dropAreaControls = useAnimation();
  const navigate = useNavigate();
  const { theme } = useTheme();

  // Gunakan ref untuk melacak apakah file sudah diupload
  const uploadedFileRef = useRef(null);
  
  // Effect untuk auto upload saat file atau pasien berubah
  useEffect(() => {
    // Hanya upload jika file dan pasien ada, dan file belum diupload
    if (file && autoUpload && selectedPatient && 
        (!uploadedFileRef.current || uploadedFileRef.current !== file.name + selectedPatient._id)) {
      
      console.log('Auto uploading file:', file.name, 'for patient:', selectedPatient.fullName || selectedPatient.name);
      
      // Tandai file ini sebagai sedang diupload
      uploadedFileRef.current = file.name + selectedPatient._id;
      
      // Gunakan setTimeout untuk memastikan UI diupdate terlebih dahulu
      setTimeout(() => {
        handleSubmit();
      }, 100);
    }
  }, [file, selectedPatient]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    
    processFile(selectedFile);
    
    // Jika pasien sudah dipilih dan autoUpload aktif, langsung upload
    if (selectedPatient && autoUpload) {
      console.log('File dipilih dan pasien sudah ada, langsung upload');
      // Kita tidak perlu setTimeout di sini karena processFile sudah mengupdate state
      // dan useEffect akan menangani upload otomatis
    } else if (!selectedPatient && autoUpload) {
      console.log('File dipilih, tapi pasien belum dipilih. Menunggu pemilihan pasien...');
    }
  };

  const processFile = (selectedFile) => {
    if (selectedFile && ['image/jpeg', 'image/png'].includes(selectedFile.type)) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('Ukuran file terlalu besar (maks. 5MB).');
        setFile(null);
        setPreview(null);
        return;
      }
      
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setError('');
      setSuccess('');
    } else {
      setError('Hanya file JPEG/PNG yang diizinkan (maks. 5MB).');
      setFile(null);
      setPreview(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    dropAreaControls.start("dragging");
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dropAreaControls.start("default");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dropAreaControls.start("default");
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    if (e) {
      e.preventDefault();
    }
    
    if (!file) {
      setError('Pilih file terlebih dahulu.');
      return;
    }

    if (!selectedPatient) {
      setError('Pilih pasien terlebih dahulu.');
      return;
    }
    
    // Cek apakah file ini sudah dalam proses upload
    if (isLoading) {
      console.log('Upload sudah dalam proses, menghindari duplikasi');
      return;
    }
    
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('patientId', selectedPatient._id);
      
      // Convert file to base64 untuk disimpan langsung di formData
      // Ini memastikan gambar tersedia untuk ditampilkan langsung
      if (file) {
        try {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = async () => {
            const base64Image = reader.result;
            formData.append('imageData', base64Image);
            
            // Lanjutkan dengan upload setelah base64 tersedia
            console.log('Mengunggah gambar dengan imageData untuk analisis...');
            try {
              const result = await uploadImage(formData);
              console.log('Hasil analisis:', result);
              
              handleUploadSuccess(result);
            } catch (uploadError) {
              console.error('Error selama upload:', uploadError);
              handleUploadError(uploadError);
            }
          };
          
          reader.onerror = (error) => {
            console.error('Error mengkonversi file ke base64:', error);
            // Tetap lanjutkan upload tanpa base64
            performUpload();
          };
        } catch (base64Error) {
          console.error('Error mengkonversi file ke base64:', base64Error);
          // Tetap lanjutkan upload tanpa base64
          performUpload();
        }
      } else {
        // Jika tidak ada file, tetap lanjutkan upload
        performUpload();
      }
    } catch (err) {
      handleUploadError(err);
    }
  };
  
  // Fungsi untuk menangani upload tanpa base64
  const performUpload = async () => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('patientId', selectedPatient._id);
      
      console.log('Mengunggah gambar untuk analisis (tanpa base64)...');
      const result = await uploadImage(formData);
      console.log('Hasil analisis:', result);
      
      handleUploadSuccess(result);
    } catch (err) {
      handleUploadError(err);
    }
  };
  
  // Fungsi untuk menangani hasil upload yang sukses
  const handleUploadSuccess = (result) => {
    console.log('Handling upload success with result:', result);
    
    // Implementasi defensive programming untuk menghindari error saat property tidak ada
    if (result && result.analysis) {
      try {
        // Validasi dan ambil data yang dibutuhkan dengan nilai default jika tidak ada
        const analysisId = result.analysis.id || result.analysis._id || '';
        const patientId = selectedPatient?._id || '';
        const patientName = selectedPatient?.fullName || selectedPatient?.name || 'Pasien';
        const timestamp = result.analysis.timestamp || new Date().toISOString();
        const imageUrl = result.analysis.imageUrl || preview || '';
        const imageData = result.analysis.imageData || null;
        
        // Ambil data severity dari hasil dengan validasi bertingkat
        // Cek dari hasil.results (format baru) atau langsung dari root (format lama)
        const results = result.analysis.results || {};
        const severity = result.analysis.results?.severity || result.analysis.severity || 'Tidak diketahui';
        const severityLevel = result.analysis.results?.severityLevel || result.analysis.severityLevel || 0;
        const classification = result.analysis.results?.classification || result.analysis.classification || 'Tidak diketahui';
        const confidence = result.analysis.results?.confidence || result.analysis.confidence || 0;
        const isSimulation = result.analysis.results?.isSimulation || result.analysis.isSimulation || false;
        const errorMessage = result.analysis.results?.errorMessage || result.analysis.errorMessage || null;
        
        // Ambil rekomendasi dan catatan
        const recommendation = result.analysis.recommendation || 'Tidak ada rekomendasi';
        const notes = result.analysis.notes || recommendation || '';
        
        // Simpan data hasil analisis ke localStorage sementara untuk diakses di halaman hasil
        const analysisData = {
          id: analysisId,
          _id: analysisId, // Tambahkan _id juga untuk konsistensi
          patientId: patientId,
          patientName: patientName,
          patient: selectedPatient, // Simpan semua data pasien
          timestamp: timestamp,
          imageUrl: imageUrl,
          imageData: imageData, // Tambahkan imageData jika ada
          severity: severity,
          severityLevel: severityLevel,
          classification: classification,
          confidence: confidence,
          recommendation: recommendation,
          notes: notes,
          isSimulation: isSimulation,
          errorMessage: errorMessage, // Tambahkan pesan error jika ada
          originalFilename: file?.name || 'uploaded-image',
          createdAt: timestamp
        };
        
        localStorage.setItem('currentAnalysis', JSON.stringify(analysisData));
        
        // Reset form setelah berhasil
        setFile(null);
        setPreview(null);
        setSelectedPatient(null);
        setError('');
        
        // Gunakan callback onUploadSuccess jika tersedia
        if (onUploadSuccess && typeof onUploadSuccess === 'function') {
          console.log('Memanggil callback onUploadSuccess dengan data yang divalidasi');
          // Format data sesuai harapan parent component dengan validasi
          const formattedResult = {
            _id: analysisId,
            id: analysisId,
            prediction: {
              severity: severity,
              severityLevel: severityLevel,
              confidence: confidence,
              recommendation: recommendation,
              analysisId: analysisId,
              patientId: patientId,
              isSimulation: isSimulation,
              errorMessage: errorMessage // Tambahkan pesan error jika ada
            },
            preview: preview,
            file: file,
            patient: selectedPatient,
            patientId: selectedPatient, // Duplikasi patientId untuk kompabilitas
            imageData: imageData,
            originalFilename: file?.name || 'uploaded-image',
            createdAt: timestamp,
            response: result,
            errorMessage: errorMessage // Tambahkan pesan error jika ada
          };
          onUploadSuccess(formattedResult);
        } else {
          // Jika tidak ada callback, tampilkan pesan sukses
          setSuccess('Gambar berhasil diunggah dan dianalisis.');
        }
      } catch (parseError) {
        console.error('Error parsing response data:', parseError);
        setError(`Terjadi kesalahan saat memproses hasil analisis: ${parseError.message}`);
      }
    } else {
      console.error('Format respons tidak valid:', result);
      setError('Terjadi kesalahan saat memproses hasil analisis. Format respons tidak valid.');
    }
    setIsLoading(false);
  };
  
  // Fungsi untuk menangani error selama upload
  const handleUploadError = (err) => {
    console.error('Error during image upload:', err);
    const errorMessage = err.response?.data?.message || err.message || 'Terjadi kesalahan saat mengunggah gambar.';
    setError(errorMessage);
    setIsLoading(false);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: 'spring', damping: 12 }
    }
  };

  const dropzoneVariants = {
    default: { 
      borderColor: 'rgba(209, 213, 219, 1)',
      scale: 1,
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
    },
    dragging: { 
      borderColor: theme.primary || 'rgba(59, 130, 246, 1)',
      scale: 1.02,
      boxShadow: `0 8px 16px ${theme.primary ? theme.primary + '33' : 'rgba(59, 130, 246, 0.2)'}`
    },
    hover: {
      scale: 1.01,
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
    }
  };

  const iconVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { type: 'spring', stiffness: 300, damping: 20 }
    },
    hover: { 
      scale: 1.1,
      transition: { type: 'spring', stiffness: 400, damping: 10 }
    },
    tap: { scale: 0.9 }
  };

  const filePreviewVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: 'spring', stiffness: 300, damping: 25 }
    },
    exit: { 
      opacity: 0, 
      y: -20,
      transition: { duration: 0.2 }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-md sm:max-w-lg md:max-w-xl mx-auto"
    >
      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="text-red-500 bg-red-50 p-4 rounded-xl mb-5 text-sm sm:text-base flex items-start shadow-sm border border-red-100"
          >
            <FiAlertCircle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </motion.div>
        )}
        
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="text-green-600 bg-green-50 p-4 rounded-xl mb-5 text-sm sm:text-base flex items-start shadow-sm border border-green-100"
          >
            <FiCheck className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
            <span>{success}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        variants={itemVariants}
        className="mb-6"
      >
        <PatientSelector 
          onSelectPatient={setSelectedPatient} 
          selectedPatient={selectedPatient} 
        />
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <motion.div 
          variants={itemVariants}
          className="space-y-2"
        >
          <motion.div
            variants={dropzoneVariants}
            initial="default"
            animate={dropAreaControls}
            whileHover="hover"
            className={`relative border-2 border-dashed rounded-2xl p-8 transition-all ${
              isDragging ? `bg-${theme.name || 'blue'}-50` : 'bg-white'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/jpeg, image/png"
              disabled={isLoading}
            />
            
            <AnimatePresence mode="wait">
              {!preview ? (
                <motion.div 
                  key="upload-prompt"
                  className="flex flex-col items-center justify-center text-center"
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0 }}
                >
                  <motion.div
                    className="w-20 h-20 mb-4 rounded-full flex items-center justify-center"
                    style={{ 
                      backgroundColor: `${theme.primary}10`,
                      color: theme.primary
                    }}
                    variants={iconVariants}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <FiUpload className="w-8 h-8" />
                  </motion.div>
                  
                  <motion.h3 
                    className="text-lg font-medium text-gray-700 mb-2"
                    variants={itemVariants}
                  >
                    Seret & Lepaskan Gambar Retina
                  </motion.h3>
                  
                  <motion.p 
                    className="text-sm text-gray-500 mb-4"
                    variants={itemVariants}
                  >
                    atau klik untuk memilih file
                  </motion.p>
                  
                  <motion.button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-5 py-2.5 text-white text-sm font-medium rounded-lg shadow-md hover:shadow-lg transition-all"
                    style={{
                      background: `linear-gradient(to right, ${theme.primary}, ${theme.secondary})` 
                    }}
                    variants={itemVariants}
                    whileHover={{ scale: 1.05, boxShadow: `0 5px 15px ${theme.primary}66` }}
                    whileTap={{ scale: 0.95 }}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Mengunggah...' : 'Pilih File'}
                  </motion.button>
                  
                  <motion.p 
                    className="text-xs text-gray-400 mt-4"
                    variants={itemVariants}
                  >
                    Format yang didukung: JPG, PNG (maks. 5MB)
                  </motion.p>
                </motion.div>
              ) : (
                <motion.div 
                  key="file-preview"
                  className="flex flex-col items-center"
                  variants={filePreviewVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <div className="relative w-full max-w-xs mx-auto">
                    <motion.div
                      className="relative rounded-lg overflow-hidden shadow-lg border-4 border-white"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <img 
                        src={preview} 
                        alt="Preview" 
                        className="w-full h-auto object-cover"
                      />
                      
                      <motion.button
                        type="button"
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
                        onClick={() => {
                          setFile(null);
                          setPreview(null);
                        }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <FiX className="w-5 h-5" />
                      </motion.button>
                    </motion.div>
                    
                    <motion.div 
                      className="mt-4 text-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <p className="text-sm font-medium text-gray-700 flex items-center justify-center">
                        <FiImage className="mr-2" /> {file?.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {(file?.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </motion.div>
                  </div>
                  
                  <motion.div 
                    className="mt-6 flex space-x-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <motion.button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      disabled={isLoading}
                    >
                      Ganti Gambar
                    </motion.button>
                    
                    {!autoUpload && (
                      <motion.button
                        type="submit"
                        className="px-4 py-2 text-white text-sm font-medium rounded-lg shadow-md hover:shadow-lg transition-all"
                        style={{
                          background: `linear-gradient(to right, ${theme.primary}, ${theme.secondary})` 
                        }}
                        whileHover={{ scale: 1.05, boxShadow: `0 5px 15px ${theme.primary}66` }}
                        whileTap={{ scale: 0.95 }}
                        disabled={isLoading || !selectedPatient}
                      >
                        {isLoading ? (
                          <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Mengunggah...
                          </span>
                        ) : (
                          'Unggah & Analisis'
                        )}
                      </motion.button>
                    )}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Animated decorative elements */}
            <motion.div 
              className="absolute -z-10 top-1/4 -left-10 w-20 h-20 rounded-full blur-xl"
              style={{ backgroundColor: `${theme.primary}1A` }}
              animate={{ 
                x: [0, 10, 0],
                y: [0, -10, 0],
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 5,
                ease: "easeInOut" 
              }}
            />
            <motion.div 
              className="absolute -z-10 bottom-1/4 -right-10 w-32 h-32 rounded-full blur-xl"
              style={{ backgroundColor: `${theme.secondary}1A` }}
              animate={{ 
                x: [0, -10, 0],
                y: [0, 10, 0],
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 7,
                ease: "easeInOut" 
              }}
            />
          </motion.div>
          
          {isLoading && (
            <motion.div 
              className="mt-4 bg-white rounded-lg p-4 shadow-sm border border-gray-100"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            >
              <div className="flex items-center">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <motion.div 
                    className="h-2.5 rounded-full" 
                    style={{ backgroundColor: theme.primary }}
                    initial={{ width: "5%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 2, ease: "easeInOut" }}
                  />
                </div>
                <span className="text-sm text-gray-500 ml-4 whitespace-nowrap">Mengunggah...</span>
              </div>
            </motion.div>
          )}
        </motion.div>
      </form>
    </motion.div>
  );
}

export default UploadImage;