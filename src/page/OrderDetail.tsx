import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  doc,
  getDoc,
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  updateDoc,
  getDocs,
  where,
} from "firebase/firestore";
import { db, auth } from "@/firebase";
import {
  ArrowLeft,
  Send,
  CheckCircle2,
  CreditCard,
  Info,
  MoreVertical,
  Package,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Message {
  id: string;
  senderId: string;
  text: string;
  createdAt: any;
}

const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [showMobileDetails, setShowMobileDetails] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const [Other, setOther] = useState("");
  const [OtherName, setOtherName] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [showDeliverySuccess, setShowDeliverySuccess] = useState(false);
  const [deliveryLoading, setDeliveryLoading] = useState(false);
  const [showArrivalModal, setShowArrivalModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [bodyScan, setBodyScan] = useState<any>(null);
  const [loadingScan, setLoadingScan] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const user = auth.currentUser;

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const cancelOrder = async () => {
    if (!order?.id || !user) return;

    try {
      setCancelLoading(true);

      const orderRef = doc(db, "orders", order.id);

      await updateDoc(orderRef, {
        status: "cancelled",
        updatedAt: serverTimestamp(),
      });

      setOrder({
        ...order,
        status: "cancelled",
      });

      const paymentRef = Math.floor(1000000000 + Math.random() * 9000000000);
      await addDoc(collection(db, "orders", order.id, "messages"), {
        senderId: user.uid,
        text: `La commande a été annulée, ref: ${paymentRef}`,
        createdAt: serverTimestamp(),
      });

      setShowCancelModal(true);
    } catch (err) {
      console.error(err);
    } finally {
      setCancelLoading(false);
      setShowMenu(false);
    }
  };

  const confirmArrival = async () => {
    if (!order?.id || !user) return;

    try {
      const orderRef = doc(db, "orders", order.id);

      await updateDoc(orderRef, {
        status: "arrived",
        updatedAt: serverTimestamp(),
      });

      setOrder({
        ...order,
        status: "arrived",
      });
      const paymentRef = Math.floor(1000000000 + Math.random() * 9000000000);
      await addDoc(collection(db, "orders", order.id, "messages"), {
        senderId: user.uid,
        text: `La commande est bien arrivée, ref: ${paymentRef}`,
        createdAt: serverTimestamp(),
      });
      setShowArrivalModal(true);
    } catch (err) {
      console.error(err);
    }
  };

  const startPayment = () => {
    setShowPaymentModal(true);
  };

  const processPayment = async () => {
    if (!order?.id || !user) return;
    try {
      setPaymentProcessing(true);

      // simulation attente passerelle paiement
      await new Promise((resolve) => setTimeout(resolve, 2500));

      const orderRef = doc(db, "orders", order.id);

      await updateDoc(orderRef, {
        status: "payed",
        updatedAt: serverTimestamp(),
      });

      setOrder({
        ...order,
        status: "payed",
      });

      setPaymentSuccess(true);

      setTimeout(() => {
        setShowPaymentModal(false);
        setPaymentSuccess(false);
      }, 1500);
      const paymentRef = Math.floor(1000000000 + Math.random() * 9000000000);
      await addDoc(collection(db, "orders", order.id, "messages"), {
        senderId: user.uid,
        text: `Le paiement a été effectué, ref: ${paymentRef}`,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setPaymentProcessing(false);
    }
  };

  const completeOrder = async () => {
    if (!order?.id || !user) return;

    try {
      setDeliveryLoading(true);

      const orderRef = doc(db, "orders", order.id);

      await updateDoc(orderRef, {
        status: "finished",
        updatedAt: serverTimestamp(),
      });

      const paymentRef = Math.floor(1000000000 + Math.random() * 9000000000);
      await addDoc(collection(db, "orders", order.id, "messages"), {
        senderId: user.uid,
        text: `La commande est prête pour expédition et en cours d’acheminement, ref: ${paymentRef}`,
        createdAt: serverTimestamp(),
      });

      setOrder({
        ...order,
        status: "finished",
      });

      // ouvrir confirmation flottante
      setShowDeliverySuccess(true);

      // fermer après 2 secondes
      setTimeout(() => {
        setShowDeliverySuccess(false);
      }, 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setDeliveryLoading(false);
    }
  };

  const acceptOrder = async () => {
    if (!order?.id || !user) return;

    try {
      setIsLoading(true);

      const orderRef = doc(db, "orders", order.id);

      await updateDoc(orderRef, {
        status: "accepted",
        updatedAt: serverTimestamp(),
      });

      const paymentRef = Math.floor(1000000000 + Math.random() * 9000000000);
      await addDoc(collection(db, "orders", order.id, "messages"), {
        senderId: user.uid,
        text: `La commande a été accepté, ref: ${paymentRef}`,
        createdAt: serverTimestamp(),
      });

      setOrder({
        ...order,
        status: "accepted",
      });

      setShowSuccessModal(true);
    } catch (error) {
      console.error("Erreur acceptation :", error);
    } finally {
      setIsLoading(false);
    }
  };

  const buttonChoice = (mobile: boolean) => {
    if (!order) return;
    if (order.status == "pending") {
      if (Other == "buyer") {
        return mobile ? (
          <button
            onClick={() => {
              console.log("Accept clicked");
              setShowMobileDetails(false);
              acceptOrder();
            }}
            disabled={isLoading}
            className="flex flex-col items-center gap-2 py-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-colors shadow-sm"
          >
            <div className="w-8 h-8 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-slate-700 uppercase">
              {isLoading ? "..." : "Accepter"}
            </span>
          </button>
        ) : (
          <div className="pt-4 border-t border-slate-100">
            <label className="text-[11px] uppercase font-bold text-slate-400 mb-2 block">
              Actions Vendeur
            </label>
            <button
              onClick={() => {
                console.log("Accept clicked");
                acceptOrder();
              }}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-lg shadow-emerald-200 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4.5 h-4.5" />
              {isLoading ? "..." : "Accepter"}
            </button>
          </div>
        );
      }
    } else if (order.status == "accepted") {
      if (Other == "seller") {
        return mobile ? (
          <button
            onClick={() => {
              console.log("Payment clicked");
              startPayment();
              setShowMobileDetails(false);
            }}
            className="flex flex-col items-center gap-2 py-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-colors shadow-sm"
          >
            <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
              <CreditCard className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-slate-700 uppercase">
              Payer
            </span>
          </button>
        ) : (
          <div>
            <label className="text-[11px] uppercase font-bold text-slate-400 mb-2 block">
              Actions Client
            </label>
            <button
              onClick={() => {
                console.log("Payment clicked");
                startPayment();
              }}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <CreditCard className="w-4.5 h-4.5" />
              Procéder au paiement
            </button>
          </div>
        );
      }
    } else if (order.status == "payed") {
      if (Other == "buyer") {
        return mobile ? (
          <button
            onClick={() => {
              console.log("Deliver clicked");
              completeOrder();
              setShowMobileDetails(false);
            }}
            className="flex flex-col items-center gap-2 py-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-colors shadow-sm"
          >
            <div className="w-8 h-8 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>

            <span className="text-[10px] font-bold text-slate-700 uppercase">
              Terminer
            </span>
          </button>
        ) : (
          <div>
            <label className="text-[11px] uppercase font-bold text-slate-400 mb-2 block">
              Actions Vendeur
            </label>

            <button
              onClick={() => {
                console.log("Deliver clicked");
                completeOrder();
              }}
              disabled={deliveryLoading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-lg shadow-emerald-200 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4.5 h-4.5" />
              Livrer la commande
            </button>
          </div>
        );
      }
    } else if (order.status == "finished") {
      if (Other == "seller") {
        return mobile ? (
          <button
            onClick={() => {
              console.log("Confirm delivery clicked");
              confirmArrival();
              setShowMobileDetails(false);
            }}
            className="flex flex-col items-center gap-2 py-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-colors shadow-sm"
          >
            <div className="w-8 h-8 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            bold
            <span className="text-[10px] font- text-slate-700 uppercase">
              RECU
            </span>
          </button>
        ) : (
          <div>
            <label className="text-[11px] uppercase font-bold text-slate-400 mb-2 block">
              Réception
            </label>

            <button
              onClick={() => {
                console.log("Confirm delivery clicked");
                confirmArrival();
              }}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-lg shadow-emerald-200 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4.5 h-4.5" />
              Confirmer la réception
            </button>
          </div>
        );
      }
    }
    return null;
  };

  const fetchBodyScan = async () => {
    const user = auth.currentUser;

    if (!user) return;

    try {
      const q = query(
        collection(db, "body_scans"),
        where("userId", "==", order.buyerId),
      );

      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        // on prend le premier scan
        const docData = snapshot.docs[0].data();
        setBodyScan(docData);
      } else {
        setBodyScan(null);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoadingScan(false);
    }
  };

  const fetchUserData = async () => {
    const user = auth.currentUser;

    if (!user || !order) return;
    try {
      let otherUserId = "";
      if (user.uid === order.sellerId) {
        otherUserId = order.buyerId;
        setOther("buyer");
      } else {
        otherUserId = order.sellerId;
        setOther("seller");
      }
      const docRef = doc(db, "users", otherUserId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setOtherName(data.username);
      }
    } catch (error) {
      console.error("Erreur fetch user:", error);
    }
  };

  useEffect(() => {
    if (!order) return;
    fetchBodyScan();
    fetchUserData();
  }, [order]);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) return;
      const docRef = doc(db, "orders", id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        setOrder({ id: snap.id, ...snap.data() });
      }
    };
    fetchOrder();
  }, [id]);

  // 🔥 2. Messages realtime
  useEffect(() => {
    if (!id) return;

    const q = query(
      collection(db, "orders", id, "messages"),
      orderBy("createdAt"),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Message[];

      setMessages(list);

      // auto scroll 🔥
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    });

    return () => unsubscribe();
  }, [id]);

  // 🔥 3. envoyer message
  const sendMessage = async () => {
    if (!input.trim() || !user || !id) return;

    await addDoc(collection(db, "orders", id, "messages"), {
      senderId: user.uid,
      text: input,
      createdAt: serverTimestamp(),
    });

    setInput("");
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 text-slate-900 font-sans overflow-hidden">
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-[90%] max-w-sm shadow-xl text-center animate-in zoom-in-95">
            {/* Icon */}
            <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center rounded-full bg-green-100 text-green-600 text-xl">
              ✓
            </div>

            <h2 className="text-lg font-semibold mb-2">Commande acceptée</h2>

            <p className="text-sm text-gray-500 mb-4">
              Vous avez accepté cette commande avec succès.
            </p>

            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
            >
              OK
            </button>
          </div>
        </div>
      )}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-3xl p-6 w-[380px] shadow-2xl">
            {!paymentSuccess ? (
              <>
                <h3 className="text-lg font-bold mb-5">Paiement sécurisé</h3>

                {/* Faux visuel carte */}
                <div className="rounded-2xl p-5 mb-5 bg-gradient-to-r from-slate-800 to-slate-700 text-white shadow-xl">
                  <p className="text-xs opacity-70 mb-3">Carte bancaire</p>

                  <input
                    type="text"
                    maxLength={19}
                    placeholder="1234 5678 9012 3456"
                    className="w-full bg-transparent border border-slate-500 rounded-lg px-3 py-2 text-sm outline-none mb-4"
                  />

                  <input
                    type="text"
                    placeholder="Nom du titulaire"
                    className="w-full bg-transparent border border-slate-500 rounded-lg px-3 py-2 text-sm outline-none mb-4"
                  />

                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="MM/YY"
                      className="flex-1 bg-transparent border border-slate-500 rounded-lg px-3 py-2 text-sm outline-none"
                    />

                    <input
                      type="password"
                      maxLength={3}
                      placeholder="CVV"
                      className="w-20 bg-transparent border border-slate-500 rounded-lg px-3 py-2 text-sm outline-none"
                    />
                  </div>
                </div>

                <p className="text-sm text-slate-500 mb-5">
                  Montant : {order?.total || "25 000 Ar"}
                </p>

                <button
                  disabled={paymentProcessing}
                  onClick={processPayment}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold"
                >
                  {paymentProcessing ? "Traitement..." : "Payer maintenant"}
                </button>
              </>
            ) : (
              <div className="text-center py-4">
                <CheckCircle2 className="mx-auto mb-3 w-12 h-12" />
                <p className="font-semibold">Paiement effectué avec succès</p>
              </div>
            )}
          </div>
        </div>
      )}
      {showDeliverySuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-3xl p-7 shadow-2xl w-[360px] text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 mx-auto flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>

            <h3 className="text-lg font-bold mb-2">Livraison terminée</h3>

            <p className="text-sm text-slate-500">
              La commande a été marquée comme livrée avec succès.
            </p>
          </div>
        </div>
      )}
      {showArrivalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-3xl p-6 w-[360px] shadow-2xl text-center">
            <div className="text-5xl mb-3">🎉</div>

            <h3 className="text-lg font-bold mb-2">
              Merci pour votre confiance
            </h3>

            <p className="text-sm text-slate-500 mb-5">
              Votre commande a été reçue avec succès
            </p>

            {/* Rating stars (UI only) */}
            <div className="flex justify-center gap-2 mb-5 text-2xl">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={`transition ${
                    star <= rating ? "text-yellow-400" : "text-slate-300"
                  }`}
                >
                  ★
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowArrivalModal(false)}
              className="w-full py-3 bg-slate-900 text-white rounded-xl"
            >
              Terminer
            </button>
          </div>
        </div>
      )}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-3xl p-6 w-[360px] shadow-2xl text-center">
            <div className="text-5xl mb-3">⚠️</div>

            <h3 className="text-lg font-bold mb-2">Commande annulée</h3>

            <p className="text-sm text-slate-500 mb-5">
              Votre commande a été annulée avec succès.
            </p>

            <button
              onClick={() => setShowCancelModal(false)}
              className="w-full py-3 bg-slate-900 text-white rounded-xl"
            >
              OK
            </button>
          </div>
        </div>
      )}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="w-[92%] max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 space-y-5 animate-fadeIn">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">
                {Other == "buyer" ? "Client body Profile" : "Your Body Profile"}
              </h2>

              {bodyScan && (
                <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-600 text-xs font-semibold">
                  {bodyScan.size}
                </span>
              )}
            </div>

            {/* Content */}
            {loadingScan ? (
              <div className="space-y-3">
                <div className="h-3 w-32 bg-slate-200 rounded animate-pulse"></div>
                <div className="h-3 w-24 bg-slate-200 rounded animate-pulse"></div>
              </div>
            ) : bodyScan ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-2xl p-4 shadow-sm">
                  <p className="text-xs text-slate-400">Shoulder</p>
                  <p className="text-lg font-bold text-slate-800">
                    {bodyScan.metrics.shoulder.toFixed(1)} cm
                  </p>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 shadow-sm">
                  <p className="text-xs text-slate-400">Arm</p>
                  <p className="text-lg font-bold text-slate-800">
                    {bodyScan.metrics.arm.toFixed(1)} cm
                  </p>
                </div>

                <div className="col-span-2 bg-indigo-50 rounded-2xl p-4 shadow-sm">
                  <p className="text-xs text-slate-400">Height</p>
                  <p className="text-xl font-bold text-indigo-600">
                    {bodyScan.metrics.height.toFixed(1)} cm
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-sm text-slate-500">No body scan found</p>

                <p className="text-xs text-slate-400 mt-1">
                  Run a scan to generate your profile
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowProfileModal(false)}
                className="flex-1 py-3 rounded-2xl bg-slate-900 text-white font-semibold hover:bg-slate-800"
              >
                ok
              </button>
            </div>
          </div>
        </div>
      )}
      {/* LEFT SIDE: ORDER INFORMATION & ACTIONS */}
      <aside className="hidden md:flex w-[380px] bg-white border-r border-slate-200 flex-col shrink-0">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 cursor-pointer hover:bg-slate-200 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-800">
                Détails de l'ordre
              </h1>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <h3 className="font-semibold text-slate-700">
                {order?.productName || "Article en attente..."}
              </h3>
              <div className="flex justify-between items-center mt-1">
                <span className="text-lg font-bold text-blue-600">
                  {order?.price || "0"} Ar
                </span>
                <span className="px-2 py-1 bg-amber-100 text-amber-700 text-[10px] font-bold rounded uppercase">
                  {order?.status || "En attente"}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">
                  {Other === "buyer" ? "Acheteur" : "Vendeur"}
                </span>
                <span className="font-medium">
                  {OtherName || "Rakoto Fenosoa"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Date</span>
                <span className="font-medium">
                  {order?.createdAt?.toDate
                    ? order.createdAt.toDate().toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : "..."}
                </span>
              </div>
              <span className="font-medium">
                {order?.delivery ?? "Non spécifié"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1 p-6 space-y-4 overflow-y-auto">
          {buttonChoice(false)}
        </div>

        <div className="p-6 text-center">
          <p className="text-xs text-slate-400">
            Besoin d'aide ?{" "}
            <span className="text-blue-600 cursor-pointer hover:underline">
              Support client
            </span>
          </p>
        </div>
      </aside>

      {/* RIGHT SIDE: DISCUSSION AREA */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Header - Fixed to top */}
        <header className="h-16 bg-white border-b border-slate-200 px-4 md:px-6 flex items-center justify-between shrink-0 z-30">
          <div className="flex items-center gap-3">
            {/* Back button on mobile */}
            <button
              onClick={() => navigate(-1)}
              className="md:hidden w-8 h-8 bg-slate-50 rounded-full flex items-center justify-center text-slate-500"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="relative">
              <div className="w-9 h-9 md:w-10 md:h-10 bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-600 text-sm md:text-base">
                {order?.sellerName?.slice(0, 2).toUpperCase() || "RF"}
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-800 line-clamp-1">
                {OtherName || "Rakoto Fenosoa"}
              </h4>
              <p className="text-[10px] text-emerald-600 font-medium">
                En ligne maintenant
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Info toggle for mobile */}
            <button
              onClick={() => setShowMobileDetails(!showMobileDetails)}
              className={`md:hidden flex items-center justify-center w-9 h-9 rounded-xl transition-all ${showMobileDetails ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "bg-slate-100 text-slate-500"}`}
            >
              {showMobileDetails ? (
                <X className="w-4 h-4" />
              ) : (
                <Info className="w-4 h-4" />
              )}
            </button>
            <div className="relative">
              <button
                onClick={() => setShowMenu((prev) => !prev)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
              >
                <MoreVertical className="w-5 h-5" />
              </button>

              {showMenu && (
                <div className="absolute top-full right-0 mt-2 w-44 bg-white border border-slate-100 shadow-lg rounded-xl overflow-hidden z-50">
                  {order?.status === "pending" && (
                    <button
                      disabled={cancelLoading}
                      className="w-full text-left px-4 py-3 hover:bg-slate-50 text-sm text-red-500 disabled:opacity-50"
                      onClick={cancelOrder}
                    >
                      {cancelLoading ? "Annulation..." : "Annuler la commande"}
                    </button>
                  )}
                  <button
                    className="w-full text-left px-4 py-3 hover:bg-slate-50 text-sm"
                    onClick={() => setShowProfileModal(true)}
                  >
                    Infos mesure
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Mobile Details Overlay/Accordion */}
        <AnimatePresence>
          {showMobileDetails && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden bg-white border-b border-slate-200 z-20 shadow-xl shadow-slate-200/50 overflow-hidden"
            >
              <div className="p-5 space-y-5">
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">
                        Article
                      </p>
                      <h3 className="font-bold text-slate-800">
                        {order?.productName || "Article en attente..."}
                      </h3>
                    </div>
                    <span className="px-2 py-1 bg-amber-100 text-amber-700 text-[10px] font-bold rounded uppercase">
                      {order?.status || "En attente"}
                    </span>
                  </div>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-xl font-bold text-blue-600">
                      {order?.price || "0"}
                    </span>
                    <span className="text-sm font-bold text-blue-600">Ar</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 px-1">
                  {buttonChoice(true)}
                </div>

                <div className="p-3 bg-slate-50 rounded-xl flex items-center gap-3">
                  <div className="w-8 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center">
                    <Package className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight leading-none mb-1">
                      Livraison prévue à
                    </p>
                    <p className="text-xs font-bold text-slate-700 leading-none">
                      {order?.delivery ?? "Non spécifié"}
                    </p>
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight leading-none mb-1">
                      Commande créé le
                    </p>
                    <p className="text-xs font-bold text-slate-700 leading-none">
                      {order?.createdAt?.toDate
                        ? order.createdAt.toDate().toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })
                        : "..."}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <section className="flex-1 p-4 md:p-6 space-y-6 overflow-y-auto bg-slate-50 relative">
          {/* Subtle pattern overlay */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none" />

          <div className="space-y-6 relative z-10">
            {messages.map((msg) => {
              const isMe = msg.senderId === user?.uid;

              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${isMe ? "justify-end" : "justify-start gap-3"}`}
                >
                  {!isMe && (
                    <div className="w-8 h-8 bg-slate-200 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold text-slate-600">
                      RF
                    </div>
                  )}
                  <div
                    className={`px-4 py-3 rounded-2xl max-w-[80%] shadow-sm
                      ${
                        isMe
                          ? "bg-blue-600 text-white rounded-tr-none shadow-md shadow-blue-100"
                          : "bg-white border border-slate-200 text-slate-700 rounded-tl-none"
                      }`}
                  >
                    <p className="text-sm">{msg.text}</p>
                    <p
                      className={`text-[10px] mt-2 text-right font-medium ${isMe ? "text-blue-200" : "text-slate-400"}`}
                    >
                      {msg.createdAt?.toDate
                        ? msg.createdAt.toDate().toLocaleString("fr-FR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "..."}
                      {isMe && " • Lu"}
                    </p>
                  </div>
                </motion.div>
              );
            })}
            <div ref={bottomRef} className="h-2" />
          </div>
        </section>

        <footer className="p-6 bg-white border-t border-slate-200 shrink-0">
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Écrire un message..."
                className="w-full bg-slate-50 border border-slate-200 rounded-full px-6 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all font-medium"
              />
            </div>
            <button
              onClick={sendMessage}
              disabled={!input.trim()}
              className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg transition-all active:scale-90
                ${
                  input.trim()
                    ? "bg-blue-600 shadow-blue-200 hover:bg-blue-700"
                    : "bg-slate-200 shadow-none cursor-not-allowed text-slate-400"
                }`}
            >
              <Send className="w-5 h-5 transform rotate-45 -translate-y-0.5 translate-x-0.5" />
            </button>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default OrderDetail;
