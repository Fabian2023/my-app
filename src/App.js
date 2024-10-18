import React, { Suspense, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import Casco3d from "./Components/Casco3d";
import { OrbitControls } from "@react-three/drei";
import Webcam from "react-webcam";

const App = () => {
  const webcamRef = useRef(null);

  return (
    <div style={{ width: "100%", height: "100vh", position: "relative" }}>
      {/* Webcam background */}
      <Webcam
        ref={webcamRef}
        audio={false}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100vh",
          zIndex: 1,
          objectFit: "cover", 
          transform: "scaleX(-1)",

        }}
      />

      {/* 3D Model of the helmet */}
      <div
        style={{
          width: "100%",
          height: "100vh",
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: 2, // Make sure the 3D model is above the webcam
          pointerEvents: "none", // Ignore mouse events on this layer
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
          {/* <OrbitControls
            enableZoom={true}
            minDistance={10}
            maxDistance={100}
            maxPolarAngle={Math.PI / 2}
          /> */}
        </Canvas>
      </div>
    </div>
  );
};

export default App;
