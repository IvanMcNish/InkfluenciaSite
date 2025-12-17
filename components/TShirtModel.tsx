import React, { useMemo, useLayoutEffect, useRef } from "react";
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

  // 🔒 Clonar para no mutar el cache
  const scene = useMemo(
    () => gltf.scene.clone(true) as THREE.Object3D,
    [gltf.scene]
  );

  // ✅ Textura
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

  // ✅ Ref estable al mesh destino
  const targetMeshRef = useRef<THREE.Mesh | null>(null);

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
            best = obj as THREE.Mesh;
          }
        }
      }
    });

    targetMeshRef.current = best;
  }, [scene, fabricMaterial]);

  const targetMesh = targetMeshRef.current;

  // ✅ UI de carga solo si NO hay mesh destino aún
  if (!targetMesh) {
    return (
      <Html center>
        <div className="bg-white/80 p-4 rounded-xl shadow border">
          Cargando mallas del modelo…
        </div>
      </Html>
    );
  }

  // ✅ Guardas: decal solo si hay textura y el mesh es Mesh real
  const canDecal =
    !!texture && targetMesh instanceof THREE.Mesh && !!targetMesh.geometry;

  return (
    <Center top>
      <group scale={2.2}>
        <primitive object={scene} />

        {canDecal && (
          <Decal
            // 🔥 CLAVE: mesh siempre válido
            mesh={targetMesh}
            // Key: fuerza remount cuando cambias imagen (evita estados viejos)
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
      </group>
    </Center>
  );
};

useGLTF.preload(MODEL_URL);

export default TShirtModel;
