export {};

declare global {
  namespace NodeJS {
    interface Global {
      localhostToPublicURL: string;
    }
  }
}
