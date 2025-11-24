import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import gsap from 'gsap';

// --- CÁC MODULE CỦA BẠN ---
import { STORY_DB } from './config';
import { setupEnvironment } from './environment';
import type { Environment } from './environment';
import { setupWater, getWaterHeightAt } from './water';
import { setupWorld } from './world';

// Định nghĩa kiểu cho sóng nước
type WaveObject = { update: (delta: number) => void; mesh: THREE.Object3D };

// --- BIẾN TOÀN CỤC ---
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let controls: OrbitControls;
let clock: THREE.Clock;
let wave: WaveObject;
let roomGroup: THREE.Group;
let env: Environment;

// Biến riêng cho hiệu ứng Trái Đất
let earthPlane: THREE.Mesh;
let sunLight: THREE.DirectionalLight; 

let accumulatedTime = 0;
let isViewOnRaft = true;

// Biến UI
let startButton: HTMLButtonElement;
let switchViewButton: HTMLButtonElement;

function init() {
    const container = document.body;

    // 1. SETUP UI
    setupUI();

    // 2. SETUP RENDERER
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.6;
    container.appendChild(renderer.domElement);

    // 3. SETUP SCENE
    scene = new THREE.Scene();
    // Màu nền xanh đen nhẹ (đừng để đen kịt 0x000000 để còn thấy sương mù hoạt động)
    const initialSpaceColor = 0x050510; 
    scene.background = new THREE.Color(initialSpaceColor);
    
    // Sương mù: Mỏng thôi (0.002) để nhìn xuyên qua được khoảng cách xa (Z=-250)
    scene.fog = new THREE.FogExp2(initialSpaceColor, 0.002); 

    // Setup môi trường cơ bản
    env = setupEnvironment(scene, renderer);

    // 4. SETUP CAMERA (TOP-DOWN VIEW)
    // Far = 100000: Nhìn cực xa để không bị lỗi mất hình khi zoom out
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100000);
    camera.position.set(0, 200, 0.1); 
    camera.lookAt(0, 0, 0); 

    // 5. CONTROLS
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enabled = false;    
    controls.autoRotate = false; 
    
    // --- BỎ GIỚI HẠN ZOOM ---
    controls.maxDistance = Infinity; // Zoom ra vô tận
    controls.minDistance = 0;        // Zoom xuyên vật thể
    // -------------------------

    controls.maxPolarAngle = Math.PI * 0.48; // Không cho chui xuống dưới nước
    controls.enableDamping = true;
    
    // 6. TẠO NƯỚC & BÈ
    wave = setupWater(scene);
    if (wave && wave.mesh) {
        // Scale 100 -> Kích thước thực tế khoảng 300x300 (vì gốc là 3x3)
        // Rìa nước sẽ ở Z = +/- 150.
        wave.mesh.scale.set(100, 1, 100);
    }

    roomGroup = setupWorld(scene);
    // Ẩn các vật thể thừa
    if (roomGroup) {
         roomGroup.traverse((child) => {
            if (child.name === 'Floor' || child.name === 'Ground' || child.name.includes('Computer')) {
                child.visible = false; 
            }
        });
    }

    // 7. TẠO TRÁI ĐẤT PHẲNG (ILLUSTRATION STYLE)
    createEarthSystem();

    // 8. LISTENERS
    window.addEventListener('resize', onWindowResize);
    window.addEventListener('pointerdown', onPointerDown);

    clock = new THREE.Clock();
    const loader = document.getElementById('loader');
    if (loader) loader.style.display = 'none';

    animate();
}

// --- HÀM TẠO TRÁI ĐẤT (PLANE) ---
function createEarthSystem() {
    // A. Nguồn sáng
    sunLight = new THREE.DirectionalLight(0xffffff, 1.0); 
    sunLight.position.set(0, 100, 0); 
    scene.add(sunLight);

    // B. Tạo MẶT PHẲNG Trái Đất
    const planeWidth = 200; 
    const planeHeight = 200; 
    const geometry = new THREE.PlaneGeometry(planeWidth, planeHeight, 1, 1); 
    
    const textureLoader = new THREE.TextureLoader();
    // LƯU Ý: Hãy chắc chắn bạn đã đổi tên ảnh thành 'earth_flat.jpg' hoặc sửa đường dẫn dưới đây
    const earthTexture = textureLoader.load('./assets/textures/earth_flat_map.jpg', 
        undefined, 
        undefined, 
        (err) => console.log("Lỗi tải ảnh. Hãy kiểm tra đường dẫn assets/textures/...")
    );

    // Dùng MeshBasicMaterial để giữ nguyên màu sắc ảnh minh họa (không bị bóng tối làm đen)
    const material = new THREE.MeshBasicMaterial({ 
        map: earthTexture,
        transparent: true,
        opacity: 0, // Ẩn lúc đầu
        side: THREE.FrontSide 
    });

    earthPlane = new THREE.Mesh(geometry, material); 

    // VỊ TRÍ ĐẶT:
    // Z = -250: Nằm sau rìa nước (Rìa nước là -150)
    // Y = -50:  Nằm dưới mặt nước (để chuẩn bị mọc lên)
    earthPlane.position.set(0, -50, -250); 
    earthPlane.rotation.x = 0; // Dựng thẳng đứng
    
    earthPlane.visible = false; 
    scene.add(earthPlane);
}

// --- UI GLASSMORPHISM ---
function setupUI() {
    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes pulse-glow {
            0% { box-shadow: 0 0 0 0 rgba(100, 200, 255, 0.4); }
            70% { box-shadow: 0 0 0 20px rgba(100, 200, 255, 0); }
            100% { box-shadow: 0 0 0 0 rgba(100, 200, 255, 0); }
        }
        .ocean-btn {
            font-family: 'Segoe UI', sans-serif; font-weight: bold; color: white;
            background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.3); border-radius: 50px; cursor: pointer;
            transition: all 0.3s ease; text-transform: uppercase; letter-spacing: 1px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3); outline: none;
        }
        .ocean-btn:hover {
            background: rgba(255, 255, 255, 0.25); transform: translateY(-2px) scale(1.05);
            box-shadow: 0 6px 20px rgba(0, 150, 255, 0.6);
        }
        #start-btn {
            position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
            padding: 20px 50px; font-size: 18px; z-index: 1000; animation: pulse-glow 2s infinite;
        }
        #switch-view-btn {
            position: absolute; bottom: 40px; left: 50%; transform: translateX(-50%);
            padding: 12px 30px; font-size: 14px; z-index: 100; opacity: 0; display: none;
        }
    `;
    document.head.appendChild(style);

    startButton = document.createElement('button');
    startButton.id = 'start-btn';
    startButton.className = 'ocean-btn';
    startButton.innerHTML = '✨ HẠ CÁNH ✨';
    startButton.addEventListener('click', startExperience);
    document.body.appendChild(startButton);

    switchViewButton = document.createElement('button');
    switchViewButton.id = 'switch-view-btn';
    switchViewButton.className = 'ocean-btn';
    switchViewButton.innerHTML = '🌊 Xuống Biển';
    switchViewButton.addEventListener('click', toggleCameraView);
    document.body.appendChild(switchViewButton);
}

// --- LOGIC INTRO ---
function startExperience() {
    startButton.style.opacity = '0';
    startButton.style.pointerEvents = 'none';
    setTimeout(() => startButton.style.display = 'none', 500);

    // 1. Đổi màu trời
    const targetSkyColor = new THREE.Color(0x050a20); 
    const currentBg = new THREE.Color(scene.background as THREE.Color);

    gsap.to(currentBg, {
        r: targetSkyColor.r, g: targetSkyColor.g, b: targetSkyColor.b,
        duration: 4,
        onUpdate: () => {
            scene.background = currentBg;
            if (scene.fog instanceof THREE.FogExp2) scene.fog.color = currentBg;
        }
    });

    // 2. Trái Đất mọc lên
    if (earthPlane) { 
        earthPlane.visible = true;
        
        // Hiện dần (Fade in)
        gsap.to(earthPlane.material, { opacity: 1, duration: 3, delay: 0.5 });
        
        // Mọc lên
        gsap.to(earthPlane.position, { 
            x: 0, 
            y: -1.5, // QUAN TRỌNG: Ngang mặt nước để bị che một nửa dưới
            z: -250, 
            duration: 6, 
            ease: "power2.out" 
        });
        
        // Xoay nhẹ cho sinh động (nếu muốn)
        // gsap.to(earthPlane.rotation, { z: 0.05, duration: 5, ease: "power2.out" });
    }

    // 3. Camera bay xuống
    gsap.to(camera.position, {
        x: 15, y: 6, z: 20, 
        duration: 4,
        ease: "power3.inOut",
        onUpdate: () => camera.lookAt(0, 0, 0),
        onComplete: () => {
            controls.enabled = true;
            switchViewButton.style.display = 'block';
            requestAnimationFrame(() => {
                switchViewButton.style.opacity = '1';
                switchViewButton.style.transform = 'translateX(-50%)';
            });
        }
    });
}

// --- LOGIC CHUYỂN VIEW ---
function toggleCameraView() {
    controls.enabled = false;
    if (isViewOnRaft) {
        gsap.to(camera.position, {
            x: 5, y: 2.5, z: 5, duration: 2, ease: "power2.inOut",
            onUpdate: () => camera.lookAt(0, 0, 0),
            onComplete: () => {
                controls.enabled = true; isViewOnRaft = false;
                switchViewButton.innerHTML = '🏠 Lên Bè';
            }
        });
    } else {
        gsap.to(camera.position, {
            x: 15, y: 6, z: 20, duration: 2, ease: "power2.inOut",
            onUpdate: () => camera.lookAt(0, 0, 0),
            onComplete: () => {
                controls.enabled = true; isViewOnRaft = true;
                switchViewButton.innerHTML = '🌊 Xuống Biển';
            }
        });
    }
}

function onWindowResize() {
    if (renderer && camera) {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    }
}

function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    accumulatedTime += delta;

    if (renderer && scene && camera) {
        // Update Nước
        if (wave) wave.update(delta);

        // Update Vật lý Bè
        if (roomGroup) {
            const raftX = 0; const raftZ = 0; const waterBaseY = -1.5;
            const waveHeight = getWaterHeightAt(raftX, raftZ, accumulatedTime);
            roomGroup.position.y += ((waterBaseY + waveHeight + 1.2) - roomGroup.position.y) * 0.1;

            const offset = 3.0;
            const hFront = getWaterHeightAt(raftX, raftZ - offset, accumulatedTime);
            const hBack = getWaterHeightAt(raftX, raftZ + offset, accumulatedTime);
            const hLeft = getWaterHeightAt(raftX - offset, raftZ, accumulatedTime);
            const hRight = getWaterHeightAt(raftX + offset, raftZ, accumulatedTime);

            const targetRotX = Math.atan2(hFront - hBack, offset * 2);
            const targetRotZ = Math.atan2(hLeft - hRight, offset * 2);

            roomGroup.rotation.x += (targetRotX - roomGroup.rotation.x) * 0.05;
            roomGroup.rotation.z += (targetRotZ - roomGroup.rotation.z) * 0.05;
        }

        // Update Sao
        if (env && env.stars) {
            (env.stars.material as THREE.ShaderMaterial).uniforms.uTime.value = accumulatedTime;
        }

        // Update Đèn
        const antLight = scene.getObjectByName("AntLight") as THREE.PointLight;
        if (antLight) antLight.intensity = Math.floor(accumulatedTime * 2) % 2 === 0 ? 4 : 0;

        // Xoay nhẹ Trái Đất (nếu muốn nó chuyển động)
        if (earthPlane && earthPlane.visible) {
             // earthPlane.rotation.z += 0.0001; 
        }

        controls.update();
        renderer.render(scene, camera);
    }
}

// --- RAYCASTER ---
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onPointerDown(event: PointerEvent) {
    if ((event.target as HTMLElement).tagName === 'BUTTON') return;

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
        let target = intersects[0].object;
        if (target.type === 'LineSegments' && target.parent) target = target.parent;
        if (target === wave.mesh) target.name = "Water";

        if (STORY_DB[target.name]) {
            showStory(target.name);
        }
    }
}

// --- STORY UI ---
const storyBox = document.getElementById('story-box');
const storyTitle = document.getElementById('story-title');
const storyContent = document.getElementById('story-content');
const closeBtn = document.getElementById('close-btn');

function showStory(key: string) {
    if (!storyBox || !storyTitle || !storyContent) return;
    const data = STORY_DB[key];
    storyTitle.innerText = data.title;
    storyContent.innerText = data.text;
    storyBox.style.display = 'block';
    storyBox.style.opacity = '0';
    gsap.to(storyBox, { opacity: 1, duration: 0.5 });
}

if (closeBtn) {
    closeBtn.addEventListener('click', () => {
        gsap.to(storyBox, { opacity: 0, duration: 0.3, onComplete: () => { if (storyBox) storyBox.style.display = 'none'; } });
    });
}

init();