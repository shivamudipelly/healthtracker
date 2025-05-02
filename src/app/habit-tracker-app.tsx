import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, BarChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Activity, Droplet, Moon, Settings, Award, X, Download, ArrowRight, Sun, TrendingUp } from 'lucide-react';

// Types
type HabitType = 'sleep' | 'water' | 'screen';

interface DailyEntry {
  date: string;
  formattedDate: string;
  sleep: number;
  water: number;
  screen: number;
  sleepGoalMet: boolean;
  waterGoalMet: boolean;
  screenGoalMet: boolean;
}

interface HabitGoal {
  sleep: number; // hours
  water: number; // glasses
  screen: number; // hours
}

interface Streak {
  current: number;
  longest: number;
}

interface BadgeType {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  unlocked: boolean;
}

// Mock data for the past 7 days
const generateMockData = (): DailyEntry[] => {
  const data: DailyEntry[] = [];
  const today = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateString = date.toISOString().split('T')[0];
    const formattedDate = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    
    // Create realistic data with some variation
    // Intentionally break streak on the 3rd day for sleep
    const sleepHours = i === 3 ? 5.5 : 7 + Math.random() * 1.5;
    const waterGlasses = Math.floor(6 + Math.random() * 4);
    const screenHours = Math.max(2, 5 + Math.random() * 3);
    
    data.push({
      date: dateString,
      formattedDate,
      sleep: parseFloat(sleepHours.toFixed(1)),
      water: waterGlasses,
      screen: parseFloat(screenHours.toFixed(1)),
      sleepGoalMet: sleepHours >= 7,
      waterGoalMet: waterGlasses >= 8,
      screenGoalMet: screenHours <= 6,
    });
  }
  
  return data;
};

// Main App Component
export default function HabitTrackerApp() {
  // State
  const [data, setData] = useState<DailyEntry[]>(generateMockData());
  const [goals, setGoals] = useState<HabitGoal>({ sleep: 7, water: 8, screen: 6 });
  const [activeTab, setActiveTab] = useState<HabitType>('sleep');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [currentValues, setCurrentValues] = useState({ sleep: 8, water: 8, screen: 5 });
  const [streaks, setStreaks] = useState<Record<HabitType, Streak>>({
    sleep: { current: 0, longest: 0 },
    water: { current: 0, longest: 0 },
    screen: { current: 0, longest: 0 },
  });
  const [darkMode, setDarkMode] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);
  const [badges, setBadges] = useState<BadgeType[]>([
    {
      id: 'sleep-3day',
      name: 'Sleep Master',
      description: 'Maintained sleep goal for 3 days',
      icon: <Moon size={24} />,
      unlocked: false
    },
    {
      id: 'water-7day',
      name: 'Hydration Hero',
      description: 'Met water intake goal for 7 days',
      icon: <Droplet size={24} />,
      unlocked: false
    },
    {
      id: 'screen-5day',
      name: 'Digital Detox',
      description: 'Kept screen time under goal for 5 days',
      icon: <Activity size={24} />,
      unlocked: false
    },
    {
      id: 'all-goals',
      name: 'Balanced Life',
      description: 'Met all goals in a single day',
      icon: <Award size={24} />,
      unlocked: false
    },
    {
      id: 'improvement',
      name: 'Progress Path',
      description: 'Improved in all categories for 3 days',
      icon: <TrendingUp size={24} />,
      unlocked: false
    }
  ]);

  // Calculate streaks when data changes
  useEffect(() => {
    const calculateStreaks = () => {
      const newStreaks = {
        sleep: { current: 0, longest: streaks.sleep.longest },
        water: { current: 0, longest: streaks.water.longest },
        screen: { current: 0, longest: streaks.screen.longest }
      };
      
      // Sort data by date ascending
      const sortedData = [...data].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      
      // Calculate current streaks
      sortedData.forEach(day => {
        if (day.sleepGoalMet) {
          newStreaks.sleep.current++;
          newStreaks.sleep.longest = Math.max(newStreaks.sleep.longest, newStreaks.sleep.current);
        } else {
          newStreaks.sleep.current = 0;
        }
        
        if (day.waterGoalMet) {
          newStreaks.water.current++;
          newStreaks.water.longest = Math.max(newStreaks.water.longest, newStreaks.water.current);
        } else {
          newStreaks.water.current = 0;
        }
        
        if (day.screenGoalMet) {
          newStreaks.screen.current++;
          newStreaks.screen.longest = Math.max(newStreaks.screen.longest, newStreaks.screen.current);
        } else {
          newStreaks.screen.current = 0;
        }
      });
      
      setStreaks(newStreaks);
    };
    
    calculateStreaks();
  }, [data]);

  // Calculate badges when streaks change
  useEffect(() => {
    const newBadges = [...badges];
    
    // Sleep Master Badge
    if (streaks.sleep.current >= 3) {
      const badge = newBadges.find(b => b.id === 'sleep-3day');
      if (badge && !badge.unlocked) {
        badge.unlocked = true;
      }
    }
    
    // Hydration Hero Badge
    if (streaks.water.current >= 7) {
      const badge = newBadges.find(b => b.id === 'water-7day');
      if (badge && !badge.unlocked) {
        badge.unlocked = true;
      }
    }
    
    // Digital Detox Badge
    if (streaks.screen.current >= 5) {
      const badge = newBadges.find(b => b.id === 'screen-5day');
      if (badge && !badge.unlocked) {
        badge.unlocked = true;
      }
    }
    
    // Balanced Life Badge
    const lastDay = data[data.length - 1];
    if (lastDay && lastDay.sleepGoalMet && lastDay.waterGoalMet && lastDay.screenGoalMet) {
      const badge = newBadges.find(b => b.id === 'all-goals');
      if (badge && !badge.unlocked) {
        badge.unlocked = true;
      }
    }
    
    // Improvement Badge
    if (data.length >= 4) {
      let daysImproved = 0;
      for (let i = 3; i < data.length; i++) {
        if (
          data[i].sleep >= data[i-1].sleep &&
          data[i].water >= data[i-1].water &&
          data[i].screen <= data[i-1].screen
        ) {
          daysImproved++;
          if (daysImproved >= 3) {
            const badge = newBadges.find(b => b.id === 'improvement');
            if (badge && !badge.unlocked) {
              badge.unlocked = true;
            }
            break;
          }
        } else {
          daysImproved = 0;
        }
      }
    }
    
    setBadges(newBadges);
  }, [streaks, data]);

  // Save new entry
  const saveNewEntry = () => {
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    const formattedDate = today.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    
    // Check if today's entry exists
    const existingEntryIndex = data.findIndex(entry => entry.date === todayString);
    
    const newEntry: DailyEntry = {
      date: todayString,
      formattedDate,
      sleep: currentValues.sleep,
      water: currentValues.water,
      screen: currentValues.screen,
      sleepGoalMet: currentValues.sleep >= goals.sleep,
      waterGoalMet: currentValues.water >= goals.water,
      screenGoalMet: currentValues.screen <= goals.screen
    };
    
    if (existingEntryIndex >= 0) {
      // Update existing entry
      const newData = [...data];
      newData[existingEntryIndex] = newEntry;
      setData(newData);
    } else {
      // Add new entry
      setData([...data.slice(-6), newEntry]); // Keep last 7 days only
    }
    
    setIsModalOpen(false);
  };

  // Update goals
  const updateGoals = () => {
    setIsSettingsOpen(false);
    
    // Update goalMet flags
    const updatedData = data.map(entry => ({
      ...entry,
      sleepGoalMet: entry.sleep >= goals.sleep,
      waterGoalMet: entry.water >= goals.water,
      screenGoalMet: entry.screen <= goals.screen
    }));
    
    setData(updatedData);
  };

  // Export chart as image (simplified version without html2canvas)
  const exportChart = () => {
    // Since html2canvas is not supported, we'll implement a simpler alternative
    // that just notifies the user their chart data is ready to export
    alert(`Chart data for ${activeTab} is ready to export. In a production environment, this would download a PNG image.`);
    
    // In a real implementation with html2canvas, this would generate and download an image
    console.log(`Exporting ${activeTab} chart data from ${data[0].date} to ${data[data.length-1].date}`);
  };

  // Get streak text based on streak count
  const getStreakText = (streak: number) => {
    if (streak === 0) return "No active streak";
    return streak === 1 ? "1 day streak" : `${streak} day streak`;
  };

  // Get color for each habit type
  const getHabitColor = (type: HabitType, dark = false) => {
    switch (type) {
      case 'sleep':
        return dark ? 'rgb(147, 197, 253)' : 'rgb(59, 130, 246)';
      case 'water':
        return dark ? 'rgb(153, 246, 228)' : 'rgb(20, 184, 166)';
      case 'screen':
        return dark ? 'rgb(252, 165, 165)' : 'rgb(239, 68, 68)';
      default:
        return '#888';
    }
  };

  // Get title and info for each habit type
  const getHabitInfo = (type: HabitType) => {
    switch (type) {
      case 'sleep':
        return {
          title: 'Sleep Duration',
          icon: <Moon className="mr-2" />,
          unit: 'hours',
          min: 0,
          max: 12,
          step: 0.5,
          goal: `Goal: ${goals.sleep} hours`,
          trend: data.length > 1 ? 
            data[data.length-1].sleep > data[data.length-2].sleep ? 'up' : 'down' : 'neutral'
        };
      case 'water':
        return {
          title: 'Water Intake',
          icon: <Droplet className="mr-2" />,
          unit: 'glasses',
          min: 0,
          max: 16,
          step: 1,
          goal: `Goal: ${goals.water} glasses`,
          trend: data.length > 1 ? 
            data[data.length-1].water > data[data.length-2].water ? 'up' : 'down' : 'neutral'
        };
      case 'screen':
        return {
          title: 'Screen Time',
          icon: <Activity className="mr-2" />,
          unit: 'hours',
          min: 0,
          max: 12,
          step: 0.5,
          goal: `Goal: ${goals.screen} hours (lower is better)`,
          trend: data.length > 1 ? 
            data[data.length-1].screen < data[data.length-2].screen ? 'up' : 'down' : 'neutral'
        };
    }
  };

  // Main component render
  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Navbar */}
      <nav className={`px-4 py-4 flex justify-between items-center ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
        <div className="flex items-center">
          <TrendingUp className="mr-2 text-blue-500" size={24} />
          <h1 className="text-xl font-bold">HabitTrack</h1>
        </div>
        <div className="flex items-center space-x-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`p-2 rounded-full ${darkMode ? 'bg-gray-700 text-yellow-300' : 'bg-gray-100 text-gray-700'}`}
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`p-2 rounded-full ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
            onClick={() => setIsSettingsOpen(true)}
          >
            <Settings size={20} />
          </motion.button>
        </div>
      </nav>
      
      {/* Landing Page - Show only if there's no data */}
      {data.length === 0 && (
        <div className="flex flex-col items-center justify-center flex-grow text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-md"
          >
            <TrendingUp className="mx-auto mb-6 text-blue-500" size={64} />
            <h1 className="text-3xl font-bold mb-4">Welcome to HabitTrack</h1>
            <p className="mb-8 text-lg">Track your daily habits, set goals, and visualize your progress over time.</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg font-medium flex items-center justify-center mx-auto"
              onClick={() => setIsModalOpen(true)}
            >
              Get Started <ArrowRight className="ml-2" size={18} />
            </motion.button>
          </motion.div>
        </div>
      )}
      
      {/* Main Content */}
      {data.length > 0 && (
        <main className="flex-grow px-4 py-6 md:px-8 lg:px-16">
          {/* Header */}
          <div className="mb-8">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-2xl font-bold mb-2">Your Habit Dashboard</h1>
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Track your progress and build healthy habits
              </p>
            </motion.div>
          </div>
          
          {/* Tabs */}
          <div className="mb-6 flex border-b overflow-x-auto hide-scrollbar">
            {(['sleep', 'water', 'screen'] as HabitType[]).map((type) => (
              <button
                key={type}
                className={`px-4 py-2 font-medium capitalize transition-colors relative ${activeTab === type 
                  ? `text-${type === 'sleep' ? 'blue' : type === 'water' ? 'teal' : 'red'}-500` 
                  : darkMode ? 'text-gray-400' : 'text-gray-500'}`}
                onClick={() => setActiveTab(type)}
              >
                <div className="flex items-center">
                  {type === 'sleep' && <Moon size={18} className="mr-2" />}
                  {type === 'water' && <Droplet size={18} className="mr-2" />}
                  {type === 'screen' && <Activity size={18} className="mr-2" />}
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </div>
                {activeTab === type && (
                  <motion.div 
                    className={`absolute bottom-0 left-0 right-0 h-0.5 bg-${type === 'sleep' ? 'blue' : type === 'water' ? 'teal' : 'red'}-500`}
                    layoutId="activeTab"
                  />
                )}
              </button>
            ))}
          </div>
          
          {/* Charts Section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                {getHabitInfo(activeTab).icon}
                <h2 className="font-bold text-xl">{getHabitInfo(activeTab).title}</h2>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center p-2 rounded ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
                onClick={exportChart}
              >
                <Download size={16} className="mr-1" />
                <span className="text-sm">Export</span>
              </motion.button>
            </div>
            
            <div ref={chartRef} className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
              <p className={`mb-4 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {getHabitInfo(activeTab).goal}
              </p>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                key={activeTab}
                className="h-64"
              >
                <ResponsiveContainer width="100%" height="100%">
                  {activeTab === 'water' ? (
                    <BarChart data={data}>
                      <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} />
                      <XAxis 
                        dataKey="formattedDate" 
                        stroke={darkMode ? '#aaa' : '#666'} 
                        tick={{ fontSize: 12 }} 
                      />
                      <YAxis 
                        stroke={darkMode ? '#aaa' : '#666'} 
                        tick={{ fontSize: 12 }} 
                        domain={[0, 'auto']}
                      />
                      <Tooltip
                        contentStyle={{ backgroundColor: darkMode ? '#2d3748' : '#fff', borderColor: darkMode ? '#4a5568' : '#ddd' }}
                        labelStyle={{ color: darkMode ? '#edf2f7' : '#1a202c' }}
                      />
                      <Legend />
                      <Bar 
                        dataKey="water" 
                        name="Water (glasses)" 
                        fill={getHabitColor('water', darkMode)} 
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey={() => goals.water}
                        name="Goal"
                        fill="transparent"
                        stroke={darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.3)'}
                        strokeWidth={2}
                        strokeDasharray="5 5"
                      />
                    </BarChart>
                  ) : (
                    <LineChart data={data}>
                      <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} />
                      <XAxis 
                        dataKey="formattedDate" 
                        stroke={darkMode ? '#aaa' : '#666'} 
                        tick={{ fontSize: 12 }} 
                      />
                      <YAxis 
                        stroke={darkMode ? '#aaa' : '#666'} 
                        tick={{ fontSize: 12 }} 
                        domain={activeTab === 'sleep' ? [0, 12] : [0, 'auto']}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: darkMode ? '#2d3748' : '#fff', borderColor: darkMode ? '#4a5568' : '#ddd' }}
                        labelStyle={{ color: darkMode ? '#edf2f7' : '#1a202c' }}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey={activeTab} 
                        name={`${getHabitInfo(activeTab).title} (${getHabitInfo(activeTab).unit})`} 
                        stroke={getHabitColor(activeTab, darkMode)} 
                        strokeWidth={2}
                        dot={{ stroke: getHabitColor(activeTab, darkMode), strokeWidth: 2, r: 4, fill: darkMode ? '#1f2937' : '#fff' }}
                        activeDot={{ r: 6, fill: getHabitColor(activeTab, darkMode) }}
                      />
                      <Line
                        type="monotone"
                        dataKey={() => activeTab === 'screen' ? goals.screen : activeTab === 'sleep' ? goals.sleep : goals.water}
                        name="Goal"
                        stroke={darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.3)'}
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={false}
                      />
                    </LineChart>
                  )}
                </ResponsiveContainer>
              </motion.div>
            </div>
          </div>
          
          {/* Streaks and Badges Section */