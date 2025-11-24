"use client";
import { useState, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
// TypeScript has no type declarations for this ESM build; ignore the declaration error here
// @ts-ignore: could not find a declaration file for 'maath/random/dist/maath-random.esm'
import * as random from "maath/random/dist/maath-random.esm";

export default function Stars(props: any) {
  const ref = useRef<any>(null);

  // SỬA LỖI Ở ĐÂY:
  // Thay 5000 thành 6000 (hoặc số bất kỳ chia hết cho 3)
  // Lý do: Mỗi ngôi sao cần 3 tọa độ (x,y,z). 5000/3 bị lẻ nên gây lỗi NaN.
  const [sphere] = useState(() => 
    random.inSphere(new Float32Array(6000), { radius: 150 }) as Float32Array
  );

  // Thêm hiệu ứng: Các ngôi sao tự xoay chậm
  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= delta / 10;
      ref.current.rotation.y -= delta / 15;
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={sphere} stride={3} frustumCulled={false} {...props}>
        <PointMaterial
          transparent
          color="#ffa0e0"
          size={0.05}
          sizeAttenuation={true}
          depthWrite={false}
        />
      </Points>
    </group>
  );
}