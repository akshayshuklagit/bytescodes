const API_BASE = 'http://localhost:3000/api';
let authToken = localStorage.getItem('authToken');
let currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    if (authToken) {
        showApp();
        loadPatients();
        loadDoctors();
        loadMappings();
    }
    
    setupEventListeners();
});

function setupEventListeners() {
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    document.getElementById('register-form').addEventListener('submit', handleRegister);
    document.getElementById('patient-form').addEventListener('submit', handlePatientSubmit);
    document.getElementById('doctor-form').addEventListener('submit', handleDoctorSubmit);
    document.getElementById('mapping-form').addEventListener('submit', handleMappingSubmit);
}

// Auth Functions
async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            authToken = data.token;
            currentUser = data.user;
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            showMessage('Login successful!', 'success');
            showApp();
            loadPatients();
            loadDoctors();
            loadMappings();
        } else {
            showMessage(data.error || 'Login failed', 'error');
        }
    } catch (error) {
        showMessage('Network error', 'error');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    
    try {
        const response = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            authToken = data.token;
            currentUser = data.user;
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            showMessage('Registration successful!', 'success');
            showApp();
            loadPatients();
            loadDoctors();
            loadMappings();
        } else {
            showMessage(data.error || 'Registration failed', 'error');
        }
    } catch (error) {
        showMessage('Network error', 'error');
    }
}

function logout() {
    authToken = null;
    currentUser = {};
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    document.getElementById('auth-section').classList.remove('hidden');
    document.getElementById('app-section').classList.add('hidden');
    document.getElementById('user-info').classList.add('hidden');
}

function showApp() {
    document.getElementById('auth-section').classList.add('hidden');
    document.getElementById('app-section').classList.remove('hidden');
    document.getElementById('user-info').classList.remove('hidden');
    document.getElementById('user-name').textContent = currentUser.name;
}

// UI Functions
function showLogin() {
    document.getElementById('login-form').classList.remove('hidden');
    document.getElementById('register-form').classList.add('hidden');
    document.querySelector('.tab-btn').classList.add('active');
    document.querySelectorAll('.tab-btn')[1].classList.remove('active');
}

function showRegister() {
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('register-form').classList.remove('hidden');
    document.querySelector('.tab-btn').classList.remove('active');
    document.querySelectorAll('.tab-btn')[1].classList.add('active');
}

function showSection(section) {
    document.querySelectorAll('.section').forEach(s => s.classList.add('hidden'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    
    document.getElementById(`${section}-section`).classList.remove('hidden');
    event.target.classList.add('active');
}

function showMessage(message, type) {
    const messageEl = document.getElementById('message');
    messageEl.textContent = message;
    messageEl.className = `message ${type} show`;
    setTimeout(() => messageEl.classList.remove('show'), 3000);
}

// Patient Functions
async function loadPatients() {
    try {
        const response = await fetch(`${API_BASE}/patients`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        const patients = await response.json();
        displayPatients(patients);
    } catch (error) {
        showMessage('Failed to load patients', 'error');
    }
}

function displayPatients(patients) {
    const list = document.getElementById('patients-list');
    list.innerHTML = patients.map(patient => `
        <div class="list-item">
            <div class="list-item-info">
                <h3>${patient.name}</h3>
                <p>Age: ${patient.age} | Gender: ${patient.gender}</p>
                <p>Phone: ${patient.phone}</p>
                <p>Address: ${patient.address || 'N/A'}</p>
            </div>
            <div class="list-item-actions">
                <button class="btn-warning" onclick="editPatient('${patient._id}')">Edit</button>
                <button class="btn-danger" onclick="deletePatient('${patient._id}')">Delete</button>
            </div>
        </div>
    `).join('');
}

function showPatientForm() {
    document.getElementById('patient-form').classList.remove('hidden');
    document.getElementById('patient-id').value = '';
    document.getElementById('patient-form').reset();
}

function cancelPatientForm() {
    document.getElementById('patient-form').classList.add('hidden');
}

async function handlePatientSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('patient-id').value;
    const data = {
        name: document.getElementById('patient-name').value,
        age: parseInt(document.getElementById('patient-age').value),
        gender: document.getElementById('patient-gender').value,
        phone: document.getElementById('patient-phone').value,
        address: document.getElementById('patient-address').value
    };
    
    try {
        const url = id ? `${API_BASE}/patients/${id}` : `${API_BASE}/patients`;
        const method = id ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showMessage(result.message, 'success');
            cancelPatientForm();
            loadPatients();
        } else {
            showMessage(result.error || 'Operation failed', 'error');
        }
    } catch (error) {
        showMessage('Network error', 'error');
    }
}

async function editPatient(id) {
    try {
        const response = await fetch(`${API_BASE}/patients/${id}`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        const patient = await response.json();
        
        document.getElementById('patient-id').value = patient._id;
        document.getElementById('patient-name').value = patient.name;
        document.getElementById('patient-age').value = patient.age;
        document.getElementById('patient-gender').value = patient.gender;
        document.getElementById('patient-phone').value = patient.phone;
        document.getElementById('patient-address').value = patient.address || '';
        
        showPatientForm();
    } catch (error) {
        showMessage('Failed to load patient', 'error');
    }
}

async function deletePatient(id) {
    if (!confirm('Are you sure you want to delete this patient?')) return;
    
    try {
        const response = await fetch(`${API_BASE}/patients/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showMessage(result.message, 'success');
            loadPatients();
        } else {
            showMessage(result.error || 'Delete failed', 'error');
        }
    } catch (error) {
        showMessage('Network error', 'error');
    }
}

// Doctor Functions
async function loadDoctors() {
    try {
        const response = await fetch(`${API_BASE}/doctors`);
        const doctors = await response.json();
        displayDoctors(doctors);
        populateDoctorSelect(doctors);
    } catch (error) {
        showMessage('Failed to load doctors', 'error');
    }
}

function displayDoctors(doctors) {
    const list = document.getElementById('doctors-list');
    list.innerHTML = doctors.map(doctor => `
        <div class="list-item">
            <div class="list-item-info">
                <h3>Dr. ${doctor.name}</h3>
                <p>Specialization: ${doctor.specialization}</p>
                <p>Experience: ${doctor.experience} years</p>
                <p>Phone: ${doctor.phone} | Email: ${doctor.email}</p>
            </div>
            <div class="list-item-actions">
                <button class="btn-warning" onclick="editDoctor('${doctor._id}')">Edit</button>
                <button class="btn-danger" onclick="deleteDoctor('${doctor._id}')">Delete</button>
            </div>
        </div>
    `).join('');
}

function showDoctorForm() {
    document.getElementById('doctor-form').classList.remove('hidden');
    document.getElementById('doctor-id').value = '';
    document.getElementById('doctor-form').reset();
}

function cancelDoctorForm() {
    document.getElementById('doctor-form').classList.add('hidden');
}

async function handleDoctorSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('doctor-id').value;
    const data = {
        name: document.getElementById('doctor-name').value,
        specialization: document.getElementById('doctor-specialization').value,
        phone: document.getElementById('doctor-phone').value,
        email: document.getElementById('doctor-email').value,
        experience: parseInt(document.getElementById('doctor-experience').value)
    };
    
    try {
        const url = id ? `${API_BASE}/doctors/${id}` : `${API_BASE}/doctors`;
        const method = id ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showMessage(result.message, 'success');
            cancelDoctorForm();
            loadDoctors();
        } else {
            showMessage(result.error || 'Operation failed', 'error');
        }
    } catch (error) {
        showMessage('Network error', 'error');
    }
}

async function editDoctor(id) {
    try {
        const response = await fetch(`${API_BASE}/doctors/${id}`);
        const doctor = await response.json();
        
        document.getElementById('doctor-id').value = doctor._id;
        document.getElementById('doctor-name').value = doctor.name;
        document.getElementById('doctor-specialization').value = doctor.specialization;
        document.getElementById('doctor-phone').value = doctor.phone;
        document.getElementById('doctor-email').value = doctor.email;
        document.getElementById('doctor-experience').value = doctor.experience;
        
        showDoctorForm();
    } catch (error) {
        showMessage('Failed to load doctor', 'error');
    }
}

async function deleteDoctor(id) {
    if (!confirm('Are you sure you want to delete this doctor?')) return;
    
    try {
        const response = await fetch(`${API_BASE}/doctors/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showMessage(result.message, 'success');
            loadDoctors();
        } else {
            showMessage(result.error || 'Delete failed', 'error');
        }
    } catch (error) {
        showMessage('Network error', 'error');
    }
}

// Mapping Functions
async function loadMappings() {
    try {
        const response = await fetch(`${API_BASE}/mappings`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        const mappings = await response.json();
        displayMappings(mappings);
        await populatePatientSelect();
    } catch (error) {
        showMessage('Failed to load assignments', 'error');
    }
}

function displayMappings(mappings) {
    const list = document.getElementById('mappings-list');
    list.innerHTML = mappings.map(mapping => `
        <div class="list-item">
            <div class="list-item-info">
                <h3>${mapping.patientId?.name} → Dr. ${mapping.doctorId?.name}</h3>
                <p>Specialization: ${mapping.doctorId?.specialization}</p>
                <p>Doctor Phone: ${mapping.doctorId?.phone}</p>
            </div>
            <div class="list-item-actions">
                <button class="btn-danger" onclick="deleteMapping('${mapping._id}')">Remove</button>
            </div>
        </div>
    `).join('');
}

async function populatePatientSelect() {
    try {
        const response = await fetch(`${API_BASE}/patients`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        const patients = await response.json();
        const select = document.getElementById('mapping-patient');
        select.innerHTML = '<option value="">Select Patient</option>' + 
            patients.map(p => `<option value="${p._id}">${p.name}</option>`).join('');
    } catch (error) {
        console.error('Failed to load patients for select');
    }
}

function populateDoctorSelect(doctors) {
    const select = document.getElementById('mapping-doctor');
    select.innerHTML = '<option value="">Select Doctor</option>' + 
        doctors.map(d => `<option value="${d._id}">Dr. ${d.name} (${d.specialization})</option>`).join('');
}

function showMappingForm() {
    document.getElementById('mapping-form').classList.remove('hidden');
}

function cancelMappingForm() {
    document.getElementById('mapping-form').classList.add('hidden');
}

async function handleMappingSubmit(e) {
    e.preventDefault();
    const data = {
        patientId: document.getElementById('mapping-patient').value,
        doctorId: document.getElementById('mapping-doctor').value
    };
    
    try {
        const response = await fetch(`${API_BASE}/mappings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showMessage(result.message, 'success');
            cancelMappingForm();
            loadMappings();
        } else {
            showMessage(result.error || 'Assignment failed', 'error');
        }
    } catch (error) {
        showMessage('Network error', 'error');
    }
}

async function deleteMapping(id) {
    if (!confirm('Are you sure you want to remove this assignment?')) return;
    
    try {
        const response = await fetch(`${API_BASE}/mappings/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showMessage(result.message, 'success');
            loadMappings();
        } else {
            showMessage(result.error || 'Remove failed', 'error');
        }
    } catch (error) {
        showMessage('Network error', 'error');
    }
}