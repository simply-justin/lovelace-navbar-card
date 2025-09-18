export * from './routable';
export * from './actionable';

export type Constructor<T = {}> = new (...args: any[]) => T;
