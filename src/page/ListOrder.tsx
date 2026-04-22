import { useEffect, useState, useMemo } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  doc,
  getDoc,
} from "firebase/firestore";
import { db, auth } from "@/firebase";
import { useNavigate } from "react-router-dom";
import NavBar from "@/component/NavBar";
import { Search, Package, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Order {
  id: string;
  productName: string;
  price: number;
  status: "pending" | "accepted" | "payed" | "finished" | "arrived" | "cancelled";
  createdAt: any;
}

const ListCommand = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [viewStat, setViewStat] = useState("client");
  const [buyerOrdersList, setbuyerOrdersList] = useState<Order[]>([]);
  const [sellerOrdersList, setSellerOrdersList] = useState<Order[]>([]);
  const [type_account, setType_account] = useState("");
  const user = auth.currentUser;

  const changeStat = () => {
    if (viewStat === "vendeur") {
      setViewStat("client");
      setOrders(buyerOrdersList);
    } else {
      if (type_account.includes("vendeur")) {
        setViewStat("vendeur");
        setOrders(sellerOrdersList);
      }
    }
  };

  const getType_account = async () => {
    if (!user) return;

    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      setType_account(data.type_account);
    }
  };

  useEffect(() => {
    if (!user) {
      setError("Veuillez vous connecter pour voir vos commandes.");
      setIsLoading(false);
      return;
    }

    getType_account();

    const qBuyer = query(
      collection(db, "orders"),
      where("buyerId", "==", user.uid),
      orderBy("createdAt", "desc"),
    );

    const qSeller = query(
      collection(db, "orders"),
      where("sellerId", "==", user.uid),
      orderBy("createdAt", "desc"),
    );

    const unsubBuyer = onSnapshot(qBuyer, (snapshot) => {
      const buyerData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Order, "id">),
      }));

      setbuyerOrdersList(buyerData);

      // 🔥 update UI direct selon mode
      if (viewStat === "client") {
        setOrders(buyerData);
      }

      setIsLoading(false);
    });

    const unsubSeller = onSnapshot(qSeller, (snapshot) => {
      const sellerData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Order, "id">),
      }));

      setSellerOrdersList(sellerData);

      if (viewStat === "vendeur") {
        setOrders(sellerData);
      }
    });

    return () => {
      unsubBuyer();
      unsubSeller();
    };
  }, [user, viewStat]);

  const filteredOrders = useMemo(() => {
    return orders.filter(
      (order) =>
        order.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.id.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [orders, searchQuery]);

  const getStatusBadge = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100">
            En attente
          </span>
        );

      case "accepted":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
            Acceptée
          </span>
        );

      case "payed":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
            Payée
          </span>
        );

      case "finished":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100">
            En livraison
          </span>
        );

      case "arrived":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
            Arrivée
          </span>
        );

      case "cancelled":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-100">
            Annulée
          </span>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#111827] font-sans flex flex-col">
      <NavBar />

      <main className="flex-1 p-10 flex flex-col py-20 gap-8 max-w-5xl mx-auto w-full">
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Mes commandes
            </h1>
            <p className="text-gray-500 mt-1">
              Gérez et suivez l'historique de vos achats récents.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm font-semibold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-full border border-indigo-100 shadow-sm">
            <button onClick={changeStat}>
              {viewStat == "client" ? "ACHAT" : "VENTE"}
            </button>
          </div>
          <div className="relative w-full md:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Rechercher une commande..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-center gap-3 text-red-800">
            <AlertCircle className="w-5 h-5" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Orders List Container */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          {/* Header Row */}
          <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-400 uppercase tracking-wider">
            <div className="col-span-5">Produit</div>
            <div className="col-span-2">Statut</div>
            <div className="col-span-3">Date</div>
            <div className="col-span-2 text-right">Prix total</div>
          </div>

          <div className="divide-y divide-gray-100">
            {isLoading ? (
              [1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="grid grid-cols-12 gap-4 px-6 py-6 animate-pulse"
                >
                  <div className="col-span-5 h-8 bg-gray-100 rounded" />
                  <div className="col-span-2 h-8 bg-gray-100 rounded" />
                  <div className="col-span-3 h-8 bg-gray-100 rounded" />
                  <div className="col-span-2 h-8 bg-gray-100 rounded" />
                </div>
              ))
            ) : filteredOrders.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="font-medium">Aucune commande trouvée</p>
                <p className="text-sm">
                  Essayez d'ajuster vos critères de recherche.
                </p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {filteredOrders.map((order) => (
                  <motion.div
                    key={order.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => navigate(`/orders/${order.id}`)}
                    className="grid grid-cols-12 gap-4 px-6 py-5 items-center hover:bg-gray-50 transition-colors cursor-pointer group"
                  >
                    <div className="col-span-5 flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200 text-gray-400 font-mono text-xs overflow-hidden">
                        <Package className="w-5 h-5 opacity-40 shadow-sm" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {order.productName}
                        </p>
                      </div>
                    </div>
                    <div className="col-span-2">
                      {getStatusBadge(order.status)}
                    </div>
                    <div className="col-span-3 text-sm text-gray-500 font-medium">
                      {order.createdAt?.toDate().toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </div>
                    <div className="col-span-2 text-right font-bold text-gray-900 italic">
                      {order.price.toLocaleString()} Ar
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>

          {/* Footer Control */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
            <p className="text-xs text-gray-400 font-medium">
              Affichage de {filteredOrders.length} sur {orders.length} commandes
            </p>
            <div className="flex gap-2">
              <button
                disabled
                className="px-3 py-1 border border-gray-200 bg-white rounded-md text-xs font-semibold hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                Précédent
              </button>
              <button className="px-3 py-1 border border-gray-200 bg-white rounded-md text-xs font-semibold hover:bg-gray-100 cursor-pointer transition-colors">
                Suivant
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ListCommand;
