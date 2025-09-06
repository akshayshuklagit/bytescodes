const User = require('./User');
const Patient = require('./Patient');
const Doctor = require('./Doctor');
const PatientDoctor = require('./PatientDoctor');

// Define associations
User.hasMany(Patient, { foreignKey: 'userId' });
Patient.belongsTo(User, { foreignKey: 'userId' });

Patient.belongsToMany(Doctor, { through: PatientDoctor, foreignKey: 'patientId' });
Doctor.belongsToMany(Patient, { through: PatientDoctor, foreignKey: 'doctorId' });

module.exports = {
  User,
  Patient,
  Doctor,
  PatientDoctor
};