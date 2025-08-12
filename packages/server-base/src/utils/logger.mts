import { Log, Logging } from '@google-cloud/logging';
import chalk from 'chalk';
import { setTimeout } from 'timers/promises';

import envConfig from '../configs/baseEnv.config.mts';

interface LogEntry {
  message?: string;
  loggingData?: any;
  severity: 'INFO' | 'ERROR' | 'LOG' | 'DEBUG' | 'WARN';
}

class Logger {
  private _loggerInstance: Logging;
  private _log: Log;
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY_MS = 1000;

  constructor({ logName }: { logName: string }) {
    this._loggerInstance = new Logging({ projectId: envConfig.GCP_PROJECT_ID });
    this._log = this._loggerInstance.log(logName);
  }

  private async _writeLogWithRetry(entry: LogEntry): Promise<void> {
    let retryCount = 0;
    let lastError: Error | null = null;

    while (retryCount < this.MAX_RETRIES) {
      try {
        if (envConfig.IS_PRODUCTION || envConfig.IS_DEVELOPMENT) {
          const logEntry = this._log.entry(
            {
              severity: entry.severity,
            },
            {
              message: entry.message,
              ...entry.loggingData,
            },
          );
          await this._log.write(logEntry);
          return;
        }

        // Local development logging
        if (envConfig.IS_LOCAL) {
          console.log(chalk.green(entry.message), {
            loggingData: JSON.stringify(entry.loggingData, null, 3),
          });
          return;
        }
        return;
      } catch (error) {
        lastError = error as Error;
        retryCount++;

        if (retryCount < this.MAX_RETRIES) {
          await setTimeout(this.RETRY_DELAY_MS * retryCount);
          continue;
        }

        // If all retries failed, log the error to console
        console.error('Failed to write log after retries:', {
          error: lastError.message,
          entry,
          retryCount,
        });

        console.log(
          entry.message,
          JSON.stringify({ severity: entry.severity, ...entry.loggingData }, null, 3),
        );
      }
    }
  }

  public async info(message: string, loggingData?: any): Promise<void> {
    await this._writeLogWithRetry({ message, loggingData, severity: 'INFO' });
  }

  public async log(message: string, loggingData?: any): Promise<void> {
    await this._writeLogWithRetry({ message, loggingData, severity: 'LOG' });
  }

  public async debug(message: string, loggingData?: any): Promise<void> {
    await this._writeLogWithRetry({ message, loggingData, severity: 'DEBUG' });
  }

  public async devDebug(message: string, loggingData?: any): Promise<void> {
    if (envConfig.IS_PRODUCTION) {
      return;
    }
    await this._writeLogWithRetry({ message, loggingData, severity: 'DEBUG' });
  }

  public async error(message: string, loggingData?: any): Promise<void> {
    await this._writeLogWithRetry({ message, loggingData, severity: 'ERROR' });
  }

  public async warn(message: string, loggingData?: any): Promise<void> {
    await this._writeLogWithRetry({ message, loggingData, severity: 'WARN' });
  }
}

export default Logger;
