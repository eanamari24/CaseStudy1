// components/BarangayOfficials.js
import React from 'react';
import { FaMale, FaFemale } from 'react-icons/fa'; // Import boy and girl icons
import './BarangayOfficials.css'; // Optional: Add custom styles for this component

const BarangayOfficials = () => {
  // Sample data for Barangay officials
  const officials = [
    {
      id: 1,
      name: 'Zosima Anduyan',
      position: 'Barangay Captain',
      gender: 'female', // Use 'male' or 'female'
    },
    {
      id: 2,
      name: 'Lou Daryl Paterno',
      position: 'Barangay Kagawad',
      gender: 'male',
    },
    {
      id: 3,
      name: 'Ronaldo Torres',
      position: 'Barangay Kagawad',
      gender: 'male',
    },
    {
      id: 4,
      name: 'Marissa Cabili',
      position: 'Barangay Kagawad',
      gender: 'female',
    },
    {
      id: 5,
      name: 'Jaime Artos',
      position: 'Barangay Kagawad',
      gender: 'male',
    },
    {
        id: 6,
        name: 'Victor Anadeo',
        position: 'Barangay Kagawad',
        gender: 'male',
      },
      {
        id: 7,
        name: 'Ricardo Macapil',
        position: 'Barangay Kagawad',
        gender: 'male',
      },
      {
        id: 8,
        name: 'Christopher Andaloc',
        position: 'Barangay Kagawad',
        gender: 'male',
      },
      {
        id: 9,
        name: 'Dianne Disamparado',
        position: 'Barangay SK Chairman',
        gender: 'Female',
      },
  ];

  return (
    <div className="barangay-officials">
      <h2>Barangay Tibanga Officials</h2>
      <div className="officials-list">
        {officials.map((official) => (
          <div key={official.id} className="official-card">
            <div className="official-icon">
              {official.gender === 'male' ? (
                <FaMale className="icon male" /> // Male icon
              ) : (
                <FaFemale className="icon female" /> // Female icon
              )}
            </div>
            <div className="official-details">
              <h3>{official.name}</h3>
              <p>{official.position}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BarangayOfficials;