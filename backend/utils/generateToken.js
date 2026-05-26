const jwt =
require('jsonwebtoken');

const generateToken =
(id,role)=>{

if(
!process.env.JWT_SECRET
){

throw new Error(
'JWT_SECRET missing'
);

}

return jwt.sign(

{ id,role },

process.env.JWT_SECRET,

{
expiresIn:
process.env.JWT_EXPIRE
|| '30d'
}

);

};

module.exports =
generateToken;