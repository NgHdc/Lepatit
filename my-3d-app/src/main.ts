import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import gsap from 'gsap'

// --- 1. SETUP SCENE ---
const scene = new THREE.Scene()
// Màu nền mặc định: Xanh đen vũ trụ
scene.background = new THREE.Color(0x1a1a2e) 
scene.fog = new THREE.FogExp2(0x1a1a2e, 0.02)

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000)
// Vị trí ban đầu
const START_CAM_POS = { x: 15, y: 10, z: 20 }
camera.position.set(START_CAM_POS.x, START_CAM_POS.y, START_CAM_POS.z)

const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
document.body.appendChild(renderer.domElement)

// --- UTILS: HÀM TIỆN ÍCH ---
const random = (min: number, max: number) => Math.random() * (max - min) + min

// Hàm tạo vật thể phong cách Sketch (Viền đen + Bề mặt nhám)
function createSketchMesh(
    geometry: THREE.BufferGeometry, 
    color: number, 
    opacity: number = 1
): THREE.Mesh {
    const material = new THREE.MeshStandardMaterial({ 
        color: color,
        roughness: 1.0, // Bề mặt như giấy/đất
        metalness: 0.0,
        transparent: opacity < 1,
        opacity: opacity,
        polygonOffset: true,
        polygonOffsetFactor: 1, 
        polygonOffsetUnits: 1
    })
    
    const mesh = new THREE.Mesh(geometry, material)
    mesh.castShadow = true
    mesh.receiveShadow = true

    // Tạo viền đen (Outline)
    const edgesGeo = new THREE.EdgesGeometry(geometry, 15) 
    const edgesMat = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 })
    const edges = new THREE.LineSegments(edgesGeo, edgesMat)
    mesh.add(edges)

    return mesh
}

// Group chứa toàn bộ thế giới
const world = new THREE.Group()
scene.add(world)


// --- 2. XÂY DỰNG HÀNH TINH (PROCEDURAL PLANET) ---

const planetGeo = new THREE.IcosahedronGeometry(8, 32) // Detail 32 = Rất mượt

// Hàm xử lý đào hố trên bề mặt
function digCrater(geometry: THREE.BufferGeometry, center: THREE.Vector3, radius: number, depth: number) {
    const pos = geometry.getAttribute('position')
    const v = new THREE.Vector3()
    // Tính vị trí tâm chấn trên bề mặt (bán kính 8)
    const target = center.clone().normalize().multiplyScalar(8) 

    for (let i = 0; i < pos.count; i++) {
        v.fromBufferAttribute(pos, i)
        const dist = v.distanceTo(target)

        if (dist < radius) {
            // Công thức đào hố hình Parabol mượt
            const t = dist / radius
            const falloff = Math.pow(1 - t, 2) 
            const newLength = 8 - (falloff * depth)
            
            v.setLength(newLength)
            pos.setXYZ(i, v.x, v.y, v.z)
        }
    }
    pos.needsUpdate = true
}

// Tạo Hành Tinh & Các Hố Thiên Thạch
// 1. Tạo Mesh hành tinh trước
const planet = createSketchMesh(planetGeo, 0x888888) // Màu xám Moon Grey
world.add(planet)

// 2. Logic sinh hố ngẫu nhiên
const CRATER_COUNT = 6
for(let i=0; i<CRATER_COUNT; i++) {
    // Random vector hướng bất kỳ
    const randomVec = new THREE.Vector3(
        Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5
    ).normalize()

    // BỎ QUA VÙNG CỰC BẮC (Để dành chỗ cho Hoàng tử đứng)
    if (randomVec.y > 0.5) continue 

    const rHole = random(1.5, 2.5) // Bán kính miệng hố
    const dHole = random(1.0, 2.5) // Độ sâu

    // Bước A: Đào bề mặt hành tinh lõm xuống
    digCrater(planetGeo, randomVec, rHole, dHole)

    // Bước B: Đặt thêm cái vành (Torus) để tạo cảm giác miệng núi lửa
    const craterRimGeo = new THREE.TorusGeometry(rHole, 0.15, 4, 12)
    const craterRim = createSketchMesh(craterRimGeo, 0x555555)
    
    // Đặt vành vào đúng vị trí vừa đào
    const rimPos = randomVec.clone().multiplyScalar(8) // Nhân 8 = Bán kính hành tinh
    craterRim.position.copy(rimPos)
    craterRim.lookAt(new THREE.Vector3(0,0,0)) // Xoay mặt ốp vào hành tinh
    
    planet.add(craterRim)
}

// Tính toán lại bóng sau khi biến dạng bề mặt
planetGeo.computeVertexNormals()


// --- 3. TẠO HOÀNG TỬ BÉ ---
const princeGroup = new THREE.Group()
princeGroup.position.set(0, 8, 0) // Đứng trên đỉnh
world.add(princeGroup)

// Thân
const body = createSketchMesh(new THREE.CylinderGeometry(0.5, 0.8, 2.5, 8), 0x43aa8b)
body.position.y = 1.25
princeGroup.add(body)

// Đầu
const head = createSketchMesh(new THREE.SphereGeometry(0.7, 16, 16), 0xffcdb2)
head.position.y = 2.8
princeGroup.add(head)

// Khăn choàng
const scarfGroup = new THREE.Group()
scarfGroup.position.set(0, 2.3, 0)
princeGroup.add(scarfGroup)

const neck = createSketchMesh(new THREE.TorusGeometry(0.6, 0.15, 8, 16), 0xf9c74f)
neck.rotation.x = Math.PI / 2
scarfGroup.add(neck)

const tail = createSketchMesh(new THREE.ConeGeometry(0.2, 3, 8), 0xf9c74f)
tail.geometry.translate(0, 1.5, 0)
tail.rotation.z = -Math.PI / 2
tail.position.x = 0.5
scarfGroup.add(tail)


// --- 4. TẠO BÔNG HỒNG ---
const flowerGroup = new THREE.Group()
flowerGroup.position.set(3, 7.5, 2)
flowerGroup.rotation.z = -0.2
flowerGroup.lookAt(0, 8, 0) // Hướng nhẹ về phía hoàng tử
world.add(flowerGroup)

// Thân & Hoa
const stem = createSketchMesh(new THREE.CylinderGeometry(0.05, 0.05, 2, 8), 0x2d6a4f)
stem.position.y = 1
flowerGroup.add(stem)

const flowerHead = createSketchMesh(new THREE.DodecahedronGeometry(0.4), 0xd00000)
flowerHead.position.y = 2
flowerGroup.add(flowerHead)

// Lồng kính
const glass = createSketchMesh(new THREE.CapsuleGeometry(0.7, 1, 4, 8), 0xaec3b0, 0.2)
glass.position.y = 1.2
flowerGroup.add(glass)


// --- 5. HỆ THỐNG SAO LẤP LÁNH (SHADER) ---
// Dùng Shader để sao có thể nhấp nháy (Twinkle)
const starGeo = new THREE.BufferGeometry()
const starCount = 1000
const starPos = new Float32Array(starCount * 3)
const starSizes = new Float32Array(starCount)

for(let i=0; i<starCount; i++) {
    starPos[i*3] = (Math.random() - 0.5) * 150
    starPos[i*3+1] = (Math.random() - 0.5) * 150
    starPos[i*3+2] = (Math.random() - 0.5) * 150
    starSizes[i] = Math.random()
}
starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3))
starGeo.setAttribute('size', new THREE.BufferAttribute(starSizes, 1))

const starMaterial = new THREE.ShaderMaterial({
    uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(0xffffff) },
        uOpacity: { value: 1.0 } // Biến này dùng để GSAP điều khiển độ mờ
    },
    vertexShader: `
        attribute float size;
        varying float vOpacity;
        uniform float uTime;
        void main() {
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_Position = projectionMatrix * mvPosition;
            float twinkle = sin(uTime * 2.0 + position.x * 10.0);
            gl_PointSize = size * (150.0 / -mvPosition.z) * (0.8 + 0.5 * twinkle);
            vOpacity = 0.5 + 0.5 * twinkle;
        }
    `,
    fragmentShader: `
        uniform vec3 uColor;
        uniform float uOpacity;
        varying float vOpacity;
        void main() {
            float strength = distance(gl_PointCoord, vec2(0.5));
            strength = 1.0 - step(0.5, strength);
            if (strength < 0.1) discard;
            gl_FragColor = vec4(uColor, vOpacity * uOpacity);
        }
    `,
    transparent: true,
    depthWrite: false
})
const stars = new THREE.Points(starGeo, starMaterial)
scene.add(stars)


// --- 6. ÁNH SÁNG ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
scene.add(ambientLight)

const sunLight = new THREE.DirectionalLight(0xffd700, 1.5)
sunLight.position.set(10, 20, 10)
sunLight.castShadow = true
sunLight.shadow.mapSize.set(2048, 2048)
scene.add(sunLight)


// --- 7. ANIMATION LOOP ---
const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.autoRotate = true
controls.autoRotateSpeed = 0.5

const clock = new THREE.Clock()

function animate() {
    requestAnimationFrame(animate)
    const time = clock.getElapsedTime()

    // Cập nhật thời gian cho Shader sao
    starMaterial.uniforms.uTime.value = time

    // Animation vật thể
    tail.rotation.z = -Math.PI / 2 + Math.sin(time * 5) * 0.2 
    tail.rotation.y = Math.sin(time * 3) * 0.1
    princeGroup.position.y = 8 + Math.sin(time * 2) * 0.02
    flowerGroup.rotation.z = -0.2 + Math.sin(time * 2 + 1) * 0.05

    controls.update()
    renderer.render(scene, camera)
}
animate()

// Resize handler
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
})


// --- 8. CÂU CHUYỆN: NGẮM HOÀNG HÔN (STORYTELLING) ---

// Tạo nút UI
const btn = document.createElement('button')
btn.innerText = "▶ Xem Hoàng Hôn"
Object.assign(btn.style, {
    position: 'fixed', bottom: '30px', left: '50%', transform: 'translateX(-50%)',
    padding: '12px 25px', fontSize: '16px', borderRadius: '50px',
    background: 'rgba(255, 255, 255, 0.9)', border: 'none', cursor: 'pointer',
    fontFamily: 'sans-serif', fontWeight: 'bold', boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
    transition: 'all 0.3s ease'
})
btn.onmouseover = () => btn.style.transform = 'translateX(-50%) scale(1.05)'
btn.onmouseout = () => btn.style.transform = 'translateX(-50%) scale(1)'
document.body.appendChild(btn)

function playStory() {
    controls.enabled = false // Khóa chuột
    btn.style.opacity = '0' // Ẩn nút
    btn.style.pointerEvents = 'none'

    // Kịch bản
    const tl = gsap.timeline({
        onComplete: () => {
            controls.enabled = true
            btn.style.opacity = '1'
            btn.style.pointerEvents = 'auto'
            btn.innerText = "↺ Xem lại"
        }
    })

    // CẢNH 1: Zoom vào Hoa Hồng
    tl.to(camera.position, {
        x: 5, y: 8.5, z: 5,
        duration: 3,
        ease: "power2.inOut",
        onUpdate: () => camera.lookAt(flowerGroup.position) // Khóa góc nhìn vào hoa
    })

    // CẢNH 2: Hoàng hôn (Đổi màu + Hạ thấp đèn)
    tl.to(ambientLight, { intensity: 0.05, duration: 4 }, "<") // Môi trường tối đi
    tl.to(sunLight.color, { r: 1, g: 0.3, b: 0.1, duration: 4 }, "<") // Mặt trời đỏ
    tl.to(sunLight.position, { x: -20, y: -2, z: -5, duration: 5 }, "<") // Mặt trời lặn

    // CẢNH 3: Đêm đen & Sao hiện lên
    tl.to(sunLight, { intensity: 0, duration: 2 }) // Tắt nắng
    tl.to(scene.background, { r: 0.02, g: 0.02, b: 0.05, duration: 2 }, "<") // Trời tối đen
    // Sao hiện lên rực rỡ (dùng uniform uOpacity của shader)
    tl.fromTo(starMaterial.uniforms.uOpacity, { value: 0 }, { value: 1, duration: 2 }, "<")

    // Khoảng lặng ngắm sao
    tl.to({}, { duration: 3 })

    // CẢNH 4: Bình minh (Reset)
    tl.to(sunLight.position, { x: 10, y: 20, z: 10, duration: 0 }) // Đặt lại vị trí đèn (nhanh)
    
    tl.to(scene.background, { r: 0.1, g: 0.1, b: 0.18, duration: 3 }) // Trời sáng dần
    tl.to(sunLight.color, { r: 1, g: 1, b: 1, duration: 3 }, "<") // Nắng vàng lại
    tl.to(sunLight, { intensity: 1.5, duration: 3 }, "<")
    tl.to(ambientLight, { intensity: 0.6, duration: 3 }, "<")

    // Camera bay về vị trí cũ
    tl.to(camera.position, {
        x: START_CAM_POS.x, y: START_CAM_POS.y, z: START_CAM_POS.z,
        duration: 3,
        ease: "power2.inOut",
        onUpdate: () => camera.lookAt(0, 0, 0)
    })
}

btn.addEventListener('click', playStory)