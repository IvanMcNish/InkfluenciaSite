import React, { useEffect, useMemo } from "react";
import { useLoader } from "@react-three/fiber";
import { Html, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { TShirtColor } from "../types";

interface TShirtModelProps {
  color: TShirtColor;
  designUrl: string | null;
  designScale?: number;
}

const MODEL_URL =
  "https://raw.githubusercontent.com/IvanMcNish/camiseta/main/t_shirt.glb";

const TShirtModel: React.FC<TShirtModelProps> = ({
  color,
  designUrl,
  designScale = 0.5,
}) => {
  const gltf = useGLTF(MODEL_URL) as any;
  const nodes = gltf.nodes || {};

  // ✅ DEBUG: lista nombres de meshes (1 vez)
  useEffect(() => {
    const names: string[] = [];
    gltf.scene?.traverse?.((o: any) => {
      if (o?.isMesh) names.push(o.name || "(sin nombre)");
    });
    console.log("Meshes del GLB:", names);
  }, [gltf.scene]);

  const texture = designUrl ? useLoader(THREE.TextureLoader, designUrl) : null;
  useMemo(() => {
    if (!texture) return;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.flipY = false;
    texture.anisotropy = 16;
    texture.needsUpdate = true;
  }, [texture]);

  const shirtColor = color === TShirtColor.WHITE ? "#f9fafb" : "#0a0a0a";

  const hasAnyMesh = Object.values(nodes).some((n: any) => n?.isMesh && n.geometry);

  if (!hasAnyMesh) {
    return (
      <Html center>
        <div className="bg-white/80 p-4 rounded-xl shadow border">
          No se encontraron mallas en el GLB…
        </div>
      </Html>
    );
  }

  return (
    <group scale={2.2}>
      {Object.entries(nodes).map(([key, n]: any) => {
        if (!n?.isMesh || !n.geometry) return null;
        return (
          <mesh
            key={key}
            geometry={n.geometry}
            position={n.position}
            rotation={n.rotation}
            scale={n.scale}
            castShadow
            receiveShadow
          >
            <meshStandardMaterial
              color={shirtColor}
              roughness={0.85}
              metalness={0.05}
            />
          </mesh>
        );
      })}
    </group>
  );
};

useGLTF.preload(MODEL_URL);
export default TShirtModel;
