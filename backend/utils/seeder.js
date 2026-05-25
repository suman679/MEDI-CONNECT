require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const connectDB = require('../config/db');

const User         = require('../models/User');
const Doctor       = require('../models/Doctor');
const Appointment  = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const MedicalRecord= require('../models/MedicalRecord');
const Notification = require('../models/Notification');

const seed = async () => {
  await connectDB();
  console.log('🌱 Seeding database…');

  await Promise.all([User.deleteMany(), Doctor.deleteMany(), Appointment.deleteMany(), Prescription.deleteMany(), MedicalRecord.deleteMany(), Notification.deleteMany()]);
  console.log('🗑️  Cleared existing data');

  // ── Users ──────────────────────────────────────────────────────────────
  const hashPw = (pw) => bcrypt.hash(pw, 12);

  const adminUser   = await User.create({ name:'Admin User',      email:'admin@mediconnect.com',       password:'Admin@123',   role:'admin',   isVerified:true, phone:'+91-9000000000' });
  const patientUser = await User.create({ name:'Arjun Kapoor',    email:'arjun@example.com',           password:'Patient@123', role:'patient', isVerified:true, phone:'+91-9876543210', gender:'male', dateOfBirth:new Date('1997-04-12'), bloodGroup:'O+', address:{ street:'42 MG Road', city:'Mumbai', state:'Maharashtra', zipCode:'400001', country:'India' } });

  const doctorData = [
    { name:'Dr. Priya Sharma',  email:'dr.priya@mediconnect.com',  spec:'Cardiologist',      exp:14, fee:1800, rating:4.9, reviews:312, consults:1840, hospital:'AIIMS New Delhi',        lic:'MCI-DL-01234', avail:true,  langs:['English','Hindi'],          bio:'Senior cardiologist specializing in interventional cardiology and heart failure management with 14+ years of experience.' },
    { name:'Dr. Rahul Mehta',   email:'dr.rahul@mediconnect.com',  spec:'Neurologist',       exp:11, fee:2200, rating:4.7, reviews:198, consults:1120, hospital:'Fortis Hospital Mumbai', lic:'MCI-MH-02345', avail:false, langs:['English','Hindi'],          bio:'Neurologist with expertise in epilepsy, stroke, and neurodegenerative diseases.' },
    { name:'Dr. Anjali Nair',   email:'dr.anjali@mediconnect.com', spec:'Dermatologist',     exp:8,  fee:1200, rating:4.8, reviews:445, consults:2100, hospital:'Apollo Hospital Kochi',  lic:'KMC-KL-03456', avail:true,  langs:['English','Malayalam','Hindi'],bio:'Dermatologist specializing in acne, eczema, psoriasis, and cosmetic dermatology.' },
    { name:'Dr. Sanjay Gupta',  email:'dr.sanjay@mediconnect.com', spec:'General Physician', exp:20, fee:800,  rating:4.6, reviews:892, consults:5600, hospital:'Max Healthcare Saket',   lic:'MCI-DL-04567', avail:true,  langs:['English','Hindi','Punjabi'], bio:'Experienced general physician handling a wide range of acute and chronic medical conditions.' },
    { name:'Dr. Meera Patel',   email:'dr.meera@mediconnect.com',  spec:'Gynecologist',      exp:16, fee:1600, rating:4.9, reviews:567, consults:3200, hospital:'Kokilaben Ambani Hospital',lic:'MMC-MH-05678',avail:false, langs:['English','Gujarati','Hindi'],bio:'Gynecologist specializing in high-risk pregnancy, fertility, and minimally invasive surgeries.' },
    { name:'Dr. Arun Krishnan', email:'dr.arun@mediconnect.com',   spec:'Orthopedic',        exp:12, fee:2000, rating:4.5, reviews:234, consults:980,  hospital:'NIMHANS Bangalore',       lic:'KMC-KA-06789', avail:true,  langs:['English','Tamil'],           bio:'Orthopedic surgeon specializing in joint replacement, sports injuries, and spine disorders.' },
  ];

  const doctorUsers    = [];
  const doctorProfiles = [];

  for (const d of doctorData) {
    const hash = await hashPw('Doctor@123');
    const u = await User.create({ name:d.name, email:d.email, password:hash, role:'doctor', phone:`+91-9${Math.floor(Math.random()*900000000+100000000)}`, isVerified:true });
    doctorUsers.push(u);

    const dp = await Doctor.create({
      user:u._id, specialization:d.spec, licenseNumber:d.lic, experience:d.exp,
      consultationFee:d.fee, rating:d.rating, totalReviews:d.reviews, totalConsultations:d.consults,
      hospital:d.hospital, bio:d.bio, languages:d.langs, isApproved:true, isAvailableNow:d.avail,
      slotDuration: 30,
      qualifications:[
        { degree:'MBBS', institution:'Medical College', year: 2010 - (20-d.exp) },
        { degree:'MD', institution:'Specialization College', year: 2014 - (20-d.exp) },
      ],
    });
    doctorProfiles.push(dp);
  }

  // ── Appointments ──────────────────────────────────────────────────────
  const now       = new Date();
  const today     = new Date(now); today.setHours(0,0,0,0);
  const tomorrow  = new Date(today); tomorrow.setDate(tomorrow.getDate()+1);
  const yesterday = new Date(today); yesterday.setDate(yesterday.getDate()-1);
  const nextWeek  = new Date(today); nextWeek.setDate(nextWeek.getDate()+7);

  const appt1 = await Appointment.create({ patient:patientUser._id, doctor:doctorProfiles[0]._id, date:now, timeSlot:{ start:'10:00', end:'10:30' }, type:'video', status:'confirmed', symptoms:'Chest discomfort on exertion, occasional palpitations', fee:1800, paymentStatus:'paid', roomId:'room-demo-001' });
  const appt2 = await Appointment.create({ patient:patientUser._id, doctor:doctorProfiles[2]._id, date:now, timeSlot:{ start:'14:30', end:'14:50' }, type:'video', status:'pending',   symptoms:'Skin rash on forearms for 3 weeks', fee:1200, paymentStatus:'paid' });
  const appt3 = await Appointment.create({ patient:patientUser._id, doctor:doctorProfiles[3]._id, date:tomorrow, timeSlot:{ start:'11:00', end:'11:15' }, type:'video', status:'confirmed', symptoms:'Mild fever and body ache', fee:800, paymentStatus:'paid' });
  const appt4 = await Appointment.create({ patient:patientUser._id, doctor:doctorProfiles[1]._id, date:yesterday, timeSlot:{ start:'16:00', end:'16:45' }, type:'video', status:'completed', symptoms:'Frequent migraines', fee:2200, paymentStatus:'paid', rating:{ score:5, review:'Dr. Mehta was very thorough and explained everything clearly.', createdAt:new Date() } });
  const appt5 = await Appointment.create({ patient:patientUser._id, doctor:doctorProfiles[4]._id, date:nextWeek, timeSlot:{ start:'09:00', end:'09:30' }, type:'video', status:'confirmed', symptoms:'Routine gynecology checkup', fee:1600, paymentStatus:'paid' });

  // ── Prescriptions ─────────────────────────────────────────────────────
  const rx1 = await Prescription.create({
    appointment:appt4._id, patient:patientUser._id, doctor:doctorProfiles[1]._id,
    diagnosis:'Migraine with aura (G43.1)',
    medicines:[
      { name:'Sumatriptan',   dosage:'50mg',  frequency:'At onset of headache', duration:'As needed', instructions:'Max 2 doses per 24 hrs' },
      { name:'Propranolol',   dosage:'40mg',  frequency:'Twice daily',          duration:'3 months',  instructions:'Take with food' },
      { name:'Amitriptyline', dosage:'10mg',  frequency:'Once at bedtime',      duration:'6 weeks',   instructions:'Start low, increase if needed' },
    ],
    labTests:['CBC','MRI Brain with contrast','EEG'],
    notes:'Avoid triggers: bright lights, strong odors. Maintain headache diary. Follow up in 4 weeks.',
    followUpDate: new Date(now.getTime()+28*24*60*60*1000),
  });

  const rx2 = await Prescription.create({
    appointment:appt2._id, patient:patientUser._id, doctor:doctorProfiles[2]._id,
    diagnosis:'Atopic Dermatitis (L20.9) — Mild to moderate',
    medicines:[
      { name:'Mometasone Furoate Cream', dosage:'0.1%',      frequency:'Once daily',       duration:'2 weeks',   instructions:'Apply thin layer on affected area' },
      { name:'Cetirizine HCl',           dosage:'10mg',      frequency:'Once at night',     duration:'4 weeks',   instructions:'For itching relief' },
      { name:'CeraVe Moisturizing Cream',dosage:'As needed', frequency:'2-3 times daily',   duration:'Ongoing',   instructions:'Emollient for skin barrier restoration' },
    ],
    labTests:['IgE total','CBC with differential','Patch test'],
    notes:'Avoid known allergens. Use fragrance-free products. Lukewarm baths only.',
    followUpDate: new Date(now.getTime()+21*24*60*60*1000),
  });

  await Appointment.findByIdAndUpdate(appt4._id, { prescription:rx1._id });
  await Appointment.findByIdAndUpdate(appt2._id, { prescription:rx2._id });

  // ── Medical Records ───────────────────────────────────────────────────
  await MedicalRecord.insertMany([
    { patient:patientUser._id, type:'lab-report',   title:'Complete Blood Count (CBC)',    description:'Routine blood test — all values within normal range',          doctor:doctorProfiles[3]._id, date:new Date(now-5*864e5),  tags:['blood','routine'] },
    { patient:patientUser._id, type:'imaging',       title:'Chest X-Ray PA View',           description:'No active cardiopulmonary disease. Heart size normal.',         doctor:doctorProfiles[0]._id, date:new Date(now-13*864e5), tags:['xray','chest'] },
    { patient:patientUser._id, type:'prescription',  title:'Prescription — Migraine',        description:'Prescription from Dr. Rahul Mehta for migraine management',    doctor:doctorProfiles[1]._id, date:yesterday,              tags:['migraine','neurology'] },
    { patient:patientUser._id, type:'lab-report',   title:'Allergy Panel (IgE)',            description:'Elevated IgE. Dust mites and pollen sensitization.',           doctor:doctorProfiles[2]._id, date:new Date(now-39*864e5), tags:['allergy','IgE'] },
    { patient:patientUser._id, type:'imaging',       title:'ECG — 12 Lead',                  description:'Normal sinus rhythm. No ST changes or arrhythmias detected.',  doctor:doctorProfiles[0]._id, date:new Date(now-65*864e5), tags:['ecg','cardiology'] },
    { patient:patientUser._id, type:'vaccination',   title:'COVID-19 Booster (Covaxin)',     description:'Third dose at Apollo Health Centre',                                             date:new Date('2024-09-15'),  tags:['vaccine','covid'] },
  ]);

  // ── Notifications ─────────────────────────────────────────────────────
  await Notification.insertMany([
    { user:patientUser._id, type:'appointment_confirmed', title:'Appointment Confirmed',    message:'Dr. Priya Sharma confirmed your 10:00 AM appointment for today.',   isRead:false },
    { user:patientUser._id, type:'prescription_ready',    title:'Prescription Ready',       message:'Your prescription from Dr. Anjali Nair is ready to download.',      isRead:false },
    { user:patientUser._id, type:'appointment_reminder',  title:'Appointment Reminder',     message:'Your appointment with Dr. Sanjay Gupta is tomorrow at 11:00 AM.',   isRead:true  },
    { user:patientUser._id, type:'system',                title:'Lab Report Uploaded',      message:'Your blood test results have been uploaded to your medical records.',isRead:true  },
    { user:patientUser._id, type:'new_message',           title:'New Message',              message:'Dr. Rahul Mehta sent you a follow-up message about your treatment.', isRead:true  },
    { user:doctorUsers[0]._id, type:'appointment_booked', title:'New Appointment Booked',  message:'A patient booked a video consultation for today at 10:00 AM.',       isRead:false },
    { user:doctorUsers[0]._id, type:'review_request',     title:'New Review Received',      message:'A patient left a 5-star review for your consultation.',              isRead:false },
  ]);

  console.log('\n✅ Database seeded successfully!\n');
  console.log('─'.repeat(52));
  console.log('  📧 Admin:   admin@mediconnect.com    | Admin@123');
  console.log('  📧 Patient: arjun@example.com        | Patient@123');
  console.log('  📧 Doctor:  dr.priya@mediconnect.com | Doctor@123');
  console.log('─'.repeat(52));
  process.exit(0);
};

seed().catch(err => { console.error('❌ Seeder error:', err.message); process.exit(1); });
