import { Injectable } from '@angular/core';

export class DocumentMock extends Document {
  public readyState: DocumentReadyState = 'loading';
}

export class StorageMock implements Storage {
  public length = 0;
  public clear(): void {
    return null;
  }
  public getItem(key: string): string {
    return null;
  }
  public key(index: number): string {
    return null;
  }
  public removeItem(key: string): void {
    return null;
  }
  public setItem(key: string, value: string): void {
    return null;
  }
}

export class WindowMock extends Window {
  public document = new DocumentMock();
  public localStorage = new StorageMock();
  public sessionStorage = new StorageMock();
}

const getWindow = (): Window => (window != null ? window : new WindowMock());

@Injectable({
  providedIn: 'root',
})
export class WindowService {
  private readonly windowObject: Window;

  public constructor() {
    this.windowObject = getWindow();
  }

  public get window(): Window {
    return this.windowObject;
  }

  public get document(): Document {
    return this.window.document;
  }

  public get localStore(): Storage {
    return this.window.localStorage;
  }

  public get sessionStorage(): Storage {
    return this.window.sessionStorage;
  }
}
