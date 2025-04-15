"use client"

import type React from "react"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  RefreshCw,
  BarChart4,
  Utensils,
  Flame,
  Apple,
  Beef,
  Cookie,
  Droplet,
  AlertCircle,
  Heart,
  Share2,
} from "lucide-react"
import { motion, useAnimation } from "framer-motion"

interface NutritionResultProps {
  result: {
    calories: number
    protein: number
    carbs: number
    fat: number
    sugars: number
    fiber: number
    sodium: number
    vitamins: string[]
    foodName: string
    ingredients: string[]
  }
  onReset: () => void
  image: string | null
}

export function NutritionResult({ result, onReset, image }: NutritionResultProps) {
  const controls = useAnimation()

  useEffect(() => {
    controls.start({
      scale: [1, 1.05, 1],
      transition: {
        repeat: Number.POSITIVE_INFINITY,
        duration: 2,
        ease: "easeInOut",
      },
    })
  }, [controls])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full max-w-5xl mx-auto"
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-center mb-12"
      >
        <motion.div
          className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white text-black mb-6"
          animate={controls}
        >
          <Flame className="w-8 h-8" />
        </motion.div>
        <h2 className="text-4xl font-bold text-white mb-3 tracking-tight">Analysis Complete</h2>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Your comprehensive nutritional analysis is ready, providing insights into calories, macronutrients, and
          ingredients.
        </p>
      </motion.div>

      <div className="mb-12">
        <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-white/10 shadow-[0_0_30px_rgba(255,255,255,0.05)] overflow-hidden rounded-2xl">
          <div className="p-8 md:p-10">
            <div className="flex flex-col md:flex-row md:items-end gap-4 md:gap-10 mb-10">
              <div>
                <h3 className="text-sm uppercase text-gray-500 font-medium tracking-wider mb-2">Identified Food</h3>
                <motion.h2
                  className="text-3xl md:text-4xl font-bold text-white"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  {result.foodName}
                </motion.h2>
              </div>

              <div className="flex-1 flex items-center justify-end gap-3">
                <span className="text-gray-400 font-medium">Confidence:</span>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star, index) => (
                    <motion.svg
                      key={star}
                      className="w-5 h-5 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 + index * 0.1, duration: 0.3 }}
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </motion.svg>
                  ))}
                </div>
              </div>
            </div>

            {image && (
              <motion.div
                className="mt-6 mb-8 relative rounded-xl overflow-hidden shadow-[0_0_30px_rgba(255,255,255,0.1)]"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="aspect-video relative">
                  <img src={image || "/placeholder.svg"} alt={result.foodName} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 flex items-center">
                    <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center mr-3">
                      <Utensils className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-sm text-white/70">Analyzed Image</span>
                      <h4 className="text-white font-medium">{result.foodName}</h4>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
              <MacroCard
                icon={<Flame className="w-6 h-6" />}
                label="Calories"
                value={result.calories}
                unit="kcal"
                primary
                delay={0.4}
              />
              <MacroCard
                icon={<Beef className="w-6 h-6" />}
                label="Protein"
                value={result.protein}
                unit="g"
                delay={0.5}
              />
              <MacroCard
                icon={<Cookie className="w-6 h-6" />}
                label="Carbs"
                value={result.carbs}
                unit="g"
                delay={0.6}
              />
              <MacroCard icon={<Droplet className="w-6 h-6" />} label="Fat" value={result.fat} unit="g" delay={0.7} />
            </div>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="details" className="mb-12">
        <TabsList className="w-full max-w-lg mx-auto grid grid-cols-3 bg-gray-800 rounded-full mb-8 p-1">
          <TabsTrigger
            value="details"
            className="rounded-full data-[state=active]:bg-white data-[state=active]:text-black"
          >
            Detailed Nutrition
          </TabsTrigger>
          <TabsTrigger
            value="ingredients"
            className="rounded-full data-[state=active]:bg-white data-[state=active]:text-black"
          >
            Ingredients
          </TabsTrigger>
          <TabsTrigger
            value="chart"
            className="rounded-full data-[state=active]:bg-white data-[state=active]:text-black"
          >
            Nutritional Chart
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <Card className="border-white/10 shadow-[0_0_30px_rgba(255,255,255,0.05)] overflow-hidden rounded-2xl bg-gray-900">
            {image && (
              <motion.div
                className="float-right ml-6 mb-4 w-48 md:w-64 rounded-xl overflow-hidden shadow-[0_0_20px_rgba(255,255,255,0.05)]"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="relative">
                  <img
                    src={image || "/placeholder.svg"}
                    alt={result.foodName}
                    className="w-full aspect-square object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <span className="text-xs text-white/70 block">Analyzed Food</span>
                  </div>
                </div>
              </motion.div>
            )}
            <div className="p-8">
              <h4 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Detailed Nutritional Information
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h5 className="font-medium text-white mb-3">Macronutrients</h5>
                  <DetailRow
                    label="Protein"
                    value={`${result.protein}g`}
                    percentage={Math.round(((result.protein * 4) / result.calories) * 100)}
                  />
                  <DetailRow
                    label="Carbohydrates"
                    value={`${result.carbs}g`}
                    percentage={Math.round(((result.carbs * 4) / result.calories) * 100)}
                  />
                  <DetailRow
                    label="Fat"
                    value={`${result.fat}g`}
                    percentage={Math.round(((result.fat * 9) / result.calories) * 100)}
                  />
                  <DetailRow label="Sugars" value={`${result.sugars}g`} />
                  <DetailRow label="Fiber" value={`${result.fiber}g`} />
                </div>

                <div className="space-y-4">
                  <h5 className="font-medium text-white mb-3">Micronutrients</h5>
                  <DetailRow label="Sodium" value={`${result.sodium}mg`} />

                  <div className="pt-4">
                    <h5 className="font-medium text-white mb-3">Vitamins & Minerals</h5>
                    <div className="flex flex-wrap gap-2">
                      {result.vitamins.map((vitamin, index) => (
                        <motion.span
                          key={index}
                          className="px-3 py-1 bg-gray-800 text-white rounded-full text-sm font-medium"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.1 * index }}
                        >
                          {vitamin}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-gray-800">
                <div className="flex items-center gap-2 mb-4">
                  <Heart className="w-5 h-5 text-white" />
                  <h5 className="font-medium text-white">Health Insights</h5>
                </div>
                <p className="text-gray-400">
                  This meal is high in protein and provides a good balance of macronutrients. The whole wheat bread
                  contributes complex carbohydrates, while avocado provides healthy fats. This combination supports
                  sustained energy levels and satiety.
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="ingredients">
          <Card className="border-white/10 shadow-[0_0_30px_rgba(255,255,255,0.05)] overflow-hidden rounded-2xl bg-gray-900">
            <div className="p-8">
              <div className="flex items-center gap-2 mb-6">
                <Utensils className="w-5 h-5 text-white" />
                <h4 className="text-xl font-bold text-white">Ingredients</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <ul className="space-y-4">
                    {result.ingredients.map((ingredient, index) => (
                      <motion.li
                        key={index}
                        className="flex items-start gap-4 p-4 rounded-xl bg-gray-800 hover:bg-gray-700 transition-colors"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                      >
                        <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <h5 className="font-medium text-white mb-1">{ingredient}</h5>
                          <p className="text-sm text-gray-400">
                            {index === 0 && "Lean protein source, approximately 120 calories per 100g"}
                            {index === 1 && "Complex carbohydrates, fiber-rich base"}
                            {index === 2 && "Healthy fat source, rich in minerals"}
                            {index === 3 && "Low-calorie, vitamin C rich vegetable"}
                            {index === 4 && "Low-calorie, high-fiber leafy green"}
                            {index === 5 && "Healthy monounsaturated fat source"}
                          </p>
                        </div>
                      </motion.li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-col">
                  <div className="bg-gray-800 rounded-2xl p-6 mb-6 h-full">
                    <h5 className="font-medium text-white mb-4 flex items-center gap-2">
                      <Apple className="w-4 h-4" />
                      Ingredient Quality
                    </h5>
                    <div className="space-y-3">
                      <QualityBar label="Protein Quality" percentage={92} delay={0.1} />
                      <QualityBar label="Carb Quality" percentage={85} delay={0.2} />
                      <QualityBar label="Fat Quality" percentage={95} delay={0.3} />
                      <QualityBar label="Vitamin Content" percentage={88} delay={0.4} />
                      <QualityBar label="Mineral Content" percentage={90} delay={0.5} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="chart">
          <Card className="border-white/10 shadow-[0_0_30px_rgba(255,255,255,0.05)] overflow-hidden rounded-2xl bg-gray-900">
            <div className="p-8">
              <div className="flex items-center gap-2 mb-6">
                <BarChart4 className="w-5 h-5 text-white" />
                <h4 className="text-xl font-bold text-white">Nutritional Distribution</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="flex flex-col items-center">
                  <h5 className="font-medium text-white mb-6">Macronutrient Ratio</h5>
                  <motion.div
                    className="relative w-64 h-64"
                    initial={{ opacity: 0, scale: 0.8, rotate: -90 }}
                    animate={{ opacity: 1, scale: 1, rotate: -90 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  >
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                      <circle cx="50" cy="50" r="45" fill="transparent" stroke="#374151" strokeWidth="10" />

                      {/* Protein slice */}
                      <motion.circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="transparent"
                        stroke="#ffffff"
                        strokeWidth="10"
                        strokeDasharray={`${2 * Math.PI * 45 * ((result.protein * 4) / result.calories)} ${2 * Math.PI * 45 * (1 - (result.protein * 4) / result.calories)}`}
                        strokeLinecap="butt"
                        initial={{ strokeDashoffset: 2 * Math.PI * 45 }}
                        animate={{ strokeDashoffset: 0 }}
                        transition={{ duration: 1, delay: 0.5 }}
                      />

                      {/* Carbs slice */}
                      <motion.circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="transparent"
                        stroke="#9CA3AF"
                        strokeWidth="10"
                        strokeDasharray={`${2 * Math.PI * 45 * ((result.carbs * 4) / result.calories)} ${2 * Math.PI * 45}`}
                        strokeDashoffset={`${-2 * Math.PI * 45 * ((result.protein * 4) / result.calories)}`}
                        initial={{ strokeDashoffset: 2 * Math.PI * 45 }}
                        animate={{ strokeDashoffset: -2 * Math.PI * 45 * ((result.protein * 4) / result.calories) }}
                        transition={{ duration: 1, delay: 0.7 }}
                      />

                      {/* Fat slice */}
                      <motion.circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="transparent"
                        stroke="#4B5563"
                        strokeWidth="10"
                        strokeDasharray={`${2 * Math.PI * 45 * ((result.fat * 9) / result.calories)} ${2 * Math.PI * 45}`}
                        strokeDashoffset={`${-2 * Math.PI * 45 * ((result.protein * 4 + result.carbs * 4) / result.calories)}`}
                        initial={{ strokeDashoffset: 2 * Math.PI * 45 }}
                        animate={{
                          strokeDashoffset:
                            -2 * Math.PI * 45 * ((result.protein * 4 + result.carbs * 4) / result.calories),
                        }}
                        transition={{ duration: 1, delay: 0.9 }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div
                        className="text-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.1 }}
                      >
                        <span className="block text-3xl font-bold text-white">{result.calories}</span>
                        <span className="text-sm text-gray-400">kcal</span>
                      </motion.div>
                    </div>
                  </motion.div>
                  <div className="grid grid-cols-3 gap-6 w-full mt-6">
                    <ChartLegend
                      color="bg-white"
                      label="Protein"
                      value={`${Math.round(((result.protein * 4) / result.calories) * 100)}%`}
                      delay={0.5}
                    />
                    <ChartLegend
                      color="bg-gray-400"
                      label="Carbs"
                      value={`${Math.round(((result.carbs * 4) / result.calories) * 100)}%`}
                      delay={0.6}
                    />
                    <ChartLegend
                      color="bg-gray-600"
                      label="Fat"
                      value={`${Math.round(((result.fat * 9) / result.calories) * 100)}%`}
                      delay={0.7}
                    />
                  </div>
                </div>

                <div>
                  <h5 className="font-medium text-white mb-6">Nutritional Balance</h5>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-white">Protein-Carb Ratio</span>
                        <span className="text-sm font-bold text-gray-300">Excellent</span>
                      </div>
                      <motion.div
                        className="h-2 w-full bg-gray-800 rounded-full overflow-hidden"
                        initial={{ opacity: 0, scaleX: 0 }}
                        animate={{ opacity: 1, scaleX: 1 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                      >
                        <motion.div
                          className="h-full bg-white rounded-full"
                          style={{ width: "85%" }}
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ duration: 0.8, delay: 0.2 }}
                        ></motion.div>
                      </motion.div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-white">Nutrient Density</span>
                        <span className="text-sm font-bold text-gray-300">Very Good</span>
                      </div>
                      <motion.div
                        className="h-2 w-full bg-gray-800 rounded-full overflow-hidden"
                        initial={{ opacity: 0, scaleX: 0 }}
                        animate={{ opacity: 1, scaleX: 1 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                      >
                        <motion.div
                          className="h-full bg-white rounded-full"
                          style={{ width: "78%" }}
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ duration: 0.8, delay: 0.4 }}
                        ></motion.div>
                      </motion.div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-white">Fiber Content</span>
                        <span className="text-sm font-bold text-gray-300">Good</span>
                      </div>
                      <motion.div
                        className="h-2 w-full bg-gray-800 rounded-full overflow-hidden"
                        initial={{ opacity: 0, scaleX: 0 }}
                        animate={{ opacity: 1, scaleX: 1 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                      >
                        <motion.div
                          className="h-full bg-white rounded-full"
                          style={{ width: "65%" }}
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ duration: 0.8, delay: 0.6 }}
                        ></motion.div>
                      </motion.div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-white">Healthy Fats</span>
                        <span className="text-sm font-bold text-gray-300">Excellent</span>
                      </div>
                      <motion.div
                        className="h-2 w-full bg-gray-800 rounded-full overflow-hidden"
                        initial={{ opacity: 0, scaleX: 0 }}
                        animate={{ opacity: 1, scaleX: 1 }}
                        transition={{ duration: 0.5, delay: 0.7 }}
                      >
                        <motion.div
                          className="h-full bg-white rounded-full"
                          style={{ width: "90%" }}
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ duration: 0.8, delay: 0.8 }}
                        ></motion.div>
                      </motion.div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-white">Vitamin Content</span>
                        <span className="text-sm font-bold text-gray-300">Very Good</span>
                      </div>
                      <motion.div
                        className="h-2 w-full bg-gray-800 rounded-full overflow-hidden"
                        initial={{ opacity: 0, scaleX: 0 }}
                        animate={{ opacity: 1, scaleX: 1 }}
                        transition={{ duration: 0.5, delay: 0.9 }}
                      >
                        <motion.div
                          className="h-full bg-white rounded-full"
                          style={{ width: "82%" }}
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ duration: 0.8, delay: 1 }}
                        ></motion.div>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex flex-col sm:flex-row gap-4 justify-center"
      >
        <Button
          onClick={onReset}
          className="bg-white hover:bg-white/90 text-black shadow-lg hover:shadow-xl transition-all py-6"
        >
          <RefreshCw className="mr-2 h-5 w-5" /> Analyze Another Food
        </Button>
        <Button className="bg-white hover:bg-white/90 text-black shadow-lg hover:shadow-xl transition-all py-6">
          <Share2 className="mr-2 h-5 w-5" /> Share Results
        </Button>
      </motion.div>
    </motion.div>
  )
}

function MacroCard({
  icon,
  label,
  value,
  unit,
  primary = false,
  delay = 0,
}: {
  icon: React.ReactNode
  label: string
  value: number
  unit: string
  primary?: boolean
  delay?: number
}) {
  return (
    <motion.div
      className={`p-6 rounded-xl flex flex-col ${
        primary ? "bg-white text-black" : "bg-gray-800 text-white border border-white/10"
      }`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className={primary ? "text-black" : "text-white"}>{icon}</div>
        <span className="text-sm font-medium">{label}</span>
      </div>
      <div className="flex items-baseline gap-1 mt-auto">
        <motion.span
          className="text-3xl font-bold"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.2, duration: 0.5 }}
        >
          {value}
        </motion.span>
        <span className={`text-sm ${primary ? "text-gray-700" : "text-gray-400"}`}>{unit}</span>
      </div>
    </motion.div>
  )
}

function DetailRow({
  label,
  value,
  percentage,
}: {
  label: string
  value: string
  percentage?: number
}) {
  return (
    <div className="flex flex-col space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-gray-400">{label}</span>
        <span className="font-medium text-white">{value}</span>
      </div>
      {percentage !== undefined && (
        <motion.div
          className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden"
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="h-full bg-white rounded-full"
            style={{ width: `${percentage}%` }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          ></motion.div>
        </motion.div>
      )}
    </div>
  )
}

function ChartLegend({
  color,
  label,
  value,
  delay = 0,
}: {
  color: string
  label: string
  value: string
  delay?: number
}) {
  return (
    <motion.div
      className="flex flex-col items-center"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
    >
      <div className={`w-4 h-4 rounded-full ${color} mb-1`}></div>
      <span className="text-sm font-medium text-white">{label}</span>
      <span className="text-xs text-gray-400">{value}</span>
    </motion.div>
  )
}

function QualityBar({
  label,
  percentage,
  delay = 0,
}: {
  label: string
  percentage: number
  delay?: number
}) {
  return (
    <motion.div
      className="space-y-1"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.5 }}
    >
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-400">{label}</span>
        <span className="text-sm font-medium text-white">{percentage}%</span>
      </div>
      <motion.div
        className="h-1.5 w-full bg-gray-700 rounded-full overflow-hidden"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.5, delay: delay + 0.1 }}
      >
        <motion.div
          className="h-full bg-white rounded-full"
          style={{ width: `${percentage}%` }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: delay + 0.2 }}
        ></motion.div>
      </motion.div>
    </motion.div>
  )
}

