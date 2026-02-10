import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { RoundedBox, Float, MeshTransmissionMaterial } from '@react-three/drei';
import * as THREE from 'three';

interface FileIconMeshProps {
  activeCategory: number;
}

const categoryColors = [
  '#22d3ee', // Documents - cyan
  '#a855f7', // Images - purple  
  '#f472b6', // Audio - pink
  '#fb923c', // Video - orange
  '#4ade80', // Archives - green
];

function FileIconMesh({ activeCategory }: FileIconMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  
  const targetColor = useMemo(() => new THREE.Color(categoryColors[activeCategory]), [activeCategory]);
  const currentColor = useRef(new THREE.Color(categoryColors[0]));

  useFrame((state) => {
    if (meshRef.current) {
      // Smooth color transition
      currentColor.current.lerp(targetColor, 0.05);
      
      // Subtle rotation
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.05;
    }
    
    if (glowRef.current) {
      const material = glowRef.current.material as THREE.MeshBasicMaterial;
      material.color.copy(currentColor.current);
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
      <group>
        {/* Main file body */}
        <RoundedBox
          ref={meshRef}
          args={[2.5, 3, 0.3]}
          radius={0.15}
          smoothness={4}
        >
          <MeshTransmissionMaterial
            backside
            samples={8}
            thickness={0.5}
            chromaticAberration={0.1}
            anisotropy={0.3}
            distortion={0.2}
            distortionScale={0.2}
            temporalDistortion={0.1}
            iridescence={0.8}
            iridescenceIOR={1}
            iridescenceThicknessRange={[0, 1400]}
            color={currentColor.current}
            transmission={0.9}
            roughness={0.1}
          />
        </RoundedBox>

        {/* Folded corner */}
        <mesh position={[0.75, 1, 0.2]} rotation={[0, 0, Math.PI / 4]}>
          <planeGeometry args={[0.8, 0.8]} />
          <meshStandardMaterial 
            color="#1a1f2e" 
            side={THREE.DoubleSide}
            metalness={0.5}
            roughness={0.3}
          />
        </mesh>

        {/* Glow sphere behind */}
        <mesh ref={glowRef} position={[0, 0, -0.5]} scale={2.5}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshBasicMaterial 
            color={categoryColors[activeCategory]} 
            transparent 
            opacity={0.08}
          />
        </mesh>

        {/* Document lines */}
        {[0, -0.4, -0.8].map((y, i) => (
          <mesh key={i} position={[-0.3, y, 0.18]}>
            <boxGeometry args={[1.5 - i * 0.2, 0.08, 0.05]} />
            <meshStandardMaterial 
              color="#ffffff"
              opacity={0.3}
              transparent
            />
          </mesh>
        ))}
      </group>
    </Float>
  );
}

interface FileIcon3DProps {
  activeCategory: number;
  className?: string;
}

export function FileIcon3D({ activeCategory, className }: FileIcon3DProps) {
  return (
    <div className={className}>
      <Canvas
        camera={{ position: [0, 0, 6], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#22d3ee" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#a855f7" />
        <spotLight
          position={[0, 10, 5]}
          angle={0.3}
          penumbra={1}
          intensity={0.8}
          color="#ffffff"
        />
        <FileIconMesh activeCategory={activeCategory} />
      </Canvas>
    </div>
  );
}
