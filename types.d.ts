export type Resolveable = unknown;

export interface DefinerOptions {
  eager?: boolean;
  override?: boolean;
}

export interface Store {
  [key: string]: StoreItem;
}

export interface StoreItem {
  deps: string[];
  resolveable: Resolveable;
}

export interface Container {
  define: IDefine;
  provide: IProvide;
  clone: IClone;
}

export type IDefine = (
  name: string,
  resolveable?: Resolveable,
  deps?: string[],
  opts?: DefinerOptions,
) => boolean;

export type IProvide = (deps: string[], callback: CallableFunction) => unknown;

export type IClone = () => Container;

type Newable = { new (...args: unknown[]): unknown };
