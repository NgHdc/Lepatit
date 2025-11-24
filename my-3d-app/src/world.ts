import * as THREE from 'three';
import { CONFIG } from './config';

// Hàm tạo vật thể với viền đen (Sketch Style)
function createSketchMesh(geometry: THREE.BufferGeometry, color: number, name: string = "Unknown"): THREE.Mesh {
    const material = new THREE.MeshStandardMaterial({
        color: color, 
        roughness: 0.8, 
        metalness: 0.1, // Giảm kim loại để đỡ bị tối trong đêm
        polygonOffset: true, 
        polygonOffsetFactor: 1, 
        polygonOffsetUnits: 1
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true; 
    mesh.receiveShadow = true;
    mesh.name = name;
    
    // Tạo viền (Outline)
    const edgesGeo = new THREE.EdgesGeometry(geometry, 15); // 15 độ ngưỡng
    const edgesMat = new THREE.LineBasicMaterial({ 
        color: 0x000000, // Viền đen
        linewidth: 2,
        transparent: true,
        opacity: 0.6 // Viền hơi mờ để hòa vào đêm
    });
    const edges = new THREE.LineSegments(edgesGeo, edgesMat);
    mesh.add(edges);
    
    return mesh;
}

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
    dish.rotation.x = -Math.PI/4; 
    dish.rotation.z = -Math.PI/6;
    
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