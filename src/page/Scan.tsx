import NavBar from "@/component/NavBar";
import ShowAvatar from "@/component/ShowAvatar";
import React, { useEffect, useRef} from "react";
import * as THREE from "three";

const HolisticDemo: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mountRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!videoRef.current || !mountRef.current) return;

    let animationId: number;
    let cam: any;

    const init = async () => {
      // @ts-ignore: Holistic et Camera sont chargés globalement via CDN
      const holistic = new (window as any).Holistic({
        locateFile: (file: string) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`,
      });

      holistic.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      // Three.js
      const scene = new THREE.Scene();
      const camera3D = new THREE.PerspectiveCamera(75, 640 / 480, 0.1, 1000);
      camera3D.position.z = 2;

      const renderer = new THREE.WebGLRenderer();
      renderer.setSize(640, 480);
      mountRef.current?.appendChild(renderer.domElement);

      const material = new THREE.PointsMaterial({
        color: 0xff0000,
        size: 0.02,
      });
      const geometry = new THREE.BufferGeometry();
      const points = new THREE.Points(geometry, material);
      scene.add(points);

      holistic.onResults((results: any) => {
        if (results.poseLandmarks) {
          const positions = results.poseLandmarks.map((lm: any) => [
            lm.x - 0.5,
            -lm.y + 0.5,
            -lm.z,
          ]);
          geometry.setAttribute(
            "position",
            new THREE.Float32BufferAttribute(positions.flat(), 3),
          );
        }
      });

      // @ts-ignore: Camera global
      cam = new (window as any).Camera(videoRef.current!, {
        onFrame: async () => {
          await holistic.send({ image: videoRef.current! });
        },
        width: 640,
        height: 480,
      });
      cam.start();

      // Animation continue
      const animate = () => {
        renderer.render(scene, camera3D);
        animationId = requestAnimationFrame(animate);
      };
      animate();

      // Cleanup
      return () => {
        cam.stop();
        mountRef.current?.removeChild(renderer.domElement);
        geometry.dispose();
        material.dispose();
        renderer.dispose();
        cancelAnimationFrame(animationId);
      };
    };

    const cleanupPromise = init();
    return () => {
      cleanupPromise.then((cleanup) => {
        if (cleanup) cleanup();
      });
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 selection:bg-purple-200 selection:text-purple-900">
      <NavBar />
      <div style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>
        <video ref={videoRef} style={{ display: "none" }} />

        <div ref={mountRef} style={{ width: 640, height: 480 }}></div>

        <ShowAvatar />
      </div>
    </div>
  );
};

export default HolisticDemo;
