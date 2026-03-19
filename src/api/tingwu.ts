import assert from 'node:assert';

import { $OpenApiUtil } from '@alicloud/openapi-core';
import TingwuClient, {
  CreateTaskRequest,
  CreateTaskRequestInput,
  CreateTaskRequestParameters,
  CreateTaskRequestParametersTranscription,
  type GetTaskInfoResponseBodyDataResult,
} from '@alicloud/tingwu20230930';

export interface TingwuTaskStatus {
  status: string | undefined;
  result: GetTaskInfoResponseBodyDataResult | undefined;
  errorCode: string | undefined;
  errorMessage: string | undefined;
}

const accessKeyId = process.env.ALIYUN_ACCESS_KEY_ID;
const accessKeySecret = process.env.ALIYUN_ACCESS_KEY_SECRET;
const regionId = process.env.TINGWU_REGION_ID;
const endpoint = process.env.TINGWU_ENDPOINT;
const appKey = process.env.TINGWU_APP_KEY;

assert(accessKeyId, 'ALIYUN_ACCESS_KEY_ID environment variable is required');
assert(
  accessKeySecret,
  'ALIYUN_ACCESS_KEY_SECRET environment variable is required',
);
assert(regionId, 'TINGWU_REGION_ID environment variable is required');
assert(endpoint, 'TINGWU_ENDPOINT environment variable is required');
assert(appKey, 'TINGWU_APP_KEY environment variable is required');

// Bun resolves the CJS default export automatically, but TypeScript sees it as the module namespace.
// Use .default for TypeScript, which at runtime is the constructor itself via Bun's ESM interop.
const Client = TingwuClient.default ?? TingwuClient;

const client = new Client(
  new $OpenApiUtil.Config({
    accessKeyId,
    accessKeySecret,
    regionId,
    endpoint,
  }),
);

export const tingwu = {
  async createTranscriptionTask(
    fileUrl: string,
    sourceLanguage: string,
  ): Promise<string> {
    const request = new CreateTaskRequest({
      appKey,
      type: 'offline',
      input: new CreateTaskRequestInput({
        fileUrl,
        sourceLanguage,
      }),
      parameters: new CreateTaskRequestParameters({
        transcription: new CreateTaskRequestParametersTranscription({
          diarizationEnabled: true,
        }),
        autoChaptersEnabled: true,
      }),
    });

    const response = await client.createTask(request);
    const taskId = response.body?.data?.taskId;
    assert(taskId, 'Failed to create tingwu task: no taskId returned');
    return taskId;
  },

  async getTaskStatus(taskId: string): Promise<TingwuTaskStatus> {
    const response = await client.getTaskInfo(taskId);
    const data = response.body?.data;
    return {
      status: data?.taskStatus,
      result: data?.result,
      errorCode: data?.errorCode,
      errorMessage: data?.errorMessage,
    };
  },
};
