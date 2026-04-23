import type { Clothing } from "@/data/datyType";
import { useEffect, useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db, auth } from "@/firebase"; 
import { useNavigate } from "react-router-dom";

interface RequestProps {
  selectedProduct: Clothing;
  setShowModal: (arg: boolean) => void;
  getSellerName: (arg: string) => string;
}

const ConfirmOrder: React.FC<RequestProps> = ({
  selectedProduct,
  setShowModal,
  getSellerName,
}) => {
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const [delivery, setDelivery] = useState("");

  // 🔒 Bloquer le scroll arrière
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const handleConfirmOrder = async () => {
    try {
      if (!auth.currentUser) return;

      const user = auth.currentUser;

      // 🔥 1. Créer la commande
      const orderRef = await addDoc(collection(db, "orders"), {
        buyerId: user.uid,
        sellerId: selectedProduct.userId,
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        price: selectedProduct.price,
        status: "pending",
        delivery: delivery,
        createdAt: serverTimestamp(),
      });

      // 🔥 2. Ajouter message SEULEMENT si existe
      if (message.trim() !== "") {
        await addDoc(collection(db, "orders", orderRef.id, "messages"), {
          senderId: user.uid,
          text: message,
          createdAt: serverTimestamp(),
        });
      }
      // 🔥 UX
      setShowModal(false);
      setMessage("");
      setDelivery("");

      // 👉 OPTION PRO : redirection
      navigate(`/orders/${orderRef.id}`);
    } catch (error) {
      console.error("Erreur création commande :", error);
    }
  };

  return (
    <div
      onClick={() => setShowModal(false)}
      className="fixed inset-0 z-50 flex items-center justify-center 
                 bg-black/60 backdrop-blur-sm
                 animate-in fade-in duration-200"
    >
      {/* Box */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-[95%] max-w-lg bg-white rounded-3xl shadow-2xl p-6
                   transform transition-all duration-300
                   scale-95 animate-in zoom-in-95 fade-in"
      >
        {/* Close */}
        <button
          onClick={() => setShowModal(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-black transition"
        >
          ✕
        </button>

        {/* Header */}
        <h2 className="text-2xl font-semibold mb-5">Confirmer la commande</h2>

        {/* Card produit */}
        <div className="bg-gray-50 rounded-xl p-4 mb-5 space-y-2">
          <p className="text-sm text-gray-500">Produit</p>
          <p className="font-medium text-lg">{selectedProduct.name}</p>

          <div className="flex justify-between text-sm text-gray-600 mt-2">
            <span>{getSellerName(selectedProduct.userId)}</span>
            <span className="font-semibold text-black">
              {selectedProduct.price} Ar
            </span>
          </div>
        </div>

        {/* Message */}
        <div className="mb-5">
          <label className="text-sm text-gray-600 mb-1 block">
            Message (optionnel)
          </label>
          <textarea
            placeholder="Ex: Livraison rapide si possible..."
            className="w-full border border-gray-200 focus:border-blue-500 
                       focus:ring-2 focus:ring-blue-100 outline-none 
                       rounded-xl p-3 resize-none transition"
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>

        {/* Delivery */}
        <div className="mb-5">
          <label className="text-sm text-gray-600 mb-1 block">
            Lieu de livraison
          </label>

          <input
            type="text"
            placeholder="Ex: Antananarivo, Analakely..."
            className="w-full border border-gray-200 focus:border-blue-500 
               focus:ring-2 focus:ring-blue-100 outline-none 
               rounded-xl p-3 transition"
            value={delivery}
            onChange={(e) => setDelivery(e.target.value)}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => setShowModal(false)}
            className="w-1/2 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 transition"
          >
            Annuler
          </button>

          <button
            onClick={handleConfirmOrder}
            className="w-1/2 py-3 rounded-xl bg-blue-600 text-white 
                       hover:bg-blue-700 transition font-medium shadow-md"
          >
            Confirmer
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmOrder;
