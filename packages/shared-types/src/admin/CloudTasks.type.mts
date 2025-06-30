export enum CLOUD_TASK_QUEUE {
  GENERATING_CONTENT = 'GENERATING-CONTENT',
  TTS_GENERATE = 'TTS-GENERATE',
}

export enum CLOUD_TASK_TYPE {
  WORD_DICTIONARY_GENERATE = 'WORD_DICTIONARY_GENERATE',
  WORD_SOUND_GENERATE = 'WORD_SOUND_GENERATE',
}

export interface CloudTaskRequest {
  type: CLOUD_TASK_TYPE;
  payload: any;
  scheduledTime?: Date;
}

export interface CloudTaskAttempt {
  scheduledTime: Date;
  responseTime?: Date;
  responseStatus?: {
    code?: number | null;
    message?: string | null;
    details?: any[] | null;
  };
}

export interface CloudTask {
  name: string;
  type: CLOUD_TASK_TYPE;
  payload: any;
  scheduledTime?: Date;
  dispatchCount?: number;
  lastDispatchTime?: Date;
  responseCount?: number;
  firstAttempt?: CloudTaskAttempt;
  lastAttempt?: CloudTaskAttempt;
}
