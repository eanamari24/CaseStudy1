
const express = require('express');
const redis = require('redis');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const bcrypt = require('bcrypt');
const saltRounds = 10;
require('dotenv').config();


const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to Redis
const client = redis.createClient({
  url: 'redis://@127.0.0.1:6379'  // Default Redis connection
});

client.connect()
  .then(() => console.log('Connected to Redis'))
  .catch(err => console.error('Redis connection error:', err));

// Signup endpoint
app.post('/signup', async (req, res) => {
  const { username, password, role, secretPasskey } = req.body;

  // Validate input
  if (!username || !password || !role) {
    return res.status(400).json({ message: 'Username, password, and role are required' });
  }

  // Check if the user already exists
  const existingUser = await client.hGetAll(`user:${username}`);
  if (Object.keys(existingUser).length > 0) {
    return res.status(400).json({ message: 'User already exists' });
  }

  // Validate admin role (requires secret passkey)
  if (role === 'admin' && secretPasskey !== 'admin123') { // Hardcoded secret passkey
    return res.status(403).json({ message: 'Invalid secret passkey for admin role' });
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // Save user data in Redis
  await client.hSet(`user:${username}`, 'username', username);
  await client.hSet(`user:${username}`, 'password', hashedPassword);
  await client.hSet(`user:${username}`, 'role', role);

  res.status(201).json({ message: 'User registered successfully' });
});

// Login endpoint
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // Validate input
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  // Fetch user data from Redis
  const user = await client.hGetAll(`user:${username}`);
  if (Object.keys(user).length === 0) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Compare passwords
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  // Return user data (excluding password)
  res.status(200).json({ username: user.username, role: user.role });
});

// Middleware to check if user is admin
const isAdmin = async (req, res, next) => {
  const { username } = req.body;

  // Fetch user role from Redis
  const user = await client.hGetAll(`user:${username}`);
  if (user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  }

  next();
};  

// CRUD Operations

// Route to save student data
app.post('/students', async (req, res) => {
  const { id, Fullname, DateofBirth, sex, age, purok, CivilStatus, citizenship,religion, phone } = req.body;

  // Validate input fields
  if (!id || !Fullname || !DateofBirth || !sex || !age || !purok || !CivilStatus || !citizenship || !religion || !phone) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Set student data in Redis (using object syntax for Redis v4 and above)
    const studentData = { Fullname, DateofBirth, sex, age, purok, CivilStatus, citizenship, religion, phone };

    // Save student data in Redis hash
    await client.hSet(`student:${id}`, 'Fullname', studentData.Fullname);
    await client.hSet(`student:${id}`, 'DateofBirth', studentData.DateofBirth);
    await client.hSet(`student:${id}`, 'sex', studentData.sex);
    await client.hSet(`student:${id}`, 'age', studentData.age);
    await client.hSet(`student:${id}`, 'purok', studentData.purok);
    await client.hSet(`student:${id}`, 'CivilStatus', studentData.CivilStatus);
    await client.hSet(`student:${id}`, 'citizenship', studentData.citizenship);
    await client.hSet(`student:${id}`, 'religion', studentData.religion);
    await client.hSet(`student:${id}`, 'phone', studentData.phone);

    // Respond with success message
    res.status(201).json({ message: 'Student saved successfully' });
  } catch (error) {
    console.error('Error saving student:', error);
    res.status(500).json({ message: 'Failed to save student' });
  }
});

// Read (R)
app.get('/students/:id', async (req, res) => {
  const id = req.params.id;
  const student = await client.hGetAll(`student:${id}`);
  if (Object.keys(student).length === 0) {
    return res.status(404).json({ message: 'Student not found' });
  }
  res.json(student);
});

// Read all students
app.get('/students', async (req, res) => {
  const keys = await client.keys('student:*');
  const students = await Promise.all(keys.map(async (key) => {
    return { id: key.split(':')[1], ...(await client.hGetAll(key)) };
  }));
  res.json(students);
});

// Update (U)
app.put('/students/:id', async (req, res) => {
  const id = req.params.id;
  const { Fullname, DateofBirth, sex, age, purok, CivilStatus, citizenship, religion, phone } = req.body;

  if (!Fullname && !DateofBirth && !sex && !age && !purok && !CivilStatus && !citizenship && !religion && !phone) {
    return res.status(400).json({ message: 'At least one field is required to update' });
  }

  try {
    const existingStudent = await client.hGetAll(`student:${id}`);
    if (Object.keys(existingStudent).length === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Update student data in Redis
    if (Fullname) await client.hSet(`student:${id}`, 'Fullname', Fullname);
    if (DateofBirth) await client.hSet(`student:${id}`, 'DateofBirth', DateofBirth);
    if (sex) await client.hSet(`student:${id}`, 'sex', sex);
    if (age) await client.hSet(`student:${id}`, 'age', age);
    if (purok) await client.hSet(`student:${id}`, 'purok', purok);
    if (CivilStatus) await client.hSet(`student:${id}`, 'CivilStatus', CivilStatus);
    if (citizenship) await client.hSet(`student:${id}`, 'citizenship', citizenship);
    if (religion) await client.hSet(`student:${id}`, 'religion', religion);
    if (phone) await client.hSet(`student:${id}`, 'phone', phone);

    res.status(200).json({ message: 'Student updated successfully' });
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({ message: 'Failed to update student' });
  }
});

// Delete Student (Admin Only)
app.delete('/students/:id', isAdmin, async (req, res) => {
  const id = req.params.id;
  await client.del(`student:${id}`);
  res.status(200).json({ message: 'Student deleted successfully' });
});
// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

app.post('/students/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const results = [];

  // Read and parse the CSV file
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data) => {
      console.log('Parsed row:', data); // Log parsed data for debugging
      results.push(data);
    })
    .on('end', async () => {
      try {
        let skippedRecords = 0;
        let addedRecords = 0;

        // Validate and save each student record to Redis
        for (const student of results) {
          // Map mixed case keys to lowercase
          const mappedStudent = {
            id: student.id || student.ID,
            Fullname: student.Fullname || student.Fullname,
            DateofBirth: student.DateofBirth || student.DateofBirth,
            sex: student.sex || student.Sex,
            age: student.age || student.Age,
            purok: student.purok || student.Purok,
            CivilStatus: student.CivilStatus || student.CivilStatus,
            citizenship: student.citizenship || student.citizenship,
            religion: student.religion || student.religion,
            phone: student.phone || student.Phone,
          };

          const { id, Fullname, DateofBirth, sex, age, purok, CivilStatus, citizenship, religion, phone } = mappedStudent;

          // Validate required fields
          if (!id || !Fullname || !DateofBirth || !sex || !age || !purok || !CivilStatus || !citizenship || !religion || !phone) {
            console.warn(`Skipping invalid student record: ${JSON.stringify(student)}`);
            skippedRecords++;
            continue;
          }

          // Check if student with the same ID already exists
          const existingStudent = await client.hGetAll(`student:${id}`);
          if (Object.keys(existingStudent).length > 0) {
            console.warn(`Skipping duplicate student record with ID: ${id}`);
            skippedRecords++;
            continue;
          }

          // Save student data in Redis hash
          await client.hSet(`student:${id}`, 'Fullname', Fullname);
          await client.hSet(`student:${id}`, 'DateofBirth', DateofBirth);
          await client.hSet(`student:${id}`, 'sex', sex);
          await client.hSet(`student:${id}`, 'age', age);
          await client.hSet(`student:${id}`, 'purok', purok);
          await client.hSet(`student:${id}`, 'CivilStatus', CivilStatus);
          await client.hSet(`student:${id}`, 'citizenship', citizenship);
          await client.hSet(`student:${id}`, 'religion', religion);
          await client.hSet(`student:${id}`, 'phone', phone);

          addedRecords++;
        }

        // Delete the uploaded file after processing
        fs.unlinkSync(req.file.path);

        res.status(201).json({ 
          message: 'CSV data imported successfully',
          addedRecords: addedRecords,
          skippedRecords: skippedRecords,
        });
      } catch (error) {
        console.error('Error importing CSV data:', error);
        res.status(500).json({ message: 'Failed to import CSV data' });
      }
    });
});



// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});