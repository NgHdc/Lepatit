import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import gsap from 'gsap';

import { STORY_DB } from './config';
import { setupEnvironment } from './environment';
import type { Environment } from './environment';
// Import đúng hàm getWaterHeightAt
import { setupWater, getWaterHeightAt } from './water';
// Import type WaveObject từ water luôn (đã export ở file water.ts rồi)
import type { WaveObject } from './water'; 
import { setupWorld } from './world';

let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let controls: OrbitControls;
let clock: THREE.Clock;
let wave: WaveObject;
let roomGroup: THREE.Group;
let env: Environment;

let accumulatedTime = 0;

// Đổi init thành async
async function init() {
    const container = document.body;

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.6;
    container.appendChild(renderer.domElement);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000022);

    env = setupEnvironment(scene, renderer);

    camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(15, 6, 20);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enabled = true;
    controls.maxDistance = 200;
    controls.minDistance = 5;
    controls.maxPolarAngle = Math.PI * 0.48; 
    controls.enableDamping = true;
    
    // --- SỬA ĐOẠN NÀY: Dùng await ---
    try {
        // Chờ load xong nước (model 3D)
        wave = await setupWater(scene);
        
        // Sau khi có nước rồi mới setup các thứ khác
        roomGroup = setupWorld(scene);

        window.addEventListener('resize', onWindowResize);
        window.addEventListener('pointerdown', onPointerDown);

        clock = new THREE.Clock();
        
        const loader = document.getElementById('loader');
        if (loader) loader.style.display = 'none';

        animate(); // Bắt đầu vòng lặp
    } catch (error) {
        console.error("Không thể khởi tạo ứng dụng:", error);
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
        if (wave) wave.update(delta);

        if (roomGroup) {
            const raftX = 0; 
            const raftZ = 0; 
            const waterBaseY = -1.5;

            // Hàm này giờ đã tồn tại và import đúng
            const waveHeight = getWaterHeightAt(raftX, raftZ, accumulatedTime);
            const targetY = waterBaseY + waveHeight + 1.2; 
            roomGroup.position.y += (targetY - roomGroup.position.y) * 0.1;

            const offset = 3.0; 
            const hFront = getWaterHeightAt(raftX, raftZ - offset, accumulatedTime);
            const hBack  = getWaterHeightAt(raftX, raftZ + offset, accumulatedTime);
            const hLeft  = getWaterHeightAt(raftX - offset, raftZ, accumulatedTime);
            const hRight = getWaterHeightAt(raftX + offset, raftZ, accumulatedTime);

            const targetRotX = Math.atan2(hFront - hBack, offset * 2);
            const targetRotZ = Math.atan2(hLeft - hRight, offset * 2);

            roomGroup.rotation.x += (targetRotX - roomGroup.rotation.x) * 0.05;
            roomGroup.rotation.z += (targetRotZ - roomGroup.rotation.z) * 0.05;
        }

        if (env && env.stars) {
            (env.stars.material as THREE.ShaderMaterial).uniforms.uTime.value = accumulatedTime;
        }

        const antLight = scene.getObjectByName("AntLight") as THREE.PointLight;
        if (antLight) {
            antLight.intensity = Math.floor(accumulatedTime * 2) % 2 === 0 ? 4 : 0;
        }

        scene.rotation.y += 0.0002; 

        controls.update();
        renderer.render(scene, camera);
    }
}

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onPointerDown(event: PointerEvent) { 
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
        let target = intersects[0].object;
        if (target.type === 'LineSegments' && target.parent) target = target.parent;
        // Kiểm tra wave và wave.mesh tồn tại
        if (wave && target === wave.mesh) target.name = "Water";

        if (STORY_DB[target.name]) {
            showStory(target.name);
            if(target.rotation && (!wave || target !== wave.mesh) && target.name !== "Moon") {
                  gsap.to(target.rotation, { y: target.rotation.y + Math.PI, duration: 1, ease: "back.out(1.7)" });
            }
        }
    }
}

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