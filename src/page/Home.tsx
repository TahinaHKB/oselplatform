import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import NavBar from "../component/NavBar";
import { motion } from "motion/react";
import Loading from "../component/Loading";
import useFCMTokenUpdater from "../component/FCMtoken";
import {
  Camera,
  Mail,
  User,
  Calendar,
  TrendingUp,
  DollarSign,
  Package,
  Layers,
  ChevronRight,
  ShoppingBag,
} from "lucide-react";

const CLOUD_NAME = "dyjgjijfa";
const UPLOAD_PRESET = "konnektData";

const Home: React.FC = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [loading, setLoading] = useState(true);
  const [type_account, setType_account] = useState("");
  const navigate = useNavigate();
  const [viewStat, setViewStat] = useState("client");

  // Valeurs statiques dashboard
  const salesCount = 12;
  const totalMoney = 350000;
  const stockCount = 45;
  const categoryCount = 8;

  const orderCount = 8;
  const totalSpent = 120000;
  const itemsBought = 15;
  const favoritesCount = 6;

  const changeStat = () => {
    if (viewStat == "vendeur") setViewStat("client");
    else {
      if (type_account.includes("vendeur") && viewStat == "client")
        setViewStat("vendeur");
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (!user) {
        return;
      }

      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.firstConnection) navigate("/welcom");
        setUsername(data.username);
        setEmail(data.email);
        setBirthdate(data.birthdate || "");
        setProfilePic(data.profilePic || "");
        setType_account(data.type_account);
      }

      setLoading(false);
      // useFCMTokenUpdater(); // Hook call should be inside component if it's a hook
    };

    fetchUserData();
  }, [navigate]);

  // Hook call
  useFCMTokenUpdater();

  const handleProfileUpdate = async () => {
    const user = auth.currentUser;
    if (!user) {
      alert("Demo mode: Profil mis à jour !");
      return;
    }

    await updateDoc(doc(db, "users", user.uid), {
      profilePic,
    });
    alert("Profil mis à jour !");
  };

  const handleProfilePicChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (!e.target.files?.length) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    try {
      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        formData,
      );
      setProfilePic(res.data.secure_url);
    } catch (err) {
      console.error("Erreur upload Cloudinary :", err);
      alert("Erreur lors de l'upload de l'image.");
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900 overflow-hidden">
      {/* BACKGROUND GLOW (ne casse rien) */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-indigo-300/30 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-purple-300/30 blur-[120px] rounded-full" />
      </div>

      <NavBar />

      <main className="pt-24 pb-16 px-4 md:px-8 max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Tableau de bord
            </h1>
            <p className="text-slate-500 font-medium">
              Gérez votre profil et suivez vos performances.
            </p>
          </div>

          <div className="flex items-center gap-2 text-sm font-semibold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-full border border-indigo-100 shadow-sm">
            <button onClick={changeStat}>
              {viewStat == "client"
                ? "STATISTIQUE ACHETEUR"
                : "STATISTIQUE VENDEUR"}
            </button>
          </div>
        </header>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* PROFILE */}
          <div className="lg:col-span-5 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-200 overflow-hidden"
            >
              <div className="h-32 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 relative">
                <div className="absolute -bottom-12 left-8">
                  <div className="relative group">
                    <img
                      src={
                        profilePic || "https://picsum.photos/seed/user/200/200"
                      }
                      className="w-24 h-24 rounded-2xl object-cover ring-4 ring-white shadow-xl bg-white"
                    />
                    <label className="absolute -bottom-2 -right-2 bg-white p-2 rounded-xl shadow-lg border cursor-pointer hover:scale-110 transition">
                      <input
                        type="file"
                        onChange={handleProfilePicChange}
                        className="hidden"
                      />
                      <Camera className="w-4 h-4 text-indigo-600" />
                    </label>
                  </div>
                </div>
              </div>

              <div className="pt-16 pb-8 px-8 space-y-8">
                <div>
                  <h2 className="text-2xl font-bold">
                    {username || "Utilisateur"}
                  </h2>
                  <p className="text-slate-500">{email}</p>
                </div>

                <div className="space-y-5">
                  {/* Username */}
                  <div>
                    <label className="text-xs font-bold text-slate-400 ml-1">
                      Nom d'utilisateur
                    </label>

                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400" />

                      <div className="w-full pl-11 pr-4 py-3 bg-slate-50 border rounded-2xl text-slate-700">
                        {username || "Non défini"}
                      </div>
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="text-xs font-bold text-slate-400 ml-1">
                      Email
                    </label>

                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400" />

                      <div className="w-full pl-11 pr-4 py-3 bg-slate-100 border rounded-2xl text-slate-500">
                        {email || "Non défini"}
                      </div>
                    </div>
                  </div>

                  {/* Birthdate */}
                  <div>
                    <label className="text-xs font-bold text-slate-400 ml-1">
                      Date de naissance
                    </label>

                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400" />

                      <div className="w-full pl-11 pr-4 py-3 bg-slate-50 border rounded-2xl text-slate-700">
                        {birthdate && birthdate !== "none"
                          ? birthdate
                          : "Non définie"}
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleProfileUpdate}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-2xl font-bold shadow-lg hover:opacity-90 active:scale-[0.98] transition"
                >
                  Enregistrer
                </button>
              </div>
            </motion.div>
          </div>

          {/* STATS */}
          <div className="lg:col-span-7 space-y-6">
            {viewStat == "vendeur" && (
              <>
                <div className="grid sm:grid-cols-2 gap-6">
                  {[
                    {
                      title: "Ventes totales",
                      value: salesCount,
                      icon: TrendingUp,
                      color: "indigo",
                      description: "Ventes réalisées ce mois",
                    },
                    {
                      title: "Chiffre d'affaires",
                      value: `${totalMoney.toLocaleString()} Ar`,
                      icon: DollarSign,
                      color: "emerald",
                      description: "Revenus bruts cumulés",
                    },
                    {
                      title: "Inventaire",
                      value: stockCount,
                      icon: Package,
                      color: "blue",
                      description: "Produits actifs en stock",
                    },
                    {
                      title: "Catégories",
                      value: categoryCount,
                      icon: Layers,
                      color: "purple",
                      description: "Segments de produits",
                    },
                  ].map((card, idx) => (
                    <motion.div
                      key={card.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      whileHover={{ y: -6 }}
                      className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl shadow-lg border border-slate-200 flex flex-col justify-between group cursor-pointer"
                    >
                      <div className="flex justify-between mb-4">
                        <div
                          className={`p-3 rounded-2xl bg-${card.color}-50 text-${card.color}-600`}
                        >
                          <card.icon className="w-6 h-6" />
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-500" />
                      </div>

                      <div>
                        <h3 className="text-slate-500 text-sm font-bold mb-1">
                          {card.title}
                        </h3>
                        <p className="text-3xl font-black">{card.value}</p>
                        <p className="text-slate-400 text-xs">
                          {card.description}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* CTA */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 text-white relative overflow-hidden"
                >
                  <h3 className="text-xl font-bold">
                    Prêt à booster vos ventes ?
                  </h3>
                  <p className="text-white/80 max-w-md">
                    Analysez vos performances et découvrez de nouvelles
                    opportunités.
                  </p>
                  <button className="mt-4 bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition">
                    Voir les rapports
                  </button>
                </motion.div>
              </>
            )}
            {/* STATS ACHAT */}
            {viewStat == "client" && (
              <>
                <div className="grid sm:grid-cols-2 gap-6">
                  {[
                    {
                      title: "Commandes",
                      value: orderCount,
                      icon: Package,
                      color: "indigo",
                      description: "Achats effectués",
                    },
                    {
                      title: "Dépenses totales",
                      value: `${totalSpent.toLocaleString()} Ar`,
                      icon: DollarSign,
                      color: "emerald",
                      description: "Montant total dépensé",
                    },
                    {
                      title: "Articles achetés",
                      value: itemsBought,
                      icon: ShoppingBag,
                      color: "blue",
                      description: "Produits achetés",
                    },
                    {
                      title: "Favoris",
                      value: favoritesCount,
                      icon: TrendingUp,
                      color: "purple",
                      description: "Articles enregistrés",
                    },
                  ].map((card, idx) => (
                    <motion.div
                      key={card.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      whileHover={{ y: -6 }}
                      className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl shadow-lg border border-slate-200 flex flex-col justify-between group cursor-pointer"
                    >
                      <div className="flex justify-between mb-4">
                        <div
                          className={`p-3 rounded-2xl bg-${card.color}-50 text-${card.color}-600`}
                        >
                          <card.icon className="w-6 h-6" />
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-500" />
                      </div>

                      <div>
                        <h3 className="text-slate-500 text-sm font-bold mb-1">
                          {card.title}
                        </h3>
                        <p className="text-3xl font-black">{card.value}</p>
                        <p className="text-slate-400 text-xs">
                          {card.description}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* CTA */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-r from-emerald-500 to-indigo-500 rounded-3xl p-8 text-white relative overflow-hidden"
                >
                  <h3 className="text-xl font-bold">
                    Envie de découvrir plus ?
                  </h3>
                  <p className="text-white/80 max-w-md">
                    Parcourez de nouvelles collections et trouvez votre prochain
                    coup de cœur.
                  </p>
                  <button className="mt-4 bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition">
                    Explorer la boutique
                  </button>
                </motion.div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
