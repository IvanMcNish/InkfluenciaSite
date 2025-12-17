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

function pickLargestMesh(root: THREE.Object3D) {
  const meshes: THREE.Mesh[] = [];
  root.traverse((o: any) => {
    if (o?.isMesh) meshes.push(o as THREE.Mesh);
  });

  if (!meshes.length) return null;

  let best = meshes[0];
  let bestVol = -Infinity;

  for (const m of meshes) {
    m.geometry.computeBoundingBox();
    const box = m.geometry.boundingBox;
    if (!box) continue;

    const s = new THREE.Vector3();
    box.getSize(s);
    const vol = s.x * s.y * s.z;

    if (vol > bestVol) {
      bestVol = vol;
      best = m;
    }
  }

  return best;
}

const TShirtModel: React.FC<TShirtModelProps> = ({
  color,
  designUrl,
  designScale = 0.5,
}) => {
  const gltf = useGLTF(MODEL_URL) as any;

  // ✅ Scene clonado (para no mutar cache)
  const scene = useMemo(
    () => gltf.scene.clone(true) as THREE.Object3D,
    [gltf.scene]
  );

  // ✅ Elegimos el mesh más grande (torso)
  const [target, setTarget] = useState<THREE.Mesh | null>(null);

  useLayoutEffect(() => {
    const best = pickLargestMesh(scene);
    setTarget(best);
  }, [scene]);

  // ✅ Textura del diseño
  const texture = designUrl
    ? useLoader(THREE.TextureLoader, designUrl)
    : null;

  useMemo(() => {
    if (!texture) return;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 16;
    texture.needsUpdate = true;
  }, [texture]);

  const shirtColor = color === TShirtColor.WHITE ? "#f9fafb" : "#0a0a0a";

  if (!target) {
    return (
      <Html center>
        <div className="bg-white/80 p-4 rounded-xl shadow border">
          Cargando modelo…
        </div>
      </Html>
    );
  }

  // ✅ Material “tela”
  const fabricMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(shirtColor),
        roughness: 0.85,
        metalness: 0.05,
      }),
    [shirtColor]
  );

  return (
    <Center top>
      <group scale={2.2}>
        {/* ✅ Renderiza todo el modelo completo */}
        <primitive object={scene} />

        {/* ✅ Encima, renderizamos SOLO el torso como <mesh> para que el Decal tenga padre Mesh */}
        <mesh
          geometry={target.geometry}
          position={target.position}
          rotation={target.rotation}
          scale={target.scale}
          castShadow
          receiveShadow
        >
          <primitive object={fabricMaterial} attach="material" />

          {/* ✅ Decal como hijo => NO necesita prop mesh */}
          {texture && (
            <Decal
              key={designUrl || "no-design"}
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
        </mesh>
      </group>
    </Center>
  );
};

useGLTF.preload(MODEL_URL);

export default TShirtModel;
