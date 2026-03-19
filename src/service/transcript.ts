import { randomUUID } from 'node:crypto';

import { aliyunOss } from '@/api/aliyun-oss.js';
import type { TingwuTaskStatus } from '@/api/tingwu.js';
import { tingwu } from '@/api/tingwu.js';

export const transcriptService = {
  async createTask(
    file: Buffer | NodeJS.ReadableStream,
    filename: string,
    sourceLanguage: string,
  ): Promise<string> {
    const ossKey = `audio/${randomUUID()}/${filename}`;
    await aliyunOss.uploadFile(ossKey, file);
    const fileUrl = aliyunOss.getSignedUrl(ossKey);
    const taskId = await tingwu.createTranscriptionTask(
      fileUrl,
      sourceLanguage,
    );
    return taskId;
  },

  async getTaskStatus(taskId: string): Promise<TingwuTaskStatus> {
    return tingwu.getTaskStatus(taskId);
  },
};
