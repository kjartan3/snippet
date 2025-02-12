const app = require('app');
// const jwt = require('jsonwebtoken');

// const JWT_SECRET = 'one_piece_secret';



// const verifyToken = (res, req, next) => {
//     const token = req.headers['authorization']?.split(' ')[1]; // Get token from Authorization header

//     if (!token) {
//         return res.status(403).json({ message: 'No token provided' });
//     }

//     jwt.verify(token, JWT_SECRET, (err, decoded) => {
//         if (err) {
//             return res.status(401).json({ message: 'Unauthorized' });
//         }
//         req.userId = decoded.id; // Attach user ID to request
//         next();
//     });
// };