import Logger from '../../utils/logger.mjs';
import gcsUtil from '../../utils/gcp/gcs.util.mjs';
import { Storage } from '@google-cloud/storage';

const READ_SIGNED_URL_EXPIRATION = 1 * 60 * 60 * 1000; // 1 hour

class GcsClient {
  private readonly _logger: Logger;
  private readonly _storage: Storage;

  constructor({ logger }: { logger: Logger }) {
    this._logger = logger;
    this._storage = new Storage();
  }

  private _getReadSignedUrlFromGcsUrl = async ({
    gcsUrl,
    expires = Date.now() + READ_SIGNED_URL_EXPIRATION,
  }: {
    gcsUrl?: string;
    expires?: string | number | Date;
  }) => {
    if (!gcsUrl) {
      return;
    }
    const parsedResult = gcsUtil.parsingGCSUrl(gcsUrl);
    if (!parsedResult) {
      return;
    }
    const { bucket, filePath } = parsedResult;
    const [url] = await this._storage.bucket(bucket).file(filePath).getSignedUrl({
      action: 'read',
      expires: expires,
    });
    return url;
  };

  private _deleteFileFromGCS = async ({ gcsUrl }: { gcsUrl: string }) => {
    const parsedResult = gcsUtil.parsingGCSUrl(gcsUrl);
    if (!parsedResult) {
      return;
    }
    const { bucket, filePath } = parsedResult;
    await this._storage.bucket(bucket).file(filePath).delete();
    return;
  };

  private _deleteFolderFromGCS = async ({
    bucket,
    folderPath,
  }: {
    bucket: string;
    folderPath: string;
  }) => {
    await this._storage.bucket(bucket).deleteFiles({ prefix: folderPath });
    return;
  };

  public async uploadFromMemory({
    bucketName,
    destFileName,
    contents,
  }: {
    bucketName: string;
    destFileName: string;
    contents: string | Uint8Array;
  }) {
    await this._storage.bucket(bucketName).file(destFileName).save(contents);
  }

  public makeGCSUrl = gcsUtil.makeGCSUrl;

  public getReadSignedUrlFromGcsUrl = this._getReadSignedUrlFromGcsUrl;
  public deleteFileFromGCS = this._deleteFileFromGCS;

  public deleteFolderFromGCS = this._deleteFolderFromGCS;
}

export default GcsClient;
