import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import NavBar from "../component/NavBar";
import { motion } from "framer-motion";
import Loading from "../component/Loading";
import useFCMTokenUpdater from "@/component/FCMtoken";

const CLOUD_NAME = "dyjgjijfa";
const UPLOAD_PRESET = "konnektData";

const Profile: React.FC = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Valeurs statiques dashboard
  const salesCount = 12;
  const totalMoney = 350000;
  const stockCount = 45;
  const categoryCount = 8;

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (!user) {
        navigate("/");
        return;
      }

      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setUsername(data.username);
        setEmail(data.email);
        setBirthdate(data.birthdate || "");
        setProfilePic(data.profilePic || "");
      }

      setLoading(false);
      useFCMTokenUpdater();
    };

    fetchUserData();
  }, [navigate]);

  const handleProfileUpdate = async () => {
    const user = auth.currentUser;
    if (!user) return;

    await updateDoc(doc(db, "users", user.uid), {
      username,
      birthdate,
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
    <>
      <NavBar />
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-blue-50 pt-[70px] px-4 md:px-10 pb-10 flex flex-col items-center gap-10">
        {/* Profil utilisateur */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white p-8 rounded-3xl shadow-xl border border-purple-200 flex flex-col max-w-2xl w-full"
        >
          <h2 className="text-3xl font-extrabold mb-6 text-center text-purple-700">
            Mon Profil
          </h2>

          <div className="flex flex-col items-center mb-6">
            <div className="relative w-28 h-28 mb-4">
              <img
                src={profilePic}
                alt="Profil"
                className="w-full h-full rounded-full object-cover shadow-lg border-4 border-purple-200"
              />
              <label className="absolute bottom-0 right-0 bg-purple-500 p-1 rounded-full cursor-pointer hover:bg-purple-600 transition">
                <input
                  type="file"
                  onChange={handleProfilePicChange}
                  className="hidden"
                />
                <svg
                  className="w-5 h-5 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M4 13V7a1 1 0 011-1h10a1 1 0 011 1v6h2v-6a3 3 0 00-3-3H5a3 3 0 00-3 3v6h2zM2 15a2 2 0 012-2h12a2 2 0 012 2v2H2v-2z" />
                </svg>
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled
              className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-purple-400 focus:outline-none"
              placeholder="Nom d'utilisateur"
            />
            <input
              type="email"
              value={email}
              disabled
              className="w-full px-4 py-2 border rounded-xl bg-gray-100 cursor-not-allowed"
            />
            <input
              type="date"
              value={birthdate === "none" ? "" : birthdate}
              onChange={(e) => setBirthdate(e.target.value)}
              className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-purple-400 focus:outline-none"
            />

            <button
              onClick={handleProfileUpdate}
              className="w-full bg-purple-500 text-white py-2 rounded-xl hover:bg-purple-600 transition font-semibold"
            >
              Mettre à jour le profil
            </button>
          </div>
        </motion.div>

        {/* Dashboard statique */}
        <div className="w-full max-w-7xl grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: "Nombre de ventes",
              value: salesCount,
              color: "bg-purple-100",
              textColor: "text-purple-700",
            },
            {
              title: "Argent gagné",
              value: `${totalMoney} Ar`,
              color: "bg-green-100",
              textColor: "text-green-700",
            },
            {
              title: "Produits en stock",
              value: stockCount,
              color: "bg-blue-100",
              textColor: "text-blue-700",
            },
            {
              title: "Catégories",
              value: categoryCount,
              color: "bg-yellow-100",
              textColor: "text-yellow-700",
            },
          ].map((card) => (
            <motion.div
              key={card.title}
              whileHover={{ scale: 1.05 }}
              className={`${card.color} p-6 rounded-2xl shadow flex flex-col items-center`}
            >
              <h3 className={`text-sm mb-2 ${card.textColor}`}>{card.title}</h3>
              <p className={`text-3xl font-bold ${card.textColor}`}>
                {card.value}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Profile;
