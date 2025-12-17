import React, { useMemo } from "react";
import { useLoader } from "@react-three/fiber";
import { Decal, Html, useGLTF } from "@react-three/drei";
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

  const texture = designUrl ? useLoader(THREE.TextureLoader, designUrl) : null;
  useMemo(() => {
    if (!texture) return;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.flipY = false;
    texture.anisotropy = 16;
    texture.needsUpdate = true;
  }, [texture]);

  const shirtColor = color === TShirtColor.WHITE ? "#f9fafb" : "#0a0a0a";

  // ✅ Elegir torso (mesh más grande)
  const torsoKey = useMemo(() => {
    let bestKey: string | null = null;
    let bestVol = -Infinity;

    Object.entries(nodes).forEach(([key, n]: any) => {
      if (!n?.isMesh || !n.geometry) return;

      n.geometry.computeBoundingBox?.();
      const box = n.geometry.boundingBox;
      if (!box) return;

      const s = new THREE.Vector3();
      box.getSize(s);
      const vol = s.x * s.y * s.z;

      if (vol > bestVol) {
        bestVol = vol;
        bestKey = key;
      }
    });

    return bestKey;
  }, [nodes]);

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
    <group>
      {Object.entries(nodes).map(([key, n]: any) => {
        if (!n?.isMesh || !n.geometry) return null;

        const isTorso = key === torsoKey;

        // ✅ posición del decal EN LOCAL del torso (bbox)
        let decalPos: [number, number, number] = [0, 0.15, 0.06];
        if (isTorso) {
          n.geometry.computeBoundingBox?.();
          const box = n.geometry.boundingBox as THREE.Box3 | null;
          if (box) {
            const size = new THREE.Vector3();
            const center = new THREE.Vector3();
            box.getSize(size);
            box.getCenter(center);

            const chest = center.clone();
            chest.y += size.y * 0.15; // arriba/abajo
            chest.z += size.z * 0.65; // hacia afuera

            decalPos = [chest.x, chest.y, chest.z];
          }
        }

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

            {/* ✅ Decal SIEMPRE como hijo del mesh torso */}
            {isTorso && texture && (
              <Decal
                key={designUrl || "no-design"}
                position={decalPos}
                rotation={[0, 0, 0]}
                scale={[0.35 * designScale, 0.35 * designScale, 1]}
                polygonOffset
                polygonOffsetFactor={-10}
              >
                <meshStandardMaterial
                  map={texture}
                  transparent
                  alphaTest={0.5}
                  roughness={0.6}
                  metalness={0.05}
                  depthWrite={false}
                />
              </Decal>
            )}
          </mesh>
        );
      })}
    </group>
  );
};

useGLTF.preload(MODEL_URL);

export default TShirtModel;
