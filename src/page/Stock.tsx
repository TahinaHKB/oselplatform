import { useEffect, useState } from "react";
import NavBar from "@/component/NavBar";
import {
  Shirt,
  Plus,
  Trash2,
  Package,
  Tag,
  Layers,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
} from "lucide-react";

import { db, auth } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import {type Category } from "@/data/datyType";
import LoadingComment from "@/component/LoadingComment";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";

export type Clothing = {
  id?: string;
  name: string;
  price: number;
  disponible: boolean;
  category: string;
  imageUrl: string;
};

const CLOUD_NAME = "dyjgjijfa";
const UPLOAD_PRESET = "konnektData";

const Stock = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState("");

  const [name, setName] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [disponible, setDisponible] = useState<boolean>(false);
  const [category, setCategory] = useState("");

  const [clothes, setClothes] = useState<Clothing[]>([]);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loadPubSend, setLoadPubSend] = useState(false);

  const user = auth.currentUser;

  const addCategory = async () => {
    if (!newCategory || !user) return;

    // Vérifie si la catégorie existe déjà
    const exists = categories.some(
      (cat) => cat.name.toLowerCase() === newCategory.trim().toLowerCase(),
    );

    if (exists) {
      alert("Cette catégorie existe déjà !");
      return;
    }

    // Ajouter dans Firestore
    await addDoc(collection(db, "categories"), {
      name: newCategory.trim(),
      userId: user.uid,
    });

    setNewCategory("");
    loadCategories(); // recharge la liste depuis Firestore
  };

  const loadCategories = async () => {
    if (!user) return;
    const q = query(
      collection(db, "categories"),
    );
    const querySnapshot = await getDocs(q);
    const list: Category[] = [];
    querySnapshot.forEach((docu) => {
      list.push({
        id: docu.id,
        ...(docu.data() as Category),
      });
    });
    setCategories(list);
  };

  const addClothing = async () => {
    if (!name || !category || price <= 0 || !user) return;
    setLoadPubSend(true);
    let imageUrl = "";

    if (selectedFile) {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("upload_preset", UPLOAD_PRESET);
      const maxSize = 10 * 1024 * 1024;
      if (selectedFile.size > maxSize) {
        alert("L'image est trop grosse (maximum 10MB)");
        setSelectedFile(null);
        setLoadPubSend(false);
        return;
      }
      try {
        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
          {
            method: "POST",
            body: formData,
          },
        );
        const data = await response.json();
        imageUrl = data.secure_url;
      } catch (error) {
        console.error("Erreur upload image Cloudinary:", error);
        alert("Erreur upload image");
        setLoadPubSend(false);
        return;
      }
    }

    await addDoc(collection(db, "stock"), {
      name,
      price,
      disponible,
      category,
      imageUrl,
      userId: user.uid,
    });

    setName("");
    setPrice(0);
    setDisponible(false);
    setSelectedFile(null);
    loadClothes();
    setLoadPubSend(false);
  };

  const loadClothes = async () => {
    if (!user) return;
    const q = query(collection(db, "stock"), where("userId", "==", user.uid));
    const querySnapshot = await getDocs(q);
    const list: Clothing[] = [];
    querySnapshot.forEach((docu) => {
      list.push({
        id: docu.id,
        ...(docu.data() as Clothing),
      });
    });
    setClothes(list);
  };

  const deleteClothing = async (id: string) => {
    await deleteDoc(doc(db, "stock", id));
    loadClothes();
  };

  const updateDisponible = async (id: string, newDisp: boolean) => {
    await updateDoc(doc(db, "stock", id), {
      disponible: newDisp,
    });
    loadClothes();
  };
  const navigate = useNavigate();
  const verifyUser = async () => {
    const user = auth.currentUser;
    if (!user) {
      return;
    }

    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      if (!data.type_account.includes("vendeur")) navigate("/");
    }
  };

  useEffect(() => {
    verifyUser();
    loadClothes();
    loadCategories();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 selection:bg-purple-200 selection:text-purple-900">
      <NavBar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-10">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-indigo-700 tracking-tight">
              Gestion du Stock
            </h1>
            <p className="text-purple-500 mt-1">
              Gérez vos collections et catégories de vêtements en temps réel.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm">
            <Package className="text-indigo-600" size={18} />
            <span className="font-semibold text-slate-700">
              {clothes.length}
            </span>
            <span className="text-slate-400 text-sm">articles au total</span>
          </div>
        </header>
        <div className="grid lg:grid-cols-3 gap-8 items-start">
          {/* Left Column: Forms */}
          <div className="lg:col-span-1 space-y-8">
            {/* Category Form */}
            <section className="bg-white/80 backdrop-blur-md rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <Layers size={18} className="text-indigo-600" />
                  Nouvelle Catégorie
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="relative">
                  <Tag
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />
                  <input
                    type="text"
                    placeholder="Ex : Sweat, Robe..."
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                  />
                </div>
                <button
                  onClick={addCategory}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-indigo-200"
                >
                  <Plus size={18} />
                  Créer la catégorie
                </button>
              </div>
            </section>

            {/* Clothing Form */}
            <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <Shirt size={18} className="text-indigo-600" />
                  Ajouter un Article
                </h2>
              </div>
              <div className="p-6 space-y-5">
                {/* Name */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700 ml-1">
                    Nom de l'article
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: T-shirt Oversize Bleu"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                {/* Price */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700 ml-1">
                    Prix (Ar)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">
                      Ar
                    </span>
                    <input
                      type="number"
                      min={0}
                      placeholder="0"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value) || 0)}
                    />
                  </div>
                </div>

                {/* Category Select */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700 ml-1">
                    Catégorie
                  </label>
                  <select
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all appearance-none cursor-pointer"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="">Sélectionner une catégorie</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Availability Toggle */}
                <label className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer group transition-all hover:bg-slate-100">
                  <span className="font-semibold text-slate-700">
                    Disponible immédiatement
                  </span>
                  <div className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={disponible}
                      onChange={(e) => setDisponible(e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </div>
                </label>

                {/* Image Upload */}
                <div className="space-y-3">
                  <label className="block">
                    <span className="sr-only">Choisir une image</span>
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-2xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-all">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <ImageIcon className="w-8 h-8 mb-3 text-slate-400" />
                          <p className="mb-2 text-sm text-slate-500">
                            <span className="font-semibold">
                              Cliquez pour uploader
                            </span>
                          </p>
                          <p className="text-xs text-slate-400">
                            PNG, JPG ou WEBP (Max. 10MB)
                          </p>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={(e) =>
                            e.target.files?.length &&
                            setSelectedFile(e.target.files[0])
                          }
                        />
                      </label>
                    </div>
                  </label>

                  <AnimatePresence>
                    {selectedFile && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm"
                      >
                        <img
                          src={URL.createObjectURL(selectedFile)}
                          alt="Aperçu"
                          className="w-full h-40 object-cover"
                        />
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setSelectedFile(null)}
                            className="bg-white/90 text-red-600 p-2 rounded-full shadow-lg"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {loadPubSend ? (
                  <LoadingComment msg="Enregistrement en cours..." />
                ) : (
                  <button
                    onClick={addClothing}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-emerald-100 mt-2"
                  >
                    <Plus size={20} />
                    Ajouter au Stock
                  </button>
                )}
              </div>
            </section>
          </div>

          {/* Right Column: Stock Grid */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">
                Inventaire Actuel
              </h2>
              <div className="flex gap-2">
                {/* Optional filters could go here */}
              </div>
            </div>

            {clothes.length === 0 ? (
              <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2rem] p-20 flex flex-col items-center justify-center text-center space-y-4">
                <div className="bg-slate-50 p-6 rounded-full">
                  <Package size={48} className="text-slate-300" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">
                    Votre stock est vide
                  </h3>
                  <p className="text-slate-500 max-w-xs mx-auto">
                    Commencez par ajouter des catégories et vos premiers
                    articles pour les voir apparaître ici.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {clothes.map((cloth) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={cloth.id}
                    className="group bg-white rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 overflow-hidden flex flex-col"
                  >
                    {/* Image Container */}
                    <div className="relative aspect-[4/5] overflow-hidden bg-slate-100">
                      {cloth.imageUrl ? (
                        <img
                          src={cloth.imageUrl}
                          alt={cloth.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <ImageIcon size={48} />
                        </div>
                      )}

                      {/* Status Badge */}
                      <div className="absolute top-4 left-4">
                        <span
                          className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-1.5 backdrop-blur-md ${
                            cloth.disponible
                              ? "bg-emerald-500/90 text-white"
                              : "bg-slate-800/80 text-white"
                          }`}
                        >
                          {cloth.disponible ? (
                            <CheckCircle2 size={12} />
                          ) : (
                            <XCircle size={12} />
                          )}
                          {cloth.disponible ? "En Stock" : "Épuisé"}
                        </span>
                      </div>

                      {/* Delete Button */}
                      <button
                        onClick={() => deleteClothing(cloth.id!)}
                        className="absolute top-4 right-4 bg-white/90 hover:bg-red-50 text-slate-400 hover:text-red-600 p-2.5 rounded-2xl shadow-sm transition-all opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-4 flex-1 flex flex-col">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-indigo-600 uppercase tracking-widest">
                          <Tag size={10} />
                          {cloth.category}
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 line-clamp-1">
                          {cloth.name}
                        </h3>
                      </div>

                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                            Prix de vente
                          </span>
                          <span className="text-xl font-black text-slate-900">
                            {cloth.price.toLocaleString()}{" "}
                            <span className="text-sm font-medium text-slate-500">
                              Ar
                            </span>
                          </span>
                        </div>

                        <button
                          onClick={() =>
                            updateDisponible(cloth.id!, !cloth.disponible)
                          }
                          className={`p-2.5 rounded-2xl transition-all ${
                            cloth.disponible
                              ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
                              : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                          }`}
                          title={
                            cloth.disponible
                              ? "Marquer comme épuisé"
                              : "Marquer comme disponible"
                          }
                        >
                          <Layers size={20} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Stock;
