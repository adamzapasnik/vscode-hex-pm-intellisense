export function debounce(fn: Function, wait: number) {
  let timeout: NodeJS.Timeout;
  return function (this: Function) {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(this, arguments), wait);
  };
}
