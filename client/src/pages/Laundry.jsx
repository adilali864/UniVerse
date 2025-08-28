import { useState } from 'react';
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from 'firebase/storage';
import { app } from '../firebase';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';
import '../css/laundry.css';

// Import the same images used in mess
import userIcon from "/img/user.png";
import clothesIcon from "/img/laundryico.png";
import uploadIcon from "/img/clean-clothes.png";

export default function Laundry() {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [formData, setFormData] = useState({
    imageUrls: [],
    name: '',
    enrollmentId: '',
    phone: '',
    tshirts: 0,
    shirts: 0,
    pants: 0,
    bedsheets: 0,
    lowers: 0,
    shorts: 0,
    towel: 0,
    pillowcover: 0,
    kurta: 0,
    pajama: 0,
    dupatta: 0,
  });
  const [imageUploadError, setImageUploadError] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const clothingItems = [
    { key: 'tshirts', label: 'T-Shirts'},
    { key: 'shirts', label: 'Shirts'},
    { key: 'pants', label: 'Pants'},
    { key: 'bedsheets', label: 'Bed Sheets'},
    { key: 'lowers', label: 'Lowers'},
    { key: 'shorts', label: 'Shorts' },
    { key: 'towel', label: 'Towels' },
    { key: 'pillowcover', label: 'Pillow Covers' },
    // { key: 'kurta', label: 'Kurtas' },
    // { key: 'pajama', label: 'Pajamas' },
    // { key: 'dupatta', label: 'Dupattas' }
  ];

  const handleImageSubmit = (e) => {
    if (files.length > 0 && files.length + formData.imageUrls.length < 7) {
      setUploading(true);
      setImageUploadError(false);
      const promises = [];

      for (let i = 0; i < files.length; i++) {
        promises.push(storeImage(files[i]));
      }
      Promise.all(promises)
        .then((urls) => {
          setFormData({
            ...formData,
            imageUrls: formData.imageUrls.concat(urls),
          });
          setImageUploadError(false);
          setUploading(false);
        })
        .catch((err) => {
          setImageUploadError('Image upload failed (2 mb max per image)');
          setUploading(false);
        });
    } else {
      setImageUploadError('You can only upload 6 images per listing');
      setUploading(false);
    }
  };

  const storeImage = async (file) => {
    return new Promise((resolve, reject) => {
      const storage = getStorage(app);
      const fileName = new Date().getTime() + file.name;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload is ${progress}% done`);
        },
        (error) => {
          reject(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            resolve(downloadURL);
          });
        }
      );
    });
  };

  const handleRemoveImage = (index) => {
    setFormData({
      ...formData,
      imageUrls: formData.imageUrls.filter((_, i) => i !== index),
    });
  };

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
  
    if (type === 'checkbox') {
      setFormData({ ...formData, [id]: checked });
    } else {
      setFormData({ ...formData, [id]: value });
    }
  };

  const generateSlip = () => (
    <Document>
      <Page style={pdfStyles.page}>
        <View style={pdfStyles.header}>
          <Text style={pdfStyles.title}>🧺 UniVerse Laundry Service</Text>
          <Text style={pdfStyles.subtitle}>Digital Laundry Slip</Text>
        </View>
        
        <View style={pdfStyles.section}>
          <Text style={pdfStyles.sectionTitle}>Personal Information</Text>
          <Text style={pdfStyles.text}>Name: {formData.name}</Text>
          <Text style={pdfStyles.text}>Enrollment ID: {formData.enrollmentId}</Text>
          <Text style={pdfStyles.text}>Phone: {formData.phone}</Text>
          <Text style={pdfStyles.text}>Date: {new Date().toLocaleDateString()}</Text>
        </View>

        <View style={pdfStyles.section}>
          <Text style={pdfStyles.sectionTitle}>Clothing Items</Text>
          {clothingItems.map(({ key, label }) => {
            if (formData[key] > 0) {
              return (
                <Text style={pdfStyles.text} key={key}>
                  {label}: {formData[key]}
                </Text>
              );
            }
            return null;
          })}
        </View>

        <View style={pdfStyles.footer}>
          <Text style={pdfStyles.footerText}>
            Total Items: {clothingItems.reduce((total, item) => total + (parseInt(formData[item.key]) || 0), 0)}
          </Text>
          <Text style={pdfStyles.footerText}>
            Generated on: {new Date().toLocaleString()}
          </Text>
        </View>
      </Page>
    </Document>
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.imageUrls.length < 1)
        return setError('You must upload at least one image');
      
      setLoading(true);
      setError(false);
      
      const res = await fetch('/api/laundry-listing/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          userRef: currentUser._id,
        }),
      });
  
      const data = await res.json();
      setLoading(false);
  
      if (data.success === false) {
        setError(data.message);
      } else {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 5000);
      }
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const getTotalItems = () => {
    return clothingItems.reduce((total, item) => {
      return total + (parseInt(formData[item.key]) || 0);
    }, 0);
  };

  return (
    <div id="laundry-main">
      <div id="laundry-container">
        <div className="hero-section">
          <h1 className="main-title">Digital Laundry Service</h1>
          <div className="subtitle-group">
            <h2 className="subtitle">No more lost slips!</h2>
            {/* <h3 className="sub-subtitle">Create your digital laundry listing and download your slip</h3> */}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="laundry-form">
          <div className="form-sections">
            {/* Personal Information Section */}
            <div className="form-section">
              <div className="menu-header">
                <div className="meal-icon">
                  <img src={userIcon} alt="Personal Information" className="meal-icon-img" />
                </div>
                <h3 className="meal-title">Personal Information</h3>
              </div>
              
              <div className="input-grid">
                <div className="input-group">
                  <label htmlFor="name" className="input-label">Full Name</label>
                  <input
                    type='text'
                    placeholder='Enter your full name'
                    className='form-input'
                    id='name'
                    maxLength='62'
                    minLength='2'
                    required
                    onChange={handleChange}
                    value={formData.name}
                  />
                </div>
                
                <div className="input-group">
                  <label htmlFor="enrollmentId" className="input-label">Enrollment ID</label>
                  <input
                    type='text'
                    placeholder='Enter your enrollment ID'
                    className='form-input'
                    id='enrollmentId'
                    required
                    onChange={handleChange}
                    value={formData.enrollmentId}
                  />
                </div>
                
                <div className="input-group">
                  <label htmlFor="phone" className="input-label">Phone Number</label>
                  <input
                    type='tel'
                    placeholder='Enter your phone number'
                    className='form-input'
                    id='phone'
                    required
                    onChange={handleChange}
                    value={formData.phone}
                  />
                </div>
              </div>
            </div>

            {/* Clothing Items Section */}
            <div className="form-section">
              <div className="menu-header">
                <div className="meal-icon">
                  <img src={clothesIcon} alt="Clothing Items" className="meal-icon-img" />
                </div>
                <h3 className="meal-title">Clothing Items</h3>
                <div className="total-counter">
                  Total Items: <span className="total-number">{getTotalItems()}</span>
                </div>
              </div>
              
              <div className="clothing-grid">
                {clothingItems.map((item) => (
                  <div key={item.key} className="clothing-item">
                    <div className="clothing-header">
                      <label htmlFor={item.key} className="clothing-label">
                        {item.label}
                      </label>
                    </div>
                    <div className="quantity-controls">
                      <button
                        type="button"
                        className="quantity-btn"
                        onClick={() => setFormData({
                          ...formData,
                          [item.key]: Math.max(0, (parseInt(formData[item.key]) || 0) - 1)
                        })}
                      >
                        −
                      </button>
                      <input
                        type='number'
                        className='quantity-input'
                        id={item.key}
                        min="0"
                        max="50"
                        onChange={handleChange}
                        value={formData[item.key]}
                      />
                      <button
                        type="button"
                        className="quantity-btn"
                        onClick={() => setFormData({
                          ...formData,
                          [item.key]: Math.min(50, (parseInt(formData[item.key]) || 0) + 1)
                        })}
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Images Section */}
            <div className="form-section">
              <div className="menu-header">
                <div className="meal-icon">
                  <img src={uploadIcon} alt="Upload Images" className="meal-icon-img" />
                </div>
                <h3 className="meal-title">Upload Image</h3>
              </div>
              <p className="section-description">
                Upload a photo of your laundry items
              </p>
              
              <div className="upload-area">
                <div className="upload-input-group">
                  <input
                    onChange={(e) => setFiles(e.target.files)}
                    className='file-input'
                    type='file'
                    id='images'
                    accept='image/*'
                    multiple
                  />
                  <button
                    type='button'
                    disabled={uploading}
                    onClick={handleImageSubmit}
                    className='upload-btn'
                  >
                    {uploading ? (
                      <>
                        <div className="loading-spinner"></div>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <svg className="upload-icon" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                        Upload Images
                      </>
                    )}
                  </button>
                </div>
                
                {imageUploadError && (
                  <div className="error-message">
                    <svg className="error-icon" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {imageUploadError}
                  </div>
                )}
                
                {formData.imageUrls.length > 0 && (
                  <div className="image-preview-grid">
                    {formData.imageUrls.map((url, index) => (
                      <div key={url} className="image-preview-item">
                        <img
                          src={url}
                          alt={`Upload ${index + 1}`}
                          className="preview-image"
                        />
                        <button
                          type='button'
                          onClick={() => handleRemoveImage(index)}
                          className='remove-image-btn'
                        >
                          <svg fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Submit Section */}
          <div className="submit-section">
            <button
              disabled={loading || uploading || getTotalItems() === 0}
              className='submit-btn'
              type="submit"
            >
              {loading ? (
                <>
                  <div className="loading-spinner"></div>
                  Creating Listing...
                </>
              ) : (
                <>
                  <svg className="submit-icon" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Create Laundry Listing
                </>
              )}
            </button>
            
            {error && (
              <div className="error-message">
                <svg className="error-icon" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}
          </div>
        </form>

        {/* PDF Download Section */}
        {formData.name && formData.enrollmentId && getTotalItems() > 0 && (
          <div className="download-section">
            <div className="download-card">
              <div className="download-header">
                <h3>
                  <span className="download-icon">📄</span>
                  Download Your Laundry Slip
                </h3>
                <p>Get your digital slip as a PDF document</p>
              </div>
              <PDFDownloadLink 
                document={generateSlip()} 
                fileName={`LaundrySlip_${formData.enrollmentId}_${new Date().toISOString().split('T')[0]}.pdf`}
                className="download-btn"
              >
                {({ blob, url, loading, error }) => (
                  loading ? (
                    <>
                      <div className="loading-spinner"></div>
                      Generating Slip...
                    </>
                  ) : (
                    <>
                      <svg className="download-btn-icon" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      Download Slip
                    </>
                  )
                )}
              </PDFDownloadLink>
            </div>
          </div>
        )}

        {/* Success Notification */}
        {showSuccess && (
          <div className="success-notification">
            <div className="success-content">
              <svg className="check-icon" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Laundry listing created successfully!</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// PDF Styles
const pdfStyles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
    fontFamily: 'Helvetica',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#007aff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007aff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 10,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
  },
  text: {
    fontSize: 12,
    color: '#444444',
    marginBottom: 5,
    paddingLeft: 10,
  },
  footer: {
    marginTop: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#eeeeee',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 10,
    color: '#666666',
    marginBottom: 3,
  },
});