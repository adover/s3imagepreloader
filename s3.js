import AWS from 'aws-sdk';
import {
  S3_ACCESS_KEY,
  S3_SECRET,
  S3_REGION,
  S3_BUCKET,
  S3_FOLDER,
  S3_URL
} from './config';

import fs from 'fs';
import mkdirp from 'mkdirp';

import filter from 'lodash/filter';
import each from 'lodash/each';
import endsWith from 'lodash/endsWith';

const getDirName = require('path').dirname

// Make a call to S3 and create a loading job based on all of the urls
export default class S3Preloader {

  constructor(){

    AWS.config.region = S3_REGION;

    // Set credentials
    // Note: These should really be set in environment vars

    this.filterObjectsInFolder = this.filterObjectsInFolder.bind(this);
    this.writeObjectsToFile = this.writeObjectsToFile.bind(this);
    this.getObjects = this.getObjects.bind(this);
    this.createS3Client = this.createS3Client.bind(this);

    this.s3 = new AWS.S3({
      apiVersion: '2006-03-01',
      accessKeyId: S3_ACCESS_KEY,
      secretAccessKey: S3_SECRET
    });

    this.params = {
      Bucket: S3_BUCKET,
      // Delimiter: 'STRING_VALUE',
      // EncodingType: 'url',
      // Marker: 'STRING_VALUE',
      // MaxKeys: 0,
      Prefix: S3_FOLDER,
      // RequestPayer: 'requester'
    }

  }

  getFileExtensionWhiteList () {

    return ['png', 'jpg', 'gif'];

  }

  /**
   * Utility to write the contents of a response to a file. Easier than reading the console
   */

  writeObjectsToFile (obj) {

    const path = './test/s3Object.txt';

    mkdirp(getDirName(path), (err) => {

      if(err) {

        console.log(err);

      }

      fs.writeFile(JSON.stringify(path), obj, { flag: 'wx' }, (err) => {

        if(err) {
          console.log(err);
        }

        return 'The file was saved!';

      });

    })

  }

  /**
   * Gets a nice long list of all the objects in a bucket
   */

  getObjects () {

    return new Promise((resolve, reject) => {

      this.s3.listObjects(this.params, (err, data) => {

        if (err){

          console.log('S3 getObjects: Error')
          console.log(err, err.stack);

          reject();

        }else{

          console.log('S3 getObjects: Success')
          resolve(data['Contents']);

        }

      });

    })

  }

  filterObjectsInFolder (objects) {

    let keyArray = [];

    each(objects, o => {

      const str = S3_URL + o['Key'];

      each(this.getFileExtensionWhiteList(), f => {

        console.log(f)
        if(endsWith(str, f)){

          keyArray.push(str);

        }

      })

    })

    return keyArray;

  }

  createS3Client () {

    return s3.createClient({
      maxAsyncS3: 20,
      s3RetryCount: 3,
      s3RetryDelay: 1000,
      multipartUploadThreshold: 20971520, // 20MB
      multipartUploadSize: 15728640, // 15MB
      s3Options: {
        accessKeyId: S3_ACCESS_KEY,
        secretAccessKey: S3_SECRET,
        region: S3_REGION,
        // any other options are passed to new AWS.S3()
        // See: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Config.html#constructor-property
      },
    });

  }

}
