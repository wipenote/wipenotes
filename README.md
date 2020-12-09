# WipeNote (NodeJS)


Wipenote is an online service for secure delivery of disposable messages. 

To take a look at the actual service, go to https://wipenotes.io.

The project uses the following technologies:

* Express.js and Typescript on the backend
* VueJS on the frontend 


## Usage 

General directions:

1. Run the server
2. Set up a database 

### Running the server 

Install the dependencies: 
```sh
npm i
```

Compile the assets and start a local server:
```sh
npm run start
```
The server will be available at  http://localhost:3000

### Setting up a database

You can use the following databases:

* Google Cloud Storage [google-storage]
* S3-compatible storage [s3]
* Redis [redis]

If you want to change database type, set the `DATABASE_TYPE` environment variable, and specify the additional configurations. 

#### Google Cloud Storage Variables 

```
DATABASE_TYPE=google-storage
GOOGLE_STORAGE_KEYFILENAME=/app/googleStorageKeyFile.json
GOOGLE_STORAGE_BUCKET=breachreport-wipenote
```

where 

* `GOOGLE_STORAGE_KEYFILENAME` - path to json key file<br/>
* `GOOGLE_STORAGE_BUCKET` - storage bucket name<br/> 


#### S3 Storage Variables

```
DATABASE_TYPE=s3
S3_ACCESS_KEY_ID=0000000
S3_SECRET_ACCESS_KEY=000000
S3_REGION=uk-1
S3_ENDPOINT=https://s3.amazonaws.com
S3_BUCKET=bucket_name
S3_BASE_PATH=/uploads_wipenote
```
where
* `S3_ACCESS_KEY_ID` - access key<br/>
* `S3_SECRET_ACCESS_KEY` - secret key<br/>
* `S3_REGION` - region of storage placement<br/>
* `S3_ENDPOINT` - endpoint url to access storage<br/>
* `S3_BUCKET` - bucket name<br/>
* `S3_BASE_PATH` - base folder path for storing files<br/>

#### Redis Storage Variables 

```
DATABASE_TYPE=redis
REDIS_HOST=localhost
REDIST_PORT=6379
REDIS_PASSWORD=password
```
where 

* `REDIS_HOST` - redis server url<br/>
* `REDIS_PORT` - redis server port<br/>
* `REDIS_PASSWORD` - redis server password

## License

[MIT](https://choosealicense.com/licenses/mit/)