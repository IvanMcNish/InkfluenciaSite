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

  // ✅ Clon estable para no mutar cache
  const scene = useMemo(
    () => gltf.scene.clone(true) as THREE.Object3D,
    [gltf.scene]
  );

  // ✅ Textura del diseño
  const texture = designUrl ? useLoader(THREE.TextureLoader, designUrl) : null;
  useMemo(() => {
    if (!texture) return;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 16;
    texture.needsUpdate = true;
  }, [texture]);

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

  // ✅ Mesh objetivo (torso) - el más “grande”
  const [targetMesh, setTargetMesh] = useState<THREE.Mesh | null>(null);

  useLayoutEffect(() => {
    let best: THREE.Mesh | null = null;
    let bestVol = -Infinity;

    scene.traverse((obj: any) => {
      if (obj?.isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
        obj.material = fabricMaterial;

        obj.geometry?.computeBoundingBox?.();
        const box = obj.geometry?.boundingBox;
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
          Cargando modelo…
        </div>
      </Html>
    );
  }

  const canDecal =
    !!texture &&
    targetMesh instanceof THREE.Mesh &&
    !!(targetMesh as THREE.Mesh).geometry;

  return (
    <Center top>
      <group scale={2.2}>
        {/* Camiseta completa */}
        <primitive object={scene} />

        {/* ✅ FIX DEFINITIVO: Decal como HIJO de un Mesh real (carrier invisible) */}
     {canDecal && (
  <mesh
    geometry={targetMesh.geometry}
    // ⚠️ NO uses targetMesh.position directo (son referencias mutables)
    position={[
      targetMesh.position.x,
      targetMesh.position.y,
      targetMesh.position.z,
    ]}
    rotation={[
      targetMesh.rotation.x,
      targetMesh.rotation.y,
      targetMesh.rotation.z,
    ]}
    scale={[
      targetMesh.scale.x,
      targetMesh.scale.y,
      targetMesh.scale.z,
    ]}
    // ✅ deja el mesh visible para que el decal se dibuje
  >
    {/* ✅ “material invisible”: el mesh NO se ve, pero sus hijos sí */}
    <meshBasicMaterial transparent opacity={0} colorWrite={false} />

    <Decal
      key={designUrl || "no-design"}
      position={[0, 0.45, 0.15]}
      rotation={[0, 0, 0]}
      scale={[0.3 * designScale, 0.3 * designScale, 1]}
      polygonOffset
      polygonOffsetFactor={-10}
    >
      <meshStandardMaterial
        map={texture!}
        transparent
        alphaTest={0.5}
        roughness={0.7}
        metalness={0.05}
        depthWrite={false}
      />
    </Decal>
  </mesh>
)}

      </group>
    </Center>
  );
};

useGLTF.preload(MODEL_URL);

export default TShirtModel;
