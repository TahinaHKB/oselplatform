import NavBar from "@/component/NavBar";
import ShowAvatar from "@/component/ShowAvatar";
import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const HolisticDemo: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mountRef = useRef<HTMLDivElement>(null);

  const [size, setSize] = useState("M");
  const [metrics, setMetrics] = useState({
    shoulder: 0,
    arm: 0,
    height: 0,
  });

  useEffect(() => {
    if (!videoRef.current || !mountRef.current) return;

    let animationId: number;
    let cam: any;

    const distance = (a: any, b: any) => {
      return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2);
    };

    const init = async () => {
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

      // THREE JS
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
        if (!results.poseLandmarks) return;

        const lm = results.poseLandmarks;

        // landmarks
        const ls = lm[11];
        const rs = lm[12];
        const le = lm[13];
        const lw = lm[15];
        const la = lm[27];

        // mesures
        const shoulder = distance(ls, rs);

        const upperArm = distance(ls, le);
        const foreArm = distance(le, lw);
        const arm = upperArm + foreArm;

        const height = distance(ls, la);

        // ratios
        const shoulderRatio = shoulder / height;
        //const armRatio = arm / height;

        // sizing
        let computedSize = "M";
        if (shoulderRatio < 0.22) computedSize = "S";
        else if (shoulderRatio < 0.26) computedSize = "M";
        else if (shoulderRatio < 0.3) computedSize = "L";
        else computedSize = "XL";

        setSize(computedSize);
        setMetrics({
          shoulder,
          arm,
          height,
        });

        // update THREE
        const positions = lm.map((p: any) => [p.x - 0.5, -p.y + 0.5, -p.z]);

        geometry.setAttribute(
          "position",
          new THREE.Float32BufferAttribute(positions.flat(), 3),
        );
      });

      cam = new (window as any).Camera(videoRef.current!, {
        onFrame: async () => {
          await holistic.send({ image: videoRef.current! });
        },
        width: 640,
        height: 480,
      });

      cam.start();

      const animate = () => {
        renderer.render(scene, camera3D);
        animationId = requestAnimationFrame(animate);
      };

      animate();

      return () => {
        cam.stop();
        mountRef.current?.removeChild(renderer.domElement);
        cancelAnimationFrame(animationId);
      };
    };

    const cleanupPromise = init();

    return () => {
      cleanupPromise.then((cleanup) => cleanup && cleanup());
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100">
      <NavBar />

      <div className="flex flex-col lg:flex-row gap-6 p-4 lg:p-6 items-center lg:items-start">
        {/* VIDEO + CANVAS */}
        <video ref={videoRef} className="hidden" />

        <div
          ref={mountRef}
          className="
        w-full 
        max-w-[640px] 
        aspect-[4/3] 
        bg-black/10 
        rounded-2xl 
        overflow-hidden
        shadow-lg
      "
        />

        {/* UI PANEL */}
        <div
          className="
      bg-white 
      w-full 
      max-w-sm 
      lg:w-72 
      p-5 
      rounded-2xl 
      shadow-md 
      space-y-4
    "
        >
          <h2 className="font-bold text-lg">📏 Body Sizing</h2>

          <div>
            <p className="text-sm text-gray-500">Taille recommandée</p>
            <p className="text-3xl font-bold text-indigo-600">{size}</p>
          </div>

          <div className="text-sm space-y-2">
            <p>Bras: {metrics.arm.toFixed(3)}</p>
            <p>Épaules: {metrics.shoulder.toFixed(3)}</p>
            <p>Hauteur: {metrics.height.toFixed(3)}</p>
          </div>

          <div className="text-xs text-gray-400">
            (valeurs relatives caméra)
          </div>

          <ShowAvatar />
        </div>
      </div>
    </div>
  );
};

export default HolisticDemo;
