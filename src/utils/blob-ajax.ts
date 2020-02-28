const blobPost: (url: string, blob: Blob) => Promise<any> = (url: string, blob: Blob) => {
  return new Promise((resolve, reject) => {
    try {
      const oReq = new XMLHttpRequest();
      oReq.open("POST", url, true);
      oReq.responseType = "json";
      oReq.onload = function (oEvent) {
        resolve(oReq.response);
      };
      oReq.send(blob);
    } catch(err) {
      reject(err);
    }
  });
}
const blobGet: (url: string) => Promise<any> = (url: string) => {
  return new Promise((resolve, reject) => {
    try {
      const oReq = new XMLHttpRequest();
      oReq.open("GET", url, true);
      oReq.responseType = "blob";
      oReq.onload = function(oEvent) {
        resolve(oReq.response);
      };
      oReq.send();
    } catch(err) {
      reject(err);
    }
  })
}
const bufferGet: (url: string) => Promise<any> = (url: string) => {
  return new Promise((resolve, reject) => {
    try {
      const oReq = new XMLHttpRequest();
      oReq.open("GET", url, true);
      oReq.responseType = "arraybuffer";
      oReq.onload = function(oEvent) {
        resolve(oReq.response);
      };
      oReq.send();
    } catch(err) {
      reject(err);
    }
  })
}
export { blobPost, blobGet, bufferGet }