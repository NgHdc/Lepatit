"use client";
import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Shader định nghĩa sóng
const vertexShader = `
  uniform float uTime;
  varying float vElevation;
  void main() {
    vec3 pos = position;
    float elevation = sin(pos.x * 2.0 + uTime * 0.5) * 0.5;
    elevation += sin(pos.y * 1.5 + uTime * 0.3) * 0.5;
    pos.z += elevation;
    vElevation = elevation;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const fragmentShader = `
  varying float vElevation;
  void main() {
    // Màu chất lỏng làm mát: Đen xanh
    vec3 deepColor = vec3(0.05, 0.05, 0.1);
    vec3 surfaceColor = vec3(0.1, 0.2, 0.3);
    float mixStrength = (vElevation + 1.0) * 0.5;
    vec3 color = mix(deepColor, surfaceColor, mixStrength);
    gl_FragColor = vec4(color, 0.9);
  }
`;

export default function Ocean() {
  // MeshRef để truy cập vào vật thể nhằm update animation
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Uniforms cần dùng useMemo để không bị tạo lại mỗi lần render
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
    }),
    []
  );

  // useFrame chạy 60fps, tương đương requestAnimationFrame
  useFrame((state) => {
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.ShaderMaterial;
      material.uniforms.uTime.value = state.clock.getElapsedTime();
    }
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
      <planeGeometry args={[200, 200, 128, 128]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
      />
    </mesh>
  );
}