import assert from 'node:assert';

import OSS from 'ali-oss';

const region = process.env.OSS_REGION;
const accessKeyId = process.env.OSS_ACCESS_KEY_ID;
const accessKeySecret = process.env.OSS_ACCESS_KEY_SECRET;
const bucket = process.env.OSS_BUCKET;

assert(region, 'OSS_REGION environment variable is required');
assert(accessKeyId, 'OSS_ACCESS_KEY_ID environment variable is required');
assert(
  accessKeySecret,
  'OSS_ACCESS_KEY_SECRET environment variable is required',
);
assert(bucket, 'OSS_BUCKET environment variable is required');

const client = new OSS({ region, accessKeyId, accessKeySecret, bucket });

export const aliyunOss = {
  async uploadFile(
    name: string,
    file: string | Buffer | NodeJS.ReadableStream,
  ): Promise<string> {
    const result = await client.put(name, file);
    return result.name;
  },

  async deleteFile(name: string): Promise<void> {
    await client.delete(name);
  },

  getSignedUrl(name: string, expiresInSeconds = 1800): string {
    return client.signatureUrl(name, { expires: expiresInSeconds });
  },
};
