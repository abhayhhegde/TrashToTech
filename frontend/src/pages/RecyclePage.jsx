import React, { useState } from 'react';
import { QrReader } from 'react-qr-reader';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate instead of useHistory

const API_BASE_URL = 'http://192.168.6.134:5000'; // Replace with your backend URL

const RecyclePage = () => {
  const navigate = useNavigate(); // Initialize useNavigate for navigation
  const [formData, setFormData] = useState({
    itemName: '',
    category: '',
    weight: '',
    age: '',
    condition: '',
  });
  const [points, setPoints] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [qrError, setQrError] = useState(null);
  const [isRecycleSuccessful, setIsRecycleSuccessful] = useState(false); // State to track recycle success
  const [isQRCodeScanned, setIsQRCodeScanned] = useState(false); // State to track if QR code has been scanned successfully

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Validation function to check if the required data is filled
  const validateFormData = () => {
    const { itemName, category, weight, age, condition } = formData;
    return itemName && category && weight > 0 && age >= 0 && condition;
  };

  // Function to open the scanner
  const openScanner = () => {
    if (!validateFormData()) {
      alert('Please fill out all fields before scanning the QR code.');
      return;
    }
    setQrError(null); // Clear any previous errors
    setIsScannerOpen(true); // Set scanner to open
  };

  // Function to handle QR code scan result
  const handleScan = (data) => {
    if (data) {
      if (data === 'https://www.linkinglearning.com.au/') { // Replace with your dummy QR code value
        console.log("QR code scanned successfully!"); // QR code is valid
        setQrError(null); // Reset any error
        setIsQRCodeScanned(true); // Mark QR code as scanned
        setIsScannerOpen(false); // Close the scanner after a successful scan
      } else {
        setQrError('Invalid QR Code. Please scan the correct QR code.');
      }
    }
  };

  // Function to handle QR code scanning error
  const handleError = (err) => {
    console.error(err);
    setQrError('Error scanning QR Code. Please try again.');
  };

  // Handle form submission (recycling process)
  const handleRecycle = async () => {
    const { itemName, category, weight, age, condition } = formData;

    // Retrieve email from localStorage
    const userEmail = localStorage.getItem('email');
    if (!userEmail) {
      alert('User email not found. Please log in again.');
      return;
    }

    setIsAnalyzing(true);

    try {
      // Send the recycling data and email to the server
      const response = await axios.post(`${API_BASE_URL}/recyclepage`, {
        itemName,
        category,
        weight,
        age,
        condition,
        email: userEmail, // Ensure email is passed to the server
      });

      setPoints(response.data.points);
      setIsRecycleSuccessful(true); // Mark recycle as successful
    } catch (error) {
      console.error('Error submitting recycling data:', error);
      alert('Error submitting data. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Function to navigate to the rewards page
  const goToRewardsPage = () => {
    navigate('/rewards'); // Use navigate instead of history.push
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 flex flex-col items-center mt-20">
      <h1 className="text-3xl font-bold mb-8">Recycle Your E-Waste</h1>

      {/* Form for recycling details */}
      <div className="flex flex-col mb-4">
        <label htmlFor="itemName" className="mb-2">Item Name</label>
        <input
          type="text"
          id="itemName"
          name="itemName"
          value={formData.itemName}
          onChange={handleInputChange}
          className="p-2 rounded bg-gray-800 text-white"
          placeholder="Enter the item name"
        />
      </div>

      <div className="flex flex-col mb-4">
        <label htmlFor="category" className="mb-2">Category</label>
        <select
          id="category"
          name="category"
          value={formData.category}
          onChange={handleInputChange}
          className="p-2 rounded bg-gray-800 text-white"
        >
          <option value="" disabled>Select E-Waste Category</option>
          <option value="Smartphone">Smartphone</option>
          <option value="Laptop">Laptop</option>
          <option value="Tablet">Tablet</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div className="flex flex-col mb-4">
        <label htmlFor="weight" className="mb-2">Item Weight (in kg)</label>
        <input
          type="number"
          id="weight"
          name="weight"
          value={formData.weight}
          onChange={handleInputChange}
          className="p-2 rounded bg-gray-800 text-white"
          placeholder="Enter the item weight"
        />
      </div>

      <div className="flex flex-col mb-4">
        <label htmlFor="age" className="mb-2">Item Age (in years)</label>
        <input
          type="number"
          id="age"
          name="age"
          value={formData.age}
          onChange={handleInputChange}
          className="p-2 rounded bg-gray-800 text-white"
          placeholder="Enter how old the item is"
        />
      </div>

      <div className="flex flex-col mb-4">
        <label htmlFor="condition" className="mb-2">Condition</label>
        <select
          id="condition"
          name="condition"
          value={formData.condition}
          onChange={handleInputChange}
          className="p-2 rounded bg-gray-800 text-white"
        >
          <option value="" disabled>Select Condition</option>
          <option value="Good">Good</option>
          <option value="Moderate">Moderate</option>
          <option value="Poor">Poor</option>
        </select>
      </div>

      <button
        onClick={openScanner}
        className="bg-blue-500 px-4 py-2 rounded hover:bg-blue-600"
      >
        Open Scanner
      </button>

      {/* Show QR code scanner if it's open and not scanned yet */}
      {isScannerOpen && !isQRCodeScanned && (
        <div className="mb-8">
          <QrReader
            onResult={(result, error) => {
              if (result) {
                handleScan(result?.text);
              }
              if (error) {
                handleError(error);
              }
            }}
            style={{ width: '300px' }}
          />
          {qrError && <p className="text-red-500 mt-2">{qrError}</p>}
        </div>
      )}

      <button
        onClick={handleRecycle}
        className="bg-green-500 px-4 py-2 rounded hover:bg-green-600 mt-5"
        disabled={!validateFormData() || !isQRCodeScanned} // Disable if form data is invalid or QR code is not scanned
      >
        Recycle Now
      </button>

      {isAnalyzing && <p className="mt-4">Analyzing your e-waste...</p>}
      {points && (
        <div className="mt-4">
          <h3 className="text-xl">You've earned {points} points!</h3>
          {isRecycleSuccessful && (
            <button
              onClick={goToRewardsPage}
              className="bg-purple-500 px-4 py-2 rounded hover:bg-purple-600 mt-4"
            >
              View Rewards
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default RecyclePage;
