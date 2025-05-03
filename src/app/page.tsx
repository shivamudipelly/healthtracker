"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, X, Settings, Info, Moon, Sun, Calendar, Download, Droplet, Monitor, Award, Flame, Trophy, ChevronRight, User, User2 } from "lucide-react";
import * as html2canvas from "html2canvas";
import Image from "next/image";

// Types
type Habit = {
  id: string;
  name: string;
  icon: React.ReactNode;
  unit: string;
  goalValue: number;
  currentValue: number;
  color: string;
};

type DailyRecord = {
  date: string;
  sleep: number;
  water: number;
  screenTime: number;
  goals: {
    sleep: number;
    water: number;
    screenTime: number;
  };
  completed: {
    sleep: boolean;
    water: boolean;
    screenTime: boolean;
  };
  values?: Record<string, number>; // Add optional 'values' property
};

type User = {
  name: string;
  avatar: string;
  joinDate: string;
  currentStreak: number;
  longestStreak: number;
  totalDaysTracked: number;
  badges: Badge[];
};

type Badge = {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  acquired: boolean;
  date?: string;
};

// Mock Data
const MOCK_DATA: DailyRecord[] = [
  {
    date: "2025-04-26",
    sleep: 7.5,
    water: 2100,
    screenTime: 6.2,
    goals: { sleep: 8, water: 2500, screenTime: 5 },
    completed: { sleep: false, water: false, screenTime: false }
  },
  {
    date: "2025-04-27",
    sleep: 8.2,
    water: 2600,
    screenTime: 4.8,
    goals: { sleep: 8, water: 2500, screenTime: 5 },
    completed: { sleep: true, water: true, screenTime: true }
  },
  {
    date: "2025-04-28",
    sleep: 7.8,
    water: 2400,
    screenTime: 5.1,
    goals: { sleep: 8, water: 2500, screenTime: 5 },
    completed: { sleep: false, water: false, screenTime: false }
  },
  {
    date: "2025-04-29",
    sleep: 8.5,
    water: 2800,
    screenTime: 4.5,
    goals: { sleep: 8, water: 2500, screenTime: 5 },
    completed: { sleep: true, water: true, screenTime: true }
  },
  {
    date: "2025-04-30",
    sleep: 6.5,
    water: 1800,
    screenTime: 7.2,
    goals: { sleep: 8, water: 2500, screenTime: 5 },
    completed: { sleep: false, water: false, screenTime: false }
  },
  {
    date: "2025-05-01",
    sleep: 8.3,
    water: 2700,
    screenTime: 4.7,
    goals: { sleep: 8, water: 2500, screenTime: 5 },
    completed: { sleep: true, water: true, screenTime: true }
  },
  {
    date: "2025-05-02",
    sleep: 8.0,
    water: 2500,
    screenTime: 4.9,
    goals: { sleep: 8, water: 2500, screenTime: 5 },
    completed: { sleep: true, water: true, screenTime: true }
  },
];

const USER_DATA: User = {
  name: "Alex Morgan",
  avatar: "",
  joinDate: "2025-03-15",
  currentStreak: 3,
  longestStreak: 5,
  totalDaysTracked: 19,
  badges: [
    {
      id: "water-master",
      name: "Hydration Hero",
      description: "Reached water goal 7 days in a row",
      icon: <Droplet size={24} />,
      acquired: true,
      date: "2025-04-20"
    },
    {
      id: "sleep-warrior",
      name: "Sleep Warrior",
      description: "Maintained sleep goals for 5 days",
      icon: <Moon size={24} />,
      acquired: true,
      date: "2025-04-25"
    },
    {
      id: "digital-detox",
      name: "Digital Detox",
      description: "Kept screen time under goal for 10 days",
      icon: <Monitor size={24} />,
      acquired: false
    },
    {
      id: "consistency",
      name: "Consistency King",
      description: "Tracked habits for 30 days straight",
      icon: <Calendar size={24} />,
      acquired: false
    },
    {
      id: "perfect-week",
      name: "Perfect Week",
      description: "Hit all goals every day for a week",
      icon: <CheckCircle size={24} />,
      acquired: false
    },
  ]
};

// Define habit data
const HABITS: Habit[] = [
  {
    id: "sleep",
    name: "Sleep",
    icon: <Moon className="text-indigo-500" />,
    unit: "hours",
    goalValue: 8,
    currentValue: 8.0,
    color: "#818cf8"
  },
  {
    id: "water",
    name: "Water",
    icon: <Droplet className="text-blue-500" />,
    unit: "ml",
    goalValue: 2500,
    currentValue: 2500,
    color: "#60a5fa"
  },
  {
    id: "screenTime",
    name: "Screen Time",
    icon: <Monitor className="text-rose-500" />,
    unit: "hours",
    goalValue: 5,
    currentValue: 4.9,
    color: "#f43f5e"
  }
];

// Main component
export default function HabitTracker() {
  // State hooks
  const [showLanding, setShowLanding] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showSettings, setShowSettings] = useState(false);
  const [showBadgeInfo, setShowBadgeInfo] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [habits, setHabits] = useState<Habit[]>(HABITS);
  const [records, setRecords] = useState<DailyRecord[]>(MOCK_DATA);
  const [user, setUser] = useState<User>(USER_DATA);
  const [chartType, setChartType] = useState<"line" | "bar">("line");
  const [showTutorial, setShowTutorial] = useState(false);

  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to top whenever showLanding changes
    window.scrollTo(0, 0);
  }, [showLanding]);

  // Effect to toggle dark mode class on body
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [darkMode]);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate completion percentage
  const calculateCompletion = (habitId: string): number => {
    const completedDays = records.filter(record => record.completed[habitId as keyof typeof record.completed]).length;
    return Math.round((completedDays / records.length) * 100);
  };

  // Update habit values
  // Update habit values
  const updateHabitValue = (habitId: string, value: number) => {
    // Update today's record
    const updatedRecords = [...records];
    const todayIndex = updatedRecords.length - 1;

    // Deep-clone today and its nested objects
    const today = {
      ...updatedRecords[todayIndex],
      goals: { ...updatedRecords[todayIndex].goals },
      completed: { ...updatedRecords[todayIndex].completed },
      values: { ...(updatedRecords[todayIndex].values ?? {}) },
    };

    // Store the new measurement
    today.values[habitId] = value;

    // Check if goal is met (screenTime is ≤, others ≥), with safe fallback
    const goalValue = today.goals[habitId as keyof typeof today.goals] ?? 0;
    if (habitId === "screenTime") {
      today.completed[habitId as keyof typeof today.completed] = value <= goalValue;
    } else {
      today.completed[habitId as keyof typeof today.completed] = value >= goalValue;
    }

    // Write back the mutated copy into the array
    updatedRecords[todayIndex] = today;
    setRecords(updatedRecords);

    // Update current value in habits
    const updatedHabits = habits.map(habit =>
      habit.id === habitId ? { ...habit, currentValue: value } : habit
    );
    setHabits(updatedHabits);

    // Recalculate streak
    calculateStreak(updatedRecords);
  };


  // Calculate and update streak
  const calculateStreak = (updatedRecords: DailyRecord[]) => {
    let currentStreak = 0;
    let maxStreak = user.longestStreak;

    // Iterate backwards from today
    for (let i = updatedRecords.length - 1; i >= 0; i--) {
      const record = updatedRecords[i];
      const allCompleted = Object.values(record.completed).every(Boolean);

      if (allCompleted) {
        currentStreak++;
        if (currentStreak > maxStreak) {
          maxStreak = currentStreak;
        }
      } else {
        break;
      }
    }

    setUser(prev => ({
      ...prev,
      currentStreak,
      longestStreak: maxStreak
    }));
  };

  // Update goal value
  const updateGoalValue = (habitId: string, value: number) => {
    // Update habit goal
    const updatedHabits = habits.map(habit =>
      habit.id === habitId ? { ...habit, goalValue: value } : habit
    );
    setHabits(updatedHabits);

    // Update goals in all records
    const updatedRecords = records.map(record => {
      const updatedGoals = { ...record.goals };
      updatedGoals[habitId as keyof typeof updatedGoals] = value;

      // Recalculate completion status for this record
      const updatedCompleted = { ...record.completed };
      if (habitId === "screenTime") {
        updatedCompleted[habitId as keyof typeof updatedCompleted] =
          record[habitId as keyof DailyRecord] as number <= value;
      } else {
        updatedCompleted[habitId as keyof typeof updatedCompleted] =
          record[habitId as keyof DailyRecord] as number >= value;
      }

      return {
        ...record,
        goals: updatedGoals,
        completed: updatedCompleted
      };
    });

    setRecords(updatedRecords);
    calculateStreak(updatedRecords);
  };

  // Export chart as image
  const exportChart = async () => {
    if (chartRef.current) {
      try {

        console.log('Chart exported successfully!');
        const canvas = await html2canvas.default(chartRef.current);
        const image = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = image;
        link.download = 'habit-tracker-chart.png';
        link.click();

      } catch (error) {
        console.error('Failed to export chart:', error);
      }
    }
  };


  interface DailyHabitRecord {
    completed: Record<string, boolean>;
    goals: { [key: string]: number };
  }

  // Memoized HabitCard component
  const HabitCard: React.FC<{
    habit: Habit;
    today: DailyHabitRecord;
  }> = React.memo(({ habit: initialHabit, today }) => {
    // Local state for the habit values
    const [localHabit, setLocalHabit] = useState(initialHabit);

    // Update local state when the prop changes
    useEffect(() => {
      setLocalHabit(initialHabit);
    }, [initialHabit]);

    const maxValue = localHabit.id === "sleep" ? 12 :
      localHabit.id === "water" ? 4000 : 12;

    // Handle value changes locally
    const handleValueChange = (value: number) => {
      setLocalHabit(prev => ({
        ...prev,
        currentValue: value
      }));
    };

    // Only update global state when interaction is complete
    const handleChangeComplete = useCallback(() => {
      updateHabitValue(localHabit.id, localHabit.currentValue);
    }, [localHabit.id, localHabit.currentValue]);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
      >
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            {localHabit.icon}
            <h3 className="ml-2 text-lg font-medium">{localHabit.name}</h3>
          </div>
          <span
            className={`text-sm font-medium px-2 py-1 rounded-full ${today.completed[localHabit.id]
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
              }`}
          >
            {today.completed[localHabit.id] ? "Completed" : "In Progress"}
          </span>
        </div>

        <div className="mb-4">
          <div className="flex justify-between items-center mb-1 text-sm">
            <span>
              Current: {localHabit.currentValue} {localHabit.unit}
            </span>
            <span>
              Goal: {localHabit.goalValue} {localHabit.unit}
            </span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.min(
                  (localHabit.id === "screenTime"
                    ? 1 - (localHabit.currentValue - 1) / (localHabit.goalValue - 1)
                    : localHabit.currentValue / localHabit.goalValue) * 100,
                  100
                )}%`,
                backgroundColor: localHabit.color,
              }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium">Update today&apos;s value</span>
            <span className="text-sm">
              {localHabit.currentValue} {localHabit.unit}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={maxValue}
            step={localHabit.id === "water" ? 50 : 0.1}
            value={localHabit.currentValue}
            onChange={(e) => handleValueChange(parseFloat(e.target.value))}
            onMouseUp={handleChangeComplete}
            onTouchEnd={handleChangeComplete}
            onBlur={handleChangeComplete}
            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-md appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, ${localHabit.color} 0%, ${localHabit.color} ${(localHabit.currentValue / maxValue) * 100}%, #e5e7eb ${(localHabit.currentValue / maxValue) * 100}%, #e5e7eb 100%)`,
            }}
          />
        </div>

        <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          Weekly completion: {calculateCompletion(localHabit.id)}%
        </div>
      </motion.div>
    );
  });

  HabitCard.displayName = "HabitCard";








  // Component for the landing page
  const featuredBrands = [
    {
      name: 'TechCrunch',
      color: 'text-indigo-600 dark:text-indigo-400',
      hoverColor: 'hover:text-indigo-700 dark:hover:text-indigo-300'
    },
    {
      name: 'ProductHunt',
      color: 'text-blue-600 dark:text-blue-400',
      hoverColor: 'hover:text-blue-700 dark:hover:text-blue-300'
    },
    {
      name: 'Forbes',
      color: 'text-amber-600 dark:text-amber-400',
      hoverColor: 'hover:text-amber-700 dark:hover:text-amber-300'
    }
  ];


  const LandingPage = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
    >
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <header className="mb-24 md:mb-32 text-center">
          {/* Text Content */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-indigo-100 dark:bg-indigo-900/30 w-max mx-auto p-3 rounded-2xl mb-6"
            >
              <Trophy className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            </motion.div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-blue-300 mb-4">
              Transform Your Habits
            </h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
            >
              Build better routines with AI-powered insights, personalized tracking, and science-backed strategies
            </motion.p>
          </motion.div>

          {/* Image with Featured Brands */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="relative"
          >
            <div className="relative w-full h-[300px] sm:h-[400px] md:h-[500px]">
              <Image
                src="https://images.unsplash.com/photo-1666875753105-c63a6f3bdc86?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YW5hbHl0aWNzJTIwZGFzaGJvYXJkfGVufDB8fDB8fHww"
                alt="App dashboard preview"
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 1200px"
                className="rounded-3xl shadow-2xl border-8 border-white dark:border-gray-800 mx-auto object-cover"
                priority
              />
            </div>

            {/* Featured Brands Badge */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-800 px-6 py-3 rounded-full shadow-lg flex items-center gap-4 border border-gray-100 dark:border-gray-700"
            >
              <span className="text-sm font-medium text-gray-500 dark:text-gray-300">
                Featured on
              </span>

              <div className="flex gap-4">
                {featuredBrands.map((brand, index) => (
                  <motion.span
                    key={brand.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                    className={`font-bold ${brand.color} ${brand.hoverColor} transition-colors`}
                  >
                    {brand.name}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </header>


        {/* Features Grid */}
        <section className="mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="grid md:grid-cols-3 gap-8 mb-16"
          >
            {[
              {
                title: "Analytics Dashboard",
                color: "text-green-500",
                image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop"
              },
              {
                title: "Mobile First",
                color: "text-purple-500",
                image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&auto=format&fit=crop"
              },
              {
                title: "Sleep Tracking",
                color: "text-blue-500",
                image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&auto=format&fit=crop"
              },
            ].map((feature, index) => (
              <div
                key={feature.title}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden"
              >
                <Image
                  src={feature.image}
                  alt={feature.title}
                  width={800}
                  height={192}
                  className="w-full h-48 object-cover"
                />
                <div className="p-8">
                  <h3 className="text-2xl font-bold mb-4 dark:text-white">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {index === 0 && "Detailed habit analytics with customizable reports and progress visualization"}
                    {index === 1 && "Native mobile experience with offline support and dark mode"}
                    {index === 2 && "Sleep pattern analysis with smart recommendations for better rest"}
                  </p>
                </div>
              </div>
            ))}
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-4xl font-bold mb-6 dark:text-white">Start Your Journey Today</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Join 50,000+ users who transformed their lives with consistent habit tracking
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-full font-semibold flex items-center gap-2 mx-auto"
              onClick={() => setShowLanding(false)}
            >
              Get Started for Free
              <ChevronRight className="w-5 h-5" />
            </motion.button>
            <p className="text-sm text-gray-500 mt-4 dark:text-gray-400">No credit card required</p>
          </motion.div>
        </section>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="bg-indigo-600 dark:bg-indigo-900/30 rounded-2xl p-8 text-center text-white mb-24"
        >
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="text-4xl font-bold mb-2">95%</div>
              <div className="text-gray-200 dark:text-indigo-200">User Retention Rate</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">4.9/5</div>
              <div className="text-gray-200 dark:text-indigo-200">App Store Rating</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">1M+</div>
              <div className="text-gray-200 dark:text-indigo-200">Habits Tracked Daily</div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );


  // Dashboard component
  const Dashboard = () => {
    const today = records[records.length - 1];

    return (
      <div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {habits.map(habit => (
            <HabitCard
              key={habit.id}
              habit={habit}
              today={today}

            />
          ))}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium">Weekly Progress</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={exportChart}
                className="flex items-center gap-1 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 px-3 py-1 rounded-md transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Export</span>
              </button>
            </div>
          </div>

          <div ref={chartRef} className="h-80" style={{
            backgroundColor: '#ffffff',
            color: '#000000'
          }}>
            <ResponsiveContainer width="100%" height="100%">
              {chartType === "line" ? (
                <LineChart data={records}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(date) => formatDate(date)}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis yAxisId="left" orientation="left" tick={{ fontSize: 12 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                  <YAxis yAxisId="waterAxis" orientation="right" tick={{ fontSize: 12 }} hide />
                  <Tooltip
                    formatter={(value, name) => {
                      if (name === "water") return [`${value} ml`, "Water"];
                      if (name === "sleep") return [`${value} hours`, "Sleep"];
                      if (name === "screenTime") return [`${value} hours`, "Screen Time"];
                      return [value, name];
                    }}
                    labelFormatter={(date) => formatDate(date as string)}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="sleep"
                    name="Sleep"
                    stroke={habits.find(h => h.id === "sleep")?.color || "#818cf8"}
                    strokeWidth={2}
                    yAxisId="left"
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="screenTime"
                    name="Screen Time"
                    stroke={habits.find(h => h.id === "screenTime")?.color || "#f43f5e"}
                    strokeWidth={2}
                    yAxisId="right"
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="water"
                    name="Water (ml)"
                    stroke={habits.find(h => h.id === "water")?.color || "#60a5fa"}
                    strokeWidth={2}
                    yAxisId="waterAxis"
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              ) : (
                <BarChart data={records}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(date) => formatDate(date)}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis yAxisId="left" orientation="left" tick={{ fontSize: 12 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                  <YAxis yAxisId="waterAxis" orientation="right" tick={{ fontSize: 12 }} hide />
                  <Tooltip
                    formatter={(value, name) => {
                      if (name === "water") return [`${value} ml`, "Water"];
                      if (name === "sleep") return [`${value} hours`, "Sleep"];
                      if (name === "screenTime") return [`${value} hours`, "Screen Time"];
                      return [value, name];
                    }}
                    labelFormatter={(date) => formatDate(date as string)}
                  />
                  <Legend />
                  <Bar
                    dataKey="sleep"
                    name="Sleep"
                    fill={habits.find(h => h.id === "sleep")?.color || "#818cf8"}
                    yAxisId="left"
                  />
                  <Bar
                    dataKey="screenTime"
                    name="Screen Time"
                    fill={habits.find(h => h.id === "screenTime")?.color || "#f43f5e"}
                    yAxisId="right"
                  />
                  <Bar
                    dataKey="water"
                    name="Water (ml)"
                    fill={habits.find(h => h.id === "water")?.color || "#60a5fa"}
                    yAxisId="waterAxis"
                  />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium mb-4">Daily Streak</h3>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-16 h-16 bg-indigo-100 dark:bg-indigo-900 rounded-full">
                <Flame className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="ml-4">
                <h4 className="text-2xl font-bold">{user.currentStreak} days</h4>
                <p className="text-gray-500 dark:text-gray-400">Current Streak</p>
              </div>
            </div>

            <div className="text-right">
              <h4 className="text-xl font-bold">{user.longestStreak} days</h4>
              <p className="text-gray-500 dark:text-gray-400">Longest Streak</p>
            </div>
          </div>

          <div className="mt-6">
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              {user.currentStreak === 0
                ? "Complete all your habit goals today to start a new streak!"
                : `You've been maintaining your habits for ${user.currentStreak} days in a row. Keep it up!`}
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Achievements component
  const Achievements = () => {
    return (
      <div>
        <div className="mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium mb-6">Your Badges</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {user.badges.map(badge => (
                <motion.div
                  key={badge.id}
                  whileHover={{ scale: 1.03 }}
                  onClick={() => setShowBadgeInfo(badge.id)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${badge.acquired
                    ? "border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/30"
                    : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 opacity-60"
                    }`}
                >
                  <div className="flex items-center mb-3">
                    <div className={`p-2 rounded-full ${badge.acquired ? "bg-indigo-100 dark:bg-indigo-900" : "bg-gray-100 dark:bg-gray-700"} mr-3`}>
                      {badge.icon}
                    </div>
                    <div>
                      <h4 className="font-medium">{badge.name}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {badge.acquired ? "Acquired" : "Locked"}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-300">{badge.description}</p>

                  {badge.acquired && badge.date && (
                    <p className="mt-2 text-xs text-indigo-600 dark:text-indigo-400">
                      Earned on {new Date(badge.date).toLocaleDateString()}
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium mb-4">Usage Statistics</h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Days Tracked</p>
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mr-2" />
                <span className="text-2xl font-bold">{user.totalDaysTracked}</span>
              </div>
            </div>

            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Current Streak</p>
              <div className="flex items-center">
                <Flame className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mr-2" />
                <span className="text-2xl font-bold">{user.currentStreak} days</span>
              </div>
            </div>

            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Longest Streak</p>
              <div className="flex items-center">
                <Award className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mr-2" />
                <span className="text-2xl font-bold">{user.longestStreak} days</span>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="font-medium mb-3">Your Journey</h4>
            <div className="flex items-center">
              <div className="bg-indigo-600 dark:bg-indigo-500 h-1 flex-grow rounded-full overflow-hidden">
                <div
                  className="bg-indigo-300 dark:bg-indigo-300 h-full"
                  style={{ width: `${(user.badges.filter(b => b.acquired).length / user.badges.length) * 100}%` }}
                />
              </div>
              <span className="ml-3 text-sm font-medium">
                {user.badges.filter(b => b.acquired).length}/{user.badges.length} badges
              </span>
            </div>

            <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
              You started your journey on {new Date(user.joinDate).toLocaleDateString()}.
              Continue tracking your habits to unlock more achievements!
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Main app component
  const MainApp = () => (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <nav className="bg-white dark:bg-gray-800 shadow-md py-4 px-6">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <CheckCircle className="h-6 w-6 text-indigo-600 dark:text-indigo-400 mr-2" />
            <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400 cursor-pointer" onClick={() => setShowLanding(true)}>HabitFlow</span>
          </div>

          <div className="flex items-center gap-4">
            <motion.button
              onClick={() => setDarkMode(!darkMode)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {darkMode ? (
                <Sun className="h-5 w-5 text-yellow-400" />
              ) : (
                <Moon className="h-5 w-5 text-indigo-600" />
              )}
            </motion.button>

            <motion.button
              onClick={() => setShowSettings(true)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Settings className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </motion.button>

            <div className="flex items-center">
              <div className="relative h-8 w-8 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-indigo-200 dark:border-indigo-700">
                <User2 className="h-4 w-4 text-gray-600 dark:text-gray-300" />
              </div>
              <span className="ml-2 font-medium hidden sm:inline">{user.name}</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-6 flex-grow">
        <div className="mb-6">
          <div className="flex justify-between items-center lg:flex-row flex-col gap-6">
            <h1 className="text-2xl font-bold">My Habits Dashboard</h1>
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab("dashboard")}
                className={`px-4 py-2 rounded-md transition-colors ${activeTab === "dashboard"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  }`}
              >
                Dashboard
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab("achievements")}
                className={`px-4 py-2 rounded-md transition-colors ${activeTab === "achievements"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  }`}
              >
                Achievements
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowTutorial(true)}
                className="px-3 py-2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                <Info size={18} />
              </motion.button>
            </div>
          </div>
        </div>

        {activeTab === "dashboard" ? (
          <Dashboard />
        ) : (
          <Achievements />
        )}
      </div>

      <footer className="bg-white dark:bg-gray-800 py-6 px-4 shadow-inner">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                © 2025 HabitFlow. All rights reserved.
              </p>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <span className="text-gray-600 dark:text-gray-300 text-sm">Days tracked: {user.totalDaysTracked}</span>
              </div>

              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <span className="text-gray-600 dark:text-gray-300 text-sm">Current streak: {user.currentStreak} days</span>
              </div>

              <div className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <span className="text-gray-600 dark:text-gray-300 text-sm">Longest streak: {user.longestStreak} days</span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {showSettings && <SettingsModal />}
        {showTutorial && <TutorialModal />}
        {showBadgeInfo && <BadgeInfoModal badgeId={showBadgeInfo} />}
      </AnimatePresence>
    </div>
  );

  // Settings Modal

  const SettingsModal = () => {
    // Local state to store temporary changes
    const [localHabits, setLocalHabits] = useState(habits);
    const [localDarkMode, setLocalDarkMode] = useState(darkMode);
    const [localChartType, setLocalChartType] = useState(chartType);

    // Update local state when props change
    useEffect(() => {
      setLocalHabits(habits);
      setLocalDarkMode(darkMode);
      setLocalChartType(chartType);
    }, [habits, darkMode, chartType]);

    const handleSave = () => {
      // Update all habit goals
      localHabits.forEach(habit => {
        const originalHabit = habits.find(h => h.id === habit.id);
        if (originalHabit && habit.goalValue !== originalHabit.goalValue) {
          updateGoalValue(habit.id, habit.goalValue);
        }
      });

      // Update dark mode if changed
      if (localDarkMode !== darkMode) {
        setDarkMode(localDarkMode);
      }

      // Update chart type if changed
      if (localChartType !== chartType) {
        setChartType(localChartType);
      }

      setShowSettings(false);
    };

    if (!showSettings) return null;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Settings</h2>
            <button
              onClick={() => setShowSettings(false)}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-3">Habit Goals</h3>
              {localHabits.map((habit) => (
                <div key={habit.id} className="mb-5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      {habit.icon}
                      <span className="ml-2 font-medium">{habit.name}</span>
                    </div>
                    <span className="text-sm font-medium">
                      Goal: {habit.goalValue} {habit.unit}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={habit.id === "sleep" ? 4 : habit.id === "water" ? 500 : 1}
                    max={habit.id === "sleep" ? 12 : habit.id === "water" ? 4000 : 12}
                    step={habit.id === "sleep" ? 0.5 : habit.id === "water" ? 100 : 0.5}
                    value={habit.goalValue}
                    onChange={(e) => {
                      setLocalHabits(prev => prev.map(h =>
                        h.id === habit.id ? { ...h, goalValue: parseFloat(e.target.value) } : h
                      ));
                    }}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-md appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, ${habit.color} 0%, ${habit.color} ${(habit.goalValue / (habit.id === "sleep" ? 12 : habit.id === "water" ? 4000 : 12)) * 100}%, #e5e7eb ${(habit.goalValue / (habit.id === "sleep" ? 12 : habit.id === "water" ? 4000 : 12)) * 100}%, #e5e7eb 100%)`,
                    }}
                  />
                </div>
              ))}
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3">Display Preferences</h3>
              <div className="flex items-center justify-between">
                <span>Dark Mode</span>
                <div
                  onClick={() => setLocalDarkMode(!localDarkMode)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full cursor-pointer ${localDarkMode ? "bg-indigo-600" : "bg-gray-200"}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${localDarkMode ? "translate-x-6" : "translate-x-1"}`}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between mt-3">
                <span>Chart Type</span>
                <div className="flex border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
                  <button
                    onClick={() => setLocalChartType("line")}
                    className={`px-3 py-1 text-sm ${localChartType === "line"
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"}`}
                  >
                    Line
                  </button>
                  <button
                    onClick={() => setLocalChartType("bar")}
                    className={`px-3 py-1 text-sm ${localChartType === "bar"
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"}`}
                  >
                    Bar
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowSettings(false)}
                className="px-5 py-2 rounded-md border border-gray-300 dark:border-gray-600"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSave}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-md"
              >
                Save Changes
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  };


  // Badge Info Modal
  const BadgeInfoModal = ({ badgeId }: { badgeId: string }) => {
    const badge = user.badges.find(b => b.id === badgeId);

    if (!badge) return null;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-sm w-full"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">{badge.name}</h3>
            <button
              onClick={() => setShowBadgeInfo(null)}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex items-center mb-4">
            <div className={`p-3 rounded-full ${badge.acquired ? 'bg-indigo-100 dark:bg-indigo-900' : 'bg-gray-100 dark:bg-gray-700'} mr-4`}>
              {badge.icon}
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-300 mb-1">{badge.description}</p>
              {badge.acquired && badge.date && (
                <p className="text-sm text-indigo-600 dark:text-indigo-400">
                  Earned on {new Date(badge.date).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>

          {!badge.acquired && (
            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Continue your habit tracking journey to earn this badge!
              </p>
            </div>
          )}
        </motion.div>
      </motion.div>
    );
  };

  // Tutorial Modal Component

  const TutorialModal = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg p-6"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">How to Use HabitFlow</h2>
          <button
            onClick={() => setShowTutorial(false)}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-5 text-gray-700 dark:text-gray-300">
          <div>
            <h3 className="font-semibold mb-1">1. Track Your Habits</h3>
            <p>Select a habit and mark your daily progress using the dashboard.</p>
          </div>

          <div>
            <h3 className="font-semibold mb-1">2. Set Goals</h3>
            <p>Adjust your habit goals in the Settings section to match your lifestyle.</p>
          </div>

          <div>
            <h3 className="font-semibold mb-1">3. View Progress</h3>
            <p>Switch between Line and Bar charts to visualize your performance.</p>
          </div>

          <div>
            <h3 className="font-semibold mb-1">4. Export Data</h3>
            <p>Use the export button to download your progress chart as an image.</p>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowTutorial(false)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-md transition-colors"
          >
            Got it!
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );


  return (
    <div className="min-h-screen w-full">
      {showLanding ? (
        <LandingPage />
      ) : (
        <div className="min-h-screen w-full">
          <MainApp />
        </div>
      )}
    </div>
  )
}
