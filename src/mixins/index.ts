export * from './routable';
export * from './actionable';

export type Constructor<T = object> = new (...args: unknown[]) => T;
