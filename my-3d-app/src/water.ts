import * as THREE from 'three';
import { CONFIG } from './config';

// --- CẤU HÌNH SÓNG (VẬT LÝ) ---
const WAVE_CONF = {
    speed: 1.5,
    scale: 0.15,
    height: 0.8
};

export function getWaterHeightAt(x: number, z: number, time: number): number {
    return Math.sin(x * WAVE_CONF.scale + time * WAVE_CONF.speed) * WAVE_CONF.height;
}

// --- SHADERS ---
const noiseFunctions = `
    // 1. Permutation
    vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
    
    // 2. Simplex Noise 2D
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

    // 3. FBM (Fractal Brownian Motion) - Cần thiết cho style Toon gốc
    float fbm(vec2 st) {
        float v = 0.0;
        float a = 0.5;
        mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
        for (int i = 0; i < 5; i++) {
            v += a * snoise(st);
            st = rot * st * 2.0;
            a *= 0.5;
        }
        return v;
    }
    
    // 4. Stepping function
    float multStep(float signal, float decomp) {
        float outSign = 0.;
        for(float i = 0.; i < decomp; i++) {
            outSign += step((i+1.) / decomp, signal) * (1. / (decomp-1.));
        }
        return outSign;
    }
`;

// VERTEX SHADER (Giữ nguyên logic khối liền mạch)
const vertexShader = `
    uniform float u_time;
    uniform vec3 u_boxSize; 
    
    varying vec2 vUv;
    varying float vIsTop;
    varying vec3 vPos;

    void main() {
        vUv = uv;
        vec3 pos = position;
        vPos = pos;

        float topY = u_boxSize.y / 2.0;
        float isTop = step(topY - 0.1, pos.y);
        vIsTop = isTop;

        // Sóng vật lý (Sin)
        float wave = sin(pos.x * 0.15 + u_time * 1.5) * 0.8;
        
        // Chỉ áp dụng sóng cho mặt trên
        pos.y += wave * isTop;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
`;

// FRAGMENT SHADER (KHÔI PHỤC STYLE TOON GỐC)
const fragmentShader = `
    uniform float u_time;
    uniform vec3 u_blue;
    uniform vec3 u_deepBlue;
    uniform vec3 u_boxSize;

    varying vec2 vUv;
    varying float vIsTop;
    varying vec3 vPos;

    ${noiseFunctions}

    void main() {
        vec3 finalColor;
        float alpha = 0.9;

        // --- MẶT TRÊN: STYLE TOON GỐC ---
        if (vIsTop > 0.5) {
            // Scale UV lớn để tạo vân sóng
            vec2 stUv = vUv * 8.0;

            // 1. Tạo Noise làm méo
            float bNoise = fbm(vec2(stUv.y, stUv.x - u_time * 0.1));
            
            // 2. Tạo sóng Sin bị méo bởi Noise (Đặc trưng của style này)
            float sine = sin((stUv.x + bNoise * 2.0) * 3.0 - u_time * 0.5);
            sine = (sine + 1.0) / 2.0; // Chuẩn hóa 0-1

            // 3. Phân tầng màu (Stepping)
            // 3.0 = 3 màu (Xanh đậm, Xanh nhạt, Trắng)
            float foamLevel = multStep(sine, 3.0); 

            // 4. Floaters (Đốm sáng lấp lánh)
            vec2 sparkleUv = vUv * 20.0 + vec2(-u_time * 0.2, 0.0);
            float sNoise = snoise(sparkleUv);
            float sparkle = step(0.8, sNoise) * 0.5;

            // Phối màu
            finalColor = mix(u_blue, vec3(1.0), foamLevel);
            finalColor += sparkle;
            alpha = 0.95;
        } 
        // --- MẶT BÊN: GRADIENT PHÂN TẦNG ---
        else {
            float h = u_boxSize.y / 2.0;
            float normalizedY = (vPos.y + h) / (2.0 * h);
            
            // Chia khối nước thành các dải màu rõ rệt
            float band = floor(normalizedY * 5.0) / 5.0;
            
            finalColor = mix(u_deepBlue, u_blue, band);
            alpha = 0.6 + band * 0.3; 
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

    // 1. KHỐI NƯỚC
    const waterMat = new THREE.ShaderMaterial({
        uniforms: {
            u_time: { value: 0 },
            u_blue: { value: new THREE.Color("rgb(0, 89, 179)").convertLinearToSRGB() },
            u_deepBlue: { value: new THREE.Color("rgb(0, 20, 60)").convertLinearToSRGB() },
            u_boxSize: { value: new THREE.Vector3(WIDTH, HEIGHT, DEPTH) }
        },
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        transparent: true,
        side: THREE.DoubleSide
    });

    // Dùng BoxGeometry với nhiều segment ở mặt trên (64x64)
    const waterGeo = new THREE.BoxGeometry(WIDTH, HEIGHT, DEPTH, 64, 1, 64);
    const waterMesh = new THREE.Mesh(waterGeo, waterMat);
    waterMesh.position.y = MESH_Y;
    waterMesh.name = "Water";
    waterGroup.add(waterMesh);

    // 2. HỘP KÍNH (FLAT GLASS)
    const glassGeo = new THREE.BoxGeometry(WIDTH, HEIGHT + 5, DEPTH); 
    const glassMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.05,
        side: THREE.BackSide,
        depthWrite: false
    });
    const glassBox = new THREE.Mesh(glassGeo, glassMat);
    glassBox.position.y = MESH_Y + 2.5; 
    glassBox.name = "Glass";
    waterGroup.add(glassBox);

    // Viền kính
    const edgesGeo = new THREE.EdgesGeometry(glassGeo);
    const edgesMat = new THREE.LineBasicMaterial({ 
        color: 0x66aaff, 
        linewidth: 2,
        transparent: true,
        opacity: 0.5
    });
    const edges = new THREE.LineSegments(edgesGeo, edgesMat);
    glassBox.add(edges); 

    // 3. UPDATE
    const update = (deltaTime: number) => {
        waterMat.uniforms.u_time.value += deltaTime; 
    };

    return { mesh: waterGroup, update };
}