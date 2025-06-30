export const GCS_DELIMITER = '-wjl-file-';

class gcsUtil {
  public static makeGCSUrl = ({
    bucket,
    isPublic,
    filePath,
  }: {
    bucket: string;
    isPublic: boolean;
    filePath: string;
  }): string => {
    if (isPublic) {
      return `https://storage.googleapis.com/${bucket}/${filePath}`;
    }
    return `gs://${bucket}/${filePath}`;
  };
  public static parsingReadSignedUrl({
    readSignedUrl,
  }: {
    readSignedUrl: string;
  }): { bucket: string; filePath: string; gcsUrl: string; fileName: string } | null {
    if (!readSignedUrl) {
      return null;
    }
    const url = readSignedUrl.split('?')[0];
    const filePath = url.replace('https://storage.googleapis.com/', '');
    const [bucket, ...rest] = filePath.split('/');
    const fileName = rest.join('/');
    const gcsUrl = `gs://${filePath}`;
    return {
      bucket,
      filePath,
      gcsUrl,
      fileName,
    };
  }

  public static parsingGCSUrl = (
    gcsUrl: string,
  ): {
    bucket: string;
    filePath: string;
    fileName: string;
  } | null => {
    if (!gcsUrl.includes('gs://') && !gcsUrl.includes('https://storage.googleapis.com/')) {
      return null;
    }
    const url = gcsUrl
      .replace('gs://', '')
      .replace('https://storage.googleapis.com/', '')
      .split('?')[0];
    const [bucket, ...rest] = url.split('/');
    const fileName = rest.join('/');
    const filePath = url.replace(`${bucket}/`, '');
    if (bucket.includes('http')) {
      return null;
    }
    return {
      bucket,
      filePath,
      fileName,
    };
  };

  public static getFileNameFromUploadedGCSKey = ({ gcsKey }: { gcsKey?: string }): string => {
    if (!gcsKey) {
      return '';
    }
    return gcsKey.split(GCS_DELIMITER).pop() || '';
  };
}

export default gcsUtil;
