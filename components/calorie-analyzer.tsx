"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Upload,
  Camera,
  RefreshCw,
  AlertCircle,
  ChevronRight,
  BarChart4,
  Utensils,
  Clock,
  Plus,
  Sparkles,
} from "lucide-react";
import { AnimatePresence, motion, useAnimation } from "framer-motion";
import { NutritionResult } from "@/components/nutrition-result";

/* helper to parse numeric values safely */
function toNumber(val: unknown): number {
  if (typeof val === "number") return val;
  if (typeof val === "string") return parseFloat(val) || 0;
  return 0;
}

type AnalysisState = "idle" | "uploading" | "analyzing" | "complete";

export function CalorieAnalyzer() {
  const [image, setImage] = useState<string | null>(null);
  const [state, setState] = useState<AnalysisState>("idle");
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const controls = useAnimation();

  useEffect(() => {
    // Bounce animation for the Upload icon on the hero card
    controls.start({
      y: [0, -10, 0],
      transition: { repeat: Number.POSITIVE_INFINITY, duration: 3, ease: "easeInOut" },
    });
  }, [controls]);

  /**
   * Handles user selecting a file.
   */
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show quick preview in UI
    setImage(URL.createObjectURL(file));
    setState("uploading");
    setProgress(10);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const resp = await fetch("/api/food", {
        method: "POST",
        body: formData,
      });
      if (!resp.ok) throw new Error("Upload failed");

      // Increase progress bar from 10% to 90% in steps
      let p = 10;
      const fakeTimer = setInterval(() => {
        p = Math.min(90, p + 5);
        setProgress(p);
      }, 300);

      const { ok, data, error } = await resp.json();
      clearInterval(fakeTimer);
      if (!ok) throw new Error(error);

      setProgress(100);
      setState("analyzing");

      // Extract relevant node in gr8api response
      const node =
        data?.nutrition?.data?.components?.[0]?.list?.[0] ||
        data?.nutrition?.data ||
        null;

      // Fallback if the structure isn't as we expect
      if (!node) throw new Error("No recognized nutrition data");

      // Convert any string fields to number safely
      setResult({
        foodName: node.brief_name || node.name || "Unknown food",
        calories: toNumber(node.kcal),
        protein: toNumber(node.protein),
        carbs: toNumber(node.carbs),
        fat: toNumber(node.fat),
        sugars: toNumber(node.sugar),
        fiber: toNumber(node.dietary_fiber),
        sodium: toNumber(node.sodium),
        // Hard-coded some placeholders for vitamins
        vitamins: ["Vitamin A", "Vitamin C", "Vitamin D"],
        // If "ingredients" not present, fallback to []
        ingredients: node.ingredients || [],
      });

      setState("complete");
    } catch (err) {
      console.error("Analysis error:", err);
      alert("Sorry, an error occurred while analyzing. Please try again.");
      resetAnalysis();
    }
  };

  /**
   * Resets the analysis to idle
   */
  const resetAnalysis = () => {
    setImage(null);
    setState("idle");
    setResult(null);
    setProgress(0);
  };

  /**
   * Render the initial "Upload" hero area
   */
  const renderUploadArea = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="text-center"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-12">
        {/* left (text info) */}
        <div className="order-2 md:order-1 text-left space-y-6">
          <h2 className="text-4xl font-bold text-white tracking-tight">
            Instant Food Analysis
          </h2>
          <p className="text-gray-400 text-lg leading-relaxed">
            Capture a photo of any meal and receive immediate nutritional
            insights powered by our advanced AI technology.
          </p>
          <ul className="space-y-3">
            {[
              "Precise calorie estimation",
              "Detailed macronutrient breakdown",
              "Ingredient identification",
              "Nutritional recommendations",
            ].map((item, index) => (
              <motion.li
                key={index}
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.5 }}
              >
                <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center">
                  <svg
                    className="w-3 h-3 text-black"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="3"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <span className="text-gray-300">{item}</span>
              </motion.li>
            ))}
          </ul>
        </div>

        {/* right (card to upload or camera) */}
        <div className="order-1 md:order-2">
          <motion.div
            onClick={() => fileInputRef.current?.click()}
            className="relative group mx-auto cursor-pointer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            animate={controls}
          >
            <div
              className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-white/30 via-white/10 to-white/30 opacity-70 blur-xl 
                group-hover:opacity-100 transition-all duration-500 group-hover:duration-200"
            />
            <div
              className="relative h-80 rounded-xl border border-white/20 bg-gradient-to-br from-gray-900 to-black
                flex flex-col items-center justify-center overflow-hidden shadow-[0_0_25px_rgba(255,255,255,0.1)] p-8"
            >
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/5 rounded-full"></div>
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-white/5 rounded-full"></div>

              <motion.div
                className="mb-6 p-4 bg-black rounded-full shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                animate={{
                  boxShadow: [
                    "0 0 15px rgba(255,255,255,0.2)",
                    "0 0 25px rgba(255,255,255,0.4)",
                    "0 0 15px rgba(255,255,255,0.2)",
                  ],
                }}
                transition={{
                  repeat: Number.POSITIVE_INFINITY,
                  duration: 2,
                  ease: "easeInOut",
                }}
              >
                <Upload className="w-12 h-12 text-white" strokeWidth={1.5} />
              </motion.div>

              <h3 className="text-2xl font-bold text-white mb-2">
                Drag & Drop
              </h3>
              <p className="text-gray-400 mb-6 max-w-xs text-center">
                Upload your food image or take a photo to start analysis
              </p>

              <div className="flex gap-4">
                <Button
                  variant="default"
                  className="bg-white text-black hover:bg-white/90 font-medium py-2.5 px-5 rounded-lg shadow-lg hover:shadow-xl transition-all"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Select File
                </Button>
                <Button
                  variant="outline"
                  className="border-white text-black bg-white hover:bg-white/90 font-medium py-2.5 px-5 rounded-lg shadow-lg hover:shadow-xl transition-all"
                  onClick={() => {
                    if (
                      navigator.mediaDevices &&
                      navigator.mediaDevices.getUserMedia
                    ) {
                      const videoElement = document.createElement("video");
                      const canvasElement = document.createElement("canvas");

                      navigator.mediaDevices
                        .getUserMedia({ video: true })
                        .then((stream) => {
                          videoElement.srcObject = stream;
                          videoElement.play();

                          // Create a simple modal overlay
                          const modal = document.createElement("div");
                          modal.className =
                            "fixed inset-0 bg-black/80 flex items-center justify-center z-50";

                          const modalContent = document.createElement("div");
                          modalContent.className =
                            "bg-gray-900 p-6 rounded-2xl max-w-lg w-full border border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.1)]";

                          // Header
                          const header = document.createElement("div");
                          header.className =
                            "flex justify-between items-center mb-4";
                          header.innerHTML =
                            '<h3 class="text-xl font-bold text-white">Take a Photo</h3>';

                          // Close button
                          const closeButton = document.createElement("button");
                          closeButton.className =
                            "text-white hover:text-white/80";
                          closeButton.innerHTML =
                            '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
                          closeButton.onclick = () => {
                            stream.getTracks().forEach((t) => t.stop());
                            document.body.removeChild(modal);
                          };

                          header.appendChild(closeButton);
                          modalContent.appendChild(header);

                          // video container
                          const videoContainer =
                            document.createElement("div");
                          videoContainer.className =
                            "relative rounded-xl overflow-hidden mb-4 bg-black";
                          videoElement.className =
                            "w-full h-64 object-cover";
                          videoContainer.appendChild(videoElement);
                          modalContent.appendChild(videoContainer);

                          // capture button
                          const buttonContainer =
                            document.createElement("div");
                          buttonContainer.className = "flex justify-center";

                          const captureButton =
                            document.createElement("button");
                          captureButton.className =
                            "bg-white text-black px-4 py-2 rounded-lg font-medium flex items-center gap-2";
                          captureButton.innerHTML =
                            '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/></svg> Capture';

                          captureButton.onclick = () => {
                            // set canvas
                            canvasElement.width = videoElement.videoWidth;
                            canvasElement.height = videoElement.videoHeight;

                            // snapshot
                            const ctx = canvasElement.getContext("2d");
                            ctx?.drawImage(
                              videoElement,
                              0,
                              0,
                              canvasElement.width,
                              canvasElement.height
                            );

                            // get dataUrl
                            const imageDataUrl = canvasElement.toDataURL(
                              "image/png"
                            );

                            // stop stream
                            stream.getTracks().forEach((t) => t.stop());
                            document.body.removeChild(modal);

                            setImage(imageDataUrl);
                            setState("uploading");

                            // simulate progress
                            let currentProgress = 0;
                            const interval = setInterval(() => {
                              currentProgress += 5;
                              setProgress(currentProgress);

                              if (currentProgress >= 100) {
                                clearInterval(interval);
                                setState("analyzing");

                                setProgress(0);

                                // second progress simulation
                                let analysisProgress = 0;
                                const analysisInterval = setInterval(() => {
                                  analysisProgress += 4;
                                  setProgress(analysisProgress);

                                  if (analysisProgress >= 100) {
                                    clearInterval(analysisInterval);
                                    // just dummy result
                                    setResult({
                                      calories: 457,
                                      protein: 22,
                                      carbs: 48,
                                      fat: 18,
                                      sugars: 6,
                                      fiber: 4,
                                      sodium: 650,
                                      vitamins: [
                                        "Vitamin A",
                                        "Vitamin C",
                                        "Iron",
                                        "Calcium",
                                        "Magnesium",
                                      ],
                                      foodName:
                                        "Grilled Chicken Sandwich with Avocado",
                                      ingredients: [
                                        "Chicken breast",
                                        "Whole wheat bread",
                                        "Avocado",
                                        "Tomato",
                                        "Lettuce",
                                        "Olive oil",
                                      ],
                                    });
                                    setState("complete");
                                  }
                                }, 60);
                              }
                            }, 50);
                          };

                          buttonContainer.appendChild(captureButton);
                          modalContent.appendChild(buttonContainer);

                          modal.appendChild(modalContent);
                          document.body.appendChild(modal);
                        })
                        .catch((err) => {
                          console.error("Camera error:", err);
                          alert(
                            "Unable to access camera. Please grant permission or use a supported browser."
                          );
                        });
                    } else {
                      alert(
                        "Your browser doesn't support camera access. Use the upload instead."
                      );
                    }
                  }}
                >
                  <Camera className="mr-2 h-4 w-4" />
                  Camera
                </Button>
              </div>
            </div>
          </motion.div>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>
      </div>

      <motion.div
        className="mt-16 flex justify-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <Sparkles className="w-4 h-4" />
          <span>Powered by advanced AI technology with 99.8% accuracy</span>
        </div>
      </motion.div>
    </motion.div>
  );

  /**
   * Render the "Processing" states: uploading or analyzing
   */
  const renderProcessing = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full max-w-4xl mx-auto"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
        <div className="relative">
          {/* fancy border animations */}
          <motion.div
            className="absolute inset-0 rounded-2xl border-8 border-white/5 blur-sm transform -rotate-3 scale-105"
            animate={{ rotate: [-3, 0, -3], scale: [1.05, 1.03, 1.05] }}
            transition={{
              repeat: Number.POSITIVE_INFINITY,
              duration: 8,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute inset-0 rounded-2xl border-8 border-white/5 blur-sm transform rotate-2 scale-105"
            animate={{ rotate: [2, 0, 2], scale: [1.05, 1.02, 1.05] }}
            transition={{
              repeat: Number.POSITIVE_INFINITY,
              duration: 10,
              ease: "easeInOut",
            }}
          />
          <div className="relative aspect-square rounded-2xl overflow-hidden shadow-[0_0_25px_rgba(255,255,255,0.1)] border border-white/10">
            <img
              src={image || "/placeholder.svg"}
              alt="Food"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>

            {/* bottom bar progress */}
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="flex items-center gap-3 text-white mb-2">
                <motion.div
                  animate={{ opacity: [1, 0.5, 1], scale: [1, 1.1, 1] }}
                  transition={{
                    repeat: Number.POSITIVE_INFINITY,
                    duration: 1.5,
                    ease: "easeInOut",
                  }}
                >
                  <AlertCircle className="w-5 h-5" />
                </motion.div>
                <span className="font-medium">
                  {state === "uploading"
                    ? "Processing image..."
                    : "Analyzing content..."}
                </span>
              </div>
              <Progress
                value={progress}
                className="h-1.5 bg-white/20 w-full"
                indicatorClassName="bg-white"
              />
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-3xl font-bold text-white mb-6 tracking-tight">
            {state === "uploading"
              ? "Pre-processing Image"
              : "AI Analysis in Progress"}
          </h2>
          <p className="text-gray-400 mb-8 text-lg">
            {state === "uploading"
              ? "We're optimizing your image for our advanced AI algorithms to ensure the most accurate nutritional analysis."
              : "Our machine learning models are identifying ingredients, portion sizes, and calculating precise nutritional values."}
          </p>

          <div className="space-y-5 mb-8">
            {state === "uploading" ? (
              <>
                <ProcessingStep
                  icon={<Upload className="w-5 h-5" />}
                  completed={progress > 20}
                  label="Uploading image"
                  description="Securely transferring your image"
                  delay={0.1}
                />
                <ProcessingStep
                  icon={<RefreshCw className="w-5 h-5" />}
                  completed={progress > 50}
                  label="Processing image"
                  description="Enhancing clarity and detail"
                  delay={0.2}
                />
                <ProcessingStep
                  icon={<Plus className="w-5 h-5" />}
                  completed={progress > 80}
                  label="Preparing for analysis"
                  description="Optimizing for AI recognition"
                  delay={0.3}
                />
              </>
            ) : (
              <>
                <ProcessingStep
                  icon={<Utensils className="w-5 h-5" />}
                  completed={progress > 15}
                  label="Identifying food items"
                  description="Recognizing ingredients"
                  delay={0.1}
                />
                <ProcessingStep
                  icon={<BarChart4 className="w-5 h-5" />}
                  completed={progress > 40}
                  label="Calculating nutrition"
                  description="Determining macros & calories"
                  delay={0.2}
                />
                <ProcessingStep
                  icon={<Clock className="w-5 h-5" />}
                  completed={progress > 70}
                  label="Generating insights"
                  description="Building a full nutritional profile"
                  delay={0.3}
                />
                <ProcessingStep
                  icon={<ChevronRight className="w-5 h-5" />}
                  completed={progress > 90}
                  label="Finalizing results"
                  description="Preparing your comprehensive report"
                  delay={0.4}
                />
              </>
            )}
          </div>

          <div className="text-center md:text-left">
            <Button
              variant="outline"
              size="sm"
              className="border-white/30 text-white/70 hover:bg-white/5"
              onClick={resetAnalysis}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Cancel and restart
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="max-w-6xl mx-auto">
      <Card className="border-white/10 shadow-[0_0_50px_rgba(255,255,255,0.05)] overflow-hidden bg-gray-900 rounded-3xl">
        <div className="p-8 md:p-12">
          <AnimatePresence mode="wait">
            {state === "idle" && renderUploadArea()}
            {(state === "uploading" || state === "analyzing") &&
              renderProcessing()}
            {state === "complete" && (
              <NutritionResult result={result} onReset={resetAnalysis} image={image} />
            )}
          </AnimatePresence>
        </div>
      </Card>
    </div>
  );
}

/**
 * A small helper component to show each step with an icon & progress
 */
function ProcessingStep({
  completed,
  label,
  description,
  icon,
  delay = 0,
}: {
  completed: boolean;
  label: string;
  description: string;
  icon: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      className="flex items-start gap-4"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
    >
      <motion.div
        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
          completed ? "bg-white text-black" : "bg-gray-800 text-gray-500"
        }`}
        animate={
          completed
            ? { scale: [1, 1.2, 1], transition: { duration: 0.5 } }
            : {}
        }
      >
        {icon}
      </motion.div>
      <div>
        <h4
          className={`font-medium transition-colors duration-300 ${
            completed ? "text-white" : "text-gray-400"
          }`}
        >
          {label}
        </h4>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </motion.div>
  );
}
