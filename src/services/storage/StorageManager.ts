import { IStorageProvider } from "./IStorageProvider";
import { GoogleDriveProvider } from "./GoogleDriveProvider";

class StorageManager {
  private providers: Map<string, IStorageProvider> = new Map();
  private defaultProvider: IStorageProvider;

  constructor() {
    const driveProvider = new GoogleDriveProvider();
    this.providers.set("gdrive", driveProvider);
    this.defaultProvider = driveProvider;
  }

  getProvider(type: string = "gdrive"): IStorageProvider {
    return this.providers.get(type) || this.defaultProvider;
  }

  registerProvider(provider: IStorageProvider) {
    this.providers.set(provider.type, provider);
  }
}

export const storageManager = new StorageManager();
