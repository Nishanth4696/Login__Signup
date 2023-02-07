const express = require('express')
const { S3Client } = require('@aws-sdk/client-s3')
const path = require( 'path' );
const multerS3 = require('multer-s3');
const multer = require('multer');
require("dotenv").config();

const router = express.Router();

router.use( express.urlencoded( { extended: false } ) );
router.use( express.json() );


//Providing credentials for Aws S3 bucket

const s3 = new S3Client({
	credentials:{
		accessKeyId:process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey:process.env.AWS_SECRET_ACCESS_KEY,
        Bucket:process.env.AWS_BUCKET_NAME,
	},	
	region: "ap-southeast-1"
});


// check for file extension matches the condition
function checkFileType( file, cb ){
	// Allowed ext
	const filetypes = /jpg|png|image/;
	// Check ext
	const extname = filetypes.test( path.extname( file.originalname ).toLowerCase());
	// Check mime
	const mimetype = filetypes.test( file.mimetype );
	if( mimetype && extname ){
		return cb( null, true );
	} else {
		cb( 'Error: Images Only!(*.jpg, *.png)' );
	}
}


//multer handles the files and stores into S3 bucket and returns files metadata 
const UploadImage = multer({
	storage: multerS3({
		s3: s3,
		bucket: "karthiknbucket1",
		
		acl: 'public-read',
		key: function (req, file, cb) {
			cb( null, path.basename( file.originalname, path.extname( file.originalname ) ) + '-' + Date.now() + path.extname( file.originalname ) )
		},
	}),
	limits:{ fileSize: 10000000 }, //10mb=10000000
	fileFilter: function( req, file, cb ){
		checkFileType( file, cb );
	}
}).array( 'image', 1 );

module.exports = UploadImage;