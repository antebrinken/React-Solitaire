// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ExplicitAny = any;

// Utility: value union of an object type
export type ValueOf<T> = T[keyof T];

// Root reducer mapping type
type RootReducer = typeof import("./redux/rootReducer").rootReducer;
export type RootReducerState = {
  [P in keyof RootReducer]: ReturnType<RootReducer[P]>;
};
