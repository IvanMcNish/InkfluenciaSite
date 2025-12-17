
import React, { useRef, useMemo } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { 
  OrbitControls, 
  ContactShadows, 
  Environment, 
  Float, 
  Decal, 
  useGLTF,
  useGraph,
  PerspectiveCamera,
  BakeShadows,
  Html,
  Center
} from '@react-three/drei';
import * as THREE from 'three';
import { TShirtColor } from '../types';

interface TShirtProps {
  color: TShirtColor;
  designUrl: string | null;
  designScale?: number;
}

const MODEL_URL = 'https://raw.githubusercontent.com/IvanMcNish/camiseta/main/t_shirt.glb';

const TShirtModel: React.FC<TShirtProps> = ({ color, designUrl, designScale = 0.5 }) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  
  // Cargamos el modelo. useGLTF maneja el cacheo automáticamente.
  const { nodes } = useGLTF(MODEL_URL) as any;
  
  // Buscamos la malla principal. Usualmente en modelos de una sola pieza es la primera malla encontrada.
  const mainMesh = useMemo(() => {
    return Object.values(nodes).find((node: any) => node.isMesh) as THREE.Mesh;
  }, [nodes]);

  // Cargamos la textura del diseño si existe.
  const texture = designUrl ? useLoader(THREE.TextureLoader, designUrl) : null;
  
  // Color de la camiseta.
  const shirtColor = color === TShirtColor.WHITE ? '#f9fafb' : '#0a0a0a';

  if (!mainMesh) {
    return (
      <Html center>
        <div className="text-red-500 font-bold bg-white/80 p-4 rounded-xl shadow-lg border border-red-100">
          Error: No se encontró geometría en el modelo.
        </div>
      </Html>
    );
  }

  return (
    <Center top>
      <group scale={2.2}>
        {/* 
          Renderizamos la malla usando su propia geometría. 
          Asignamos la referencia para que el Decal sepa dónde proyectarse.
        */}
        <mesh 
          ref={meshRef}
          geometry={mainMesh.geometry}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial 
            color={shirtColor} 
            roughness={0.8} 
            metalness={0.1} 
          />
          
          {/* 
            Proyección del diseño. 
            depthTest y depthWrite previenen problemas de renderizado en superficies delgadas.
          */}
          {texture && meshRef.current &&  (
            <Decal
              mesh={meshRef.current}
              position={[0, 0.45, 0.15]} 
              rotation={[0, 0, 0]}
              scale={[0.3 * designScale, 0.3 * designScale, 1]}
            >
              <meshStandardMaterial
                map={texture}
                transparent
                polygonOffset
                polygonOffsetFactor={-10}
                roughness={0.7}
                metalness={0.1}
                alphaTest={0.5}
                depthTest={true}
                depthWrite={false}
              />
            </Decal>
          )}
        </mesh>
      </group>
    </Center>
  );
};

const LoadingScreen = () => (
  <Html center>
    <div className="flex flex-col items-center gap-6 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl p-10 rounded-[3rem] shadow-2xl border border-white dark:border-slate-800 min-w-[300px]">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 border-[4px] border-slate-100 dark:border-slate-800 rounded-full" />
        <div className="absolute inset-0 border-[4px] border-inkPink border-t-transparent rounded-full animate-spin" />
      </div>
      <div className="text-center">
        <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-1">Cargando Estudio 3D</p>
        <p className="text-[10px] font-bold text-inkPink uppercase tracking-widest animate-pulse">Sincronizando Mallas...</p>
      </div>
    </div>
  </Html>
);

const TShirtCanvas: React.FC<TShirtProps> = (props) => {
  return (
    <div className="w-full h-[500px] md:h-[700px] bg-slate-50 dark:bg-slate-900/20 rounded-[4rem] overflow-hidden cursor-move relative shadow-inner group transition-colors duration-500">
      <Canvas 
        shadows 
        dpr={[1, 2]} 
        gl={{ antialias: true, preserveDrawingBuffer: true, alpha: true }}
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

        <React.Suspense fallback={<LoadingScreen />}>
          <Float 
            speed={1.2} 
            rotationIntensity={0.2} 
            floatIntensity={0.3}
          >
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
        </React.Suspense>
        
        <BakeShadows />
        <OrbitControls 
          enableZoom={false} 
          minPolarAngle={Math.PI / 4} 
          maxPolarAngle={Math.PI / 1.6}
          makeDefault 
          dampingFactor={0.05}
        />
      </Canvas>

      <div className="absolute top-10 left-10 pointer-events-none group-hover:scale-105 transition-transform duration-500">
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl px-6 py-3 rounded-2xl shadow-xl border border-white/50 dark:border-slate-700/50">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-inkPink animate-pulse" />
            <p className="text-[9px] font-black text-inkPink uppercase tracking-widest">High Fidelity</p>
          </div>
          <p className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Preview Realista</p>
        </div>
      </div>
    </div>
  );
};

// Forzamos la precarga para evitar saltos visuales
try {
  useGLTF.preload(MODEL_URL);
} catch (e) {}

export default TShirtCanvas;
