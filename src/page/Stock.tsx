import { useEffect, useState } from "react";
import NavBar from "../component/NavBar";
import { Shirt, Plus, Trash2 } from "lucide-react";

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
} from "firebase/firestore";

type Clothing = {
  id?: string;
  name: string;
  price: number;
  quantity: number;
  category: string;
};

type Category = {
  id?: string;
  name: string;
};

const defaultCategories = [
  "T-shirt",
  "Pantalon",
  "Jean",
  "Robe",
  "Pull",
  "Veste",
  "Short",
  "Chaussures",
];

const Stock = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState("");

  const [name, setName] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [quantity, setQuantity] = useState(1);
  const [category, setCategory] = useState("");

  const [clothes, setClothes] = useState<Clothing[]>([]);

  const user = auth.currentUser;

  // Ajouter catégorie
  const addCategory = async () => {
    if (!newCategory || !user) return;

    await addDoc(collection(db, "categories"), {
      name: newCategory,
      userId: user.uid,
    });

    setNewCategory("");
    loadCategories();
  };

  // Charger catégories
  const loadCategories = async () => {
    if (!user) return;

    const q = query(
      collection(db, "categories"),
      where("userId", "==", user.uid),
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

  // Ajouter vêtement
  const addClothing = async () => {
    if (!name || !category || price <= 0 || quantity <= 0 || !user) return;

    await addDoc(collection(db, "stock"), {
      name,
      price,
      quantity,
      category,
      userId: user.uid,
    });

    setName("");
    setPrice(0);
    setQuantity(1);

    loadClothes();
  };

  // Charger vêtements
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

  // supprimer vêtement
  const deleteClothing = async (id: string) => {
    await deleteDoc(doc(db, "stock", id));
    loadClothes();
  };

  // modifier quantité
  const updateQuantity = async (id: string, newQty: number) => {
    if (newQty < 0) return;

    await updateDoc(doc(db, "stock", id), {
      quantity: newQty,
    });

    loadClothes();
  };

  useEffect(() => {
    loadClothes();
    loadCategories();
  }, []);

  return (
    <>
      <NavBar />

      <div className="min-h-screen bg-gray-50 p-6 space-y-8 py-10">
        {/* Ajouter catégorie */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-bold mb-4">Créer une catégorie</h2>

          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Ex : Sweat"
              className="border p-2 rounded w-full"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            />

            <button
              onClick={addCategory}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2"
            >
              <Plus size={18} />
              Ajouter
            </button>
          </div>
        </div>

        {/* Ajouter vêtement */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-bold mb-4">Ajouter un vêtement</h2>

          <div className="grid md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Nom vêtement"
              className="border p-2 rounded"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <input
              type="number"
              placeholder="Prix"
              className="border p-2 rounded"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
            />

            <select
              className="border p-2 rounded"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Choisir catégorie</option>

              {defaultCategories.map((cat) => (
                <option key={cat}>{cat}</option>
              ))}

              {categories.map((cat) => (
                <option key={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* quantité */}
          <div className="flex items-center gap-4 mt-4">
            <span className="font-semibold">Quantité</span>

            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="bg-gray-200 px-3 py-1 rounded-lg"
            >
              -
            </button>

            <span className="font-bold text-lg">{quantity}</span>

            <button
              onClick={() => setQuantity(quantity + 1)}
              className="bg-gray-200 px-3 py-1 rounded-lg"
            >
              +
            </button>
          </div>

          <button
            onClick={addClothing}
            className="mt-4 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2"
          >
            <Shirt size={18} />
            Ajouter vêtement
          </button>
        </div>

        {/* Stock */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-bold mb-4">Stock</h2>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {clothes.map((cloth) => (
              <div
                key={cloth.id}
                className="bg-gray-50 p-4 rounded-xl hover:shadow transition flex flex-col gap-2"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 font-bold text-lg">
                    <Shirt size={20} />
                    {cloth.name}
                  </div>

                  <button
                    onClick={() => deleteClothing(cloth.id!)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <p className="text-gray-500 text-sm">
                  Catégorie : {cloth.category}
                </p>

                <p className="font-bold text-blue-600">{cloth.price} Ar</p>

                <div className="flex items-center gap-3 mt-2">
                  <button
                    onClick={() =>
                      updateQuantity(cloth.id!, cloth.quantity - 1)
                    }
                    className="bg-gray-200 px-3 py-1 rounded-lg"
                  >
                    -
                  </button>

                  <span className="font-bold">{cloth.quantity}</span>

                  <button
                    onClick={() =>
                      updateQuantity(cloth.id!, cloth.quantity + 1)
                    }
                    className="bg-gray-200 px-3 py-1 rounded-lg"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Stock;
