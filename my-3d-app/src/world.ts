import * as THREE from 'three';
import { CONFIG } from './config';

// --- CLAY MATERIAL SHADER ---
const clayVertexShader = `
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec2 vUv;
    
    void main() {
        vNormal = normalize(normalMatrix * normal);
        vPosition = position;
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

const clayFragmentShader = `
    uniform vec3 uColor;
    uniform vec3 uColorDark;
    uniform vec3 uColorLight;
    uniform float uTime;
    
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec2 vUv;
    
    // Simple noise for clay texture
    float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
    }
    
    float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        
        float a = hash(i);
        float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0));
        float d = hash(i + vec2(1.0, 1.0));
        
        return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
    }
    
    void main() {
        // Toon shading - 3 color bands
        float lightIntensity = dot(vNormal, normalize(vec3(0.5, 1.0, 0.3)));
        lightIntensity = lightIntensity * 0.5 + 0.5;
        
        // Step the lighting into bands (claymation look)
        float band = floor(lightIntensity * 3.0) / 3.0;
        
        // Mix between dark, mid, and light clay colors
        vec3 color = mix(uColorDark, uColor, band);
        color = mix(color, uColorLight, step(0.7, band));
        
        // Add subtle fingerprint/surface noise
        float surfaceNoise = noise(vUv * 50.0 + vPosition.xy * 2.0) * 0.08;
        color += surfaceNoise;
        
        // Slight color variation for handmade feel
        color += (hash(vUv * 100.0) - 0.5) * 0.03;
        
        gl_FragColor = vec4(color, 1.0);
    }
`;

// Hàm tạo vật thể với chất liệu đất sét (Clay Material)
function createClayMesh(geometry: THREE.BufferGeometry, color: number, name: string = "Unknown"): THREE.Mesh {
    const baseColor = new THREE.Color(color);
    const darkColor = baseColor.clone().multiplyScalar(0.6);
    const lightColor = baseColor.clone().multiplyScalar(1.3);

    const material = new THREE.ShaderMaterial({
        vertexShader: clayVertexShader,
        fragmentShader: clayFragmentShader,
        uniforms: {
            uColor: { value: baseColor },
            uColorDark: { value: darkColor },
            uColorLight: { value: lightColor },
            uTime: { value: 0 }
        }
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.name = name;

    // Tạo viền đậm (Thick hand-painted outline)
    const edgesGeo = new THREE.EdgesGeometry(geometry, 20); // Higher threshold for chunkier edges
    const edgesMat = new THREE.LineBasicMaterial({
        color: 0x1a1510, // Dark brown outline (not pure black)
        linewidth: 3,
        transparent: true,
        opacity: 0.8 // More visible outlines for claymation
    });
    const edges = new THREE.LineSegments(edgesGeo, edgesMat);
    mesh.add(edges);

    return mesh;
}

// Alias for backward compatibility
const createSketchMesh = createClayMesh;

export function setupWorld(scene: THREE.Scene): THREE.Group {
    const roomGroup = new THREE.Group();
    // scene.add(roomGroup);

    // --- 1. SÀN NHÀ (THE FLOATING ISLE) ---
    // Tạo sàn mỏng như một chiếc bè
    const floor = createSketchMesh(new THREE.BoxGeometry(10, 0.2, 10), CONFIG.colors.floor, "Floor");
    floor.position.y = -0.1; // Tâm sàn
    roomGroup.add(floor);

    // --- 2. BÀN LÀM VIỆC ---
    const desk = createSketchMesh(new THREE.BoxGeometry(4, 0.2, 2), CONFIG.colors.desk, "Desk"); // Đổi tên cho khớp DB
    desk.position.set(-2, 1.5, -3);
    roomGroup.add(desk);

    // Chân bàn (Trang trí thêm cho đỡ trống)
    const leg1 = createSketchMesh(new THREE.BoxGeometry(0.2, 1.5, 0.2), 0x111111);
    leg1.position.set(-3.8, 0.75, -2.2);
    roomGroup.add(leg1);
    const leg2 = createSketchMesh(new THREE.BoxGeometry(0.2, 1.5, 0.2), 0x111111);
    leg2.position.set(-0.2, 0.75, -3.8);
    roomGroup.add(leg2);

    // --- 3. MÁY TÍNH (THE DIGITAL WITCH) ---
    const pcGroup = new THREE.Group();
    roomGroup.add(pcGroup);

    // Màn hình
    const pcMonitor = createSketchMesh(new THREE.BoxGeometry(1.2, 0.8, 0.1), 0x222222, "Computer");
    pcMonitor.position.set(-2, 2.2, -3);

    // Màn hình phát sáng (Screen Glow)
    const screenMat = new THREE.MeshBasicMaterial({ color: CONFIG.colors.neon });
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.6), screenMat);
    screen.position.z = 0.06;
    screen.name = "Computer"; // Để click vào màn hình cũng nhận
    pcMonitor.add(screen);
    pcGroup.add(pcMonitor);

    // Case máy tính
    const pcCase = createSketchMesh(new THREE.BoxGeometry(0.5, 1, 1), 0x111111, "Computer");
    pcCase.position.set(-3.5, 2, -3);
    pcGroup.add(pcCase);

    // Ánh sáng màn hình hắt ra
    const screenLight = new THREE.PointLight(CONFIG.colors.neon, 2, 5);
    screenLight.position.set(-2, 2.5, -2.5);
    roomGroup.add(screenLight);

    // --- 4. BĂNG CASSETTE (ADAM'S GHOST) ---
    const cassette = createSketchMesh(new THREE.BoxGeometry(0.6, 0.1, 0.4), 0xcc4444, "Cassette");
    cassette.position.set(-1, 1.65, -2.5); // Đặt trên mặt bàn (y bàn = 1.5 + 0.1)
    cassette.rotation.y = 0.5;
    roomGroup.add(cassette);

    // --- 5. ANTENNA (THE SIGNAL) ---
    const antennaGroup = new THREE.Group();
    antennaGroup.position.set(3, 0, 3); // Đặt góc sàn

    // Cột ăng ten
    const pole = createSketchMesh(new THREE.CylinderGeometry(0.1, 0.1, 5), 0x888888, "Antenna");
    pole.position.y = 2.5;

    // Chảo thu sóng
    const dish = createSketchMesh(new THREE.ConeGeometry(1.5, 0.5, 16, 1, true), 0xcccccc, "Antenna");
    dish.position.set(0, 5, 0);
    dish.rotation.x = -Math.PI / 4;
    dish.rotation.z = -Math.PI / 6;

    antennaGroup.add(pole, dish);
    antennaGroup.name = "Antenna";

    // Đèn báo hiệu đỏ trên đỉnh ăng ten
    const antLight = new THREE.PointLight(0xff0000, 0, 3);
    antLight.position.set(0, 5, 0);
    antLight.name = "AntLight"; // Để animate nhấp nháy
    antennaGroup.add(antLight);

    // Thêm sphere nhỏ làm bóng đèn
    const bulb = new THREE.Mesh(
        new THREE.SphereGeometry(0.1),
        new THREE.MeshBasicMaterial({ color: 0xff0000 })
    );
    bulb.position.set(0, 5, 0);
    antennaGroup.add(bulb);

    roomGroup.add(antennaGroup);

    return roomGroup;
}