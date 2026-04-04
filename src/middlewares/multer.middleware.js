import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/temp');
  },
  filename: function (req, file, cb) {
    
    cb(null, file.originalname)
  }
})

export const upload = multer({
     storage, 
})
// import multer from "multer";
// import path from "path";

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     // IMPORTANT: Ensure this folder already exists in your root directory
//     cb(null, './public/temp');
//   },
//   filename: function (req, file, cb) {
//     // Create a unique suffix using the current timestamp and a random number
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    
//     // Extract the original file extension (e.g., .jpg, .png)
//     const ext = path.extname(file.originalname);
    
//     // Save as: fieldname-162334567890-123456789.jpg
//     cb(null, file.fieldname + '-' + uniqueSuffix + ext);
//   }
// });

// export const upload = multer({
//   storage,
//   // Add a file size limit (e.g., 5MB)
//   limits: {
//     fileSize: 5 * 1024 * 1024 
//   }
// });