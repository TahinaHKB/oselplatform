import React, { useEffect, useState } from "react";
import NavBar from "../component/NavBar";
import { motion } from "motion/react";
import { db } from "../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import Loading from "../component/Loading";
import {
  ShoppingCart,
  Tag,
  User as UserIcon,
  Search,
  ShoppingBag,
} from "lucide-react";
import type { Category, Clothing, User } from "@/data/datyType";
import ConfirmOrder from "@/component/ConfirmOrder";

const Navig: React.FC = () => {
  const [products, setProducts] = useState<Clothing[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [newCategory, setNewCategory] = useState<Category[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Clothing | null>(null);
  const [showModal, setShowModal] = useState(false);

  const loadCategories = async () => {
    const q = query(collection(db, "categories"));
    const querySnapshot = await getDocs(q);
    const list: Category[] = [];
    querySnapshot.forEach((docu) => {
      list.push({
        id: docu.id,
        ...(docu.data() as Category),
      });
    });
    setNewCategory(list);
  };

  // Charger tous les produits
  const fetchProducts = async () => {
    try {
      const productsRef = collection(db, "stock");
      const q = query(productsRef, where("disponible", "==", true));
      const productsSnap = await getDocs(q);

      const productsList: Clothing[] = productsSnap.docs.map((doc) => {
        const data = doc.data() as Omit<Clothing, "id">;
        return {
          id: doc.id,
          ...data,
        };
      });

      setProducts(productsList);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const fetchUsers = async () => {
    try {
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
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchProducts(), fetchUsers(), loadCategories()]);
      setLoading(false);
    };
    loadData();
  }, []);

  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      selectedCategory === "Tous" || p.category === selectedCategory;
    const matchesSearch = p.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) return <Loading />;

  // Fonction pour obtenir le nom du vendeur
  const getSellerName = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    return user ? user.username : "Inconnu";
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#1A1A1A] font-sans">
      <NavBar />

      <main className="pt-[100px] pb-20 px-6 md:px-12 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-gray-400 mb-2">
              <Tag className="w-3 h-3" />
              <span>Catalogue</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Découvrez notre{" "}
              <span className="text-gray-400 italic font-serif">
                Collection
              </span>
            </h1>
          </div>

          <p className="text-gray-500 max-w-xs text-sm leading-relaxed">
            Une sélection curatée des meilleures pièces de notre communauté.
            Qualité et style garantis.
          </p>
        </div>

        {/* Search and Filters Section */}
        <div className="flex flex-col gap-8 mb-12">
          {/* Search Bar */}
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un article..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-300 transition-all shadow-sm"
            />
          </div>

          <div className="flex flex-col gap-6">
            {/* Category Filter - Horizontal Scroll */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3 ml-1">
                Catégories
              </p>
              <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
                {newCategory.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap border ${
                      selectedCategory === cat.name
                        ? "bg-black text-white border-black shadow-lg shadow-black/10"
                        : "bg-white text-gray-600 border-gray-100 hover:border-gray-300"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Filter */}
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12">
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group cursor-pointer"
              >
                {/* Image Container */}
                <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-gray-100 mb-4">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />

                  {/* Overlay on Hover */}
                  <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Category & Color Badges */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm">
                      {product.category}
                    </span>
                  </div>

                  {/* Quick Buy Button (Desktop) */}
                  <div className="absolute bottom-4 left-4 right-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    <button
                      onClick={() => {
                        setSelectedProduct(product);
                        setShowModal(true);
                      }}
                      className="w-full bg-white text-black py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-xl hover:bg-black hover:text-white transition-colors"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Commander maintenant
                    </button>
                  </div>
                </div>

                {/* Info Container */}
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-lg leading-tight group-hover:text-gray-600 transition-colors">
                      {product.name}
                    </h3>
                    <p className="font-bold text-lg">
                      {product.price.toLocaleString()}{" "}
                      <span className="text-[10px] uppercase ml-0.5">Ar</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-gray-400">
                    <UserIcon className="w-3 h-3" />
                    <span className="text-xs font-medium">
                      Par {getSellerName(product.userId)}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 mb-4">
              <Search className="w-6 h-6 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold mb-2">Aucun produit trouvé</h3>
            <p className="text-gray-500">
              Essayez une autre catégorie ou revenez plus tard.
            </p>
          </div>
        )}

        {showModal && selectedProduct && (
          <ConfirmOrder
            selectedProduct={selectedProduct}
            setShowModal={setShowModal}
            getSellerName={getSellerName}
          />
        )}
      </main>

      {/* Footer Decoration */}
      <footer className="border-t border-gray-100 py-12 px-6 md:px-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 opacity-30">
            <div className="w-6 h-6 bg-black rounded flex items-center justify-center">
              <ShoppingBag className="text-white w-3 h-3" />
            </div>
            <span className="font-bold text-sm tracking-tight">OSEL</span>
          </div>
          <p className="text-xs text-gray-400 font-medium uppercase tracking-widest">
            © 2026 OSEL/HKB. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Navig;
