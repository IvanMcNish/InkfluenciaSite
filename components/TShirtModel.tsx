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

  // ✅ ojo: usamos nodes del GLTF en vez de clonar scene + primitive
  const nodes = gltf.nodes || {};
  const materials = gltf.materials || {};

  const texture = designUrl ? useLoader(THREE.TextureLoader, designUrl) : null;
  useMemo(() => {
    if (!texture) return;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.flipY = false;
    texture.anisotropy = 16;
    texture.needsUpdate = true;
  }, [texture]);

  const shirtColor = color === TShirtColor.WHITE ? "#f9fafb" : "#0a0a0a";

  // ✅ encontrar el mesh “torso” (el más grande)
  const torso = useMemo(() => {
    let best: any = null;
    let bestVol = -Infinity;

    Object.values(nodes).forEach((n: any) => {
      if (!n?.isMesh || !n.geometry) return;

      n.geometry.computeBoundingBox?.();
      const box = n.geometry.boundingBox;
      if (!box) return;

      const s = new THREE.Vector3();
      box.getSize(s);
      const vol = s.x * s.y * s.z;
      if (vol > bestVol) {
        bestVol = vol;
        best = n;
      }
    });

    return best as THREE.Mesh | null;
  }, [nodes]);

  // si no hay torso aún, mostramos loading
  if (!torso) {
    return (
      <Html center>
        <div className="bg-white/80 p-4 rounded-xl shadow border">
          Cargando mallas…
        </div>
      </Html>
    );
  }

  const canDecal = !!texture;

  return (
    <group scale={2.2}>
      {/* ✅ Renderizamos todas las mallas explícitamente */}
      {Object.entries(nodes).map(([key, n]: any) => {
        if (!n?.isMesh || !n.geometry) return null;

        const isTorso = n === torso;

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

            {/* ✅ Decal como hijo del MESH real (no necesita mesh prop) */}
            {isTorso && canDecal && (
              <Decal
                position={[0, 0.15, 0.05]}
                rotation={[0, 0, 0]}
                scale={[0.35 * designScale, 0.35 * designScale, 1]}
                polygonOffset
                polygonOffsetFactor={-10}
              >
                <meshStandardMaterial
                  map={texture!}
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
useLayoutEffect(() => {
  const names: string[] = [];
  scene.traverse((o: any) => {
    if (o?.isMesh) names.push(o.name || "(sin nombre)");
  });
  console.log("Meshes del GLB:", names);
}, [scene]);

export default TShirtModel;
