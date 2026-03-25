import { useEffect, useRef} from "react";
import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";

export default function ShowAvatar () {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    // Camera
    const camera = new THREE.PerspectiveCamera(60, 640 / 480, 0.1, 1000);
    camera.position.set(0, 1.5, 3);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(640, 480);
    mountRef.current.appendChild(renderer.domElement);

    // Lights
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 10, 7);
    scene.add(light);

    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambient);

    // Load FBX
    const loader = new FBXLoader();
    let model: THREE.Object3D;

    loader.load("/Y_Bot.fbx", (fbx) => {
      model = fbx;

      // Auto scale + center
      const box = new THREE.Box3().setFromObject(model);
      const size = new THREE.Vector3();
      const center = new THREE.Vector3();
      box.getSize(size);
      box.getCenter(center);
      const targetHeight = 2;
      const scale = targetHeight / size.y;
      model.scale.setScalar(scale);
      model.position.x = -center.x * scale;
      model.position.z = -center.z * scale;
      model.position.y = -box.min.y * scale;

      // Stocker le bone du bras gauche
      // const leftArmBone = model.getObjectByName(
      //   "mixamorigLeftArm",
      // ) as THREE.Bone;

      scene.add(model);

      // Animate
      const animate = () => {
        requestAnimationFrame(animate);
        if (model) {
          model.rotation.y += 0.01; // rotation autour de l'axe Y
        }
        
        renderer.render(scene, camera);
      };
      animate();
    });

    // Cleanup
    return () => {
      mountRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef}></div>;
};
