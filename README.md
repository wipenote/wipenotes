# WipeNote (NodeJS)
## Installation:
Install dependencies
```
npm i
```

Compile assets and start server locally:
```
npm run start
```
Server available at http://localhost:3000

### List of supported databases
* Google Cloud Storage [google-storage]
* S3-compatible storage [s3]
* Redis [redis]

If you want to change database type set environment variable with one of supported DATABASE_TYPE with database config params 

### Environment variables for each of databases
**Google Cloud Storage**
```
DATABASE_TYPE=google-storage
GOOGLE_STORAGE_KEYFILENAME=/app/googleStorageKeyFile.json
GOOGLE_STORAGE_BUCKET=breachreport-wipenote
```
*GOOGLE_STORAGE_KEYFILENAME* - path to json key file<br/>
*GOOGLE_STORAGE_BUCKET* - storage bucket name<br/>

**S3 Storage**
```
DATABASE_TYPE=s3
S3_ACCESS_KEY_ID=0000000
S3_SECRET_ACCESS_KEY=000000
S3_REGION=uk-1
S3_ENDPOINT=https://s3.amazonaws.com
S3_BUCKET=bucket_name
S3_BASE_PATH=/uploads_wipenote
```
*S3_ACCESS_KEY_ID* - access key<br/>
*S3_SECRET_ACCESS_KEY* - secret key<br/>
*S3_REGION* - region of storage placement<br/>
*S3_ENDPOINT* - endpoint url to access storage<br/>
*S3_BUCKET* - bucket name<br/>
*S3_BASE_PATH* - base folder path for storing files<br/>

**Redis storage**
```
DATABASE_TYPE=redis
REDIS_HOST=localhost
REDIST_PORT=6379
REDIS_PASSWORD=password
```
*REDIS_HOST* - redis server url<br/>
*REDIS_PORT* - redis server port<br/>
*REDIS_PASSWORD* - redis server password
