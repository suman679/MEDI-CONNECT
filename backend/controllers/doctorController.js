const Doctor = require('../models/Doctor');
const User   = require('../models/User');
const Appointment = require('../models/Appointment');

// GET /api/doctors
// exports.getDoctors = async (req, res, next) => {
//   try {
//     const { specialization, search, minRating, maxFee, page=1, limit=12 } = req.query;
//     const query = { isApproved: true };
//     if (specialization) query.specialization = specialization;
//     if (minRating) query.rating = { $gte: parseFloat(minRating) };
//     if (maxFee)    query.consultationFee = { $lte: parseFloat(maxFee) };

//     let doctorIds;
//     if (search) {
//       const users = await User.find({ name: { $regex: search, $options:'i' }, role:'doctor' }).select('_id');
//       doctorIds = users.map(u => u._id);
//       query.user = { $in: doctorIds };
//     }

//     const total = await Doctor.countDocuments(query);
//     const doctors = await Doctor.find(query)
//       .populate('user','name email avatar gender phone')
//       .sort({ rating: -1, totalConsultations: -1 })
//       .skip((parseInt(page)-1)*parseInt(limit))
//       .limit(parseInt(limit));

//     res.json({ success:true, count:doctors.length, total, totalPages:Math.ceil(total/parseInt(limit)), currentPage:parseInt(page), data:doctors });
//   } catch (err) { next(err); }
// };

// GET /api/doctors/specializations
exports.getSpecializations = (req, res) => {
  res.json({ success:true, data:[
    'General Physician','Cardiologist','Dermatologist','Neurologist','Orthopedic',
    'Pediatrician','Psychiatrist','Gynecologist','Oncologist','Ophthalmologist',
    'ENT Specialist','Urologist','Endocrinologist','Gastroenterologist','Pulmonologist',
    'Rheumatologist','Nephrologist','Dentist','Radiologist','Anesthesiologist',
  ]});
};

// GET /api/doctors/stats  (doctor dashboard)
exports.getDoctorStats = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user.id });
    if (!doctor) return res.status(404).json({ success:false, message:'Doctor profile not found' });

    const today = new Date(); today.setHours(0,0,0,0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate()+1);

    const [total, todayCount, pending, completed] = await Promise.all([
      Appointment.countDocuments({ doctor: doctor._id }),
      Appointment.countDocuments({ doctor: doctor._id, date:{ $gte:today, $lt:tomorrow } }),
      Appointment.countDocuments({ doctor: doctor._id, status:'pending' }),
      Appointment.countDocuments({ doctor: doctor._id, status:'completed' }),
    ]);

    res.json({ success:true, data:{ totalAppointments:total, todayAppointments:todayCount, pendingAppointments:pending, completedConsultations:completed, rating:doctor.rating, totalReviews:doctor.totalReviews } });
  } catch (err) { next(err); }
};

// GET /api/doctors/
exports.getDoctors =
async(req,res,next)=>{

try{

const {

specialization,

search,

minRating,

maxFee,

page=1,

limit=12

}=req.query;

const query = {

isApproved:true

};

if(specialization){

query.specialization =
specialization;

}

if(minRating){

query.rating = {

$gte:
parseFloat(minRating)

};

}

if(maxFee){

query.consultationFee = {

$lte:
parseFloat(maxFee)

};

}

if(search){

const users =
await User.find({

name:{
$regex:search,
$options:'i'
},

role:'doctor'

}).select('_id');

query.user = {

$in:
users.map(
u=>u._id
)

};

}

const total =
await Doctor.countDocuments(
query
);

const doctors =
await Doctor.find(query)

.populate(
'user',
'name email avatar gender phone'
)

.sort({

rating:-1,

totalConsultations:-1

})

.skip(
(parseInt(page)-1)
*
parseInt(limit)
)

.limit(
parseInt(limit)
);

res.json({

success:true,

count:
doctors.length,

total,

totalPages:
Math.ceil(
total/
parseInt(limit)
),

currentPage:
parseInt(page),

data:doctors

});

}catch(err){

next(err);

}

};

// GET /api/doctors/:id/availability
exports.getDoctorAvailability = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id).select('availability slotDuration');
    if (!doctor) return res.status(404).json({ success:false, message:'Doctor not found' });
    const booked = await Appointment.find({ doctor: req.params.id, date:{ $gte: new Date() }, status:{ $in:['pending','confirmed'] } }).select('date timeSlot');
    res.json({ success:true, data:{ availability:doctor.availability, slotDuration:doctor.slotDuration, bookedSlots:booked } });
  } catch (err) { next(err); }
};

// POST /api/doctors/profile
exports.createDoctorProfile = async (req,res,next)=>{

try{

const existing =
await Doctor.findOne({
user:req.user.id
});

if(existing){

const updated =
await Doctor.findOneAndUpdate(

{ user:req.user.id },

{
...req.body,

isApproved:true
},

{
new:true,
runValidators:true
}

).populate(
'user',
'name email avatar'
);

return res.json({
success:true,
data:updated
});

}

const doctor =
await Doctor.create({

...req.body,

user:req.user.id,

isApproved:true,

rating:0,

totalReviews:0,

totalConsultations:0

});

const populated =
await Doctor.findById(
doctor._id
).populate(
'user',
'name email avatar'
);

res.status(201).json({

success:true,

data:populated

});

}catch(err){

next(err);

}

};
// PUT /api/doctors/profile
exports.updateDoctorProfile = async (req,res,next)=>{

try{

const doctor =
await Doctor.findOneAndUpdate(

{ user:req.user.id },

{
...req.body,

isApproved:true
},

{
new:true,
runValidators:true
}

)
.populate(
'user',
'name email avatar'
);

if(!doctor){

return res.status(404).json({

success:false,

message:
'Doctor profile not found'

});

}

res.json({

success:true,

data:doctor

});

}catch(err){

next(err);

}

};