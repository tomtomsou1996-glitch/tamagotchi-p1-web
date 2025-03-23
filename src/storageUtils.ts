export async function saveWasmStateToIndexedDB(module) {
  if (module == null) {
    return;
  }

  const memory = new Uint8Array(module.HEAPU8);

  // Open IndexedDB
  const db = await new Promise((resolve, reject) => {
    const request = indexedDB.open("TamaDB", 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      db.createObjectStore("states", { keyPath: "id" });
    };
    request.onsuccess = () => {
      resolve(request.result);
    };
    request.onerror = () => {
      reject(request.error);
    };
  });

  await new Promise((resolve, reject) => {
    const transaction = db.transaction(["states"], "readwrite");
    const store = transaction.objectStore("states");
    const request = store.put({ id: "tamaState", buffer: memory });
    request.onsuccess = () => {
      resolve();
    };
    request.onerror = () => {
      reject(request.error);
    };
  });

  db.close();
}

export async function loadWasmStateFromIndexedDB(module) {
  // Open IndexedDB
  const db = await new Promise((resolve, reject) => {
    const request = indexedDB.open("TamaDB", 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      db.createObjectStore("states", { keyPath: "id" });
    };
    request.onsuccess = () => {
      resolve(request.result);
    };
    request.onerror = () => {
      reject(request.error);
    };
  });

  // Read the state
  const state = await new Promise((resolve, reject) => {
    const transaction = db.transaction(["states"], "readonly");
    const store = transaction.objectStore("states");
    const request = store.get("tamaState");
    request.onsuccess = () => {
      resolve(request.result);
    };
    request.onerror = () => {
      reject(request.error);
    };
  });

  if (state?.buffer && module != null) {
    const bytesToCopy = Math.min(state.buffer.length, module.HEAPU8.length);
    module.HEAPU8.set(state.buffer.slice(0, bytesToCopy));
  }

  db.close();
}
