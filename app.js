document.addEventListener('DOMContentLoaded', async () => {
  const inputImage = document.getElementById('inputImage');
  const outputCanvas = document.getElementById('outputCanvas');
  const faceDetectionOptions = new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 });

  // Load face-api.js models
  await faceapi.nets.ssdMobilenetv1.loadFromUri('/models');
  await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
  await faceapi.nets.faceLandmark68Net.loadFromUri('/models');

  inputImage.addEventListener('change', handleImageUpload);

  async function handleImageUpload() {
    const imageFile = inputImage.files[0];
    const img = await faceapi.bufferToImage(imageFile);
    const canvas = faceapi.createCanvasFromMedia(img);
    document.body.append(canvas);

    const displaySize = { width: img.width, height: img.height };
    faceapi.matchDimensions(canvas, displaySize);

    const detections = await faceapi.detectAllFaces(img, faceDetectionOptions)
      .withFaceLandmarks()
      .withFaceDescriptors();

    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    faceapi.draw.drawDetections(canvas, resizedDetections);
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);

    // Display face descriptors (face recognition features)
    resizedDetections.forEach(detection => {
      const box = detection.detection.box;
      const drawBox = new faceapi.draw.DrawBox(box, { label: faceapi.createCanvasFromMedia(img) });
      drawBox.draw(canvas);
    });
  }
});
