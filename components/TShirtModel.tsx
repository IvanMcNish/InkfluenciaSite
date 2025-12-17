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

  const scene = useMemo(
    () => gltf.scene.clone(true) as THREE.Object3D,
    [gltf.scene]
  );

  const texture = designUrl ? useLoader(THREE.TextureLoader, designUrl) : null;

  useMemo(() => {
    if (!texture) return;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 16;
    texture.flipY = false; // importante para glTF
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

  const [targetMesh, setTargetMesh] = useState<THREE.Mesh | null>(null);
  const [decalLocalPos, setDecalLocalPos] = useState<THREE.Vector3 | null>(null);

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

  // ✅ Posición del decal en coordenadas LOCALES del torso (bbox)
  useLayoutEffect(() => {
    if (!texture || !targetMesh) return;

    targetMesh.geometry.computeBoundingBox();
    const box = targetMesh.geometry.boundingBox;
    if (!box) return;

    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    // “pecho”: centro + un poco hacia arriba y un poco hacia afuera (Z)
    const chest = center.clone();
    chest.y += size.y * 0.15;
    chest.z += size.z * 0.35;

    setDecalLocalPos(chest);
  }, [texture, targetMesh]);

  if (!targetMesh) {
    return (
      <Html center>
        <div className="bg-white/80 p-4 rounded-xl shadow border">
          Cargando modelo…
        </div>
      </Html>
    );
  }

  const canDecal = !!texture && !!decalLocalPos && targetMesh instanceof THREE.Mesh;

  return (
    <Center top>
      <group scale={2.2}>
        <primitive object={scene} />

        {canDecal && (
          <Decal
            // ✅ importante: Decal aplicado al mesh real
            mesh={targetMesh}
            key={designUrl || "no-design"}
            position={[decalLocalPos!.x, decalLocalPos!.y, decalLocalPos!.z]}
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
      </group>
    </Center>
  );
};

useGLTF.preload(MODEL_URL);

export default TShirtModel;
