"use client";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Mesh } from "three";

export default function Earth() {
  const earthRef = useRef<Mesh>(null);

  useFrame(() => {
    if (earthRef.current) {
      earthRef.current.rotation.y += 0.0005; // Quay chậm
    }
  });

  return (
    <group position={[0, 5, -100]}>
      {/* Trái đất lõi */}
      <mesh ref={earthRef}>
        <sphereGeometry args={[40, 64, 64]} />
        <meshStandardMaterial
          color="#553333"      // Màu đất nâu đỏ
          emissive="#220505"   // Tự phát sáng màu đỏ chết chóc
          roughness={0.8}
        />
      </mesh>

      {/* Vầng khí quyển mờ */}
      <mesh>
        <sphereGeometry args={[42, 32, 32]} />
        <meshBasicMaterial
          color="#ff4400"
          transparent
          opacity={0.1}
          side={1} // THREE.BackSide (để nhìn xuyên từ ngoài vào hoặc ngược lại tùy setting)
        />
      </mesh>
    </group>
  );
}