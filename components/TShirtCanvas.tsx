import React, { useMemo, useLayoutEffect, useState } from "react";
import { useLoader } from "@react-three/fiber";
import { Center, Decal, Html, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { TShirtColor } from "../types";

interface TShirtProps {
  color: TShirtColor;
  designUrl: string | null;
  designScale?: number;
}


const MODEL_URL =
  "https://raw.githubusercontent.com/IvanMcNish/camiseta/main/t_shirt.glb";

export const TShirtModel: React.FC<TShirtProps> = ({
  color,
  designUrl,
  designScale = 0.5,
}) => {
  const gltf = useGLTF(MODEL_URL) as any;

  // ✅ CLONE: evita mutar el scene cacheado de drei (muy importante)
  const scene = useMemo(() => gltf.scene.clone(true) as THREE.Object3D, [gltf.scene]);

  // ✅ Textura del diseño
  const texture = designUrl ? useLoader(THREE.TextureLoader, designUrl) : null;
  if (texture) {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 16;
  }

  const shirtColor = color === TShirtColor.WHITE ? "#f9fafb" : "#0a0a0a";
  const fabricMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(shirtColor),
        roughness: 0.85,
        metalness: 0.05,
      }),
    [shirtColor]
  );

  // ✅ Guardamos el mesh objetivo REAL del scene clonado
  const [targetMesh, setTargetMesh] = useState<THREE.Mesh | null>(null);

  useLayoutEffect(() => {
    let best: THREE.Mesh | null = null;
    let bestVol = -Infinity;

    scene.traverse((obj: any) => {
      if (obj?.isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
        obj.material = fabricMaterial;

        // escoger mesh más grande (normalmente torso)
        obj.geometry.computeBoundingBox();
        const box = obj.geometry.boundingBox;
        if (box) {
          const s = new THREE.Vector3();
          box.getSize(s);
          const vol = s.x * s.y * s.z;
          if (vol > bestVol) {
            bestVol = vol;
            best = obj as THREE.Mesh;
          }
        }
      }
    });

    setTargetMesh(best);
  }, [scene, fabricMaterial]);

  if (!targetMesh) {
    return (
      <Html center>
        <div className="bg-white/80 p-4 rounded-xl shadow border">
          Cargando mallas del modelo...
        </div>
      </Html>
    );
  }

  return (
    <Center top>
      <group scale={2.2}>
        {/* ✅ Camiseta COMPLETA */}
        <primitive object={scene} />

        {/* ✅ Decal aplicado al mesh REAL del torso */}
        {texture && (
          <Decal
            mesh={targetMesh}
            position={[0, 0.45, 0.15]}
            rotation={[0, 0, 0]}
            scale={[0.3 * designScale, 0.3 * designScale, 1]}
            polygonOffset
            polygonOffsetFactor={-10}
          >
            <meshStandardMaterial
              map={texture}
              transparent
              alphaTest={0.5}
              roughness={0.7}
              metalness={0.05}
              depthWrite={false}
            />
          </Decal>
        )}
      </group>
    </Center>
  );
};

try {
  useGLTF.preload(MODEL_URL);
} catch (e) {}
export default TShirtCanvas;


