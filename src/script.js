/*
  _   _                    _                  _    _
 | | | |_   _ _   _ _ __  (_)_   _ _ __      / \  | |__  _ __
 | |_| | | | | | | | '_ \ | | | | | '_ \    / _ \ | '_ \| '_ \
 |  _  | |_| | |_| | | | || | |_| | | | |  / ___ \| | | | | | |
 |_| |_|\__, |\__,_|_| |_|/ |\__,_|_| |_| /_/   \_\_| |_|_| |_|
        |___/           |__/

to-blank
Copyright © 2024 Hyunjun Ahn

*/

import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

let textArray = [];
let textMeshes = [];
let textAnimations = [];

loadTextData();

let icosahedronBrightnessAnimation = null;

// scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

// camera
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.z = 20;

camera.layers.enableAll();

// renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// post processing setting
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0,    // strength
    0.5,  // radius
    0.85  // threshold
);
composer.addPass(bloomPass);

// PMREMGenerator setting
const pmremGenerator = new THREE.PMREMGenerator(renderer);
pmremGenerator.compileEquirectangularShader();

// environment map load
const textureLoader = new THREE.TextureLoader();
textureLoader.load(
    '../textures/SPECTRUM.jpg',
    (texture) => {
        texture.mapping = THREE.EquirectangularReflectionMapping; // mapping method set

        const envMap = pmremGenerator.fromEquirectangular(texture).texture;

        // save environment maps for use in materials
        icosahedronMaterial.envMap = envMap;
        chromeMaterial.envMap = envMap;

        texture.dispose();
        pmremGenerator.dispose();
    },
    undefined,
    (error) => {
        console.error('환경 맵 로드 중 오류 발생:', error);
    }
);

// icosahedron
const icosahedronGeometry = new THREE.IcosahedronGeometry(3.1, 0);
const icosahedronMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,                  // Base color of the material (white)
    metalness: 0,                     // Metalness (0: non-metallic)
    roughness: 0,                     // Surface roughness (0: smooth)
    transmission: 1.0,                // Light transmission (1: fully transparent)
    thickness: 0.2,                   // Material thickness (affects refracted light)
    ior: 1.33,                        // Index of refraction (similar to water)
    iridescence: 1.0,                 // Enable iridescent effect
    iridescenceIOR: 1.3,              // Index of refraction for iridescent effect
    iridescenceThicknessRange: [200, 600], // Thickness range for iridescent effect
    side: THREE.DoubleSide,           // Double-sided rendering (both inside and outside)
    clearcoat: 1.0,                   // Enable additional reflective layer
    clearcoatRoughness: 0.1,          // Roughness of the clear coat (0.1: slightly rough)
    transparent: true,                // Enable transparency effect
    depthWrite: false,                // Prevent writing to depth buffer (fix overlapping visual issues)
    envMapIntensity: 0.05,            // Intensity of environment map reflections
    emissive: new THREE.Color(0xffffff), // Emissive color (white)
    emissiveIntensity: 0,             // Emissive intensity (0: emissive effect disabled)
});
const icosahedron = new THREE.Mesh(icosahedronGeometry, icosahedronMaterial);
icosahedron.scale.set(3.5, 3.5, 3.5);
scene.add(icosahedron);

// ring
const ringTexture = textureLoader.load(
    '../textures/6645.jpg',
    () => console.log('Ring texture loaded successfully'),
    undefined,
    (error) => console.error('Error loading ring texture:', error)
);

const chromeMaterial = new THREE.MeshPhysicalMaterial({
    map: ringTexture,
    color: 0xffffff,
    metalness: 1.0,
    roughness: 0.0,
    reflectivity: 1.0,
    clearcoat: 1.0,
    clearcoatRoughness: 0.0,
    envMapIntensity: 0.01,
});

const objLoader = new OBJLoader();
const objPaths = ['./models/ring.1.obj', './models/ring.2.obj', './models/ring.3.obj'];

const ringObjects = [];
const ringInitialPositions = [];

objPaths.forEach((path, index) => {
    objLoader.load(
        path,
        (object) => {
            object.traverse((child) => {
                if(child.isMesh) {
                    child.material = chromeMaterial;
                }
            });

            const positions = [
                { position: [-22, 8, 10], rotation: [15.1, 9.35, 1.3] },
                { position: [22, 15, 10], rotation: [1.7, 12.7, 2.22] },
                { position: [-25, -25, -10], rotation: [23.2, 14.15, 161.7] },
            ];

            object.scale.set(6.5, 6.5, 6.5);
            object.position.set(...positions[index].position);
            object.rotation.set(...positions[index].rotation);

            // 초기 위치 저장
            ringInitialPositions.push(object.position.clone());

            scene.add(object);
            ringObjects.push(object);
        },
        undefined,
        (error) => console.error('Error loading OBJ file:', error)
    );
});

// directional lights
const directionalLights = [
    { position: [10, 10, -25] },
    { position: [10, -10, -25] },
    { position: [-10, 10, -25] },
    { position: [-10, -10, -25] },
];

directionalLights.forEach((lightConfig) => {
    const light = new THREE.DirectionalLight(0xffffff, 100.0);
    light.position.set(...lightConfig.position);
    scene.add(light);
});

// point lights
const icosahedronLight = new THREE.PointLight(0xffffff, 0, 100);
icosahedronLight.position.copy(icosahedron.position);
scene.add(icosahedronLight);

let font;

const fontLoader = new FontLoader();
fontLoader.load(
    '../fonts/AppleSDGothicNeoSB00_Regular.json',
    (loadedFont) => {
        font = loadedFont; // 이전에 저장된 텍스트들을 씬에 추가하지 않음
    },
    undefined,
    (error) => {
        console.error('폰트 로드 중 오류 발생:', error);
    }
);

createDownloadButton();
createResetButton();

function animate() {
    requestAnimationFrame(animate);

    const currentTime = performance.now();

    icosahedron.rotation.x += 0.0025;
    icosahedron.rotation.y += 0.0035;

    ringObjects.forEach((ring, index) => {
        const time = currentTime * 0.001;
        const amplitude = 0.3; // 진동 강도
        const frequency = 1.5; // 진동 속도

        const initialPosition = ringInitialPositions[index];

        ring.position.x = initialPosition.x + Math.sin(time * frequency + index) * amplitude;
        ring.position.y = initialPosition.y + Math.cos(time * frequency + index) * amplitude;
        ring.position.z = initialPosition.z + Math.sin(time * frequency + index * 1.1) * amplitude;
    });

    // text mesh animation
    textAnimations.forEach((animation) => {
        const { textMesh, startTime, duration, startPosition, endPosition, movingToIcosahedron } = animation;

        const elapsedTime = currentTime - startTime;
        const t = Math.min(elapsedTime / duration, 1);

        if(movingToIcosahedron) {
            if(t < 1.0) {
                // move to icosahedron
                textMesh.position.lerpVectors(
                    startPosition,
                    endPosition,
                    t
                );
            } else {
                // animation finish
                textMesh.position.copy(endPosition);
                animation.movingToIcosahedron = false;
                animation.isFloating = true;
                animation.startTime = currentTime;
            }

            // brightness animation
            if(!icosahedronBrightnessAnimation) {
                const brightnessAnimationDelay = 500;
                if(elapsedTime >= brightnessAnimationDelay) {
                    startIcosahedronBrightnessAnimation(currentTime - brightnessAnimationDelay);
                }
            }
        } else if(animation.isFloating) {
            updateFloatingAnimation(animation, currentTime);
        }
    });

    // update icosahedral brightness animation
    if(icosahedronBrightnessAnimation) {
        const elapsedTime = currentTime - icosahedronBrightnessAnimation.startTime;

        if(icosahedronBrightnessAnimation.phase === 'increase') {
            const t = Math.min(elapsedTime / 1200, 1);
            icosahedronMaterial.emissiveIntensity = THREE.MathUtils.lerp(0, 0.65, t);
            bloomPass.strength = THREE.MathUtils.lerp(0, 0.15, t);

            if(t >= 1.0) {
                icosahedronBrightnessAnimation.phase = 'hold';
                icosahedronBrightnessAnimation.startTime = currentTime;
            }
        } else if(icosahedronBrightnessAnimation.phase === 'hold') {
            if(elapsedTime >= 100) { // 100ms 대기
                icosahedronBrightnessAnimation.phase = 'decrease';
                icosahedronBrightnessAnimation.startTime = currentTime;

                // text limit
                if(textMeshes.length > 10) {
                    removeOldestText();
                }
            }
        } else if(icosahedronBrightnessAnimation.phase === 'decrease') {
            const t = Math.min(elapsedTime / 1200, 1);
            icosahedronMaterial.emissiveIntensity = THREE.MathUtils.lerp(0.65, 0, t);
            bloomPass.strength = THREE.MathUtils.lerp(0.15, 0, t);

            if(t >= 1.0) {
                // animation finish
                icosahedronBrightnessAnimation = null;
                icosahedronMaterial.emissiveIntensity = 0;
                bloomPass.strength = 0;
            }
        }
    }

    // rendering with post processing
    composer.render();
}
animate();

function updateFloatingAnimation(animation, currentTime) {
    const { textMesh, startTime } = animation;

    const time = (currentTime - startTime) * 0.001;

    const radius = 3.0;
    const speed = 0.4;

    textMesh.position.x = icosahedron.position.x + radius * Math.sin(speed * time);
    textMesh.position.y = icosahedron.position.y + radius * Math.cos(speed * time);
    textMesh.position.z = icosahedron.position.z + radius * Math.sin(speed * time * 0.7);

    textMesh.rotation.x = Math.sin(time * 0.5) * 0.8;
    textMesh.rotation.y = Math.cos(time * 0.3) * 0.8;
    textMesh.rotation.z = Math.sin(time * 0.7) * 0.2;
}

// icosahedron brightness animation start function
function startIcosahedronBrightnessAnimation(adjustedStartTime) {
    icosahedronBrightnessAnimation = {
        startTime: adjustedStartTime || performance.now(),
        phase: 'increase',
    };
}

function insertLineBreaks(text, maxLineLength) {
    let result = '';
    let index = 0;

    while(index < text.length) {
        let line = text.substr(index, maxLineLength);
        result += line + '\n';
        index += maxLineLength;
    }

    return result.trim();
}

// message event listener
window.addEventListener('message', (event) => {
    let textData = event.data;
    const timestamp = new Date().toLocaleString();
    let processedText = insertLineBreaks(textData, 12); // maximum line length: 12
    const textEntry = { text: processedText, time: timestamp };
    textArray.push(textEntry);
    console.log(textArray);

    saveTextData(); // save in local

    createText(textEntry);
});

function createText(textEntry) {
    if(!font) return;

    const text = textEntry.text;
    const textGeometry = new TextGeometry(text, {
        font: font,
        size: 0.9,
        height: 0.1,
        curveSegments: 12,
        bevelEnabled: false,
    });

    // centralize text by calculating bounding boxes
    textGeometry.computeBoundingBox();
    const boundingBox = textGeometry.boundingBox;
    const centerOffset = new THREE.Vector3();
    boundingBox.getCenter(centerOffset).negate();
    textGeometry.translate(centerOffset.x, centerOffset.y, centerOffset.z);

    const textMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);

    textMesh.position.set(0, 0, 15.8); // text position setting

    textMesh.lookAt(camera.position);

    textMesh.layers.set(1); // 텍스트를 레이어 1에 배치하여 환경 맵 반사에서 제외

    scene.add(textMesh);
    textMeshes.push(textMesh);

    setTimeout(() => {
        startTextAnimation(textMesh);
    }, 2000);
}

function startTextAnimation(textMesh) {
    const startPosition = textMesh.position.clone();
    const endPosition = icosahedron.position.clone();
    const animationDuration = 1500; // 1.5초 동안 이동

    const startTime = performance.now(); // save start time

    textAnimations.push({
        textMesh: textMesh,
        startTime: startTime,
        duration: animationDuration, // ms
        startPosition: startPosition,
        endPosition: endPosition,
        movingToIcosahedron: true,
        isFloating: false,
    });
}

// delete old text
function removeOldestText() {
    const oldestTextMesh = textMeshes.shift();
    scene.remove(oldestTextMesh);

    // erase animation too
    const index = textAnimations.findIndex(
        (animation) => animation.textMesh === oldestTextMesh
    );
    if(index !== -1) {
        textAnimations.splice(index, 1);
    }

    // resource cleanup
    oldestTextMesh.geometry.dispose();
    oldestTextMesh.material.dispose();
}

// save in local
function saveTextData() {
    localStorage.setItem('textData', JSON.stringify(textArray));
}

// load in local
function loadTextData() {
    const savedData = localStorage.getItem('textData');
    if(savedData) {
        textArray = JSON.parse(savedData);
    }
}

// text download button
function createDownloadButton() {
    const downloadButton = document.createElement('button');
    downloadButton.textContent = '   ';
    downloadButton.style.position = 'absolute';
    downloadButton.style.top = '10px';
    downloadButton.style.right = '10px';
    downloadButton.style.zIndex = '100';
    downloadButton.style.padding = '10px 20px';
    downloadButton.style.backgroundColor = 'rgba(255, 255, 255, 0)';
    downloadButton.style.border = 'none';
    downloadButton.style.cursor = 'pointer';
    document.body.appendChild(downloadButton);

    downloadButton.addEventListener('click', () => {
        downloadTextData();
    });
}

// text download function
function downloadTextData() {
    let dataStr = '';
    textArray.forEach((entry) => {
        dataStr += `시간: ${entry.time}\n`;
        dataStr += `내용: ${entry.text}\n`;
        dataStr += '------------------------\n';
    });

    const blob = new Blob([dataStr], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'text.txt';
    a.click();

    URL.revokeObjectURL(url);
}

// text reset button
function createResetButton() {
    const resetButton = document.createElement('button');
    resetButton.textContent = '   ';
    resetButton.style.position = 'absolute';
    resetButton.style.bottom = '10px';
    resetButton.style.right = '10px';
    resetButton.style.zIndex = '100';
    resetButton.style.padding = '10px 20px';
    resetButton.style.backgroundColor = 'rgba(255, 255, 255, 0)';
    resetButton.style.border = 'none';
    resetButton.style.cursor = 'pointer';
    document.body.appendChild(resetButton);

    resetButton.addEventListener('click', () => {
        resetTextData();
    });
}

// text reset function
function resetTextData() {
    localStorage.removeItem('textData');
    textArray = [];
    location.reload();
}