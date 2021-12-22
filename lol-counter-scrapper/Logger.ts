export let _logger = console;

export async function setLogger(logger: any) {
  if (logger) _logger = logger;
}
