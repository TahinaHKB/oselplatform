import React, { useEffect, useState } from "react";
import NavBar from "../component/NavBar";
import { motion } from "framer-motion";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import Loading from "@/component/Loading";

type Clothing = {
  id: string;
  name: string;
  price: number;
  category: string;
  userId: string;
};

type User = {
  id: string;
  username: string;
};

const categories = [
  "Tous",
  "T-shirt",
  "Jean",
  "Pull",
  "Chaussures",
  "Veste",
  "Robe",
  "Short",
];

const Naviguer: React.FC = () => {
  const [products, setProducts] = useState<Clothing[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const [loading, setLoading] = useState(true);

  // Charger tous les produits
  const fetchProducts = async () => {
    const productsRef = collection(db, "stock");
    const productsSnap = await getDocs(productsRef);
    const productsList: Clothing[] = productsSnap.docs.map((doc) => {
      const data = doc.data() as Omit<Clothing, "id">;
      return {
        id: doc.id,
        ...data,
      };
    });
    setProducts(productsList);
  };

  const fetchUsers = async () => {
    const usersRef = collection(db, "users");
    const usersSnap = await getDocs(usersRef);
    const usersList: User[] = usersSnap.docs.map((doc) => {
      const data = doc.data() as Omit<User, "id">;
      return {
        id: doc.id,
        ...data,
      };
    });
    setUsers(usersList);
  };

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchProducts(), fetchUsers()]);
      setLoading(false);
    };
    loadData();
  }, []);

  const filteredProducts =
    selectedCategory === "Tous"
      ? products
      : products.filter((p) => p.category === selectedCategory);

  if (loading)
    return <Loading />;

  // Fonction pour obtenir le nom du vendeur
  const getSellerName = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    return user ? user.username : "Inconnu";
  };

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-blue-50 pt-[70px] px-4 md:px-10 pb-10 flex flex-col gap-8">
        <h1 className="text-3xl font-bold text-center text-purple-700">
          Produits Disponibles
        </h1>

        {/* Filtre catégorie */}
        <div className="flex justify-center mb-6">
          <select
            className="px-4 py-2 rounded-xl border focus:ring-2 focus:ring-purple-400 outline-none"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Grille des produits */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <motion.div
              key={product.id}
              whileHover={{ scale: 1.03 }}
              className="bg-white rounded-2xl shadow-lg p-4 flex flex-col justify-between hover:shadow-xl transition"
            >
              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-bold text-purple-700">
                  {product.name}
                </h3>
                <p className="text-gray-600">
                  Vendeur : {getSellerName(product.userId)}
                </p>
                <p className="text-blue-600 font-semibold text-xl">
                  {product.price} Ar
                </p>
                <p className="text-sm text-gray-500">
                  Catégorie : {product.category}
                </p>
              </div>

              <button className="mt-4 bg-gradient-to-r from-green-400 to-blue-500 text-white py-2 rounded-xl hover:from-green-500 hover:to-blue-600 transition font-semibold">
                Acheter
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Naviguer;
