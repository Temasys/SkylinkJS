const base64ToBlob = (chunk) => {
  // eslint-disable-next-line no-undef
  const byteString = atob(chunk);
  // write the bytes of the string to an ArrayBuffer
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let j = 0; j < byteString.length; j += 1) {
    ia[j] = byteString.charCodeAt(j);
  }
  // write the ArrayBuffer to a blob, and you're done
  // eslint-disable-next-line no-undef
  return new Blob([ab]);
};

export default base64ToBlob;
