import * as THREE from 'three';
import { CONFIG } from './config';

export interface Environment {
    skyMesh: THREE.Mesh;
    lightSource: THREE.Vector3;
    moonMesh: THREE.Mesh;
    stars: THREE.Points;
    stardust: THREE.Points; // Thêm bụi sao vào interface
}

// --- TOON SKY SHADER ---
const skyVertexShader = `
    varying vec3 vWorldPosition;
    void main() {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * viewMatrix * worldPosition;
    }
`;

const skyFragmentShader = `
    uniform vec3 topColor;
    uniform vec3 bottomColor;
    uniform float offset;
    uniform float exponent;
    uniform float steps;

    varying vec3 vWorldPosition;

    void main() {
        float h = normalize(vWorldPosition + offset).y;
        float gradient = max(0.0, h);
        gradient = pow(gradient, exponent);
        float steppedGradient = floor(gradient * steps) / steps;
        vec3 color = mix(bottomColor, topColor, steppedGradient);
        gl_FragColor = vec4(color, 1.0);
    }
`;

export function setupEnvironment(scene: THREE.Scene, renderer: THREE.WebGLRenderer): Environment {

    // 1. SKY (Gothic stepped gradient)
    const skyGeo = new THREE.SphereGeometry(4000, 32, 15);
    const skyMat = new THREE.ShaderMaterial({
        vertexShader: skyVertexShader,
        fragmentShader: skyFragmentShader,
        uniforms: {
            topColor: { value: new THREE.Color(CONFIG.colors.skyTop) },
            bottomColor: { value: new THREE.Color(CONFIG.colors.skyBottom) },
            offset: { value: 300 },
            exponent: { value: 0.5 }, // Slightly adjusted for moodier sky
            steps: { value: CONFIG.colors.skyBand }
        },
        side: THREE.BackSide
    });
    const skyMesh = new THREE.Mesh(skyGeo, skyMat);
    scene.add(skyMesh);

    // 2. MOON (Warm cream claymation moon with glow halo)
    const moonGeo = new THREE.SphereGeometry(15, 16, 16); // Lower poly for clay look
    const moonMat = new THREE.MeshBasicMaterial({
        color: CONFIG.colors.moon,
    });
    const moonMesh = new THREE.Mesh(moonGeo, moonMat);
    moonMesh.position.set(50, 100, -200);
    moonMesh.name = "Moon";
    scene.add(moonMesh);

    // Moon Glow Halo (Coraline-style soft glow)
    const glowTexture = createMoonGlowTexture();
    const glowMaterial = new THREE.SpriteMaterial({
        map: glowTexture,
        color: 0xf5e6c8, // Warm cream
        transparent: true,
        opacity: 0.4,
        blending: THREE.AdditiveBlending
    });
    const moonGlow = new THREE.Sprite(glowMaterial);
    moonGlow.scale.set(80, 80, 1); // Large soft glow
    moonMesh.add(moonGlow);

    const lightSource = moonMesh.position.clone().normalize();
    const moonLight = new THREE.DirectionalLight(CONFIG.colors.moonlight, 2.0); // Slightly warmer
    moonLight.position.copy(moonMesh.position);
    moonLight.castShadow = true;
    moonLight.shadow.mapSize.width = 2048;
    moonLight.shadow.mapSize.height = 2048;
    moonLight.shadow.camera.near = 50;
    moonLight.shadow.camera.far = 500;
    moonLight.shadow.bias = -0.0005;
    scene.add(moonLight);

    // 3. STARS (Hand-painted dots - lower count for clay aesthetic)
    const stars = createToonStars();
    scene.add(stars);

    // 4. STARDUST (Enabled for atmospheric particles)
    const stardust = createFloatingDust();
    scene.add(stardust); // ENABLED for claymation atmosphere

    // Warmer ambient for gothic feel
    const ambientLight = new THREE.AmbientLight(0x2a2530, 0.6);
    scene.add(ambientLight);

    return { skyMesh, lightSource, moonMesh, stars, stardust };
}

// Create procedural moon glow texture
function createMoonGlowTexture(): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;

    // Radial gradient for soft glow
    const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    gradient.addColorStop(0, 'rgba(255, 240, 220, 1)');
    gradient.addColorStop(0.2, 'rgba(255, 230, 200, 0.6)');
    gradient.addColorStop(0.5, 'rgba(255, 220, 180, 0.2)');
    gradient.addColorStop(1, 'rgba(255, 210, 160, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 128, 128);

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
}

function createToonStars() {
    const starCount = 800;
    const starGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);

    for (let i = 0; i < starCount * 3; i += 3) {
        const r = 3500;
        const theta = 2 * Math.PI * Math.random();
        const phi = Math.acos(2 * Math.random() - 1);

        positions[i] = r * Math.sin(phi) * Math.cos(theta);
        positions[i + 1] = Math.abs(r * Math.sin(phi) * Math.sin(theta));
        positions[i + 2] = r * Math.cos(phi);

        sizes[i / 3] = Math.random() * 15.0 + 15.0;
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starGeo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const starMat = new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 },
            color: { value: new THREE.Color(0xffffff) }
        },
        vertexShader: `
            attribute float size;
            uniform float uTime;
            void main() {
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                gl_Position = projectionMatrix * mvPosition;
                float blink = step(0.5, sin(uTime * 1.5 + position.x));
                gl_PointSize = size * (0.3 + 0.7 * blink); 
            }
        `,
        fragmentShader: `
            uniform vec3 color;
            void main() {
                float dist = distance(gl_PointCoord, vec2(0.5));
                if (dist > 0.5) discard;
                gl_FragColor = vec4(color, 1.0);
            }
        `,
        transparent: true
    });

    return new THREE.Points(starGeo, starMat);
}

// HÀM MỚI: TẠO BỤI BAY LƠ LỬNG
function createFloatingDust() {
    const count = 500;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const randoms = new Float32Array(count * 3); // Dùng để tạo chuyển động ngẫu nhiên riêng biệt

    for (let i = 0; i < count * 3; i += 3) {
        // Bụi bay xung quanh khu vực bè (phạm vi 40x40x20)
        positions[i] = (Math.random() - 0.5) * 40;
        positions[i + 1] = Math.random() * 20; // Chỉ bay trên mặt nước
        positions[i + 2] = (Math.random() - 0.5) * 40;

        randoms[i] = Math.random();
        randoms[i + 1] = Math.random();
        randoms[i + 2] = Math.random();
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 3));

    const mat = new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 },
            color: { value: new THREE.Color(CONFIG.colors.stardust) }
        },
        vertexShader: `
            uniform float uTime;
            attribute vec3 aRandom;
            varying float vAlpha;
            
            void main() {
                vec3 pos = position;
                
                // Chuyển động cuộn nhẹ theo thời gian (Sóng sin phức hợp)
                // Mỗi hạt di chuyển theo quỹ đạo riêng dựa trên aRandom
                pos.x += sin(uTime * 0.5 + aRandom.y * 10.0) * 0.5;
                pos.y += cos(uTime * 0.3 + aRandom.x * 10.0) * 0.5;
                pos.z += sin(uTime * 0.4 + aRandom.z * 10.0) * 0.5;

                vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                gl_Position = projectionMatrix * mvPosition;
                
                // Kích thước thay đổi theo độ sâu (để tạo chiều sâu)
                gl_PointSize = (20.0 / -mvPosition.z);
                
                // Độ mờ nhấp nháy nhẹ
                vAlpha = 0.5 + 0.5 * sin(uTime + aRandom.x * 10.0);
            }
        `,
        fragmentShader: `
            uniform vec3 color;
            varying float vAlpha;
            void main() {
                // Hạt bụi tròn mềm (Soft circle)
                float dist = distance(gl_PointCoord, vec2(0.5));
                if (dist > 0.5) discard;
                float alpha = 1.0 - smoothstep(0.3, 0.5, dist);
                gl_FragColor = vec4(color, alpha * vAlpha);
            }
        `,
        transparent: true,
        depthWrite: false, // Không ghi vào depth buffer để bụi không che lấp nhau thô thiển
        blending: THREE.AdditiveBlending // Cộng màu để bụi sáng lên
    });

    return new THREE.Points(geo, mat);
}