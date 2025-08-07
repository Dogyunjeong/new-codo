import { CloudTasksTypes } from '@base/shared-types';
import Logger from '../../utils/logger.mts';
import { CloudTasksClient as GoogleCloudTasksClient, protos } from '@google-cloud/tasks';
import { ExpectedServerError } from '@base/shared-utils';

export type ICloudTask = protos.google.cloud.tasks.v2.ITask;

class CloudTasksClient {
  private readonly _hostUrl: string;
  private readonly _logger: Logger;
  private readonly _client: GoogleCloudTasksClient;
  private readonly _project: string;
  private readonly _location: string;

  constructor({
    logger,
    project,
    location,
    hostUrl,
  }: {
    logger: Logger;
    project: string;
    location: string;
    hostUrl: string;
  }) {
    this._logger = logger;
    this._client = new GoogleCloudTasksClient();
    this._project = project;
    this._location = location;
    this._hostUrl = hostUrl;
  }

  private _getQueuePath = (queue: string): string => {
    return this._client.queuePath(this._project, this._location, queue);
  };

  private _getTargetUrl = (type: CloudTasksTypes.CLOUD_TASK_TYPE) => {
    switch (type) {
      case CloudTasksTypes.CLOUD_TASK_TYPE.WORD_DICTIONARY_GENERATE:
        return `${this._hostUrl}/admin-api/contents-generating/word-dictionary/generate-for-learning-paths`;
      case CloudTasksTypes.CLOUD_TASK_TYPE.WORD_SOUND_GENERATE:
        return `${this._hostUrl}/admin-api/contents-generating/word-dictionary/sound/generate-for-locale`;
    }
  };

  private _getTaskType = (url: string) => {
    const trimmedUrl = url.replace(this._hostUrl, '');
    switch (trimmedUrl) {
      case '/admin-api/contents-generating/word-dictionary/generate-for-learning-paths':
        return CloudTasksTypes.CLOUD_TASK_TYPE.WORD_DICTIONARY_GENERATE;
      case '/admin-api/contents-generating/word-dictionary/sound/generate-for-locale':
        return CloudTasksTypes.CLOUD_TASK_TYPE.WORD_SOUND_GENERATE;
    }
  };

  private _mapCloudTask = (task: ICloudTask): CloudTasksTypes.CloudTask => {
    return {
      name: task.name ?? '',
      type:
        this._getTaskType(task.httpRequest?.url ?? '') ??
        CloudTasksTypes.CLOUD_TASK_TYPE.WORD_DICTIONARY_GENERATE,
      payload: task.httpRequest?.body,
      scheduledTime: task.scheduleTime?.seconds
        ? new Date((task.scheduleTime.seconds as number) * 1000)
        : undefined,
      dispatchCount: task.dispatchCount ?? 0,
      firstAttempt: {
        scheduledTime: task.firstAttempt?.scheduleTime?.seconds
          ? new Date((task.firstAttempt.scheduleTime.seconds as number) * 1000)
          : new Date(),
        responseTime: task.firstAttempt?.responseTime?.seconds
          ? new Date((task.firstAttempt.responseTime.seconds as number) * 1000)
          : undefined,
        responseStatus: task.firstAttempt?.responseStatus ?? undefined,
      },
      lastAttempt: {
        scheduledTime: task.lastAttempt?.scheduleTime?.seconds
          ? new Date((task.lastAttempt.scheduleTime.seconds as number) * 1000)
          : new Date(),
        responseTime: task.lastAttempt?.responseTime?.seconds
          ? new Date((task.lastAttempt.responseTime.seconds as number) * 1000)
          : undefined,
        responseStatus: task.lastAttempt?.responseStatus ?? undefined,
      },
    };
  };

  public async createTask({
    queue,
    cloudTask,
  }: {
    queue: string;
    cloudTask: CloudTasksTypes.CloudTask;
  }): Promise<CloudTasksTypes.CloudTask> {
    const url = this._getTargetUrl(cloudTask.type);
    const payload = cloudTask.payload;
    const scheduledAt = cloudTask.scheduledTime;

    if (!url) {
      throw new ExpectedServerError(`Unsupported cloud task type: ${cloudTask.type}`);
    }
    try {
      const queuePath = this._getQueuePath(queue);

      const task: protos.google.cloud.tasks.v2.ITask = {
        httpRequest: {
          httpMethod: 'POST',
          url,
          headers: {
            'Content-Type': 'application/json',
          },
          body: Buffer.from(JSON.stringify(payload)).toString('base64'),
        },
        scheduleTime: scheduledAt
          ? {
              seconds: scheduledAt.getTime() / 1000,
            }
          : undefined,
      };

      const [response] = await this._client.createTask({
        parent: queuePath,
        task,
      });
      return this._mapCloudTask(response);
    } catch (error) {
      this._logger.error('Failed to create cloud task', { error, queue, payload });
      throw error;
    }
  }

  public async listTasks({ queue }: { queue: string }): Promise<CloudTasksTypes.CloudTask[]> {
    try {
      const queuePath = this._getQueuePath(queue);
      const [tasks] = await this._client.listTasks({
        parent: queuePath,
      });
      return tasks.map(this._mapCloudTask);
    } catch (error) {
      this._logger.error('Failed to list cloud tasks', { error, queue });
      throw error;
    }
  }
}

export default CloudTasksClient;
