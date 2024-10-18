import React, { Suspense, useRef, useEffect, useCallback, useState } from "react";
import { Canvas } from "@react-three/fiber";
import Casco3d from "./Components/Casco3d"; // Asegúrate de que esta ruta sea correcta
import { OrbitControls } from "@react-three/drei";
import Webcam from "react-webcam";
import * as faceapi from "face-api.js";
import "./App.css";

const App = () => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [helmetPosition, setHelmetPosition] = useState([0, 0, 0]);

  // Cargar los modelos de face-api.js al montar el componente
  useEffect(() => {
    const loadModels = async () => {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
        await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
        await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
        await faceapi.nets.faceExpressionNet.loadFromUri('/models');
        console.log("Modelos cargados exitosamente");
      } catch (err) {
        console.error("Error cargando los modelos de face-api.js:", err);
      }
    };

    loadModels();
  }, []);

  const handleFaceDetection = useCallback(async () => {
    if (webcamRef.current && webcamRef.current.video.readyState === 4) {
      const video = webcamRef.current.video;
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;
  
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;
  
      // Detección del rostro usando el modelo TinyFaceDetector
      const detections = await faceapi.detectSingleFace(
        video,
        new faceapi.TinyFaceDetectorOptions()
      ).withFaceLandmarks();
  
      if (detections) {
        const resizedDetections = faceapi.resizeResults(detections, {
          width: videoWidth,
          height: videoHeight,
        });
  
        const ctx = canvasRef.current.getContext("2d");
        ctx.clearRect(0, 0, videoWidth, videoHeight);
        faceapi.draw.drawDetections(canvasRef.current, resizedDetections);
        faceapi.draw.drawFaceLandmarks(canvasRef.current, resizedDetections);
  
        // Obtener las coordenadas de los landmarks
        const landmarks = resizedDetections.landmarks;
        const leftEyebrow = landmarks.getLeftEyeBrow(); // Obtener coordenadas de la ceja izquierda
        const rightEyebrow = landmarks.getRightEyeBrow(); // Obtener coordenadas de la ceja derecha
  
        // Calcular la posición media de las cejas
        const eyebrowX = (leftEyebrow[3].x + rightEyebrow[3].x) / 2; // Promedio en X
        const eyebrowY = (leftEyebrow[3].y + rightEyebrow[3].y) / 2; // Promedio en Y
  
        // Normalizar las coordenadas
        const normalizedX = (eyebrowX / videoWidth) * 2 - 1; // Normalizar a [-1, 1]
        const normalizedY = -(eyebrowY / videoHeight) * 2 + 1; // Normalizar a [-1, 1]
  
        // Ajustar la posición del casco (bajar y mover a la izquierda)
        const helmetYOffset = 8.0; // Ajusta este valor para cambiar la altura del casco
        const helmetXOffset = 1.5; // Ajusta este valor para mover el casco a la izquierda
        setHelmetPosition([normalizedX - helmetXOffset, normalizedY - helmetYOffset, 20]); // 20 en Z para que esté frente al usuario
      }
    }
  }, []);
  
  
  

  useEffect(() => {
    const interval = setInterval(() => {
      handleFaceDetection();
    }, 900); // Detección cada 100ms
    return () => clearInterval(interval);
  }, [handleFaceDetection]);

  return (
    <div style={{ width: "100%",left:"-7px", height: "90vh", marginTop: "-8px", position: "relative", overflow: "hidden" }}>
      <Webcam
        ref={webcamRef}
        audio={false}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 1,
          objectFit: "cover",
          transform: "scaleX(-1)",
        }}
      />
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          top: -30,
          right: -260,
          width: "250%",
          height: "100vh",
          zIndex: 1,
          transform: "scaleX(-1)",
        }}
      />
      <div
        style={{
          width: "100%",
          height: "100vh",
          position: "absolute",
          top: -200,
          left: 0,
          zIndex: 3,
          pointerEvents: "auto",
        }}
      >
        <Canvas
          camera={{ zoom: 1, position: [0, 2, 65] }}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100vh",
            zIndex: 2,
          }}
        >
          <ambientLight intensity={1.9} />
          <directionalLight position={[5, 5, 5]} intensity={2} />
          <pointLight position={[35, 35, 0]} intensity={0.4} />
          <pointLight position={[-35, 35, 0]} intensity={0.4} />
          <Suspense fallback={null}>
            {/* Pasar la posición del casco como prop */}
            <Casco3d position={helmetPosition} />
          </Suspense>
          <OrbitControls
            enableZoom={true}
            minDistance={10}
            maxDistance={100}
            maxPolarAngle={Math.PI / 2}
          />
        </Canvas>
      </div>
    </div>
  );
};

export default App;
