"use client";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Earth from "./Earth";
import Ocean from "./Ocean";
import Stars from "./Stars";

export default function Scene() {
  return (
    <div className="w-full h-screen relative bg-black">
      <Canvas camera={{ position: [0, 2, 10], fov: 75 }}>
        {/* Sương mù để làm mờ đường chân trời */}
        <fogExp2 attach="fog" args={['#050505', 0.015]} />
        
        {/* Ánh sáng môi trường */}
        <ambientLight intensity={0.5} />
        
        {/* Ánh sáng từ Trái đất hắt lại */}
        <directionalLight position={[0, 10, -50]} intensity={2} color="#ffaa33" />

        {/* Các vật thể */}
        <Stars />
        <Earth />
        <Ocean />

        {/* Điều khiển Camera */}
        <OrbitControls 
          enableZoom={false} 
          enablePan={false}
          maxPolarAngle={Math.PI / 2 - 0.05} // Không cho nhìn xuống đáy
          minPolarAngle={Math.PI / 3}        // Không cho nhìn lên quá cao
          autoRotate
          autoRotateSpeed={0.2}
        />
      </Canvas>
    </div>
  );
}