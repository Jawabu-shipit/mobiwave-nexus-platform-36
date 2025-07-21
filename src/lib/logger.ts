
import AuditLogger from './audit-logger';
import EnvironmentManager from './environment-config';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  message: string;
  data?: any;
  source?: string;
  userId?: string;
}

class Logger {
  private static instance: Logger;
  private environmentManager: EnvironmentManager;
  private auditLogger: AuditLogger;
  private logs: LogEntry[] = [];

  private constructor() {
    this.environmentManager = EnvironmentManager.getInstance();
    this.auditLogger = AuditLogger.getInstance();
    this.initializeLogger();
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private initializeLogger(): void {
    // Set up global error handling
    window.addEventListener('error', (event) => {
      this.error('Global error caught', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.error('Unhandled promise rejection', {
        reason: event.reason
      });
    });

    this.info('Logger initialized');
  }

  private log(level: LogLevel, message: string, data?: any, source?: string): void {
    const config = this.environmentManager.getConfig();
    
    // Check if we should log at this level
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(config.logging.level);
    const messageLevelIndex = levels.indexOf(level);
    
    if (messageLevelIndex < currentLevelIndex) {
      return;
    }

    const logEntry: LogEntry = {
      timestamp: new Date(),
      level,
      message,
      data,
      source: source || 'application'
    };

    this.logs.push(logEntry);

    // Console logging
    if (config.logging.enableConsole) {
      const consoleMethod = level === 'debug' ? 'log' : level;
      console[consoleMethod](`[${level.toUpperCase()}] ${message}`, data || '');
    }

    // Remote logging
    if (config.logging.enableRemote) {
      this.sendToRemoteLogger(logEntry);
    }

    // Audit logging for specific events
    if (config.features.auditLogging && this.shouldAudit(level, message)) {
      this.auditLogger.logAction(
        logEntry.userId || 'system',
        `log_${level}`,
        {
          resourceType: 'log',
          metadata: { message, data, source },
          severity: level === 'error' ? 'high' : level === 'warn' ? 'medium' : 'low'
        }
      );
    }
  }

  private shouldAudit(level: LogLevel, message: string): boolean {
    return level === 'error' || 
           level === 'warn' || 
           message.toLowerCase().includes('security') ||
           message.toLowerCase().includes('auth') ||
           message.toLowerCase().includes('permission');
  }

  private async sendToRemoteLogger(logEntry: LogEntry): Promise<void> {
    try {
      await fetch('/api/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(logEntry)
      });
    } catch (error) {
      console.error('Failed to send log to remote server:', error);
    }
  }

  debug(message: string, data?: any, source?: string): void {
    this.log('debug', message, data, source);
  }

  info(message: string, data?: any, source?: string): void {
    this.log('info', message, data, source);
  }

  warn(message: string, data?: any, source?: string): void {
    this.log('warn', message, data, source);
  }

  error(message: string, data?: any, source?: string): void {
    this.log('error', message, data, source);
  }

  setUserId(userId: string): void {
    this.logs.forEach(log => {
      if (!log.userId) {
        log.userId = userId;
      }
    });
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logs.filter(log => log.level === level);
  }

  clearLogs(): void {
    this.logs = [];
  }
}

export default Logger;
