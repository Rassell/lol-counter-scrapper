type ILogger = {
  log: (...args: any[]) => void;
};

export let _logger: ILogger = console;

export function setLogger(logger: ILogger) {
  if (logger) _logger = logger;
}
