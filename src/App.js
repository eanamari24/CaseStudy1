
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AiOutlineSearch } from 'react-icons/ai'; 
import './App.css';
import AddResidents from './components/AddResidents';
import ListResidents from './components/ListResidents';
import DataVisualization from './components/DataVisualization';
import BarangayOfficials from './components/BarangayOfficials'; // Import the new component
import  './components/main.jpg';
import { FaHome, FaUserPlus, FaList, FaChartBar, FaSignOutAlt, FaArrowLeft, FaArrowRight } from 'react-icons/fa';



const API_URL = 'http://localhost:5000/students';

function App() {
  const [formData, setFormData] = useState({ id: '', Fullname: '', DateofBirth: '', sex: '', age: '', Purok: '' , CivilStatus: '', citizenship: '', phone: '' });
  const [students, setStudents] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [file, setFile] = useState(null);
  const [user, setUser] = useState(null); // Track logged-in user
  const [isLogin, setIsLogin] = useState(true); // Toggle between login and signup
  const [selectedRole, setSelectedRole] = useState('user'); // Track selected role
  const [activeSection, setActiveSection] = useState('home'); // Track active section
  const fileInputRef = useRef(null); // Create a ref for the file input
  const [isSidebarHidden, setIsSidebarHidden] = useState(false);
  

  // Fetch all students
  const fetchStudents = async () => {
    try {
      const response = await axios.get(API_URL);
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

   // Check for user data in localStorage on app load
   useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser)); // Set user state from localStorage
    }
  }, []);

  // Fetch students when user is logged in
  useEffect(() => {
    if (user) {
      fetchStudents();
    }
  }, [user]);

  const toggleSidebar = () => {
    setIsSidebarHidden(!isSidebarHidden);
  };

  // Handle login
  const handleLogin = async (username, password) => {
    try {
      const response = await axios.post('http://localhost:5000/login', { username, password });
      setUser(response.data); // Set user state
      localStorage.setItem('user', JSON.stringify(response.data)); // Save user data to localStorage
      toast.success('Login successful!');
    } catch (error) {
      toast.error('Invalid credentials');
    }
  };

  // Handle signup
  const handleSignup = async (username, password, role, secretPasskey) => {
    try {
      const response = await axios.post('http://localhost:5000/signup', { username, password, role, secretPasskey });
      toast.success('Signup successful!');
      setIsLogin(true); // Switch to login after signup
    } catch (error) {
      toast.error(error.response?.data?.message || 'Signup failed');
    }
  };

   // Logout
   const handleLogout = () => {
    setUser(null); // Clear user state
    localStorage.removeItem('user'); // Remove user data from localStorage
    toast.success('Logged out successfully!');
  };

  // Handle role change
  const handleRoleChange = (e) => {
    setSelectedRole(e.target.value);
  };

  // Render login/signup form
  const renderAuthForm = () => (
    <div className="auth-container">
      <div className="auth-form">
        <div className="system-title">Barangay Tibanga Resident Management System</div>
        <h2>{isLogin ? 'LOGIN' : 'SIGNUP'}</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const username = e.target.username.value;
            const password = e.target.password.value;
            if (isLogin) {
              handleLogin(username, password);
            } else {
              const role = e.target.role.value;
              const secretPasskey = e.target.secretPasskey?.value;
              handleSignup(username, password, role, secretPasskey);
            }
          }}
        >
          <input type="text" name="username" placeholder="Username" required />
          <input type="password" name="password" placeholder="Password" required />
          {!isLogin && (
            <>
              <select name="role" required onChange={handleRoleChange}>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
              {selectedRole === 'admin' && (
                <input
                  type="password"
                  name="secretPasskey"
                  placeholder="Admin Secret Passkey"
                  required
                />
              )}
            </>
          )}
          <button type="submit">{isLogin ? 'Login' : 'Signup'}</button>
        </form>
        <p>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Signup' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );

  // Render main application if user is logged in
  if (!user) {
    return (
      <div className="container">
        {renderAuthForm()}
        <ToastContainer />
      </div>
    );
  }


  // Delete student (only for admin)
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`, { data: { username: user.username } });
      toast.success('Student deleted!');
      fetchStudents();
    } catch (error) {
      toast.error('Error deleting student!');
    }
  };

  // Populate form for updating student
  const handleEdit = (student) => {
    setFormData(student);
    setIsEditing(true);
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };


    // Render Home Section
  const renderHome = () => (
    <div className="home-page">
      <h1>Barangay Tibanga</h1>
      <p>Resident Profiling Management System</p>
      <BarangayOfficials /> {/* Add the Barangay Officials component */}
    </div>
  );

  
  

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'home':
        return renderHome();
      case 'addResidents':
        return (
          <AddResidents
            fetchStudents={fetchStudents}
            formData={formData}
            setFormData={setFormData}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            students={students}
          />
        );
      case 'listResidents':
        return (
          <ListResidents
            students={students}
            fetchStudents={fetchStudents}
            user={user}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
            searchTerm={searchTerm}
            handleSearchChange={handleSearchChange}
          />
        );
      case 'dataVisualization':
        return <DataVisualization students={students} />;
      default:
        return null;
    }
  };

  return (
    <div className="container">
      <div className={`sidebar ${isSidebarHidden ? 'hidden' : ''}`}>
        <h2>Menu</h2>
        <button className="hide-sidebar-button" onClick={toggleSidebar}>
          {isSidebarHidden ? <FaArrowRight /> : <FaArrowLeft />}
        </button>
        <ul>
          <li className={activeSection === 'home' ? 'active' : ''} onClick={() => setActiveSection('home')}>
            <span className="icon"><FaHome /></span> Home
          </li>
          <li className={activeSection === 'addResidents' ? 'active' : ''} onClick={() => setActiveSection('addResidents')}>
            <span className="icon"><FaUserPlus /></span> Add Residents
          </li>
          <li className={activeSection === 'listResidents' ? 'active' : ''} onClick={() => setActiveSection('listResidents')}>
            <span className="icon"><FaList /></span> List of Residents
          </li>
          <li className={activeSection === 'dataVisualization' ? 'active' : ''} onClick={() => setActiveSection('dataVisualization')}>
            <span className="icon"><FaChartBar /></span> Data Visualization
          </li>
        </ul>
        <button className="logout-button" onClick={handleLogout}>
          <span className="icon"><FaSignOutAlt /></span> Logout
        </button>
      </div>
      <div className={`main-content ${isSidebarHidden ? 'sidebar-hidden' : ''}`}>
        {renderActiveSection()}
      </div>

      <ToastContainer />
    </div>
  );
}



export default App;