export type JsonInput =
  | null
  | boolean
  | number
  | string
  | JsonInput[]
  | { [key: string]: JsonInput };
