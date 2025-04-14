import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';


const AddResidents = ({ fetchStudents, formData, setFormData, isEditing, setIsEditing, students }) => {
  const [citizenshipOther, setCitizenshipOther] = useState('');
  const [religionOther, setReligionOther] = useState('');

  useEffect(() => {
    if (!isEditing) {
      // Auto-generate ID based on the last ID in the students array
      const lastId = students.length > 0 ? Math.max(...students.map((s) => parseInt(s.id))) + 1 : 1;
      setFormData((prevData) => ({ ...prevData, id: lastId.toString() }));
    }
  }, [isEditing, students]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCitizenshipChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, citizenship: value });
    if (value !== 'Others') {
      setCitizenshipOther('');
    }
  };

  const handleReligionChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, religion: value });
    if (value !== 'Others') {
      setReligionOther('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { ...formData };
    if (data.citizenship === 'Others') {
      data.citizenship = citizenshipOther;
    }
    if (data.religion === 'Others') {
      data.religion = religionOther;
    }

    try {
      if (isEditing) {
        await axios.put(`http://localhost:5000/students/${formData.id}`, data);
        toast.success('Resident updated successfully!');
      } else {
        await axios.post('http://localhost:5000/students', data);
        toast.success('Resident added successfully!');
      }
      fetchStudents();
      setFormData({ id: '', Fullname: '', DateofBirth: '', sex: '', age: '', purok: '', CivilStatus: '', citizenship: '', religion: '', phone: '' });
      setIsEditing(false);
    } catch (error) {
      toast.error(`Error ${isEditing ? 'updating' : 'adding'} resident!`);
    }
  };

  return (
    <div className="add-resident-container">
  <h3>{isEditing ? 'Edit Resident' : 'ADD NEW RESIDENT'}</h3>
  <form onSubmit={handleSubmit}>
    <div className="form-row">
      <div className="form-group">
        <label>ID</label>
        <input
          type="text"
          name="id"
          value={formData.id}
          onChange={handleChange}
          required
          disabled
        />
      </div>
      <div className="form-group">
        <label>Full Name</label>
        <input
          type="text"
          name="Fullname"
          placeholder="Full Name"
          value={formData.Fullname}
          onChange={handleChange}
          required
        />
      </div>
      </div>
      <div className="form-row">
      <div className="form-group">
        <label>Date of Birth</label>
        <input
          type="date"
          name="DateofBirth"
          value={formData.DateofBirth}
          onChange={handleChange}
          required
        />
      </div>
          <div className="form-group">
            <label>Sex</label>
            <select name="sex" value={formData.sex} onChange={handleChange} required>
              <option value="">Select Sex</option>
              <option value="Female">Female</option>
              <option value="Male">Male</option>
            </select>
          </div>
        </div>
        <div className="form-row">
        <div className="form-group">
        <label>Age</label>
        <input
          type="number"
          name="age"
          placeholder="Age"
          value={formData.age}
          onChange={handleChange}
          required
        />
      </div>
    
          <div className="form-group">
            <label>Purok</label>
            <select name="purok" value={formData.purok} onChange={handleChange} required>
              <option value="">Select Purok</option>
              {Array.from({ length: 17 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Civil Status</label>
            <select name="CivilStatus" value={formData.CivilStatus} onChange={handleChange} required>
              <option value="">Select Civil Status</option>
              <option value="Single">Single</option>
              <option value="Married">Married</option>
              <option value="Widowed">Widowed</option>
              <option value="Separated">Separated</option>
            </select>
          </div>
          <div className="form-group">
            <label>Citizenship</label>
            <select name="citizenship" value={formData.citizenship} onChange={handleCitizenshipChange} required>
              <option value="">Select Citizenship</option>
              <option value="Filipino">Filipino</option>
              <option value="Others">Foreign</option>
            </select>
            {formData.citizenship === 'Others' && (
              <input
                type="text"
                placeholder="Specify Citizenship"
                value={citizenshipOther}
                onChange={(e) => setCitizenshipOther(e.target.value)}
                required
              />
            )}
          </div>
        </div>
        <div className="form-row">
      <div className="form-group">
        <label>Religion</label>
        <select name="religion" value={formData.religion} onChange={handleReligionChange} required>
          <option value="">Select Religion</option>
          <option value="Roman Catholic">Roman Catholic</option>
          <option value="Islam">Islam</option>
          <option value="Born Again">Born Again</option>
          <option value="SDA">SDA</option>
          <option value="Iglesia ni Cristo">Iglesia ni Cristo</option>
          <option value="Others">Others</option>
        </select>
        {formData.religion === 'Others' && (
          <input
            type="text"
            placeholder="Specify Religion"
            value={religionOther}
            onChange={(e) => setReligionOther(e.target.value)}
            required
          />
        )}
      </div>
      <div className="form-group">
        <label>Phone</label>
        <input
          type="text"
          name="phone"
          placeholder="Phone"
          value={formData.phone}
          onChange={handleChange}
          required
        />
      </div>
        </div>
        <div className="form-row">
          <button type="submit">{isEditing ? 'Update Resident' : 'Add Resident'}</button>
        </div>
      </form>
    </div>
  );
};

export default AddResidents;