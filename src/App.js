import React, { Suspense, useRef, useEffect, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import Casco3d from "./Components/Casco3d";
import { OrbitControls } from "@react-three/drei";
import Webcam from "react-webcam";
import * as faceapi from "face-api.js";
import "./App.css";

const App = () => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  // Cargar los modelos de face-api.js al montar el componente
  useEffect(() => {
    const loadModels = async () => {
      try {
        // Asegúrate de que los modelos se cargan desde la carpeta correcta
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

  // Función que detecta el rostro en cada frame de la webcam
  const handleFaceDetection = useCallback(async () => {
    if (
      webcamRef.current &&
      webcamRef.current.video.readyState === 4 // Verifica que el video esté listo
    ) {
      const video = webcamRef.current.video;
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;

      // Asegúrate de que el canvas tenga las mismas dimensiones que el video
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      // Verifica si los modelos ya están cargados antes de ejecutar la detección
      if (!faceapi.nets.tinyFaceDetector.isLoaded) {
        console.log("El modelo TinyFaceDetector no está cargado aún.");
        return;
      }

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

        // Dibuja las detecciones sobre el canvas
        const ctx = canvasRef.current.getContext("2d");
        ctx.clearRect(0, 0, videoWidth, videoHeight); // Limpia el canvas
        faceapi.draw.drawDetections(canvasRef.current, resizedDetections);
        faceapi.draw.drawFaceLandmarks(canvasRef.current, resizedDetections);

        // Detectar movimiento de cabeza basado en landmarks
        const landmarks = resizedDetections.landmarks;
        const nose = landmarks.getNose();
        const leftEye = landmarks.getLeftEye();
        const rightEye = landmarks.getRightEye();

        const noseX = nose[3].x; // Coordenada X del centro de la nariz
        const leftEyeX = leftEye[0].x;
        const rightEyeX = rightEye[3].x;

        // Comparar las posiciones de los ojos y la nariz para detectar inclinación de cabeza
        if (noseX < leftEyeX) {
          console.log("Cabeza hacia la derecha");
        } else if (noseX > rightEyeX) {
          console.log("Cabeza hacia la izquierda");
        }
      }
    }
  }, []);

  // Usa el hook useEffect para ejecutar la detección en cada frame de la webcam
  useEffect(() => {
    const interval = setInterval(() => {
      handleFaceDetection();
    }, 2000); // Detección cada 100ms

    return () => clearInterval(interval);
  }, [handleFaceDetection]);

  return (
    <div style={{ width: "102%", height: "90vh", marginTop:"-8px", position: "relative",  overflow: "hidden" }}>
      {/* Webcam background */}
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

      {/* Canvas para dibujar las detecciones faciales */}
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          top: -30,
          right: -260,
          width: "250%",
          height: "100vh",
          zIndex: 1, // Por encima de la webcam para dibujar las detecciones
          transform: "scaleX(-1)",
        }}
     
      />

      {/* 3D Model of the helmet */}
      <div
        style={{
          width: "100%",
          height: "100vh",
          position: "absolute",
          top: -200,
          left: 0,
          zIndex: 3, // Make sure the 3D model is above the webcam
          pointerEvents: "auto", // Ignore mouse events on this layer
        }}
      >
        <Canvas
          camera={{ zoom: 1, position: [0, 2, 65] }}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100vh", // Matches the webcam's size
            zIndex: 2, // Above webcam, but can interact with the scene
          }}
        >
          <ambientLight intensity={1.9} />
          <directionalLight position={[5, 5, 5]} intensity={2} />
          <pointLight position={[35, 35, 0]} intensity={0.4} />
          <pointLight position={[-35, 35, 0]} intensity={0.4} />
          <Suspense fallback={null}>
            <Casco3d />
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
