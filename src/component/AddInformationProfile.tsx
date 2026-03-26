import { motion } from "motion/react";
import { User, Sparkles, Calendar } from "lucide-react";
import { useState } from "react";
import { auth, db } from "@/firebase";
import { doc, updateDoc } from "firebase/firestore";

interface Property {
  handleNext: () => void;
}

const AddInformationProfile: React.FC<Property> = ({ handleNext }) => {
  const [formData, setFormData] = useState({
    gender: "",
    style: "",
    birthday: "",
  });
  const handleProfileUpdate = async () => {
    const user = auth.currentUser;
    if (!user) {
      alert("Demo mode: Profil mis à jour !");
      return;
    }

    await updateDoc(doc(db, "users", user.uid), {
      gender: formData.gender,
      style_cloth: formData.style,
      birthdate: formData.birthday,
    });
    handleNext();
  };
  return (
    <motion.section
      key="profile"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="flex-1 max-w-2xl mx-auto w-full px-6 py-12 md:py-24"
    >
      <div className="mb-12">
        <h2 className="text-4xl font-light tracking-tight mb-4">
          Complétez vos informations
        </h2>
        <p className="text-gray-500">Aidez-nous à connaître vos besoins</p>
      </div>

      <div className="space-y-10">
        {/* Gender Selection */}
        <div className="space-y-4">
          <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400">
            <User className="w-3 h-3" />
            Sexe
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {["Homme", "Femme"].map((g) => (
              <button
                key={g}
                onClick={() => setFormData({ ...formData, gender: g })}
                className={`px-4 py-3 rounded-xl border transition-all text-sm font-medium ${
                  formData.gender === g
                    ? "bg-black text-white border-black"
                    : "bg-white border-gray-200 hover:border-gray-400"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Style Preference */}
        <div className="space-y-4">
          <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400">
            <Sparkles className="w-3 h-3" />
            Préférence
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              {
                id: "traditionnel",
                label: "Traditionnel",
                desc: "Tenues classiques inspirées des styles locaux",
              },
              {
                id: "moderne",
                label: "Moderne",
                desc: "Style actuel avec des coupes tendances",
              },
              {
                id: "vintage",
                label: "Vintage",
                desc: "Looks rétro inspirés des anciennes époques",
              },
              {
                id: "formal",
                label: "Formel",
                desc: "Tenues élégantes pour occasions spéciales",
              },
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => setFormData({ ...formData, style: s.id })}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  formData.style === s.id
                    ? "bg-black text-white border-black"
                    : "bg-white border-gray-200 hover:border-gray-400"
                }`}
              >
                <div className="font-bold text-sm mb-1">{s.label}</div>
                <div
                  className={`text-xs ${formData.style === s.id ? "text-gray-400" : "text-gray-500"}`}
                >
                  {s.desc}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Birthday */}
        <div className="space-y-4">
          <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400">
            <Calendar className="w-3 h-3" />
            Date d'anniversaire
          </label>
          <input
            type="date"
            value={formData.birthday}
            onChange={(e) =>
              setFormData({ ...formData, birthday: e.target.value })
            }
            className="w-full p-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
          />
        </div>

        <button
          onClick={handleProfileUpdate}
          disabled={!formData.gender || !formData.style || !formData.birthday}
          className="w-full py-4 bg-black text-white rounded-full font-medium transition-all hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.98]"
        >
          Complete Profile
        </button>
      </div>
    </motion.section>
  );
};

export default AddInformationProfile;
