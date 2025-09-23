import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { login as loginApi } from "../api/services";
import { useAuth } from "../context/AuthContext";
import gsap from "gsap";

export default function Login() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const trainRef = useRef(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await loginApi(employeeId, password);
      login(data.user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    gsap.to(trainRef.current, {
      y: "-=10",
      repeat: -1,
      yoyo: true,
      duration: 1.5,
      ease: "power1.inOut",
    });
  }, []);

  return (
    <div className="flex flex-col md:flex-row w-full h-screen overflow-hidden">
      {/* Left Side - Cover Image */}
      <div className="relative w-full md:w-3/5 h-[60vh] md:h-full flex items-center justify-center overflow-hidden">
        <img
          ref={trainRef}
          src="/train3.jpg"
          alt="Train Cover"
          className="w-full h-full object-cover"
        />
        {/* Clouds */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-20 h-10 md:w-40 md:h-20 bg-white rounded-full opacity-20"
            style={{ top: `${10 + i * 15}%`, left: `${-30 + i * 20}%` }}
            animate={{ x: ["-30%", "120%"] }}
            transition={{
              repeat: Infinity,
              duration: 30 + i * 5,
              ease: "linear",
            }}
          />
        ))}
      </div>

      {/* Right Side - Content */}
      <div className="w-full md:w-2/5 h-full flex flex-col items-center justify-center px-6 md:px-16 bg-[#111]">
        {!open ? (
          <>
            <motion.h1
              className="text-3xl sm:text-4xl md:text-5xl text-center font-bold mb-4 md:mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-white-500 to-slate-500"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              KMRL
              <br />
              <span className="text-xl sm:text-2xl md:text-3xl font-medium bg-clip-text text-transparent bg-gradient-to-r from-white via-white-500 to-slate-500">
                Document Intelligence
              </span>
            </motion.h1>

            <motion.p
              className="text-gray-300 mb-4 md:mb-8 text-center text-sm sm:text-base md:text-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              The metro-inspired AI platform for smarter, faster, and safer
              document management.
            </motion.p>

            <motion.button
              className="px-8 py-3 md:px-12 md:py-4 rounded-full bg-gradient-to-r from-white via-white-500 to-slate-500 text-black text-base sm:text-lg md:text-xl font-semibold shadow-lg hover:shadow-xl"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setOpen(true)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Get Started
            </motion.button>
          </>
        ) : (
          <AnimatePresence>
            <motion.div
              key="login"
              className="w-full sm:w-4/5 md:w-full bg-[#222] rounded-3xl p-6 sm:p-8 shadow-lg flex flex-col justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.8 }}
            >
              <h3 className="text-2xl sm:text-3xl md:text-3xl font-bold text-white text-center mb-4">
                Login
              </h3>
              <p className="text-gray-300 text-center mb-4 sm:mb-6 text-sm sm:text-base">
                Enter your credentials to continue
              </p>

              <form className="space-y-4" onSubmit={handleLogin}>
                <input
                  type="text"
                  placeholder="Employee ID"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  className="w-full px-4 py-3 sm:px-5 sm:py-4 rounded-2xl bg-[#333] placeholder-gray-400 text-white text-sm sm:text-lg md:text-lg focus:outline-none focus:ring-2 focus:ring-slate-500 transition"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 sm:px-5 sm:py-4 rounded-2xl bg-[#333] placeholder-gray-400 text-white text-sm sm:text-lg md:text-lg focus:outline-none focus:ring-2 focus:ring-slate-500 transition"
                />
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full py-3 sm:py-4 rounded-2xl bg-gradient-to-r from-white via-white-500 to-slate-500 text-black text-base sm:text-lg md:text-xl font-semibold shadow-lg"
                >
                  {loading ? "Signing in..." : "Sign In"}
                </motion.button>
              </form>

              <div className="mt-4 text-center text-gray-400 text-sm">
                <button
                  onClick={() => setOpen(false)}
                  className="underline hover:text-white transition"
                >
                  Back
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
