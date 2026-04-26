import { useState } from "react";
import { createUserWithEmailAndPassword} from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import LoadingComment from "../component/LoadingComment";
import { motion, type Variants } from "framer-motion";
import { Mail, Lock, User, ArrowRight, ShoppingBag } from "lucide-react";

const containerVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5 },
  },
};

const formVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 },
  },
};

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (!email || password.length < 6)
        throw new Error(
          "Email ou mot de passe invalide (6 caractères minimum)",
        );

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        createdAt: new Date(),
        username: username,
        birthdate: "none",
        profilePic:
          "https://res.cloudinary.com/dyjgjijfa/image/upload/v1762547536/m11dom2lca9yzbrc1qpf.png",
        firstConnection: true,
        type_account: "client",
      });

      //await sendEmailVerification(userCredential.user);
      navigate("/verify-email");

    } catch (err: any) {
      setError("Erreur inscription :" + err.message);
    }
    setLoading(false);
  };

  return (
    <div className="h-screen overflow-hidden flex items-center justify-center bg-gray-950 text-white">
      {/* Background FIXE */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-indigo-500/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-pink-500/20 rounded-full blur-[120px]" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 rounded-3xl overflow-hidden shadow-2xl bg-white/5 backdrop-blur-xl relative z-10"
      >
        {/* LEFT */}
        <div className="relative hidden lg:flex flex-col justify-end p-10 bg-gradient-to-br from-indigo-600 to-purple-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-full overflow-hidden">
              <img
                src="/images/logo.jpg"
                alt="Logo OSEL"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-2xl font-bold">OSEL</span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="text-4xl font-bold mb-4">Create Account</h1>
            <p className="text-white/80">
              Enrichissez votre garde robe avec nous
            </p>
          </motion.div>
        </div>

        {/* RIGHT */}
        <div className="p-8 lg:p-12 flex flex-col justify-center bg-gray-900">
          <motion.div
            variants={formVariants}
            initial="hidden"
            animate="visible"
            className="w-full max-w-md mx-auto"
          >
            <motion.div variants={itemVariants} className="mb-10">
              <h2 className="text-3xl font-bold mb-2">Créer un compte</h2>
              <p className="text-gray-400">Rejoignez-nous dès maintenant</p>
            </motion.div>

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-400 text-sm mb-4"
              >
                {error}
              </motion.p>
            )}

            <form onSubmit={handleRegister} className="space-y-5">
              <motion.div variants={itemVariants}>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Nom d'utilisateur"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      setError("");
                    }}
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                    }}
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="password"
                    placeholder="Mot de passe"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError("");
                    }}
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                {loading ? (
                  <LoadingComment msg="Création du compte..." />
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition"
                  >
                    Créer un compte
                    <ArrowRight className="w-5 h-5" />
                  </motion.button>
                )}
              </motion.div>
            </form>

            <motion.div className="mt-6 text-center">
              <p className="text-gray-400">
                Déjà un compte ?
                <Link
                  to="/login"
                  className="ml-2 text-indigo-400 hover:underline"
                >
                  Se connecter
                </Link>
              </p>
            </motion.div>
          </motion.div>

          {/* Mobile logo */}
          <div className="absolute top-4 right-6 lg:hidden flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <ShoppingBag className="text-white w-4 h-4" />
            </div>
            <span className="font-bold">OSEL</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
