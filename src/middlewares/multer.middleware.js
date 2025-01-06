// using a multer as a middle ware for file upload
// or detailed definition :- Multer is a middleware for handling multipart/form-data, primarily used for uploading files in Node.js and Express.js applications.
import multer from 'multer'

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/temp')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.originalname)
    }
})

export  const upload = multer({ storage: storage })

