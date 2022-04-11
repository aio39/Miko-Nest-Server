import {
  GetObjectCommand,
  ListObjectsV2Command,
  S3Client,
} from '@aws-sdk/client-s3';
import {
  ReceiveMessageCommand,
  ReceiveMessageCommandInput,
  SQSClient,
} from '@aws-sdk/client-sqs';
import * as dayjs from 'dayjs';
import * as customParseFormat from 'dayjs/plugin/customParseFormat';
import * as dotenv from 'dotenv';
dayjs.extend(customParseFormat);

// import { dirname } from 'path';
// import { fileURLToPath } from 'url';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);
dotenv.config({ path: __dirname + '/.dev.env' });

const sqsClient = new SQSClient({
  region: process.env.AWS_REGION as string,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS as string,
    secretAccessKey: process.env.AWS_SECRET as string,
  },
});

const s3Client = new S3Client({
  region: process.env.AWS_REGION as string,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS as string,
    secretAccessKey: process.env.AWS_SECRET as string,
  },
});

const MAX_BATCH = 1;
const params: ReceiveMessageCommandInput = {
  AttributeNames: ['SentTimestamp'],
  MaxNumberOfMessages: MAX_BATCH,
  MessageAttributeNames: ['All'],
  QueueUrl: process.env.AWS_SQS_RECORDING, // 정료, 시작 실패 , 종료 실패
  VisibilityTimeout: 300,
  WaitTimeSeconds: 0,
};

const test = async () => {
  const result = await sqsClient.send(new ReceiveMessageCommand(params));
  console.log(result);
  if (result?.$metadata.httpStatusCode === 200) {
    result?.Messages?.forEach((msg) => {
      console.log(JSON.parse(msg.Body as string));
    });
  }
};

// test();

const test2 = async () => {
  s3Client
    .send(
      new ListObjectsV2Command({
        // 하위폴더 까지 전부다
        Bucket: 'miko-ivs-bucket',
        Prefix: 'ivs/v1/121323684128/Cj5ynk97sEJv/2022/2/24/7/28/DSx6jQdTrJNw',
        MaxKeys: 3, // Default
        // ContinuationToken: ',
      }),
    )
    .then((result) => {
      console.log(result);
    });
};

// test2();
const test3 = async () => {
  s3Client
    .send(
      new GetObjectCommand({
        // 하위폴더 까지 전부다
        Bucket: 'miko-ivs-bucket',
        Key: 'ivs/v1/121323684128/Cj5ynk97sEJv/2022/2/24/7/28/DSx6jQdTrJNw/events/recording-started.json',

        // ContinuationToken: ',
      }),
    )
    .then((result) => {
      console.log(result);
    });
};

// test3();

const test4 = () => {
  const date =
    'ivs/v1/121323684128/NIFlWVmsiHXA/2022/4/11/2/5/upMzWLrpHYre'.match(
      /(\d+\/\d+\/\d+\/\d+\/\d+)/g,
    );
  console.log(date);
  if (date && date[0]) {
    const date2 = dayjs(date[0], 'YYYY/M/D/H/m').toISOString();
    console.log(date2);
  }
};

test4();

// ivs/v1/123456789012/AsXego4U6tnj/2020/6/23/20/12/j8Z9O91ndcVs/
//    events
//       ivs-check
//       recording-started.json
//       recording-ended.json
//       recording-failed.json
//    media
//       hls
//            master.m3u8
// https://miko-ivs-bucket.s3.amazonaws.com/ivs/v1/121323684128/Cj5ynk97sEJv/2022/2/24/7/28/DSx6jQdTrJNw/media/hls/master.m3u8
//       thumbnails
//                thumb0.jpg  ~ > 10 11 12 20 30 ~~~~
