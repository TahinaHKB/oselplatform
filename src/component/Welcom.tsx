import { motion} from "motion/react";
import {
  ChevronRight,
  Sparkles,
} from "lucide-react";

interface Property {
  handleNext: () => void;
}

const Welcom: React.FC<Property> = ({ handleNext }) =>{
  return (
    <motion.section
      key="welcome"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="flex-1 flex flex-col md:flex-row"
    >
      <div className="flex-1 flex flex-col justify-center px-6 md:px-24 py-12">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black text-white text-[10px] font-bold uppercase tracking-widest"
        >
          <Sparkles className="w-3 h-3" />
          Bienvenue
        </motion.div>
        <h1 className="text-5xl md:text-8xl font-light tracking-tighter leading-[0.9] mb-8">
          Votre style, <br />
          <span className="font-serif italic text-gray-400">redefinie.</span>
        </h1>
        <p className="text-lg text-gray-500 max-w-md mb-12 leading-relaxed">
          Ravis de vous accueillir ! Nos tailleurs créent vos tenues sur mesure,
          et vos mensures ? Pas besoin de bouger, on s’occupe de tout avec
          style.
        </p>
        <button
          onClick={handleNext}
          className="group flex items-center justify-between w-full md:w-64 px-6 py-4 bg-black text-white rounded-full transition-all hover:bg-gray-800 active:scale-95"
        >
          <span className="font-medium tracking-tight">Commencer</span>
          <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
      <div className="flex-1 relative overflow-hidden hidden md:block">
        <img
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop"
          alt="Fashion"
          className="absolute inset-0 w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-transparent to-[#fcfcfc]/20" />
      </div>
    </motion.section>
  );
}

export default Welcom;
