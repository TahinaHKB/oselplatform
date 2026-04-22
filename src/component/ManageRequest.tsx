import { useEffect, useState } from "react";
import {
  CheckCircle,
  Clock,
  Image as ImageIcon,
  Search,
  Filter,
  MoreVertical,
  Menu,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { auth, db } from "@/firebase";
import Loading from "@/component/Loading";
import { useNavigate } from "react-router-dom";

interface Request {
  id: string;
  person: string;
  personUid: string;
  avatar: string;
  desire: string;
  imageUrl: string;
  etat: "pending" | "approved" | "refused";
  createdAt: string;
  approvedAt?: string;
  approvedBy?: string;
  refusedAt?: string;
  refusedBy?: string;
}

// Définition des props avec une interface TypeScript
interface RequestProps {
  setSidebarOpen: (arg0: boolean) => void;
}

// Composant fonctionnel typé
const ManageRequest: React.FC<RequestProps> = ({ setSidebarOpen }) => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [activeTab, setActiveTab] = useState<
    "pending" | "approved" | "refused"
  >("pending");
  const [loading, setLoading] = useState(true);
  const user = auth.currentUser;

  const handleRefuse = async (id: string) => {
    if (!user) return;

    try {
      const requestRef = doc(db, "apply", id);

      await updateDoc(requestRef, {
        etat: "refused",
        refusedAt: new Date().toLocaleString(),
        refusedBy: user.uid,
      });

      setRequests((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                etat: "refused",
                approvedBy: "vous",
                approvedAt: new Date().toLocaleString(),
              }
            : r,
        ),
      );
    } catch (error) {
      console.error("Error updating request:", error);
    }
  };

  const handleApprove = async (id: string) => {
    if (!user) return;

    try {
      const req = requests.find((u) => u.id === id);

      if (!req || !req.personUid) {
        console.error("Request or user UID not found");
        return;
      }

      const userRef = doc(db, "users", req.personUid);
      const requestRef = doc(db, "apply", id);

      await updateDoc(userRef, {
        type_account: "client vendeur",
      });

      await updateDoc(requestRef, {
        etat: "approved",
        approvedAt: new Date().toLocaleString(),
        approvedBy: user.uid,
      });

      setRequests((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                etat: "approved",
                approvedBy: "vous",
                approvedAt: new Date().toLocaleString(),
              }
            : r,
        ),
      );
    } catch (error) {
      console.error("Error updating request:", error);
    }
  };

  const filteredRequests = requests.filter((req) => req.etat === activeTab);

  async function getUserInfo(uid: string) {
    try {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();

        return {
          avatar: data.profilePic || "",
          username: data.username || "Unknown",
        };
      } else {
        console.log("User not found");
        return {
          avatar: "",
          username: "Unknown",
        };
      }
    } catch (error) {
      return {
        avatar: "",
        username: "Error",
      };
    }
  }

  const [cache] = useState<
    Record<string, { avatar: string; username: string }>
  >({});
  const [cache2] = useState<Record<string, { username: string }>>({});
  const [cache3] = useState<Record<string, { username: string }>>({});

  const fetchProducts = async () => {
    try {
      const requestRef = collection(db, "apply");
      const requestSnap = await getDocs(requestRef);

      const requestList: Request[] = await Promise.all(
        requestSnap.docs.map(async (docItem) => {
          const data = docItem.data() as any;

          if (!cache[data.person]) {
            cache[data.person] = (await getUserInfo(data.person)) || "";
          }

          if (!cache2[data.approvedBy]) {
            cache2[data.approvedBy] =
              (await getUserInfo(data.approvedBy)) || "";
          }

          if (!cache3[data.refusedBy]) {
            cache3[data.refusedBy] = (await getUserInfo(data.refusedBy)) || "";
          }

          return {
            id: docItem.id,
            ...data,
            personUid: data.person,
            avatar: cache[data.person].avatar,
            person: cache[data.person].username,
            approvedBy: cache2[data.approvedBy].username,
            refusedBy: cache3[data.refusedBy].username,
            createdAt: data.createdAt?.seconds
              ? new Date(data.createdAt.seconds * 1000).toLocaleString()
              : "",
          };
        }),
      );

      setRequests(requestList);
    } catch (error) {
      console.error("Fetch error:", error);
    }
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
      if (!data.type_account.includes("admin")) navigate("/");
    }
  };

  useEffect(() => {
    verifyUser();
    fetchProducts().finally(() => setLoading(false));
  }, []);

  const returnViewType = (
    type: string,
    approvedBy: string | undefined,
    approvedAt: string | undefined,
    refusedAt: string | undefined,
    refusedBy: string | undefined,
  ) => {
    if (type == "pending")
      return (
        <span className="flex items-center gap-1.5 px-3 py-1 bg-[#FEF3C7] text-[#92400E] rounded-full text-xs font-medium">
          <Clock size={14} />
          Pending Review
        </span>
      );
    else if (type == "approved")
      return (
        <span className="flex items-center gap-1.5 px-3 py-1 bg-[#DCFCE7] text-[#166534] rounded-full text-xs font-medium">
          <CheckCircle size={14} />
          Approuvé par {approvedBy} le {approvedAt}
        </span>
      );
    else
      return (
        <span className="flex items-center gap-1.5 px-3 py-1 bg-[#FEE2E2] text-[#B91C1C] rounded-full text-xs font-medium">
          <X size={14} /> {/* icône “X” pour refus */}
          Refusé par {refusedBy} le {refusedAt}
        </span>
      );
  };

  if (loading) return (
    <main className="flex-1 overflow-y-auto">
      <Loading />
    </main>
  );
  return (
    <main className="flex-1 overflow-y-auto">
      <header className="bg-white border-b border-[#E5E7EB] p-4 sm:p-6 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <button className="md:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu size={24} />
          </button>

          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Content Approval</h1>
            <p className="text-[#6B7280] text-sm mt-1">
              Review and manage incoming user submissions
            </p>
          </div>

          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
                size={18}
              />
              <input
                type="text"
                placeholder="Search requests..."
                className="pl-10 pr-4 py-2 bg-[#F3F4F6] border-none rounded-full text-sm focus:ring-2 focus:ring-[#2563EB] outline-none w-full"
              />
            </div>
            <button className="p-2 text-[#6B7280] hover:bg-[#F3F4F6] rounded-full">
              <Filter size={20} />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto p-4 sm:p-6 md:p-8">
        {/* Tabs */}
        <div className="flex gap-4 sm:gap-8 border-b border-[#E5E7EB] mb-6 sm:mb-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab("pending")}
            className={`pb-4 text-sm font-medium transition-colors relative ${
              activeTab === "pending"
                ? "text-[#2563EB]"
                : "text-[#6B7280] hover:text-[#1A1A1A]"
            }`}
          >
            Pending Approval
            {activeTab === "pending" && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2563EB]"
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab("approved")}
            className={`pb-4 text-sm font-medium transition-colors relative ${
              activeTab === "approved"
                ? "text-[#2563EB]"
                : "text-[#6B7280] hover:text-[#1A1A1A]"
            }`}
          >
            Approved
            {activeTab === "approved" && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2563EB]"
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab("refused")}
            className={`pb-4 text-sm font-medium transition-colors relative ${
              activeTab === "refused"
                ? "text-[#2563EB]"
                : "text-[#6B7280] hover:text-[#1A1A1A]"
            }`}
          >
            Refused
            {activeTab === "refused" && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2563EB]"
              />
            )}
          </button>
        </div>

        {/* Request List */}
        <div className="space-y-6">
          <AnimatePresence mode="popLayout">
            {filteredRequests.length > 0 ? (
              filteredRequests.map((request) => (
                <motion.div
                  key={request.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="p-4 sm:p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={request.avatar}
                          alt={request.person}
                          className="w-10 h-10 rounded-full object-cover border border-[#E5E7EB]"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <h3 className="font-semibold text-[#1A1A1A]">
                            {request.person}
                          </h3>
                          <p className="text-[#6B7280] text-xs">
                            {request.createdAt}
                          </p>
                        </div>
                      </div>
                      <button className="p-1 text-[#9CA3AF] hover:text-[#1A1A1A] hover:bg-[#F3F4F6] rounded">
                        <MoreVertical size={18} />
                      </button>
                    </div>

                    <p className="text-[#374151] mb-6 leading-relaxed">
                      {request.desire}
                    </p>

                    <div className="relative rounded-xl overflow-hidden bg-[#F3F4F6] aspect-video mb-6 group">
                      <img
                        src={request.imageUrl}
                        alt="Request attachment"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-4 right-4">
                        <div className="bg-white/90 backdrop-blur px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider text-[#374151] flex items-center gap-1 shadow-sm">
                          <ImageIcon size={12} />
                          Attachment
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pt-4 border-t border-[#F3F4F6] gap-4">
                      <div className="flex items-center gap-2">
                        {returnViewType(
                          request.etat,
                          request.approvedBy,
                          request.approvedAt,
                          request.refusedAt,
                          request.refusedBy,
                        )}
                      </div>

                      {request.etat === "pending" && (
                        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                          <button
                            onClick={() => handleRefuse(request.id)}
                            className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-[#6B7280] hover:text-[#1A1A1A] hover:bg-[#F3F4F6] rounded-lg transition-colors"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => handleApprove(request.id)}
                            className="w-full sm:w-auto px-6 py-2 bg-[#2563EB] text-white text-sm font-semibold rounded-lg hover:bg-[#1D4ED8] shadow-lg shadow-blue-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                          >
                            <CheckCircle size={16} />
                            Approve Request
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20 bg-white rounded-2xl border border-dashed border-[#D1D5DB]"
              >
                <div className="bg-[#F3F4F6] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={32} className="text-[#9CA3AF]" />
                </div>
                <h3 className="text-lg font-semibold text-[#1A1A1A]">
                  All caught up!
                </h3>
                <p className="text-[#6B7280]">
                  No {activeTab} requests to display at the moment.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
};

export default ManageRequest;
