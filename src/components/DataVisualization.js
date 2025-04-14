import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FaUsers, FaMale, FaFemale, FaHeart, FaGlobe, FaPrayingHands } from 'react-icons/fa'; // Import icons from react-icons

const COLORS = ['#ff6384', '#36a2eb', '#ffcc00', '#4bc0c0', '#9966ff'];

// Custom Tooltip for Bar Charts
const CustomBarTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip" style={{ backgroundColor: '#fff', padding: '10px', border: '1px solid #ccc' }}>
        <p>{`${label}: ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

const DataVisualization = ({ students }) => {
  if (!students || students.length === 0) {
    return <div>No data available.</div>;
  }

  // Calculate total number of residents
  const totalResidents = students.length;

  // Calculate total males and females
  const totalMales = students.filter(student => student.sex === 'Male').length;
  const totalFemales = students.filter(student => student.sex === 'Female').length;

  // Calculate total civil status (Single, Married, Separated, Widowed)
  const civilStatusCounts = students.reduce((acc, student) => {
    const status = student.CivilStatus; // Ensure this matches the field name in your data
    if (['Single', 'Married', 'Separated', 'Widowed'].includes(status)) {
      acc[status] = (acc[status] || 0) + 1;
    }
    return acc;
  }, {});

  // Calculate total citizenship
  const citizenshipCounts = students.reduce((acc, student) => {
    const citizenship = student.citizenship || 'Unknown';
    acc[citizenship] = (acc[citizenship] || 0) + 1;
    return acc;
  }, {});

  // Calculate total religion
  const religionCounts = students.reduce((acc, student) => {
    const religion = student.religion || 'Unknown';
    acc[religion] = (acc[religion] || 0) + 1;
    return acc;
  }, {});

  // Process chart data
  const processChartData = (students) => {
    // Purok Distribution
    const purokData = students.reduce((acc, student) => {
      acc[student.purok] = (acc[student.purok] || 0) + 1;
      return acc;
    }, {});

    const purokChart = Object.keys(purokData).map((key) => ({
      name: key,
      count: purokData[key],
    }));

    // Age Distribution
    const ageData = students.reduce((acc, student) => {
      acc[student.age] = (acc[student.age] || 0) + 1;
      return acc;
    }, {});

    const ageChart = Object.keys(ageData)
      .map((key) => ({ age: key, count: ageData[key] }))
      .sort((a, b) => a.age - b.age);

    // Month of Birth Distribution
    const monthData = students.reduce((acc, student) => {
      const date = new Date(student.DateofBirth);
      if (!isNaN(date.getTime())) {
        const month = date.toLocaleString('default', { month: 'long' }); // Get full month name
        acc[month] = (acc[month] || 0) + 1;
      }
      return acc;
    }, {});

    const monthChart = Object.keys(monthData).map((key) => ({
      name: key,
      count: monthData[key],
    }));

    // Year of Birth Distribution
    const yearData = students.reduce((acc, student) => {
      const date = new Date(student.DateofBirth);
      if (!isNaN(date.getTime())) {
        const year = date.getFullYear().toString();
        acc[year] = (acc[year] || 0) + 1;
      }
      return acc;
    }, {});

    const yearChart = Object.keys(yearData).map((key) => ({
      name: key,
      count: yearData[key],
    }));

    return { purokChart, ageChart, monthChart, yearChart };
  };

  const { purokChart, ageChart, monthChart, yearChart } = React.useMemo(() => processChartData(students), [students]);

  return (
    <div className="main-content">
      <h2>Data Visualization</h2>

      {/* Total Residents Container */}
      <div className="total-residents-container">
        {/* First Row: Total Residents, Total Males, Total Females */}
        <div className="total-residents-row">
          {/* Total Residents */}
          <div className="total-residents-card">
            <div className="total-residents-icon">
              <FaUsers size={32} />
            </div>
            <div className="total-residents-number">
              <h3>Total Residents</h3>
              <p>{totalResidents}</p>
            </div>
          </div>

          {/* Total Males */}
          <div className="total-residents-card">
            <div className="total-residents-icon">
              <FaMale size={32} />
            </div>
            <div className="total-residents-number">
              <h3>Total Males</h3>
              <p>{totalMales}</p>
            </div>
          </div>

          {/* Total Females */}
          <div className="total-residents-card">
            <div className="total-residents-icon">
              <FaFemale size={32} />
            </div>
            <div className="total-residents-number">
              <h3>Total Females</h3>
              <p>{totalFemales}</p>
            </div>
          </div>
        </div>

        {/* Second Row: Civil Status, Religion, Citizenship */}
        <div className="total-residents-row">
          {/* Total Civil Status */}
          <div className="total-residents-card">
            <div className="total-residents-icon">
              <FaHeart size={32} />
            </div>
            <div className="total-residents-number">
              <h3>Civil Status</h3>
              <ul>
                {Object.entries(civilStatusCounts).map(([status, count]) => (
                  <li key={status}>{`${status}: ${count}`}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Total Religion */}
          <div className="total-residents-card">
            <div className="total-residents-icon">
              <FaPrayingHands size={32} />
            </div>
            <div className="total-residents-number">
              <h3>Religion</h3>
              <ul>
                {Object.entries(religionCounts).map(([religion, count]) => (
                  <li key={religion}>{`${religion}: ${count}`}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Total Citizenship */}
          <div className="total-residents-card">
            <div className="total-residents-icon">
              <FaGlobe size={32} />
            </div>
            <div className="total-residents-number">
              <h3>Citizenship</h3>
              <ul>
                {Object.entries(citizenshipCounts).map(([citizenship, count]) => (
                  <li key={citizenship}>{`${citizenship}: ${count}`}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="chart-container">
        {/* Purok Distribution Bar Chart */}
        <div>
          <h3>Purok Distribution</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={purokChart}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip content={<CustomBarTooltip />} />
              <Legend />
              <Bar dataKey="count" fill="#36a2eb" animationDuration={500} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Age Distribution Bar Chart */}
        <div>
          <h3>Age Distribution</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={ageChart}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="age" />
              <YAxis />
              <Tooltip content={<CustomBarTooltip />} />
              <Legend />
              <Bar dataKey="count" fill="#ff6384" animationDuration={500} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Month of Birth Distribution Bar Chart */}
        <div>
          <h3>Month of Birth Distribution</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={monthChart}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip content={<CustomBarTooltip />} />
              <Legend />
              <Bar dataKey="count" fill="#4bc0c0" animationDuration={500} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Year of Birth Distribution Bar Chart */}
        <div>
          <h3>Year of Birth Distribution</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={yearChart}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip content={<CustomBarTooltip />} />
              <Legend />
              <Bar dataKey="count" fill="#9966ff" animationDuration={500} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DataVisualization;