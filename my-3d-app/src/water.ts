import * as THREE from 'three';
// import { CONFIG } from './config'; // Giả sử bạn có hoặc bỏ qua

// --- CẤU HÌNH VẬT LÝ & GIÓ ---
export const WATER_CONFIG = {
    speed: 1.2,
    scale: 0.2,
    height: 0.6,
    windX: 1.0, // Hướng gió X
    windZ: 0.5  // Hướng gió Z
};

// Hàm tính độ cao vật lý (cho vật thể nổi) - Đồng bộ sơ bộ với Vertex Shader
export function getWaterHeightAt(x: number, z: number, time: number): number {
    // Mô phỏng sóng Gerstner đơn giản hóa
    const k = WATER_CONFIG.scale;
    const c = WATER_CONFIG.speed;
    const x_term = x * WATER_CONFIG.windX + z * WATER_CONFIG.windZ;
    return Math.sin(x_term * k + time * c) * WATER_CONFIG.height;
}

// --- SHADERS ---

const noiseFunctions = `
    // Simplex Noise 2D cơ bản
    vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
    float snoise(vec2 v){
        const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                -0.577350269189626, 0.024390243902439);
        vec2 i  = floor(v + dot(v, C.yy) );
        vec2 x0 = v - i + dot(i, C.xx);
        vec2 i1;
        i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod(i, 289.0);
        vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
        + i.x + vec3(0.0, i1.x, 1.0 ));
        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
        m = m*m ;
        m = m*m ;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
        vec3 g;
        g.x  = a0.x  * x0.x  + h.x  * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
    }
`;

// VERTEX SHADER: Tạo sóng nhấp nhô theo hướng gió
const vertexShader = `
    uniform float u_time;
    uniform vec3 u_boxSize; 
    uniform vec2 u_windDirection;

    varying vec2 vUv;
    varying float vIsTop;
    varying vec3 vPos;
    varying float vWaveHeight;

    void main() {
        vUv = uv;
        vec3 pos = position;
        vPos = pos;

        float topY = u_boxSize.y / 2.0;
        float isTop = step(topY - 0.1, pos.y);
        vIsTop = isTop;

        // Tính toán sóng: Kết hợp 2 lớp sóng Sin di chuyển theo hướng gió
        // Lớp 1: Sóng lớn, chậm
        float wave1 = sin(dot(pos.xz, u_windDirection) * 0.15 + u_time * 1.0);
        // Lớp 2: Sóng nhỏ, nhanh (tạo độ gợn)
        float wave2 = cos(dot(pos.xz, u_windDirection) * 0.4 + u_time * 2.5);
        
        float combinedWave = (wave1 * 0.6 + wave2 * 0.3) * 0.8; // Amplitude tổng

        // Chỉ áp dụng sóng cho mặt trên
        pos.y += combinedWave * isTop;
        
        vWaveHeight = combinedWave; // Truyền độ cao sóng vào fragment để chỉnh màu
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
`;

// FRAGMENT SHADER: Phong cách Ghibli (Mảng màu + Vệt gió)
const fragmentShader = `
    uniform float u_time;
    uniform vec3 u_surfaceColor; // Màu mặt nước (Teal)
    uniform vec3 u_foamColor;    // Màu bọt/vệt gió (White/Light Blue)
    uniform vec3 u_deepColor;    // Màu đáy/thân khối (Deep Blue)
    uniform vec3 u_boxSize;
    uniform vec2 u_windDirection;

    varying vec2 vUv;
    varying float vIsTop;
    varying vec3 vPos;
    varying float vWaveHeight;

    ${noiseFunctions}

    void main() {
        vec3 finalColor;
        float alpha = 0.9;

        // --- MẶT TRÊN: GHIBLI STYLE ---
        if (vIsTop > 0.5) {
            // 1. Wind UV: Kéo dãn UV theo hướng gió để tạo vệt dài
            vec2 windUV = vUv * 4.0; 
            // Di chuyển texture ngược chiều gió để tạo cảm giác nước trôi
            windUV -= u_windDirection * u_time * 0.3; 
            
            // Kéo dãn texture theo hướng X (giả lập vệt gió lướt qua)
            windUV.x *= 0.5; 

            // 2. Tạo Noise nền (Water surface texture)
            float noiseBase = snoise(windUV);
            
            // 3. Tạo vệt bọt (Foam/Reflections) - Phong cách Anime
            // Sử dụng step sắc nét (hard edge) thay vì smoothstep mờ ảo
            float foamMask = step(0.6, noiseBase); 

            // 4. Sparkles (Đốm sáng lấp lánh đặc trưng Anime)
            vec2 sparkleUV = vUv * 15.0 + vec2(u_time * 0.5, u_time * 0.2);
            float sparkleNoise = snoise(sparkleUV);
            float sparkle = step(0.85, sparkleNoise); // Chỉ lấy những điểm sáng nhất

            // 5. Phối màu
            // Màu nền dựa trên độ cao sóng (Sóng cao sáng hơn, sóng thấp tối hơn)
            vec3 base = mix(u_surfaceColor, u_surfaceColor * 0.8, smoothstep(-0.5, 0.5, -vWaveHeight));
            
            // Cộng lớp bọt
            finalColor = mix(base, u_foamColor, foamMask * 0.5); // Bọt trong suốt 50%
            
            // Cộng lớp lấp lánh (Màu trắng tuyệt đối)
            finalColor += vec3(1.0) * sparkle;

            alpha = 0.95;
        } 
        // --- MẶT BÊN: GRADIENT SÂU THẲM ---
        else {
            float h = u_boxSize.y / 2.0;
            float normalizedY = (vPos.y + h) / (2.0 * h);
            
            // Gradient mượt mà từ Đáy (Deep) lên Mặt (Surface)
            // Anime thường dùng gradient 2 màu rõ rệt
            finalColor = mix(u_deepColor, u_surfaceColor, pow(normalizedY, 0.8));
            
            // Thêm một chút vân caustics giả ở gần mặt nước
            if (normalizedY > 0.7) {
                 float sideNoise = snoise(vec2(vPos.x * 0.2 + u_time * 0.5, vPos.z * 0.2));
                 finalColor += vec3(0.1) * step(0.3, sideNoise) * (normalizedY - 0.7) * 2.0;
            }

            alpha = 0.7 + normalizedY * 0.25; 
        }

        gl_FragColor = vec4(finalColor, alpha);
    }
`;

export interface WaveObject {
    mesh: THREE.Group;
    update: (deltaTime: number) => void;
}

export function setupWater(scene: THREE.Scene): WaveObject {
    const waterGroup = new THREE.Group();
    scene.add(waterGroup);

    // KÍCH THƯỚC
    const WIDTH = 60;
    const DEPTH = 60;
    const HEIGHT = 15;
    
    const TARGET_SURFACE_Y = -1.5;
    const MESH_Y = TARGET_SURFACE_Y - (HEIGHT / 2);

    // --- GHIBLI COLOR PALETTE ---
    // Màu ngọc lam (Turquoise) rực rỡ cho mặt nước
    const COLOR_SURFACE = new THREE.Color("#26C4EC").convertLinearToSRGB(); 
    // Màu trắng pha xanh nhẹ cho bọt
    const COLOR_FOAM = new THREE.Color("#D8F7FF").convertLinearToSRGB();
    // Màu xanh biển sâu (Royal Blue) cho đáy
    const COLOR_DEEP = new THREE.Color("#1A5698").convertLinearToSRGB();

    // 1. KHỐI NƯỚC
    const waterMat = new THREE.ShaderMaterial({
        uniforms: {
            u_time: { value: 0 },
            u_surfaceColor: { value: COLOR_SURFACE },
            u_foamColor: { value: COLOR_FOAM },
            u_deepColor: { value: COLOR_DEEP },
            u_boxSize: { value: new THREE.Vector3(WIDTH, HEIGHT, DEPTH) },
            u_windDirection: { value: new THREE.Vector2(WATER_CONFIG.windX, WATER_CONFIG.windZ).normalize() }
        },
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        transparent: true,
        side: THREE.DoubleSide,
    });

    // Tăng số lượng segment để sóng mượt hơn (128 thay vì 64)
    const waterGeo = new THREE.BoxGeometry(WIDTH, HEIGHT, DEPTH, 128, 1, 128);
    const waterMesh = new THREE.Mesh(waterGeo, waterMat);
    waterMesh.position.y = MESH_Y;
    waterMesh.name = "Water";
    waterGroup.add(waterMesh);

    // 2. HỘP KÍNH (Giữ nguyên nhưng chỉnh màu viền sáng hơn cho hợp style Anime)
    const glassGeo = new THREE.BoxGeometry(WIDTH, HEIGHT + 2, DEPTH); 
    const glassMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.1, // Tăng nhẹ độ đục
        side: THREE.BackSide,
        depthWrite: false
    });
    const glassBox = new THREE.Mesh(glassGeo, glassMat);
    glassBox.position.y = MESH_Y + 1.0; 
    glassBox.name = "Glass";
    waterGroup.add(glassBox);

    const edgesGeo = new THREE.EdgesGeometry(glassGeo);
    const edgesMat = new THREE.LineBasicMaterial({ 
        color: 0xaaddff, // Viền xanh sáng
        linewidth: 2,
        transparent: true,
        opacity: 0.4
    });
    const edges = new THREE.LineSegments(edgesGeo, edgesMat);
    glassBox.add(edges); 

    // 3. UPDATE
    const update = (deltaTime: number) => {
        waterMat.uniforms.u_time.value += deltaTime; 
    };

    return { mesh: waterGroup, update };
}