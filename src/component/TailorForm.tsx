import { useState, useRef, type ChangeEvent, type FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Upload, CheckCircle2, Scissors, ArrowRight, X } from "lucide-react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/firebase";

interface Property {
  handleNext: () => void;
}

const CLOUD_NAME = "dyjgjijfa";
const UPLOAD_PRESET = "konnektData";

const TailorForm: React.FC<Property> = ({ handleNext }) => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    desire: "",
  });

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file || !formData.desire) return;
    setLoading(true);

    try {
      // 🔹 Upload image
      const form = new FormData();
      form.append("file", file);
      form.append("upload_preset", UPLOAD_PRESET);
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        alert("L'image est trop grosse (maximum 10MB)");
        setFile(null);
        setLoading(false);
        return;
      }
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: form,
        },
      );

      const data = await res.json();

      const user = auth.currentUser;

      await addDoc(collection(db, "apply"), {
        imageUrl: data.secure_url,
        desire: formData.desire,
        person: user?.uid,
        createdAt: serverTimestamp(),
      });

      console.log("Envoyé ✅");
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-osel-cream">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center space-y-6 onClick={handleNext}bg-white p-12 rounded-3xl shadow-xl shadow-osel-gold/10 border border-osel-gold/20"
        >
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-osel-gold/10 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-osel-gold" />
            </div>
          </div>
          <h2 className="text-4xl font-serif font-medium text-osel-dark">
            Application reçue
          </h2>
          <p className="text-osel-dark/60 leading-relaxed">
            Merci de partager votre passion avec Osel. Nos maîtres tailleurs
            examineront vos informations et vous contacteront prochainement.
          </p>
          <button
            
            className="text-osel-gold font-medium hover:underline flex items-center justify-center gap-2 mx-auto"
          >
            Suivant
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-osel-cream selection:bg-osel-gold/30">
      {/* Hero Section */}
      <header className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex justify-center mb-6">
              <Scissors className="w-8 h-8 text-osel-gold" />
            </div>
            <h1 className="text-6xl md:text-8xl font-serif font-light tracking-tight text-osel-dark leading-none">
              Façonnez votre avenir <br />
              <span className="italic text-osel-gold">chez OSEL</span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-xl md:text-2xl text-osel-dark/70 font-serif italic max-w-2xl mx-auto leading-relaxed"
          >
            Nous recherchons des maîtres artisans qui insufflent la vie au
            tissu. Rejoignez notre héritage d'élégance et de précision. Vous
            n'êtes pas obligés de postuler.
          </motion.p>
        </div>
      </header>

      {/* Application Form */}
      <main className="max-w-3xl mx-auto px-6 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-[2rem] p-8 md:p-16 shadow-2xl shadow-osel-dark/5 border border-osel-gold/10"
        >
          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="space-y-4">
              <label className="text-xs uppercase tracking-widest font-semibold text-osel-gold">
                Qu'est ce que vous inspire le plus à devenir tailleur chez OSEL
                ?
              </label>
              <textarea
                required
                rows={4}
                placeholder="Tell us about your passion for tailoring and what Osel means to you..."
                className="w-full bg-osel-cream/30 border border-osel-dark/5 rounded-2xl p-6 focus:border-osel-gold outline-none transition-colors text-lg resize-none"
                value={formData.desire}
                onChange={(e) =>
                  setFormData({ ...formData, desire: e.target.value })
                }
              />
            </div>

            <div className="space-y-4">
              <label className="text-xs uppercase tracking-widest font-semibold text-osel-gold">
                Photo de votre meilleur création
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`relative group cursor-pointer border-2 border-dashed rounded-2xl transition-all duration-300 flex flex-col items-center justify-center p-12 overflow-hidden
                  ${preview ? "border-osel-gold bg-osel-gold/5" : "border-osel-dark/10 hover:border-osel-gold hover:bg-osel-gold/5"}`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />

                <AnimatePresence mode="wait">
                  {preview ? (
                    <motion.div
                      key="preview"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="relative w-full aspect-video rounded-xl overflow-hidden shadow-lg"
                    >
                      <img
                        src={preview}
                        alt="Creation preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreview(null);
                        }}
                        className="absolute top-4 right-4 p-2 bg-white/90 rounded-full text-osel-dark hover:bg-white transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="upload"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center space-y-4"
                    >
                      <div className="w-16 h-16 bg-osel-gold/10 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                        <Upload className="w-6 h-6 text-osel-gold" />
                      </div>
                      <div>
                        <p className="text-lg font-medium">
                          Upload a photo of your work
                        </p>
                        <p className="text-sm text-osel-dark/40">
                          JPG, PNG or WebP up to 10MB
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-6 rounded-2xl text-xl font-serif flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all duration-500 disabled:opacity-50 group"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Send Application
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
            <button
              onClick={handleNext}
              className="w-full py-4 bg-black text-white rounded-full font-medium transition-all hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              Suivant
            </button>
          </form>
        </motion.div>
      </main>
    </div>
  );
};

export default TailorForm;
