import { Injectable, Logger, LoggerService } from '@nestjs/common';

@Injectable()
export class AppLoggerService implements LoggerService {
  private isProduction = process.env.NODE_ENV === 'production';

  log(message: string, context?: string) {
    if (this.isProduction) {
      this.formatLog('info', message, context);
    } else {
      Logger.prototype.log.call(this, message, context ?? 'Application');
    }
  }

  error(message: string, trace?: string, context?: string) {
    this.formatLog('error', message, context, trace);
  }

  warn(message: string, context?: string) {
    this.formatLog('warn', message, context);
  }

  debug?(message: string, context?: string) {
    if (!this.isProduction) {
      this.formatLog('debug', message, context);
    }
  }

  verbose?(message: string, context?: string) {
    if (!this.isProduction) {
      this.formatLog('verbose', message, context);
    }
  }

  private formatLog(
    level: string,
    message: string,
    context?: string,
    trace?: string,
  ) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      context: context ?? 'Application',
      message,
      ...(trace && { trace }),
    };
    const output = JSON.stringify(logEntry);
    if (level === 'error') {
      process.stderr.write(output + '\n');
    } else {
      process.stdout.write(output + '\n');
    }
  }
}
