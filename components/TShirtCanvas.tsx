import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  ContactShadows,
  PerspectiveCamera,
  Float,
  Html,
} from "@react-three/drei";
import { TShirtColor } from "../types";
import TShirtModel from "./TShirtModel";

interface TShirtCanvasProps {
  color: TShirtColor;
  designUrl: string | null;
  designScale?: number;
}

const TShirtCanvas: React.FC<TShirtCanvasProps> = (props) => {
  return (
    <div className="w-full h-[500px] md:h-[700px] rounded-[4rem] overflow-hidden">
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <PerspectiveCamera makeDefault position={[0, 0.5, 5]} fov={35} />

        <ambientLight intensity={0.6} />
        <spotLight
          position={[10, 15, 10]}
          angle={0.25}
          penumbra={1}
          intensity={1.5}
          castShadow
        />
        <pointLight position={[-10, 10, -5]} intensity={1} color="#2196F3" />

        <Suspense
          fallback={
            <Html center>
              <div className="bg-white/80 p-4 rounded-xl shadow">
                Cargando 3D…
              </div>
            </Html>
          }
        >
          <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.3}>
            <TShirtModel {...props} />
          </Float>

          <Environment preset="city" />
          <ContactShadows
            position={[0, -1.8, 0]}
            opacity={0.3}
            scale={10}
            blur={2.4}
            far={10}
          />
        </Suspense>

        <OrbitControls
          enableZoom={false}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 1.6}
          dampingFactor={0.05}
        />
      </Canvas>
    </div>
  );
};

export default TShirtCanvas;
