import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, ShoppingBag } from "lucide-react";
import Welcom from "@/component/Welcom";
import AddInformationProfile from "@/component/AddInformationProfile";
import TailorForm from "@/component/TailorForm";
import { auth, db } from "@/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

type Step = "welcome" | "profile" | "tailor" | "success";

export default function WelcomNewUser() {
  const [step, setStep] = useState<Step>("welcome");
  const handleNext = () => {
    if (step === "welcome") setStep("profile");
    else if (step === "profile") setStep("tailor");
    else if (step === "tailor") setStep("success");
  };
  const navigate = useNavigate();
  const numberPage = () => {
    if (step === "welcome") return "1";
    else if (step === "profile") return "2";
    else if (step === "tailor") return "3";
    else return "4";
  };
  const goToHome = async () => {
    const user = auth.currentUser;
    if (!user) {
      return;
    }

    await updateDoc(doc(db, "users", user.uid), {
      firstConnection: false,
    });

    navigate("/scan");
  };
  return (
    <div className="min-h-screen bg-[#fcfcfc] text-[#1a1a1a] font-sans selection:bg-black selection:text-white">
      {/* Navigation / Header */}
      <nav className="fixed top-0 left-0 right-0 h-16 flex items-center justify-between px-6 md:px-12 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
            <ShoppingBag className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold tracking-tighter text-xl uppercase">
            OSEL
          </span>
        </div>
        <div className="text-xs font-medium uppercase tracking-widest text-gray-400">
          page
          {numberPage()}
        </div>
      </nav>

      <main className="pt-16 min-h-screen flex flex-col">
        <AnimatePresence mode="wait">
          {step === "welcome" && <Welcom handleNext={handleNext} />}

          {step === "profile" && (
            <AddInformationProfile handleNext={handleNext} />
          )}

          {step === "tailor" && <TailorForm handleNext={handleNext} />}

          {step === "success" && (
            <motion.section
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-1 flex flex-col items-center justify-center px-6 text-center"
            >
              <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center mb-8">
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-4xl font-light tracking-tight mb-4">
                Tout est prêt !
              </h2>
              <p className="text-gray-500 max-w-sm mb-12">
                Bienvenue chez OSEL. Votre boutique personnalisée est prête pour
                que vous l'exploriez.
              </p>
              <button
                onClick={goToHome}
                className="px-12 py-4 bg-black text-white rounded-full font-medium transition-all hover:bg-gray-800"
              >
                Terminer
              </button>
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      {/* Footer Decoration */}
      <footer className="fixed bottom-6 left-6 right-6 flex justify-between items-center pointer-events-none">
        <div className="text-[10px] uppercase tracking-[0.3em] text-gray-500 font-bold">
          Osel. 2026
        </div>
        <div className="flex gap-4">
          <div className="w-1 h-1 bg-gray-200 rounded-full" />
          <div className="w-1 h-1 bg-gray-200 rounded-full" />
          <div className="w-1 h-1 bg-gray-200 rounded-full" />
        </div>
      </footer>
    </div>
  );
}
