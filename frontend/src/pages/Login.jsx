import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "../styles/login.css";
import { useNavigate } from "react-router-dom";
import { login } from "../api/services";

export default function Login() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault(); // prevent page reload
    setLoading(true);
    setError("");

    try {
      const data = await login(employeeId, password);
      console.log("Login Success:", data);

      // store token or user info (localStorage / context)
      localStorage.setItem("user", JSON.stringify(data.user));

      // navigate to dashboard
      navigate("/dashboard");
    } catch (err) {
      console.error("Login failed:", err.response?.data || err.message);
      setError(
        err.response?.data?.detail || "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex items-center justify-center bg-gray-50 overflow-hidden">
      {/* Outer framed panel */}
      <div className="w-full h-screen relative overflow-hidden bg-transparent">
        {/* Background split layer */}
        <div className="absolute inset-0 bg-split-layer" />

        {/* Animated background elements */}
        
        {/* Floating document icons */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-white/05"
              initial={{
                opacity: 0,
                y: Math.random() * 100 + 50,
                x: Math.random() * 100 - 50,
                rotate: Math.random() * 20 - 10
              }}
              animate={{
                opacity: [0, 0.1, 0],
                y: [Math.random() * 100, Math.random() * 500 + 200],
                x: [Math.random() * 100 - 50, Math.random() * 200 - 100],
                rotate: Math.random() * 360
              }}
              transition={{
                duration: Math.random() * 10 + 15,
                repeat: Infinity,
                delay: Math.random() * 5,
                ease: "linear"
              }}
              style={{
                fontSize: `${Math.random() * 20 + 16}px`,
                left: `${Math.random() * 100}%`,
              }}
            >
              📄
            </motion.div>
          ))}
        </div>

        {/* Metro line route animation */}
        <motion.div 
          className="absolute left-0 top-0 w-7/12 h-full pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
        >
          {/* Metro line path */}
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <motion.path
              d="M10,10 C30,30 40,60 20,80 C0,100 40,90 60,70 S80,30 90,10"
              fill="none"
              stroke="rgba(255,122,61,0.15)"
              strokeWidth="0.5"
              strokeDasharray="2 3"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            />
          </svg>
          
          {/* Moving metro train icon along path */}
          <motion.div
            className="absolute w-4 h-4 text-orange-500"
            initial={{ offsetDistance: "0%", opacity: 0 }}
            animate={{ 
              offsetDistance: "100%", 
              opacity: [0, 1, 1, 0] 
            }}
            transition={{
              offsetDistance: { duration: 8, repeat: Infinity, ease: "linear" },
              opacity: { duration: 8, repeat: Infinity, times: [0, 0.1, 0.9, 1] }
            }}
            style={{
              offsetPath: `path("M10,10 C30,30 40,60 20,80 C0,100 40,90 60,70 S80,30 90,10")`,
            }}
          >
            🚆
          </motion.div>
        </motion.div>

        {/* Pulsing connection nodes */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-3 h-3 rounded-full bg-orange-400/30 pointer-events-none"
            style={{
              left: `${15 + (i * 18)}%`,
              top: `${20 + (i * 12)}%`,
            }}
            animate={{
              scale: [1, 1.8, 1],
              opacity: [0.7, 0.2, 0.7],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.6,
            }}
          />
        ))}

        {/* Content grid */}
        <div className="relative z-20 grid grid-cols-12 h-full">
          {/* Left column: heading + train */}
          <div className="col-span-7 px-14 py-12 flex flex-col items-start justify-center text-white">
            {/* Animated title */}
            <motion.h1 
              className="font-playfair text-4xl md:text-5xl leading-snug mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              KMRL
              <br />
              <motion.span 
                className="block text-3xl md:text-4xl font-medium tracking-wide"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.8 }}
              >
                Document Intelligence
              </motion.span>
            </motion.h1>

            <div className="mt-auto w-full flex items-end">
              <div className="relative w-full">
                <motion.img
                  src="/train.png"
                  alt="KMRL Metro"
                  className="w-[520px] md:w-[600px] drop-shadow-[0_25px_40px_rgba(9,15,33,0.5)]"
                  style={{ userSelect: "none", pointerEvents: "none" }}
                  initial={{ x: -100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                />
                {/* sweeping light animation */}
                <motion.div
                  className="absolute -left-[45%] top-6 w-[160%] h-[160%] opacity-10 pointer-events-none"
                  animate={{ x: ["-35%", "35%"] }}
                  transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
                  style={{
                    background:
                      "radial-gradient(1200px 360px at 30% 30%, rgba(255,255,255,0.06), transparent 30%)",
                    transform: "rotate(-6deg)",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Right column: tagline + button or login */}
          <div className="col-span-5 flex flex-col items-center justify-center text-center px-10 relative">
            {!open && (
              <>
                <motion.p 
                  className="text-gray-600 text-lg mb-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                >
                  The metro-inspired AI platform for smarter, faster, and safer
                  document management.
                </motion.p>
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setOpen(true)}
                  className="relative inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-[#ff7a3d] to-[#ff5a2a] shadow-lg text-white font-medium"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                >
                  <span>Get Started</span>
                  <motion.span
                    className="absolute inset-0 rounded-full pointer-events-none"
                    aria-hidden
                    animate={{ x: ["-100%", "120%"] }}
                    transition={{
                      repeat: Infinity,
                      duration: 2.2,
                      ease: "linear",
                    }}
                  />
                </motion.button>
              </>
            )}

            {/* Diamond login card */}
            <AnimatePresence>
              {open && (
                <motion.div
                  key="diamond"
                  initial={{ y: -200, rotate: -12, opacity: 0, scale: 0.9 }}
                  animate={{ y: 0, rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ y: -220, rotate: 12, opacity: 0, scale: 0.95 }}
                  transition={{
                    type: "spring",
                    stiffness: 90,
                    damping: 14,
                    mass: 0.7,
                  }}
                  className="relative mt-6"
                  style={{ perspective: 1200 }}
                >
                  <div className="diamond-outer">
                    <div className="diamond-inner">
                      <button
                        aria-label="Close login"
                        onClick={() => setOpen(false)}
                        className="absolute top-0 right-3 w-9 h-9 rounded-full hover:border bg-white shadow-md grid place-items-center text-sm text-gray-600"
                      >
                        ✕
                      </button>

                      <div className="px-6 py-6 w-full">
                        <h3 className="text-center text-2xl font-playfair text-[#10243b] mb-4">
                          Login
                        </h3>

                        <form
                          className="space-y-3"
                          onSubmit={handleLogin}
                        >
                          <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                          >
                            <input
                              className="w-full px-4 py-2 rounded-lg bg-[#f1f6fb] border border-[#e0e9f5] focus:outline-none focus:shadow-[0_0_18px_rgba(255,122,60,0.12)] transition"
                              placeholder="Employee ID"
                              value={employeeId}
                              onChange={(e) => setEmployeeId(e.target.value)}
                              autoComplete="username"
                            />
                          </motion.div>
                          
                          <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                          >
                            <input
                              className="w-full px-4 py-2 rounded-lg bg-[#f1f6fb] border border-[#e0e9f5] focus:outline-none focus:shadow-[0_0_18px_rgba(255,122,60,0.12)] transition"
                              placeholder="Password"
                              type="password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              autoComplete="current-password"
                            />
                          </motion.div>

                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={loading}
                            className="relative w-full py-2 rounded-md text-white font-medium overflow-hidden"
                            style={{
                              background: "linear-gradient(90deg,#0f2b4a,#10243b)",
                              boxShadow: "0 8px 20px rgba(255,122,60,0.18)",
                            }}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                          >
                            <span className="relative z-10">{loading ? "Signing in..." : "Sign In"}</span>
                            <motion.span
                              className="absolute inset-0 block pointer-events-none"
                              animate={{ x: ["-120%", "120%"] }}
                              transition={{
                                repeat: Infinity,
                                duration: 1.6,
                                ease: "linear",
                              }}
                              style={{
                                background:
                                  "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.12) 50%, transparent 100%)",
                              }}
                            />
                          </motion.button>
                        </form>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}






































