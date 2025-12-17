import React, { useMemo, useLayoutEffect, useState } from "react";
import { useLoader } from "@react-three/fiber";
import { Center, Decal, Html, useGLTF } from "@react-three/drei";
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

  // 🔒 CLONE para no mutar el cache de drei
  const scene = useMemo(
    () => gltf.scene.clone(true) as THREE.Object3D,
    [gltf.scene]
  );

  const texture = designUrl
    ? useLoader(THREE.TextureLoader, designUrl)
    : null;

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

  const [targetMesh, setTargetMesh] = useState<THREE.Mesh | null>(null);

  useLayoutEffect(() => {
    let best: THREE.Mesh | null = null;
    let bestVol = -Infinity;

    scene.traverse((obj: any) => {
      if (obj?.isMesh) {
        obj.material = fabricMaterial;
        obj.castShadow = true;
        obj.receiveShadow = true;

        obj.geometry.computeBoundingBox();
        const box = obj.geometry.boundingBox;
        if (box) {
          const s = new THREE.Vector3();
          box.getSize(s);
          const vol = s.x * s.y * s.z;
          if (vol > bestVol) {
            bestVol = vol;
            best = obj;
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
          Cargando modelo…
        </div>
      </Html>
    );
  }

  return (
    <Center top>
      <group scale={2.2}>
        {/* Camiseta completa */}
        <primitive object={scene} />

        {/* Decal en el torso */}
        {texture && (
          <Decal
            mesh={targetMesh}
            position={[0, 0.45, 0.15]}
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

useGLTF.preload(MODEL_URL);

export default TShirtModel;
