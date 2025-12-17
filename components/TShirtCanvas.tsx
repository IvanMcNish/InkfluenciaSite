
import React, { useMemo } from "react";
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

const TShirtModel: React.FC<TShirtProps> = ({
  color,
  designUrl,
  designScale = 0.5,
}) => {
  // ✅ Cargamos el modelo completo
  const gltf = useGLTF(MODEL_URL) as any;
  const scene: THREE.Object3D = gltf.scene;
  const nodes = gltf.nodes ?? {};

  // ✅ Textura del diseño
  const texture = designUrl
    ? useLoader(THREE.TextureLoader, designUrl)
    : null;

  if (texture) {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 16;
  }

  // ✅ Color de camiseta
  const shirtColor = color === TShirtColor.WHITE ? "#f9fafb" : "#0a0a0a";

  // ✅ Elegimos un mesh “objetivo” (el más grande) para pegar el decal en el torso
  const targetMesh = useMemo(() => {
    const meshes: THREE.Mesh[] = Object.values(nodes).filter(
      (n: any) => n?.isMesh
    ) as THREE.Mesh[];

    if (!meshes.length) return null;

    let best = meshes[0];
    let bestVol = -Infinity;

    for (const m of meshes) {
      // bounding box para estimar el tamaño
      m.geometry.computeBoundingBox();
      const box = m.geometry.boundingBox!;
      const size = new THREE.Vector3();
      box.getSize(size);

      const vol = size.x * size.y * size.z;
      if (vol > bestVol) {
        bestVol = vol;
        best = m;
      }
    }

    return best;
  }, [nodes]);

  // ✅ Asegura que todas las piezas del modelo adopten el color/material de camiseta
  const fabricMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(shirtColor),
      roughness: 0.85,
      metalness: 0.05,
    });
  }, [shirtColor]);

  // Aplicamos material a todos los meshes del scene (torso, cuello, mangas, etc.)
  useMemo(() => {
    scene.traverse((obj: any) => {
      if (obj?.isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
        obj.material = fabricMaterial;
      }
    });
  }, [scene, fabricMaterial]);

  if (!targetMesh) {
    return (
      <Html center>
        <div className="text-red-500 font-bold bg-white/80 p-4 rounded-xl shadow-lg border border-red-100">
          Error: No se encontró ninguna malla (Mesh) en el modelo.
        </div>
      </Html>
    );
  }

  return (
    <Center top>
      <group scale={2.2}>
        {/* ✅ Renderiza la camiseta COMPLETA */}
        <primitive object={scene} />

        {/* ✅ Decal sobre el mesh objetivo (torso grande) */}
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

export default TShirtModel;

// ✅ Precarga (opcional)
try {
  useGLTF.preload(MODEL_URL);
} catch (e) {}
