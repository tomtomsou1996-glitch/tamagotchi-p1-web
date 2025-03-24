export async function saveWasmStateToIndexedDB(cpuState: number[]) {
  const memory = new Uint32Array(cpuState);

  const db: IDBDatabase = await new Promise((resolve, reject) => {
    const request = indexedDB.open("TamaDB", 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      db.createObjectStore("states", { keyPath: "id" });
    };
    request.onsuccess = () => {
      resolve(request.result);
    };
    request.onerror = (ev: unknown) => {
      console.error("DB save error on open", ev);
      reject(request.error ?? new Error("Unknown DB error"));
    };
  });

  await new Promise((resolve, reject) => {
    const transaction = db.transaction(["states"], "readwrite");
    const store = transaction.objectStore("states");
    const request = store.put({ id: "tamaState", buffer: memory });
    request.onsuccess = () => {
      resolve(undefined);
    };
    request.onerror = (ev: unknown) => {
      console.error("DB save error on write", ev);
      reject(request.error ?? new Error("Unknown DB error"));
    };
  });

  db.close();
}

export async function readWasmStateFromIndexedDB(): Promise<
  Uint32Array | undefined
> {
  const db: IDBDatabase = await new Promise((resolve, reject) => {
    const request = indexedDB.open("TamaDB", 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      db.createObjectStore("states", { keyPath: "id" });
    };
    request.onsuccess = () => {
      resolve(request.result);
    };
    request.onerror = () => {
      reject(request.error ?? new Error("Unknown DB error"));
    };
  });

  const buffer: Uint32Array | undefined = await new Promise(
    (resolve, reject) => {
      const transaction = db.transaction(["states"], "readonly");
      const store = transaction.objectStore("states");
      const request = store.get("tamaState");
      request.onsuccess = () => {
        const result = request.result as { buffer?: Uint32Array } | undefined;
        if (result != null && result.buffer instanceof Uint32Array) {
          resolve(result.buffer);
        }
      };
      request.onerror = () => {
        reject(request.error ?? new Error("Unknown DB error"));
      };
    }
  );

  db.close();

  return buffer;
}
