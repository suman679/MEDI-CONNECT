const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req,res,next)=>{

let token;

if(
req.cookies &&
req.cookies.mc_token
){
token =
req.cookies.mc_token;
}

else if(
req.headers.authorization &&
req.headers.authorization
.startsWith('Bearer')
){

token =
req.headers.authorization
.split(' ')[1];

}

if(!token){

return res.status(401)
.json({

success:false,
message:
'Not authorized, no token'

});

}

try{

if(
!process.env.JWT_SECRET
){

throw new Error(
'JWT_SECRET missing'
);

}

const decoded =
jwt.verify(

token,

process.env.JWT_SECRET

);

req.user =
await User
.findById(decoded.id)
.select('-password');

if(!req.user){

return res.status(401)
.json({

success:false,
message:
'User not found'

});

}

if(!req.user.isActive){

return res.status(401)
.json({

success:false,
message:
'Account deactivated'

});

}

next();

}catch(err){

return res.status(401)
.json({

success:false,
message:
'Token invalid or expired'

});

}

};


exports.authorize =
(...roles)=>{

return (
req,
res,
next
)=>{

if(
!roles.includes(
req.user.role
)
){

return res
.status(403)
.json({

success:false,

message:
`Role '${req.user.role}' is not authorized`

});

}

next();

};

};