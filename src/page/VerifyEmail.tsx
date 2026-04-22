import { useEffect, useState } from "react";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, CheckCircle2, ArrowRight } from "lucide-react";
import { sendEmailVerification } from "firebase/auth";
export default function VerifyEmail() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [isVerified, setIsVerified] = useState(false);

  const sendEmail = async () => {
    if (!auth.currentUser) return;

    await sendEmailVerification(auth.currentUser);
  };

  useEffect(() => {
    sendEmail();

    const interval = setInterval(async () => {
      if (!auth.currentUser) return;

      try {
        // 🔥 recharge user depuis Firebase
        await auth.currentUser.reload();

        if (auth.currentUser.emailVerified) {
          clearInterval(interval);
          setChecking(false);
          setIsVerified(true);

          // Small delay for the success state to be visible
          setTimeout(() => {
            navigate("/login");
          }, 2000);
        }
      } catch (error) {
        console.error("Verification error:", error);
      }
    }, 3000); // check toutes les 3s

    return () => clearInterval(interval);
  }, [navigate]);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#0f172a] [background-image:radial-gradient(circle_at_0%_0%,#1e293b_0%,transparent_50%),radial-gradient(circle_at_100%_100%,#312e81_0%,transparent_50%)] flex items-center justify-center p-4 font-sans">
      {/* Background Atmosphere */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-blue-500/10 blur-3xl rounded-full translate-y-8" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md p-12"
      >
        <div className="group relative">
          {/* Main Card */}
          <div className="relative bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-10 shadow-2xl flex flex-col items-center text-center">
            {/* Icon Container */}
            <div className="relative mb-8">
              <AnimatePresence mode="wait">
                {isVerified ? (
                  <motion.div
                    key="success"
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="h-24 w-24 rounded-full bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 border border-white/5 flex items-center justify-center backdrop-blur-md"
                  >
                    <CheckCircle2 className="h-10 w-10 text-emerald-400" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="waiting"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="h-24 w-24 rounded-full bg-gradient-to-tr from-blue-500/20 to-indigo-500/20 border border-white/5 flex items-center justify-center relative"
                  >
                    <div className="h-16 w-16 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md">
                      <Mail
                        className="h-8 w-8 text-blue-400"
                        strokeWidth={1.5}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Text Content */}
            <div className="space-y-4 mb-10">
              <motion.h2
                className="text-3xl font-light tracking-tight text-white"
                animate={{ opacity: 1 }}
              >
                {isVerified ? (
                  <>
                    Email{" "}
                    <span className="font-semibold text-emerald-400">
                      vérifié
                    </span>
                  </>
                ) : (
                  <>
                    Vérifie ton{" "}
                    <span className="font-semibold text-blue-400">email</span>
                  </>
                )}
              </motion.h2>

              <p className="text-slate-400 leading-relaxed">
                {isVerified
                  ? "Génial ! Ton compte est maintenant actif. Redirection en cours vers votre tableau de bord."
                  : "Nous avons envoyé un lien de confirmation à votre adresse ( vérifier dans vos spam ). Veuillez cliquer sur le lien pour activer votre compte."}
              </p>
            </div>

            {/* Status Indicator */}
            <div className="w-full space-y-6">
              <div className="flex items-center justify-center space-x-3 py-4 bg-white/5 rounded-2xl border border-white/5">
                {checking && !isVerified ? (
                  <>
                    <div className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                    </div>
                    <span className="text-sm font-medium text-slate-300 tracking-wide uppercase">
                      Vérification en cours...
                    </span>
                  </>
                ) : isVerified ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2 text-emerald-400/80"
                  >
                    <span className="text-sm font-medium uppercase tracking-wide">
                      Redirection en cours
                    </span>
                    <ArrowRight className="h-3 w-3 animate-pulse" />
                  </motion.div>
                ) : null}
              </div>
              {!isVerified && (
                <div className="pt-4 flex flex-col space-y-4">
                  <button onClick={() => sendEmail()} className="text-sm text-blue-400 hover:text-blue-300 transition-colors font-medium">
                    Renvoyer l'email de confirmation
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Aesthetic Footer Text */}
        <div className="mt-8 text-center">
          <p className="text-[10px] text-slate-600 tracking-[0.2em] uppercase">
            &copy; {new Date().getFullYear()} OSEL &bull; Security First
          </p>
        </div>
      </motion.div>
    </div>
  );
}
