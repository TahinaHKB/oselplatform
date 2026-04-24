import { 
  ChevronRight, 
  Scan, 
  Ruler, 
  Maximize2, 
  AlertCircle,
} from "lucide-react";
import React, { useEffect, useRef, useState} from "react";
import * as THREE from "three";
import { useNavigate} from "react-router-dom";
import { auth, db } from "@/firebase";
import { motion, AnimatePresence } from "motion/react";
import { addDoc, collection, getDocs, query, serverTimestamp, updateDoc, where } from "firebase/firestore";

const HolisticDemo: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mountRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const startScanRef = useRef(false);
  const [startScan, setStartScan] = useState(false);
  const [errorPosition, setErrorPosition] = useState(true);
  const [scanProgress, setScanProgress] = useState(0);
  const [showSaveModal, setShowSaveModal] = useState(false);

  const [size, setSize] = useState("Aucune");
  const [metricsCM, setMetricsCM] = useState({
    shoulder: 0,
    arm: 0,
    height: 0,
  });

  const scanControl = () => {
    if (startScan) return;

    startScanRef.current = true;
    setStartScan(true);
    setScanProgress(0);

    const duration = 10000;
    const interval = 100;
    let elapsed = 0;

    const progressTimer = setInterval(async () => {
      elapsed += interval;
      setScanProgress(Math.min((elapsed / duration) * 100, 100));
      if (elapsed >= duration) {
        clearInterval(progressTimer);

        startScanRef.current = false;
        setStartScan(false);
      }
    }, interval);
  };

  const saveMesurements = async () => {
    const user = auth.currentUser;

    if (!user) {
      console.log("No user logged in");
      return;
    }

    try {
      const q = query(
        collection(db, "body_scans"),
        where("userId", "==", user.uid),
      );

      const querySnapshot = await getDocs(q);

      const data = {
        userId: user.uid,
        size,
        metrics: {
          shoulder: metricsCM.shoulder,
          arm: metricsCM.arm,
          height: metricsCM.height,
        },
        createdAt: serverTimestamp(),
      };

      // ===== SI EXISTE → UPDATE =====
      if (!querySnapshot.empty) {
        const docRef = querySnapshot.docs[0].ref;

        await updateDoc(docRef, data);

        setShowSaveModal(true);
      }
      // ===== SINON → CREATE =====
      else {
        await addDoc(collection(db, "body_scans"), data);

        setShowSaveModal(true);
      }
    } catch (error) {
      console.error("❌ Firestore error:", error);
    }
  };

  const goToHome = async () => {
    const user = auth.currentUser;
    if (!user) return;
    navigate("/");
  };

  useEffect(() => {
    if (!videoRef.current || !mountRef.current) return;

    let animationId: number;
    let cam: any;

    let heightSamples: number[] = [];
    let isCalibrated = false;
    let scale = 1;

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

      const scene = new THREE.Scene();
      const camera3D = new THREE.PerspectiveCamera(75, 640 / 480, 0.1, 1000);
      camera3D.position.z = 2.5;

      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
      });
      const containerWidth = mountRef.current!.clientWidth;
      const containerHeight =
        mountRef.current!.clientHeight || (containerWidth * 3) / 4;

      renderer.setSize(containerWidth, containerHeight);
      renderer.setPixelRatio(window.devicePixelRatio);
      camera3D.aspect = containerWidth / containerHeight;
      camera3D.updateProjectionMatrix();
      mountRef.current?.appendChild(renderer.domElement);

      // Gradient background for the 3D scene (synthetic)
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      scene.add(ambientLight);

      const pointLight = new THREE.PointLight(0x6366f1, 1);
      pointLight.position.set(2, 2, 2);
      scene.add(pointLight);

      const material = new THREE.PointsMaterial({
        color: 0x6366f1,
        size: 0.015,
        transparent: true,
        opacity: 0.8,
      });

      const geometry = new THREE.BufferGeometry();
      const points = new THREE.Points(geometry, material);
      scene.add(points);

      holistic.onResults((results: any) => {
        if (!results.poseLandmarks) {
          setErrorPosition(true);
          return;
        }

        const lm = results.poseLandmarks;
        const ls = lm[11]; // left shoulder
        const rs = lm[12]; // right shoulder
        const le = lm[13]; // left elbow
        const lw = lm[15]; // left wrist
        const la = lm[27]; // left ankle

        const shoulder = distance(ls, rs);
        const upperArm = distance(ls, le);
        const foreArm = distance(le, lw);
        const arm = upperArm + foreArm;
        const heightVisible = distance(ls, la);

        const movement = Math.abs(ls.x - rs.x) + Math.abs(ls.y - rs.y);
        const confidence =
          (ls.visibility +
            rs.visibility +
            lm[23].visibility +
            lm[24].visibility) /
          4;

        const isStable = movement < 0.2 && confidence > 0.8;
        setErrorPosition(!isStable);

        if (!isCalibrated && isStable && startScanRef.current) {
          heightSamples.push(heightVisible);
          if (heightSamples.length >= 30) {
            const avgHeight =
              heightSamples.reduce((a, b) => a + b) / heightSamples.length;
            const head = lm[0];
            const ankleL = lm[27];
            const ankleR = lm[28];
            const ankleVisible =
              ankleL.visibility > 0.6 && ankleR.visibility > 0.6;
            const ankleCenter = {
              x: (ankleL.x + ankleR.x) / 2,
              y: (ankleL.y + ankleR.y) / 2,
              z: (ankleL.z + ankleR.z) / 2,
            };
            const hipCenter = {
              x: (lm[23].x + lm[24].x) / 2,
              y: (lm[23].y + lm[24].y) / 2,
              z: (lm[23].z + lm[24].z) / 2,
            };
            const base = ankleVisible ? ankleCenter : hipCenter;
            const headToBase = distance(head, base);
            const estimatedHeight = headToBase * 1.25;
            const safeAvgHeight = Math.max(avgHeight, 0.1);
            scale = (estimatedHeight / safeAvgHeight) * 1.35;
            scale = Math.min(Math.max(scale, 140), 210); // Standard human range
            isCalibrated = true;
          }
        }

        const shoulderRatio = shoulder / heightVisible;
        let computedSize = "M";
        if (shoulderRatio < 0.22) computedSize = "S";
        else if (shoulderRatio < 0.26) computedSize = "M";
        else if (shoulderRatio < 0.3) computedSize = "L";
        else computedSize = "XL";
        setSize(computedSize);

        if (isCalibrated) {
          setMetricsCM({
            shoulder: shoulder * scale,
            arm: arm * scale,
            height: heightVisible * scale,
          });
          isCalibrated = false;
        }

        const positions = lm.map((p: any) => [
          (p.x - 0.5) * 2,
          (-p.y + 0.5) * 2,
          -p.z * 2,
        ]);
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

      const handleResize = () => {
        const w = mountRef.current!.clientWidth;
        const h = mountRef.current!.clientHeight || (w * 3) / 4;
        renderer.setSize(w, h);
        camera3D.aspect = w / h;
        camera3D.updateProjectionMatrix();
      };
      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
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
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900 overflow-hidden">
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-[90%] max-w-sm space-y-4 animate-fadeIn">
            <h2 className="text-xl font-bold text-center">Scan Saved ✅</h2>

            <p className="text-sm text-gray-500 text-center">
              Your body measurements have been successfully saved, you can now
              visit the shop.
            </p>

            <div className="flex flex-col gap-3">
              {/* rester */}
              <button
                onClick={() => setShowSaveModal(false)}
                className="bg-slate-900 text-white py-3 rounded-xl hover:bg-slate-800"
              >
                Stay here
              </button>

              {/* aller boutique */}
              <button
                onClick={() => navigate("/navig")}
                className="bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-500"
              >
                Go to Shop
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Top Navigation Bar */}
      <nav className="flex items-center justify-between px-8 h-16 bg-white border-b border-slate-200 z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Scan className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold tracking-tight text-xl">
            OSEL<span className="text-indigo-600">Scan</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full border border-green-200">
            <div
              className={`w-2 h-2 rounded-full ${errorPosition ? "bg-red-500" : "bg-green-500 animate-pulse"}`}
            ></div>
            <span className="text-[10px] font-bold uppercase tracking-wider">
              {errorPosition ? "Calibration Needed" : "System Ready"}
            </span>
          </div>
          <button className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors italic">
            Documentation
          </button>
        </div>
      </nav>

      <main className="flex-1 grid grid-cols-12 gap-6 p-8">
        {/* Left Column: Camera / Skeleton View */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-4">
          <div className="relative flex-1 bg-slate-900 rounded-2xl overflow-hidden border-4 border-white shadow-2xl group min-h-[400px]">
            {/* Camera Feed Mounting Point */}
            <video ref={videoRef} className="hidden" />
            <div ref={mountRef} className="w-full h-full" />

            {/* HUD Overlays */}
            <div className="absolute top-6 left-6 flex flex-col gap-1 pointer-events-none">
              <div className="text-[10px] uppercase font-bold tracking-[0.2em] text-indigo-400">
                Camera Feed 01
              </div>
              <div className="text-xs text-white opacity-50 font-mono tracking-tighter">
                1280x720 • 60 FPS
              </div>
            </div>

            <div className="absolute top-6 right-6 pointer-events-none">
              <div className="flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded border border-white/20">
                <span className="text-[10px] font-bold text-white uppercase tracking-widest">
                  Scan Mode: Precision
                </span>
              </div>
            </div>

            {/* Scanning Line */}
            <AnimatePresence>
              {startScan && (
                <motion.div
                  initial={{ top: "0%" }}
                  animate={{ top: "100%" }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-indigo-400 to-transparent blur-sm shadow-[0_0_15px_rgba(99,102,241,0.8)] z-10"
                />
              )}
            </AnimatePresence>

            {/* Error / Warning Overlay */}
            <AnimatePresence>
              {errorPosition && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="absolute bottom-8 inset-x-8 pointer-events-none"
                >
                  <div className="bg-red-500/95 backdrop-blur-sm border border-red-400 text-white p-4 rounded-xl flex items-center gap-4 shadow-lg">
                    <div className="p-2 bg-white/20 rounded-lg flex items-center justify-center">
                      <AlertCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold truncate">
                        Coverage Alert
                      </p>
                      <p className="text-xs opacity-90 leading-tight">
                        Ensure your entire body is visible and remain completely
                        still for calibration.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Action Buttons Row */}
          <div className="flex gap-4">
            <button
              onClick={scanControl}
              className={`
                flex-1 flex items-center justify-center gap-3 py-5 rounded-2xl font-bold transition-all shadow-xl
                ${
                  startScan || errorPosition
                    ? "bg-slate-900 text-white hover:bg-slate-800 active:scale-95 shadow-slate-200"
                    : "bg-slate-900 text-white hover:bg-slate-800 active:scale-95 shadow-slate-200"
                }
              `}
            >
              <span>
                {startScan ? "Analysis in Progress" : "Start Precise Scan"}
              </span>
              <ChevronRight
                className={`w-5 h-5 transition-transform ${startScan ? "" : "group-hover:translate-x-1"}`}
              />
            </button>
            <button
              onClick={goToHome}
              className="px-8 flex items-center justify-center bg-white text-slate-900 border border-slate-200 rounded-2xl font-bold hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
            >
              Return Home
            </button>
            <button
              onClick={saveMesurements}
              className={`
      px-8 flex items-center justify-center rounded-2xl font-bold transition-all shadow-sm
      ${
        true
          ? "bg-indigo-600 text-white hover:bg-indigo-500 active:scale-95"
          : "bg-slate-200 text-slate-400 cursor-not-allowed"
      }
    `}
            >
              Save
            </button>
          </div>
        </div>

        {/* Right Column: Results & Metrics */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          {/* Result Card */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm transition-all duration-500">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
              Analysis Result
            </div>
            <div className="flex items-baseline gap-2">
              <h1 className="text-7xl font-black text-indigo-600 tracking-tighter">
                {size || "--"}
              </h1>
              <span className="text-slate-400 font-medium italic">
                Standard Fit
              </span>
            </div>
            <div className="h-px bg-slate-100 my-6"></div>
            <p className="text-sm text-slate-500 leading-relaxed">
              Based on your skeletal proportions, we recommend size{" "}
              <span className="font-bold text-slate-800">
                {size === "Aucune" ? "None" : size}
              </span>{" "}
              for a tailored athletic fit.
            </p>
          </div>

          {/* Metrics List */}
          <div className="flex flex-col gap-3">
            <MetricItem
              label="Height"
              value={metricsCM.height}
              icon={<Maximize2 className="w-4 h-4" />}
              color="indigo"
            />
            <MetricItem
              label="Shoulder Width"
              value={metricsCM.shoulder}
              icon={<Scan className="w-4 h-4" />}
              color="purple"
            />
            <MetricItem
              label="Arm Length"
              value={metricsCM.arm}
              icon={<Ruler className="w-4 h-4" />}
              color="pink"
            />
          </div>

          {/* Status Indicator / Process Monitor */}
          <div className="mt-auto p-5 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-start gap-4">
            <div
              className={`w-2 h-2 rounded-full mt-2 ${startScan ? "bg-indigo-600 animate-ping" : "bg-indigo-400"}`}
            ></div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-indigo-900 uppercase tracking-widest">
                Process Monitor
              </div>
              <div className="text-[11px] text-indigo-700/70 mt-1 font-mono truncate">
                {startScan
                  ? `Capturing frames... ${Math.round(scanProgress)}%`
                  : "Awaiting calibration sample..."}
              </div>
              <div className="w-full h-1.5 bg-indigo-200/50 rounded-full mt-3 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: startScan ? `${scanProgress}%` : "30%" }}
                  className="h-full bg-indigo-600 shadow-[0_0_8px_rgba(79,70,229,0.5)]"
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Note */}
      <footer className="px-8 py-4 bg-white border-t border-slate-200 flex justify-between">
        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
          OSEL scan• HKB
        </span>
        <span className="text-[10px] text-slate-400 font-bold italic">
          v1.0.0-stable
        </span>
      </footer>
    </div>
  );
};

interface MetricItemProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: 'indigo' | 'purple' | 'pink';
}

const MetricItem: React.FC<MetricItemProps> = ({ label, value, icon, color }) => {
  const colorMap = {
    indigo: "text-indigo-600 bg-indigo-50 border-indigo-100",
    purple: "text-purple-600 bg-purple-50 border-purple-100",
    pink: "text-pink-600 bg-pink-50 border-pink-100",
  };

  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-200 flex justify-between items-center group transition-all hover:border-slate-300 hover:shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-xl border ${colorMap[color]}`}>
          {icon}
        </div>
        <span className="text-sm font-medium text-slate-500">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-xl font-bold font-mono tracking-tighter text-slate-900">{value.toFixed(1)}</span>
        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">cm</span>
      </div>
    </div>
  );
};
export default HolisticDemo;