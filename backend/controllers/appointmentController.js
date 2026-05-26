const Appointment  = require('../models/Appointment');
const Doctor       = require('../models/Doctor');
const Notification = require('../models/Notification');


// BOOK APPOINTMENT
exports.bookAppointment = async (req,res,next)=>{

try{

const { doctorId,date,timeSlot,type,symptoms } = req.body;

if(!doctorId || !date || !timeSlot?.start){
return res.status(400).json({
success:false,
message:'Required fields missing'
});
}

const doctor = await Doctor.findById(doctorId)
.populate('user','_id name');

if(!doctor){
return res.status(404).json({
success:false,
message:'Doctor not found'
});
}

if(!doctor.isApproved){
return res.status(400).json({
success:false,
message:'Doctor unavailable'
});
}

const clash = await Appointment.findOne({
doctor:doctorId,
date:new Date(date),
'timeSlot.start':timeSlot.start,
status:{ $in:['pending','confirmed'] }
});

if(clash){
return res.status(400).json({
success:false,
message:'Time slot already booked'
});
}

const roomId =
type==='video'
? `room-${Date.now().toString(36)}`
: undefined;

const appt = await Appointment.create({
patient:req.user.id,
doctor:doctorId,
date:new Date(date),
timeSlot,
type:type || 'video',
symptoms,
fee:doctor.consultationFee,
roomId
});

await Promise.all([

Notification.create({
user:doctor.user._id,
type:'appointment_booked',
title:'New Appointment',
message:`New appointment booked.`,
data:{ appointmentId:appt._id }
}),

Notification.create({
user:req.user.id,
type:'appointment_booked',
title:'Appointment Booked',
message:'Your appointment has been booked.',
data:{ appointmentId:appt._id }
})

]);

const populated =
await Appointment.findById(appt._id)
.populate({
path:'doctor',
populate:{
path:'user',
select:'name email avatar'
}
})
.populate('patient','name email');

res.status(201).json({
success:true,
data:populated
});

}catch(err){
next(err);
}

};


// GET APPOINTMENTS
exports.getAppointments = async (req,res,next)=>{

try{

const {
status,
upcoming,
page=1,
limit=20
} = req.query;

let query = {};

const safePage =
Math.max(1,parseInt(page));

const safeLimit =
Math.min(
50,
Math.max(1,parseInt(limit))
);

if(req.user.role==='patient'){

query.patient=req.user.id;

}

else if(req.user.role==='doctor'){

const doctor =
await Doctor.findOne({
user:req.user.id
});

if(!doctor){
return res.status(404).json({
success:false,
message:'Doctor profile not found'
});
}

query.doctor=doctor._id;

}

if(status){
query.status=status;
}

if(upcoming==='true'){

query.date={ $gte:new Date() };

if(!status){
query.status={
$in:['pending','confirmed']
};
}

}

const total =
await Appointment.countDocuments(query);

const data =
await Appointment.find(query)

.populate({
path:'doctor',
populate:{
path:'user',
select:'name avatar'
}
})

.populate(
'patient',
'name email avatar'
)

.sort({
date:1,
'timeSlot.start':1
})

.skip(
(safePage-1)*safeLimit
)

.limit(safeLimit);

res.json({
success:true,
count:data.length,
total,
page:safePage,
data
});

}catch(err){
next(err);
}

};


// GET SINGLE APPOINTMENT
exports.getAppointment = async (req,res,next)=>{

try{

const appt =
await Appointment.findById(req.params.id)

.populate({
path:'doctor',
populate:{
path:'user',
select:'name email avatar phone'
}
})

.populate(
'patient',
'name email avatar phone dateOfBirth gender'
)

.populate('prescription');

if(!appt){

return res.status(404).json({
success:false,
message:'Appointment not found'
});

}

let doctorDoc=null;

if(req.user.role==='doctor'){

doctorDoc =
await Doctor.findOne({
user:req.user.id
});

}

const authorized =

req.user.role==='admin'

|| appt.patient._id.toString()
=== req.user.id

|| (
doctorDoc &&
appt.doctor._id.toString()
=== doctorDoc._id.toString()
);

if(!authorized){

return res.status(403).json({
success:false,
message:'Unauthorized access'
});

}

res.json({
success:true,
data:appt
});

}catch(err){
next(err);
}

};


// UPDATE STATUS
exports.updateStatus = async (req,res,next)=>{

try{

const { status,cancellationReason } = req.body;

const appt =
await Appointment.findById(req.params.id)

.populate({
path:'doctor',
populate:{
path:'user',
select:'_id name'
}
})

.populate(
'patient',
'_id name'
);

if(!appt){

return res.status(404).json({
success:false,
message:'Appointment not found'
});

}

const valid = {

pending:[
'confirmed',
'cancelled'
],

confirmed:[
'in-progress',
'cancelled',
'no-show'
],

'in-progress':[
'completed'
]

};

if(
valid[appt.status] &&
!valid[appt.status].includes(status)
){

return res.status(400).json({
success:false,
message:'Invalid status transition'
});

}

appt.status=status;

if(cancellationReason){

appt.cancellationReason=
cancellationReason;

appt.cancelledBy=
req.user.role;

}

await appt.save();

res.json({
success:true,
data:appt
});

}catch(err){
next(err);
}

};


// ADD REVIEW
exports.addReview = async (req,res,next)=>{

try{

const {
score,
review
} = req.body;

if(
!score ||
score<1 ||
score>5
){

return res.status(400).json({
success:false,
message:'Rating must be 1-5'
});

}

const appt =
await Appointment.findById(
req.params.id
);

if(!appt){

return res.status(404).json({
success:false,
message:'Appointment not found'
});

}

if(
appt.patient.toString()
!== req.user.id
){

return res.status(403).json({
success:false,
message:'Unauthorized'
});

}

if(
appt.status!=='completed'
){

return res.status(400).json({
success:false,
message:'Only completed appointments can be reviewed'
});

}

if(
appt.rating?.score
){

return res.status(400).json({
success:false,
message:'Already reviewed'
});

}

appt.rating={
score,
review,
createdAt:new Date()
};

await appt.save();

const reviewed =
await Appointment.find({

doctor:appt.doctor,

'rating.score':{
$exists:true
}

});

const avg =
reviewed.reduce(
(s,a)=>s+a.rating.score,
0
)/reviewed.length;

await Doctor.findByIdAndUpdate(
appt.doctor,
{
rating:
Math.round(avg*10)/10,
totalReviews:
reviewed.length
}
);

res.json({
success:true,
data:appt
});

}catch(err){
next(err);
}

};