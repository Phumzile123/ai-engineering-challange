alert("JavaScript is working");
import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";
import { OrbitControls } from "https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://unpkg.com/three@0.160.0/examples/jsm/loaders/GLTFLoader.js";

/* -----------------------------
   TAB LOGIC
----------------------------- */
const tabButtons = document.querySelectorAll(".tab-btn");
const tabContents = document.querySelectorAll(".tab-content");

tabButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    tabButtons.forEach((b) => b.classList.remove("active"));
    tabContents.forEach((c) => c.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(btn.dataset.tab).classList.add("active");
  });
});

/* -----------------------------
   SHARED THREE.JS SETUP FUNCTION
----------------------------- */
function createScene(containerId) {
  const container = document.getElementById(containerId);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x020617);

  const camera = new THREE.PerspectiveCamera(
    60,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  );
  camera.position.set(0, 1.5, 4);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.innerHTML = "";
  container.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.4);
  hemiLight.position.set(0, 20, 0);
  scene.add(hemiLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
  dirLight.position.set(5, 10, 7);
  scene.add(dirLight);

  const grid = new THREE.GridHelper(10, 10, 0x64748b, 0x334155);
  scene.add(grid);

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, side: THREE.DoubleSide })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.01;
  scene.add(floor);

  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }

  animate();

  window.addEventListener("resize", () => {
    const width = container.clientWidth;
    const height = container.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  });

  return { scene, camera, renderer, controls };
}

/* -----------------------------
   PROTOTYPE 1: AI → 3D ASSET
----------------------------- */
const assetSceneBundle = createScene("viewer1");
const assetScene = assetSceneBundle.scene;
const assetLoader = new GLTFLoader();
let currentAsset = null;

const assetDatabase = [
  {
    keywords: ["hard hat", "helmet", "yellow hard hat", "construction helmet"],
    name: "Construction Hard Hat",
    url: "https://modelviewer.dev/shared-assets/models/Helmet.glb",
    summary:
      "This protective hard hat is commonly used on construction sites to reduce the risk of head injuries from falling objects and accidental impact."
  },
  {
    keywords: ["robot", "android", "machine"],
    name: "Training Robot",
    url: "https://modelviewer.dev/shared-assets/models/RobotExpressive.glb",
    summary:
      "This robot model can represent an AI training assistant in interactive education scenarios, including demonstrations, coaching, and guided practice."
  },
  {
    keywords: ["horse", "animal"],
    name: "Horse Model",
    url: "https://modelviewer.dev/shared-assets/models/Horse.glb",
    summary:
      "This 3D animal model can support learning scenarios involving biology, movement, veterinary awareness, or environment-based simulations."
  }
];

function normalizeText(text) {
  return text.toLowerCase().trim();
}

function inferAsset(promptText) {
  const prompt = normalizeText(promptText);

  for (const item of assetDatabase) {
    for (const keyword of item.keywords) {
      if (prompt.includes(keyword)) {
        return item;
      }
    }
  }

  return {
    name: "Fallback Training Robot",
    url: "https://modelviewer.dev/shared-assets/models/RobotExpressive.glb",
    summary:
      "A fallback 3D educational model was selected because the entered description did not strongly match a known object in the current retrieval library."
  };
}

function clearCurrentAsset() {
  if (currentAsset) {
    assetScene.remove(currentAsset);
    currentAsset.traverse((child) => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach((m) => m.dispose());
        } else {
          child.material.dispose();
        }
      }
    });
    currentAsset = null;
  }
}

function centerAndScaleModel(model) {
  const box = new THREE.Box3().setFromObject(model);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  box.getSize(size);
  box.getCenter(center);

  model.position.sub(center);

  const maxDim = Math.max(size.x, size.y, size.z);
  const scale = 2 / maxDim;
  model.scale.setScalar(scale);

  model.position.y += 1;
}

document.getElementById("generateAssetBtn").addEventListener("click", () => {
  const prompt = document.getElementById("assetPrompt").value;
  const imageFile = document.getElementById("assetImage").files[0];

  let selectedAsset;

  if (prompt && prompt.trim() !== "") {
    selectedAsset = inferAsset(prompt);
  } else if (imageFile) {
    const fileName = imageFile.name.toLowerCase();
    selectedAsset = inferAsset(fileName);
  } else {
    alert("Please type a description or upload an image.");
    return;
  }

  document.getElementById("assetName").textContent = selectedAsset.name;
  document.getElementById("assetSummary").textContent = selectedAsset.summary;

  clearCurrentAsset();

  assetLoader.load(
    selectedAsset.url,
    (gltf) => {
      currentAsset = gltf.scene;
      centerAndScaleModel(currentAsset);
      assetScene.add(currentAsset);
    },
    undefined,
    (error) => {
      console.error("Error loading model:", error);
      document.getElementById("assetSummary").textContent =
        "The model could not be loaded. Check internet access or use another GLB source.";
    }
  );
});

/* -----------------------------
   PROTOTYPE 2: NATURAL LANGUAGE → AVATAR
----------------------------- */
const avatarSceneBundle = createScene("viewer2");
const avatarScene = avatarSceneBundle.scene;
const avatarLoader = new GLTFLoader();
let avatarModel = null;
let mixer = null;
let clock = new THREE.Clock();
let activeAction = null;
let avatarAnimations = [];

const avatarUrl = "https://modelviewer.dev/shared-assets/models/RobotExpressive.glb";

avatarLoader.load(
  avatarUrl,
  (gltf) => {
    avatarModel = gltf.scene;
    centerAndScaleModel(avatarModel);
    avatarScene.add(avatarModel);

    avatarAnimations = gltf.animations;
    mixer = new THREE.AnimationMixer(avatarModel);
  },
  undefined,
  (error) => {
    console.error("Error loading avatar:", error);
  }
);

function playAnimationByName(nameCandidates) {
  if (!mixer || avatarAnimations.length === 0) {
    return false;
  }

  const clip = avatarAnimations.find((anim) =>
    nameCandidates.some((candidate) =>
      anim.name.toLowerCase().includes(candidate.toLowerCase())
    )
  );

  if (!clip) return false;

  if (activeAction) {
    activeAction.stop();
  }

  activeAction = mixer.clipAction(clip);
  activeAction.reset();
  activeAction.play();
  return true;
}

function interpretCommand(command) {
  const text = normalizeText(command);

  if (text.includes("wave")) {
    return {
      intent: "Greeting / Wave",
      explanation:
        "The AI interpreted this as a friendly greeting behaviour for welcoming or acknowledging the learner.",
      animationHints: ["wave", "hello", "gesture"]
    };
  }

  if (text.includes("walk") || text.includes("move")) {
    return {
      intent: "Locomotion",
      explanation:
        "The AI interpreted this as a movement instruction and mapped it to avatar locomotion behaviour.",
      animationHints: ["walk", "run", "moving"]
    };
  }

  if (text.includes("point")) {
    return {
      intent: "Pointing Gesture",
      explanation:
        "The AI interpreted this as a directional gesture used to draw the learner’s attention to an object or hazard.",
      animationHints: ["point", "gesture"]
    };
  }

  if (text.includes("safety") || text.includes("posture")) {
    return {
      intent: "Safety Demonstration",
      explanation:
        "The AI interpreted this as a training posture demonstration suitable for safety education scenarios.",
      animationHints: ["idle", "pose", "gesture"]
    };
  }

  return {
    intent: "General Instruction",
    explanation:
      "The command was interpreted as a general avatar action. A default expressive animation will be used.",
    animationHints: ["idle", "dance", "gesture"]
  };
}

function animateAvatarLoop() {
  requestAnimationFrame(animateAvatarLoop);
  const delta = clock.getDelta();
  if (mixer) mixer.update(delta);
}
animateAvatarLoop();

document.getElementById("runCommandBtn").addEventListener("click", () => {
  const command = document.getElementById("avatarCommand").value;

  if (!command.trim()) {
    alert("Please enter an avatar command.");
    return;
  }

  const result = interpretCommand(command);

  document.getElementById("avatarIntent").textContent = `Intent: ${result.intent}`;
  document.getElementById("avatarExplanation").textContent = result.explanation;

  const found = playAnimationByName(result.animationHints);

  if (!found) {
    document.getElementById("avatarExplanation").textContent +=
      " No exact animation clip was found in the current avatar file, so this acts as a fallback interpretation.";
  }
});