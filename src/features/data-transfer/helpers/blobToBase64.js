const blobToBase64 = data => new Promise((resolve) => {
  const { FileReader } = window;
  const fileReader = new FileReader();
  fileReader.readAsDataURL(data);
  fileReader.onload = () => {
    // Load Blob as dataurl base64 string
    const base64BinaryString = fileReader.result.split(',')[1];
    return resolve(base64BinaryString);
  };
});

export default blobToBase64;
