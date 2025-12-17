import React, { useMemo, useLayoutEffect, useState } from "react";
import { useThree, useLoader } from "@react-three/fiber";
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
  const { camera } = useThree();

  // ✅ clone para no mutar cache
  const scene = useMemo(
    () => gltf.scene.clone(true) as THREE.Object3D,
    [gltf.scene]
  );

  // ✅ textura
  const texture = designUrl ? useLoader(THREE.TextureLoader, designUrl) : null;
  useMemo(() => {
    if (!texture) return;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 16;
    texture.flipY = false; // 🔥 muy importante con GLTF + decals
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
  const [decalPos, setDecalPos] = useState<THREE.Vector3 | null>(null);
  const [decalNormal, setDecalNormal] = useState<THREE.Vector3 | null>(null);

  // 1) aplicar material y escoger mesh torso (más grande)
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

  // 2) cuando hay textura + mesh, raycast al centro de la camiseta
  useLayoutEffect(() => {
    if (!texture || !targetMesh) return;

    // Queremos “pegar” en el centro visible (pecho)
    // Tomamos un punto al frente de la cámara hacia el objeto:
    const raycaster = new THREE.Raycaster();

    // NDC 0,0 = centro de pantalla
    raycaster.setFromCamera(new THREE.Vector2(0, 0.05), camera);

    const hits = raycaster.intersectObject(targetMesh, true);
    if (hits.length) {
      const hit = hits[0];

      setDecalPos(hit.point.clone());

      // normal del punto (para orientar el decal)
      const n = hit.face?.normal?.clone() ?? new THREE.Vector3(0, 0, 1);
      n.transformDirection(targetMesh.matrixWorld);
      setDecalNormal(n.normalize());
    } else {
      // fallback (por si no pega): centro del mesh
      const box = new THREE.Box3().setFromObject(targetMesh);
      const center = new THREE.Vector3();
      box.getCenter(center);
      setDecalPos(center);
      setDecalNormal(new THREE.Vector3(0, 0, 1));
    }
  }, [texture, targetMesh, camera]);

  if (!targetMesh) {
    return (
      <Html center>
        <div className="bg-white/80 p-4 rounded-xl shadow border">
          Cargando modelo…
        </div>
      </Html>
    );
  }

  const canDecal = !!texture && !!decalPos && !!decalNormal;

  // Rotación: alinear decal con la normal
  const decalRotation = useMemo(() => {
    if (!decalNormal) return [0, 0, 0] as [number, number, number];

    const quat = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 0, 1),
      decalNormal
    );
    const euler = new THREE.Euler().setFromQuaternion(quat);
    return [euler.x, euler.y, euler.z] as [number, number, number];
  }, [decalNormal]);

  return (
    <Center top>
      <group scale={2.2}>
        <primitive object={scene} />

        {canDecal && (
          <Decal
            // ✅ Ahora el Decal es hijo del mesh real, no depende de “position hardcoded”
            mesh={targetMesh}
            key={designUrl || "no-design"}
            position={[decalPos!.x, decalPos!.y, decalPos!.z]}
            rotation={decalRotation}
            scale={[0.35 * designScale, 0.35 * designScale, 1]}
            polygonOffset
            polygonOffsetFactor={-10}
          >
            <meshStandardMaterial
              map={texture!}
              transparent
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
