import React, { useState } from 'react';
import { Calendar, Layers, Plus, Check, Droplets, Stethoscope, Scale, Sparkles, Clock, Info, ChevronDown, ChevronLeft, ChevronRight, X, Pencil, BookmarkCheck, ArrowRight, MoreHorizontal } from 'lucide-react';
import { Animal, Task } from '../../types';
import { findReusableRoutineTemplate, saveReusableRoutineTemplate, ReusableRoutineTemplate } from '../../utils/routineTemplateUtils';

interface AssignFeedingCareSectionProps {
  animal: Animal;
  currentAgeStage: string;
  foodItem: string;
  onClose: () => void;
  onAddTask: (task: Task) => void;
  setScheduleActionFeedback: (msg: string | null) => void;
}

interface TaskScheduleItem {
  key: string;
  name: string;
  frequency: string;
  dayOfWeek: string;
  time: string;
  customDates?: string[];
}

const DEFAULT_SCHEDULE_CONFIGS: Record<string, TaskScheduleItem> = {
  feeding: {
    key: 'feeding',
    name: 'Feeding',
    frequency: 'Every 3 days',
    dayOfWeek: '3 days apart',
    time: '8:00 AM'
  },
  water: {
    key: 'water',
    name: 'Water Replacement',
    frequency: 'Daily',
    dayOfWeek: 'Every day',
    time: '9:00 AM'
  },
  health: {
    key: 'health',
    name: 'Health Checkup',
    frequency: 'Weekly',
    dayOfWeek: 'Monday',
    time: '10:00 AM'
  },
  weight: {
    key: 'weight',
    name: 'Weight Monitoring',
    frequency: 'Weekly',
    dayOfWeek: 'Friday',
    time: '11:00 AM'
  },
  cleaning: {
    key: 'cleaning',
    name: 'Enclosure Cleaning',
    frequency: 'Weekly',
    dayOfWeek: 'Wednesday',
    time: '2:00 PM'
  },
  other: {
    key: 'other',
    name: 'Special Care',
    frequency: 'Weekly',
    dayOfWeek: 'Monday',
    time: '12:00 PM'
  }
};

export const AssignFeedingCareSection: React.FC<AssignFeedingCareSectionProps> = ({
  animal,
  currentAgeStage,
  foodItem,
  onClose,
  onAddTask,
  setScheduleActionFeedback
}) => {
  // Check if a reusable routine template exists for this species & age group
  const [existingTemplate, setExistingTemplate] = useState<ReusableRoutineTemplate | null>(() => {
    return findReusableRoutineTemplate(animal.species, currentAgeStage);
  });
  const hasExistingTemplate = !!existingTemplate;

  const [scheduleRoutineMode, setScheduleRoutineMode] = useState<'existing' | 'custom'>(() => {
    return hasExistingTemplate ? 'existing' : 'custom';
  });
  const [isEditingExistingSchedule, setIsEditingExistingSchedule] = useState(false);
  const [selectedTaskKeys, setSelectedTaskKeys] = useState<string[]>(() => {
    if (existingTemplate?.selectedTaskKeys && existingTemplate.selectedTaskKeys.length > 0) {
      return existingTemplate.selectedTaskKeys;
    }
    return ['feeding', 'water', 'health'];
  });
  const [taskConfigs, setTaskConfigs] = useState<Record<string, TaskScheduleItem>>(() => {
    if (existingTemplate?.taskConfigs) {
      return { ...DEFAULT_SCHEDULE_CONFIGS, ...existingTemplate.taskConfigs };
    }
    return DEFAULT_SCHEDULE_CONFIGS;
  });
  const [customOtherTaskName, setCustomOtherTaskName] = useState<string>('Special Care');
  const [showFullScheduleModal, setShowFullScheduleModal] = useState(false);
  const [showSaveTemplatePrompt, setShowSaveTemplatePrompt] = useState(false);

  // Calendar Date Picker Modal State
  const [calendarModalTaskKey, setCalendarModalTaskKey] = useState<string | null>(null);
  const [calendarNavDate, setCalendarNavDate] = useState<Date>(() => new Date());

  // Date helpers
  const formatYMD = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const formatReadableCustomDates = (dates: string[]) => {
    if (!dates || dates.length === 0) return 'Select dates';
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const sorted = [...dates].sort();
    const formatted = sorted.map(d => {
      const parts = d.split('-');
      if (parts.length === 3) {
        const mIdx = parseInt(parts[1], 10) - 1;
        const dayNum = parseInt(parts[2], 10);
        return `${monthNames[mIdx]} ${dayNum}`;
      }
      return d;
    });
    if (formatted.length <= 3) {
      return formatted.join(', ');
    }
    return `${formatted.slice(0, 2).join(', ')} +${formatted.length - 2} more`;
  };

  const formatSingleDateChip = (dateStr: string) => {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const mIdx = parseInt(parts[1], 10) - 1;
      const d = parseInt(parts[2], 10);
      return `${monthNames[mIdx]} ${d}`;
    }
    return dateStr;
  };

  const handleToggleCustomDate = (dateStr: string) => {
    if (!calendarModalTaskKey) return;
    setTaskConfigs(prev => {
      const cur = prev[calendarModalTaskKey] || DEFAULT_SCHEDULE_CONFIGS[calendarModalTaskKey];
      const existingDates = cur.customDates || [];
      let updatedDates: string[];
      if (existingDates.includes(dateStr)) {
        updatedDates = existingDates.filter(d => d !== dateStr);
      } else {
        updatedDates = [...existingDates, dateStr].sort();
      }

      const summaryText = updatedDates.length > 0
        ? formatReadableCustomDates(updatedDates)
        : 'Select dates';

      return {
        ...prev,
        [calendarModalTaskKey]: {
          ...cur,
          frequency: 'Custom',
          customDates: updatedDates,
          dayOfWeek: summaryText
        }
      };
    });
  };

  // Check if frequency represents a days apart interval
  const isDaysApartFrequency = (freq: string = '', dayOfWeek: string = '') => {
    const f = freq.toLowerCase();
    const d = dayOfWeek.toLowerCase();
    return (
      f.includes('every 2 days') ||
      f.includes('every 3 days') ||
      f.includes('every x days') ||
      f.includes('days apart') ||
      d.includes('apart') ||
      (f.startsWith('every ') && f.includes('day') && f !== 'daily')
    );
  };

  // Helper to format date preview: e.g. "Nov 3, 2026 (Tue) • 8:00 AM"
  const formatSchedulePreviewDate = (timeStr: string = '8:00 AM', dayOfWeek?: string, freq?: string, customDates?: string[]) => {
    try {
      const today = new Date();
      const dateObj = new Date(today.getFullYear(), today.getMonth(), today.getDate());

      if (freq === 'Custom' && customDates && customDates.length > 0) {
        const todayStr = formatYMD(today.getFullYear(), today.getMonth(), today.getDate());
        const upcoming = customDates.filter(d => d >= todayStr).sort();
        const targetDateStr = upcoming[0] || customDates[0];
        const parts = targetDateStr.split('-');
        if (parts.length === 3) {
          const y = parseInt(parts[0], 10);
          const m = parseInt(parts[1], 10) - 1;
          const d = parseInt(parts[2], 10);
          const specificDate = new Date(y, m, d);
          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          return `${monthNames[specificDate.getMonth()]} ${specificDate.getDate()}, ${specificDate.getFullYear()} (${dayNames[specificDate.getDay()]}) • ${timeStr}`;
        }
      }

      if (freq === 'Weekly' && dayOfWeek && dayOfWeek !== '—') {
        const cleanDay = dayOfWeek.replace('Every ', '').trim();
        const daysMap: Record<string, number> = {
          'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6
        };
        const targetDay = daysMap[cleanDay] !== undefined ? daysMap[cleanDay] : daysMap[dayOfWeek];
        if (targetDay !== undefined) {
          const curDay = dateObj.getDay();
          const diff = (targetDay - curDay + 7) % 7;
          dateObj.setDate(dateObj.getDate() + (diff === 0 ? 7 : diff));
        }
      } else if (freq === 'Quarterly') {
        dateObj.setMonth(dateObj.getMonth() + 3);
      } else if (freq === 'Monthly') {
        dateObj.setMonth(dateObj.getMonth() + 1);
      } else if (freq?.toLowerCase().includes('day') || dayOfWeek?.toLowerCase().includes('apart')) {
        const match = (freq + ' ' + (dayOfWeek || '')).match(/(\d+)\s*day/i);
        const daysToAdd = match ? parseInt(match[1], 10) : 3;
        dateObj.setDate(dateObj.getDate() + daysToAdd);
      } else {
        dateObj.setDate(dateObj.getDate() + 1);
      }
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      return `${monthNames[dateObj.getMonth()]} ${dateObj.getDate()}, ${dateObj.getFullYear()} (${dayNames[dateObj.getDay()]}) • ${timeStr}`;
    } catch (e) {}
    return `Scheduled • ${timeStr}`;
  };

  const handleToggleTaskKey = (key: string) => {
    setSelectedTaskKeys(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const handleFrequencyChange = (key: string, val: string) => {
    setTaskConfigs(prev => {
      const cur = prev[key] || DEFAULT_SCHEDULE_CONFIGS[key] || {
        key,
        name: key,
        frequency: val,
        dayOfWeek: '—',
        time: '8:00 AM'
      };
      let newDayOfWeek = cur.dayOfWeek;

      if (val === 'Weekly' || val === 'Bi-weekly') {
        newDayOfWeek = (cur.dayOfWeek && ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].includes(cur.dayOfWeek))
          ? cur.dayOfWeek
          : 'Monday';
      } else if (val === 'Every 2 days') {
        newDayOfWeek = '2 days apart';
      } else if (val === 'Every 3 days') {
        newDayOfWeek = '3 days apart';
      } else if (val === 'Every X days') {
        newDayOfWeek = cur.dayOfWeek && cur.dayOfWeek.includes('apart') ? cur.dayOfWeek : '3 days apart';
      } else if (val === 'Quarterly') {
        newDayOfWeek = '1st of Quarter';
      } else if (val === 'Monthly') {
        newDayOfWeek = '1st of month';
      } else if (val === 'Daily') {
        newDayOfWeek = 'Every day';
      } else if (val === 'Custom') {
        newDayOfWeek = cur.customDates && cur.customDates.length > 0
          ? formatReadableCustomDates(cur.customDates)
          : 'Select dates';
        setTimeout(() => setCalendarModalTaskKey(key), 50);
      }

      return {
        ...prev,
        [key]: {
          ...cur,
          frequency: val,
          dayOfWeek: newDayOfWeek
        }
      };
    });
  };

  const handleDaysApartChange = (key: string, val: string) => {
    const match = val.match(/\d+/);
    const numDays = match ? match[0] : '3';
    setTaskConfigs(prev => {
      const cur = prev[key] || DEFAULT_SCHEDULE_CONFIGS[key];
      return {
        ...prev,
        [key]: {
          ...cur,
          frequency: `Every ${numDays} days`,
          dayOfWeek: val
        }
      };
    });
  };

  const handleInitiateSave = () => {
    const keysToSave = scheduleRoutineMode === 'existing' && !isEditingExistingSchedule
      ? (existingTemplate?.selectedTaskKeys || ['feeding', 'water', 'health'])
      : selectedTaskKeys;

    if (keysToSave.length === 0) {
      setScheduleActionFeedback('Please select at least one task to schedule.');
      return;
    }

    if (scheduleRoutineMode === 'existing' && !isEditingExistingSchedule) {
      executeSaveAndApply(false);
    } else {
      setShowSaveTemplatePrompt(true);
    }
  };

  const executeSaveAndApply = (saveAsTemplate: boolean) => {
    setShowSaveTemplatePrompt(false);

    const keysToSave = scheduleRoutineMode === 'existing' && !isEditingExistingSchedule
      ? (existingTemplate?.selectedTaskKeys || ['feeding', 'water', 'health'])
      : selectedTaskKeys;

    if (keysToSave.length === 0) {
      setScheduleActionFeedback('Please select at least one task to schedule.');
      return;
    }

    if (saveAsTemplate) {
      const saved = saveReusableRoutineTemplate(
        animal.species,
        currentAgeStage || 'Adult',
        taskConfigs,
        selectedTaskKeys
      );
      setExistingTemplate(saved);
    }

    const assignedKeeperId = animal.assignedKeeperId || '';
    const assignedKeeperName = animal.assignedKeeperName || 'Duty Keepers';
    const todayStr = new Date().toISOString().split('T')[0];

    keysToSave.forEach((key, idx) => {
      const config = taskConfigs[key];
      if (!config) return;

      let taskType: Task['type'] = 'Care';
      let title = '';
      let details = '';

      if (key === 'feeding') {
        taskType = 'Feeding';
        title = `Feed ${animal.name || animal.species}`;
        details = `Prey: ${foodItem || 'Standard Prey'} (1 portion)\nFrequency: ${config.frequency}\nTime: ${config.time}`;
      } else if (key === 'water') {
        taskType = 'Care';
        title = `Water Replacement - ${animal.name || animal.species}`;
        details = `Replace and refresh clean water bowl, sanitize dish.\nFrequency: ${config.frequency}\nTime: ${config.time}`;
      } else if (key === 'health') {
        taskType = 'Health Check';
        title = `Health Checkup - ${animal.name || animal.species}`;
        details = `Routine visual & physical exam (eyes, skin/scales, vent, alertness).\nFrequency: ${config.frequency} (${config.dayOfWeek})\nTime: ${config.time}`;
      } else if (key === 'weight') {
        taskType = 'Care';
        title = `Weight Monitoring - ${animal.name || animal.species}`;
        details = `Weigh specimen on calibrated digital scale and log weight in grams.\nFrequency: ${config.frequency} (${config.dayOfWeek})\nTime: ${config.time}`;
      } else if (key === 'cleaning') {
        taskType = 'Cleaning';
        title = `Enclosure Cleaning - ${animal.name || animal.species}`;
        details = `Spot-clean substrate, disinfect decor, check humidity & ventilation.\nFrequency: ${config.frequency} (${config.dayOfWeek})\nTime: ${config.time}`;
      } else if (key === 'other') {
        taskType = 'Care';
        const customName = taskConfigs.other?.name || customOtherTaskName || 'Special Care';
        title = `${customName} - ${animal.name || animal.species}`;
        details = `Routine task: ${customName}\nFrequency: ${config.frequency} (${config.dayOfWeek})\nTime: ${config.time}`;
      }

      let taskDetails = details;
      if (config.frequency === 'Custom' && config.customDates && config.customDates.length > 0) {
        taskDetails += `\nScheduled Custom Dates: ${config.customDates.join(', ')}`;
      }

      const initialTaskDate = (config.frequency === 'Custom' && config.customDates && config.customDates.length > 0)
        ? config.customDates[0]
        : todayStr;

      const newTask: Task = {
        id: 'TASK-' + (Date.now().toString().slice(-5) + (idx * 2) + Math.floor(Math.random() * 100)),
        animalId: animal.id,
        type: taskType,
        title,
        time: config.time,
        date: initialTaskDate,
        details: taskDetails,
        frequency: config.frequency === 'Weekly' ? `Weekly on ${config.dayOfWeek}` : (config.frequency === 'Custom' ? `Custom: ${config.dayOfWeek}` : config.frequency),
        status: 'Pending',
        assignedBy: 'Admin',
        assignedByName: 'Sanctuary Administration',
        assignedKeeperId: assignedKeeperId || undefined,
        assignedKeeperName: assignedKeeperName || undefined,
        enclosureId: animal.enclosureId,
        createdAt: new Date().toISOString()
      };

      onAddTask(newTask);
    });

    onClose();
    if (saveAsTemplate) {
      setScheduleActionFeedback(`✓ Routine saved as reusable template for ${animal.species} (${currentAgeStage || 'Adult'}) and assigned!`);
    } else if (scheduleRoutineMode === 'existing') {
      setScheduleActionFeedback('✓ Routine applied successfully!');
    } else {
      setScheduleActionFeedback(`✓ Routine assigned for ${animal.name || animal.species} only!`);
    }
  };

  const tasksMetadata = [
    {
      key: 'feeding',
      name: 'Feeding',
      icon: (
        <svg className="w-4 h-4 text-[#0B3A23]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 11h16a1 1 0 0 1 1 1c0 5-4 9-9 9s-9-4-9-9a1 1 0 0 1 1-1Z" />
          <path d="M6 7h12" />
        </svg>
      )
    },
    {
      key: 'water',
      name: 'Water Replacement',
      icon: <Droplets className="w-4 h-4 text-[#0B3A23]" />
    },
    {
      key: 'health',
      name: 'Health Checkup',
      icon: <Stethoscope className="w-4 h-4 text-[#0B3A23]" />
    },
    {
      key: 'weight',
      name: 'Weight Monitoring',
      icon: <Scale className="w-4 h-4 text-[#0B3A23]" />
    },
    {
      key: 'cleaning',
      name: 'Enclosure Cleaning',
      icon: <Sparkles className="w-4 h-4 text-[#0B3A23]" />
    },
    {
      key: 'other',
      name: customOtherTaskName || 'Other',
      icon: <MoreHorizontal className="w-4 h-4 text-[#0B3A23]" />
    }
  ];

  // Render Frequency Dropdown
  const renderFrequencySelector = (key: string, config: TaskScheduleItem) => {
    const curFreq = config.frequency;
    const knownOptions = ['Daily', 'Every 2 days', 'Every 3 days', 'Weekly', 'Bi-weekly', 'Monthly', 'Quarterly', 'Custom'];
    const isCustomInterval = !knownOptions.includes(curFreq);

    return (
      <div className="relative">
        <select
          value={curFreq}
          onChange={(e) => handleFrequencyChange(key, e.target.value)}
          className="w-full appearance-none bg-white text-slate-800 text-xs font-semibold px-3 py-1.5 rounded-full border border-slate-200 shadow-2xs focus:outline-none focus:border-[#0B3A23] cursor-pointer pr-6"
        >
          <option value="Daily">Daily</option>
          <option value="Every 2 days">Every 2 days</option>
          <option value="Every 3 days">Every 3 days</option>
          {isCustomInterval && curFreq.startsWith('Every ') && (
            <option value={curFreq}>{curFreq}</option>
          )}
          <option value="Weekly">Weekly</option>
          <option value="Bi-weekly">Bi-weekly</option>
          <option value="Monthly">Monthly</option>
          <option value="Quarterly">Quarterly</option>
          <option value="Custom">Custom</option>
        </select>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>
    );
  };

  // Render Days Column Dropdown/Text based on frequency
  const renderDaysSelector = (key: string, config: TaskScheduleItem, isEditable: boolean) => {
    const isDaysApart = isDaysApartFrequency(config.frequency, config.dayOfWeek);
    const isWeekly = config.frequency === 'Weekly';
    const isBiWeekly = config.frequency === 'Bi-weekly';
    const isQuarterly = config.frequency === 'Quarterly';
    const isMonthly = config.frequency === 'Monthly';
    const isCustom = config.frequency === 'Custom';
    const isDaily = config.frequency === 'Daily';

    if (!isEditable) {
      if (isDaily) {
        return (
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#EDF8F2] border border-emerald-200 text-xs font-semibold text-[#0B3A23]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] shrink-0" />
            <span>Every day</span>
          </div>
        );
      }
      if (isCustom) {
        const hasDates = config.customDates && config.customDates.length > 0;
        return (
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#FAF9F5] border border-slate-200 text-xs font-semibold text-slate-800">
            <Calendar className="w-3.5 h-3.5 text-[#0B3A23] shrink-0" />
            <span className="truncate">{hasDates ? formatReadableCustomDates(config.customDates!) : (config.dayOfWeek || 'Custom Dates')}</span>
          </div>
        );
      }
      return (
        <span className={config.dayOfWeek && config.dayOfWeek !== '—' ? 'text-xs font-semibold text-slate-800' : 'text-slate-400 font-bold text-sm select-none'}>
          {config.dayOfWeek || '—'}
        </span>
      );
    }

    // Daily: clean matching pill
    if (isDaily) {
      return (
        <div className="w-full flex items-center space-x-2 px-3 py-1.5 rounded-full bg-[#F4F9F6] border border-slate-200 text-xs font-semibold text-emerald-950">
          <span className="w-2 h-2 rounded-full bg-[#16A34A] shrink-0" />
          <span className="truncate">Every day</span>
        </div>
      );
    }

    // Days Apart: e.g. 2 days apart, 3 days apart
    if (isDaysApart) {
      const curApartVal = config.dayOfWeek && config.dayOfWeek.includes('apart')
        ? config.dayOfWeek
        : (config.frequency.match(/\d+/) ? `${config.frequency.match(/\d+/)?.[0]} days apart` : '3 days apart');

      return (
        <div className="relative">
          <select
            value={curApartVal}
            onChange={(e) => handleDaysApartChange(key, e.target.value)}
            className="w-full appearance-none bg-white text-slate-800 text-xs font-semibold px-3 py-1.5 rounded-full border border-slate-200 shadow-2xs focus:outline-none focus:border-[#0B3A23] cursor-pointer pr-6"
          >
            <option value="2 days apart">2 days apart</option>
            <option value="3 days apart">3 days apart</option>
            <option value="4 days apart">4 days apart</option>
            <option value="5 days apart">5 days apart</option>
            <option value="6 days apart">6 days apart</option>
            <option value="7 days apart">7 days apart</option>
            <option value="10 days apart">10 days apart</option>
            <option value="14 days apart">14 days apart</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      );
    }

    // Weekly
    if (isWeekly) {
      return (
        <div className="relative">
          <select
            value={config.dayOfWeek && config.dayOfWeek !== '—' && !config.dayOfWeek.includes('2nd') ? config.dayOfWeek : 'Monday'}
            onChange={(e) => {
              const val = e.target.value;
              setTaskConfigs(prev => ({
                ...prev,
                [key]: { ...prev[key], dayOfWeek: val }
              }));
            }}
            className="w-full appearance-none bg-white text-slate-800 text-xs font-semibold px-3 py-1.5 rounded-full border border-slate-200 shadow-2xs focus:outline-none focus:border-[#0B3A23] cursor-pointer pr-6"
          >
            <option value="Monday">Monday</option>
            <option value="Tuesday">Tuesday</option>
            <option value="Wednesday">Wednesday</option>
            <option value="Thursday">Thursday</option>
            <option value="Friday">Friday</option>
            <option value="Saturday">Saturday</option>
            <option value="Sunday">Sunday</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      );
    }

    // Bi-weekly
    if (isBiWeekly) {
      return (
        <div className="relative">
          <select
            value={config.dayOfWeek && config.dayOfWeek !== '—' ? config.dayOfWeek : 'Every 2nd Monday'}
            onChange={(e) => {
              const val = e.target.value;
              setTaskConfigs(prev => ({
                ...prev,
                [key]: { ...prev[key], dayOfWeek: val }
              }));
            }}
            className="w-full appearance-none bg-white text-slate-800 text-xs font-semibold px-3 py-1.5 rounded-full border border-slate-200 shadow-2xs focus:outline-none focus:border-[#0B3A23] cursor-pointer pr-6"
          >
            <option value="Every 2nd Monday">Every 2nd Monday</option>
            <option value="Every 2nd Tuesday">Every 2nd Tuesday</option>
            <option value="Every 2nd Wednesday">Every 2nd Wednesday</option>
            <option value="Every 2nd Thursday">Every 2nd Thursday</option>
            <option value="Every 2nd Friday">Every 2nd Friday</option>
            <option value="Every 2nd Saturday">Every 2nd Saturday</option>
            <option value="Every 2nd Sunday">Every 2nd Sunday</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      );
    }

    // Quarterly
    if (isQuarterly) {
      return (
        <div className="relative">
          <select
            value={config.dayOfWeek && config.dayOfWeek !== '—' ? config.dayOfWeek : '1st of Quarter'}
            onChange={(e) => {
              const val = e.target.value;
              setTaskConfigs(prev => ({
                ...prev,
                [key]: { ...prev[key], dayOfWeek: val }
              }));
            }}
            className="w-full appearance-none bg-white text-slate-800 text-xs font-semibold px-3 py-1.5 rounded-full border border-slate-200 shadow-2xs focus:outline-none focus:border-[#0B3A23] cursor-pointer pr-6"
          >
            <option value="1st of Quarter">1st of Quarter</option>
            <option value="Mid-Quarter">Mid-Quarter</option>
            <option value="End of Quarter">End of Quarter</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      );
    }

    // Monthly
    if (isMonthly) {
      return (
        <div className="relative">
          <select
            value={config.dayOfWeek && config.dayOfWeek !== '—' ? config.dayOfWeek : '1st of the month'}
            onChange={(e) => {
              const val = e.target.value;
              setTaskConfigs(prev => ({
                ...prev,
                [key]: { ...prev[key], dayOfWeek: val }
              }));
            }}
            className="w-full appearance-none bg-white text-slate-800 text-xs font-semibold px-3 py-1.5 rounded-full border border-slate-200 shadow-2xs focus:outline-none focus:border-[#0B3A23] cursor-pointer pr-6"
          >
            <option value="1st of the month">1st of the month</option>
            <option value="15th of the month">15th of the month</option>
            <option value="End of the month">End of the month</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      );
    }

    // Custom: Interactive Calendar Date Selector Button
    if (isCustom) {
      const hasDates = config.customDates && config.customDates.length > 0;
      return (
        <button
          type="button"
          onClick={() => {
            setCalendarModalTaskKey(key);
            if (hasDates && config.customDates?.[0]) {
              const d = new Date(config.customDates[0]);
              if (!isNaN(d.getTime())) setCalendarNavDate(d);
            }
          }}
          className="w-full flex items-center justify-between bg-white hover:bg-[#F2FAF5] text-slate-800 text-xs font-semibold px-3 py-1.5 rounded-full border border-emerald-600/40 hover:border-[#0B3A23] shadow-2xs cursor-pointer transition-all group"
          title="Click to open calendar and select dates"
        >
          <div className="flex items-center space-x-1.5 truncate min-w-0">
            <Calendar className="w-3.5 h-3.5 text-[#0B3A23] shrink-0" />
            <span className="truncate font-bold text-slate-900">
              {hasDates
                ? `${config.customDates?.length} Date${config.customDates && config.customDates.length > 1 ? 's' : ''} Set`
                : 'Select Dates'}
            </span>
          </div>
          <span className="text-[10px] bg-[#E5F5EC] text-[#0B3A23] font-extrabold px-1.5 py-0.5 rounded-md shrink-0 ml-1 group-hover:bg-[#0B3A23] group-hover:text-white transition-colors">
            📅 Pick
          </span>
        </button>
      );
    }

    return <span className="text-slate-400 font-bold text-sm select-none">—</span>;
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#EBE7DF] shadow-xs space-y-6 animate-fadeIn">
      {/* Header matching image_793890ac.png */}
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 rounded-lg bg-[#E5F5EC] text-[#0B3A23] flex items-center justify-center shrink-0 border border-emerald-900/10">
          <Calendar className="w-5 h-5 text-[#0B3A23]" />
        </div>
        <h3 className="font-extrabold text-xl sm:text-2xl text-slate-900 tracking-tight">
          Assign Feeding & Care Tasks
        </h3>
      </div>

      {/* Routine Selection Cards */}
      {!hasExistingTemplate ? (
        /* If no routine template exists yet for this animal's species & age, display ONLY Create Custom Routine */
        <div className="p-4 sm:p-4.5 rounded-2xl border-2 border-[#16A34A] bg-[#EDF8F2] shadow-xs flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#E5F5EC] text-[#0B3A23] flex items-center justify-center shrink-0 border border-emerald-900/10">
              <Plus className="w-5 h-5 text-[#0B3A23]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="font-bold text-sm sm:text-base text-slate-900 leading-snug">Create Custom Routine</h4>
                <span className="text-[10px] font-bold text-emerald-800 bg-[#D4EFE0] px-2.5 py-0.5 rounded-full">
                  No Saved Routine Yet
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Set a custom feeding and care routine for {animal.species} – {currentAgeStage || 'Adult'}. You can save it as a reusable template.
              </p>
            </div>
          </div>
          <div className="w-5 h-5 rounded-full border-2 border-[#0B3A23] flex items-center justify-center shrink-0">
            <div className="w-2.5 h-2.5 rounded-full bg-[#0B3A23]" />
          </div>
        </div>
      ) : (
        /* Both cards displayed when a reusable template exists for this species & age stage */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: Use Existing Routine */}
          <div
            onClick={() => {
              setScheduleRoutineMode('existing');
              if (existingTemplate) {
                setTaskConfigs(prev => ({ ...prev, ...existingTemplate.taskConfigs }));
                setSelectedTaskKeys(existingTemplate.selectedTaskKeys || ['feeding', 'water', 'health']);
              }
            }}
            className={`p-4 sm:p-4.5 rounded-2xl flex items-center justify-between cursor-pointer transition-all ${
              scheduleRoutineMode === 'existing'
                ? 'border-2 border-[#16A34A] bg-[#EDF8F2] shadow-xs'
                : 'border border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#E5F5EC] text-[#0B3A23] flex items-center justify-center shrink-0">
                <Layers className="w-5 h-5 text-[#0B3A23]" />
              </div>
              <div>
                <h4 className="font-bold text-sm sm:text-base text-slate-900 leading-snug">Use Existing Routine</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Apply the saved routine for {animal.species} – {currentAgeStage || 'Adult'}.
                </p>
              </div>
            </div>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
              scheduleRoutineMode === 'existing' ? 'border-[#0B3A23]' : 'border-slate-300'
            }`}>
              {scheduleRoutineMode === 'existing' && <div className="w-2.5 h-2.5 rounded-full bg-[#0B3A23]" />}
            </div>
          </div>

          {/* Card 2: Create Custom Routine */}
          <div
            onClick={() => setScheduleRoutineMode('custom')}
            className={`p-4 sm:p-4.5 rounded-2xl flex items-center justify-between cursor-pointer transition-all ${
              scheduleRoutineMode === 'custom'
                ? 'border-2 border-[#16A34A] bg-[#EDF8F2] shadow-xs'
                : 'border border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-slate-50 text-emerald-800 flex items-center justify-center shrink-0 border border-slate-100">
                <Plus className="w-5 h-5 text-emerald-800" />
              </div>
              <div>
                <h4 className="font-bold text-sm sm:text-base text-slate-900 leading-snug">Create Custom Routine</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Set a new and unique routine for this animal.
                </p>
              </div>
            </div>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
              scheduleRoutineMode === 'custom' ? 'border-[#0B3A23]' : 'border-slate-300'
            }`}>
              {scheduleRoutineMode === 'custom' && <div className="w-2.5 h-2.5 rounded-full bg-[#0B3A23]" />}
            </div>
          </div>
        </div>
      )}

      {/* Routine Content: Existing Preview or Custom 2-Column */}
      {scheduleRoutineMode === 'existing' ? (
        /* Use Existing Routine Layout matching image_0246226e.png */
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs space-y-4">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start space-x-3">
              <Calendar className="w-6 h-6 text-[#0B3A23] shrink-0 mt-0.5 stroke-[2.2]" />
              <div>
                <h4 className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight">
                  Routine Schedule Preview
                </h4>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  This is the current schedule for {animal.species} – {currentAgeStage || 'Adult'}. You can edit it if needed.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsEditingExistingSchedule(!isEditingExistingSchedule)}
              className={`self-start sm:self-auto px-3.5 py-1.5 rounded-xl border text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer shadow-2xs ${
                isEditingExistingSchedule
                  ? 'border-emerald-600 bg-[#E5F5EC] text-[#0B3A23]'
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800'
              }`}
            >
              <Pencil className="w-3.5 h-3.5 text-slate-700" />
              <span>{isEditingExistingSchedule ? 'Done Editing' : 'Edit Schedule'}</span>
            </button>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto custom-scrollbar">
            <div className="min-w-[480px]">
              {/* Table Header */}
              <div className="bg-[#E2F2E9] rounded-xl px-4 py-2.5 text-xs font-extrabold text-[#0B3A23] grid grid-cols-12 items-center gap-3 mb-2">
                <div className="col-span-4">Task</div>
                <div className="col-span-3">Frequency</div>
                <div className="col-span-3">Days / Interval</div>
                <div className="col-span-2">Time</div>
              </div>

              {/* Table Rows */}
              <div className="divide-y divide-slate-100 bg-white">
                {(existingTemplate?.selectedTaskKeys && existingTemplate.selectedTaskKeys.length > 0
                  ? existingTemplate.selectedTaskKeys
                  : ['feeding', 'water', 'health']
                ).map((key) => {
                  const config = taskConfigs[key] || DEFAULT_SCHEDULE_CONFIGS[key];
                  const meta = tasksMetadata.find(m => m.key === key) || { name: key, icon: <Calendar className="w-4 h-4 text-[#0B3A23]" /> };

                  return (
                    <div
                      key={key}
                      className="grid grid-cols-12 items-center gap-3 px-4 py-3 hover:bg-[#FAFDFC] transition-colors"
                    >
                      {/* Col 1: Task */}
                      <div className="col-span-4 flex items-center space-x-2.5 min-w-0">
                        <span className="shrink-0">{meta.icon}</span>
                        <span className="font-bold text-xs sm:text-sm text-slate-900 truncate">{meta.name}</span>
                      </div>

                      {/* Col 2: Frequency */}
                      <div className="col-span-3">
                        {isEditingExistingSchedule ? (
                          renderFrequencySelector(key, config)
                        ) : (
                          <span className="text-xs font-semibold text-slate-800">{config.frequency}</span>
                        )}
                      </div>

                      {/* Col 3: Days / Interval */}
                      <div className="col-span-3">
                        {renderDaysSelector(key, config, isEditingExistingSchedule)}
                      </div>

                      {/* Col 4: Time */}
                      <div className="col-span-2">
                        {isEditingExistingSchedule ? (
                          <div className="relative flex items-center bg-white rounded-full border border-slate-200 shadow-2xs px-3 py-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-500 mr-2 shrink-0" />
                            <input
                              type="text"
                              value={config.time}
                              onChange={(e) => {
                                const val = e.target.value;
                                setTaskConfigs(prev => ({
                                  ...prev,
                                  [key]: { ...prev[key], time: val }
                                }));
                              }}
                              className="w-full bg-transparent text-xs font-semibold text-slate-800 focus:outline-none"
                            />
                          </div>
                        ) : (
                          <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-900">
                            <Clock className="w-3.5 h-3.5 text-slate-700 shrink-0" />
                            <span>{config.time}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Next Activities Bar matching image_0246226e.png */}
          <div className="bg-[#EDF8F2] rounded-2xl p-3 sm:p-3.5 flex flex-wrap items-center justify-between gap-3 mt-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* Next Activities Label */}
              <div className="flex items-center space-x-2 text-[#0B3A23]">
                <Info className="w-4 h-4 text-[#0B3A23] stroke-[2.4]" />
                <span className="font-extrabold text-xs sm:text-sm text-[#0B3A23] tracking-tight whitespace-nowrap">
                  Next Activities
                </span>
                <span className="text-slate-300 font-normal hidden sm:inline ml-1">|</span>
              </div>

              {/* Activity 1: Next Feeding */}
              <div className="bg-white rounded-xl px-3.5 py-2 border border-slate-200/80 shadow-2xs flex items-center space-x-2.5">
                <svg className="w-4 h-4 text-[#0B3A23]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 11h16a1 1 0 0 1 1 1c0 5-4 9-9 9s-9-4-9-9a1 1 0 0 1 1-1Z" />
                  <path d="M6 7h12" />
                </svg>
                <div>
                  <p className="text-[11px] font-bold text-slate-900 leading-tight">Next Feeding</p>
                  <p className="text-[10px] text-slate-500 font-medium">
                    {formatSchedulePreviewDate(taskConfigs.feeding?.time, taskConfigs.feeding?.dayOfWeek, taskConfigs.feeding?.frequency)}
                  </p>
                </div>
              </div>

              {/* Activity 2: Next Water Replacement */}
              <div className="bg-white rounded-xl px-3.5 py-2 border border-slate-200/80 shadow-2xs flex items-center space-x-2.5">
                <Droplets className="w-4 h-4 text-[#0B3A23]" />
                <div>
                  <p className="text-[11px] font-bold text-slate-900 leading-tight">Next Water Replacement</p>
                  <p className="text-[10px] text-slate-500 font-medium">
                    {formatSchedulePreviewDate(taskConfigs.water?.time, taskConfigs.water?.dayOfWeek, taskConfigs.water?.frequency)}
                  </p>
                </div>
              </div>
            </div>

            {/* View Full Schedule Button */}
            <button
              type="button"
              onClick={() => setShowFullScheduleModal(true)}
              className="rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold px-4 py-2 flex items-center space-x-1.5 shadow-2xs cursor-pointer transition-colors shrink-0"
            >
              <Calendar className="w-3.5 h-3.5 text-[#0B3A23]" />
              <span>View Full Schedule</span>
            </button>
          </div>
        </div>
      ) : (
        /* Create Custom Routine Layout (Preserved 2-column layout unchanged) */
        <div className="flex flex-col lg:flex-row items-stretch gap-6">
          {/* Left Column: Select Tasks */}
          <div className="w-full lg:w-72 shrink-0 bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs space-y-3">
            <h4 className="font-extrabold text-base text-slate-900 tracking-tight">Select Tasks</h4>
            <div className="space-y-2">
              {tasksMetadata.map(t => {
                const isChecked = selectedTaskKeys.includes(t.key);
                const isOther = t.key === 'other';

                return (
                  <div key={t.key} className="space-y-1.5">
                    <div
                      onClick={() => handleToggleTaskKey(t.key)}
                      className={`p-3 rounded-2xl flex items-center space-x-3 cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-[#EAF6EE] text-slate-900'
                          : 'bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                        isChecked
                          ? 'bg-[#0B3A23] text-white'
                          : 'border-2 border-slate-300 bg-white'
                      }`}>
                        {isChecked && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                      </div>
                      <div className="shrink-0">{t.icon}</div>
                      <span className="font-bold text-sm select-none">{isOther ? 'Other' : t.name}</span>
                    </div>

                    {/* Inline Task Name Input for 'Other' */}
                    {isOther && isChecked && (
                      <div className="pl-8 pr-1 animate-fadeIn">
                        <input
                          type="text"
                          value={customOtherTaskName}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCustomOtherTaskName(val);
                            setTaskConfigs(prev => ({
                              ...prev,
                              other: {
                                ...prev.other,
                                name: val || 'Other'
                              }
                            }));
                          }}
                          placeholder="Task name (e.g. Misting, Shedding...)"
                          className="w-full text-xs font-semibold px-3 py-1.5 rounded-xl border border-emerald-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0B3A23] focus:border-[#0B3A23] shadow-2xs"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Set Schedule */}
          <div className="flex-1 min-w-0 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-[#0B3A23]" />
              <h4 className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight">Set Schedule</h4>
            </div>

            {/* Schedule Table Container */}
            <div className="overflow-x-auto custom-scrollbar">
              <div className="min-w-[480px]">
                {/* Table Header */}
                <div className="bg-[#E2F2E9] rounded-xl px-4 py-2.5 text-xs font-extrabold text-[#0B3A23] grid grid-cols-12 items-center gap-3 mb-2">
                  <div className="col-span-4">Task</div>
                  <div className="col-span-3">Frequency</div>
                  <div className="col-span-3">Days / Interval</div>
                  <div className="col-span-2">Time</div>
                </div>

                {/* Table Rows */}
                {selectedTaskKeys.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs font-semibold bg-[#FAF9F5] rounded-2xl border border-dashed border-slate-200">
                    No tasks selected. Please check at least one task on the left to configure its schedule.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedTaskKeys.map((key) => {
                      const config = taskConfigs[key] || {
                        key,
                        name: key === 'other' ? (customOtherTaskName || 'Other') : key,
                        frequency: 'Daily',
                        dayOfWeek: '—',
                        time: '8:00 AM'
                      };

                      const meta = tasksMetadata.find(m => m.key === key) || {
                        key,
                        name: key === 'other' ? (customOtherTaskName || 'Other') : key,
                        icon: <Calendar className="w-4 h-4 text-[#0B3A23]" />
                      };

                      const displayName = key === 'other' ? (customOtherTaskName || 'Other') : meta.name;

                      return (
                        <div
                          key={key}
                          className="grid grid-cols-12 items-center gap-3 px-4 py-2.5 bg-white rounded-xl border border-slate-200/80 hover:border-slate-300 transition-colors"
                        >
                          {/* Col 1: Task */}
                          <div className="col-span-4 flex items-center space-x-2.5 min-w-0">
                            <span className="shrink-0">{meta.icon}</span>
                            <span className="font-bold text-xs sm:text-sm text-slate-900 truncate">{displayName}</span>
                          </div>

                          {/* Col 2: Frequency */}
                          <div className="col-span-3">
                            {renderFrequencySelector(key, config)}
                          </div>

                          {/* Col 3: Days / Interval */}
                          <div className="col-span-3">
                            {renderDaysSelector(key, config, true)}
                          </div>

                          {/* Col 4: Time */}
                          <div className="col-span-2 relative">
                            <div className="relative flex items-center bg-white rounded-full border border-slate-200 shadow-2xs px-3 py-1.5">
                              <Clock className="w-3.5 h-3.5 text-slate-500 mr-2 shrink-0" />
                              <input
                                type="text"
                                value={config.time}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setTaskConfigs(prev => ({
                                    ...prev,
                                    [key]: { ...prev[key], time: val }
                                  }));
                                }}
                                className="w-full bg-transparent text-xs font-semibold text-slate-800 focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Schedule Preview Bar */}
            <div className="bg-[#E5F5EC] rounded-2xl p-3.5 sm:p-4 flex flex-wrap items-center justify-between gap-3 mt-4">
              <div className="flex items-center space-x-1.5 text-xs font-extrabold text-[#0B3A23]">
                <Calendar className="w-4 h-4 text-[#0B3A23]" />
                <span>Schedule Preview</span>
                <span title="Auto-calculated upcoming task occurrences">
                  <Info className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {selectedTaskKeys.includes('feeding') && (
                  <div className="bg-white rounded-xl px-3.5 py-2 border border-slate-200/80 shadow-2xs flex items-center space-x-2.5">
                    <svg className="w-4 h-4 text-[#0B3A23]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 11h16a1 1 0 0 1 1 1c0 5-4 9-9 9s-9-4-9-9a1 1 0 0 1 1-1Z" />
                      <path d="M6 7h12" />
                    </svg>
                    <div>
                      <p className="text-[11px] font-bold text-slate-900 leading-tight">Next Feeding</p>
                      <p className="text-[10px] text-slate-500 font-medium">
                        {formatSchedulePreviewDate(taskConfigs.feeding?.time, taskConfigs.feeding?.dayOfWeek, taskConfigs.feeding?.frequency)}
                      </p>
                    </div>
                  </div>
                )}

                {selectedTaskKeys.includes('water') && (
                  <div className="bg-white rounded-xl px-3.5 py-2 border border-slate-200/80 shadow-2xs flex items-center space-x-2.5">
                    <Droplets className="w-4 h-4 text-[#0B3A23]" />
                    <div>
                      <p className="text-[11px] font-bold text-slate-900 leading-tight">Next Water Replacement</p>
                      <p className="text-[10px] text-slate-500 font-medium">
                        {formatSchedulePreviewDate(taskConfigs.water?.time, taskConfigs.water?.dayOfWeek, taskConfigs.water?.frequency)}
                      </p>
                    </div>
                  </div>
                )}

                {selectedTaskKeys.includes('health') && (!selectedTaskKeys.includes('feeding') || !selectedTaskKeys.includes('water')) && (
                  <div className="bg-white rounded-xl px-3.5 py-2 border border-slate-200/80 shadow-2xs flex items-center space-x-2.5">
                    <Stethoscope className="w-4 h-4 text-[#0B3A23]" />
                    <div>
                      <p className="text-[11px] font-bold text-slate-900 leading-tight">Next Health Checkup</p>
                      <p className="text-[10px] text-slate-500 font-medium">
                        {formatSchedulePreviewDate(taskConfigs.health?.time, taskConfigs.health?.dayOfWeek, taskConfigs.health?.frequency)}
                      </p>
                    </div>
                  </div>
                )}

                {selectedTaskKeys.includes('other') && (
                  <div className="bg-white rounded-xl px-3.5 py-2 border border-slate-200/80 shadow-2xs flex items-center space-x-2.5">
                    <MoreHorizontal className="w-4 h-4 text-[#0B3A23]" />
                    <div>
                      <p className="text-[11px] font-bold text-slate-900 leading-tight">Next {customOtherTaskName || 'Care'}</p>
                      <p className="text-[10px] text-slate-500 font-medium">
                        {formatSchedulePreviewDate(taskConfigs.other?.time, taskConfigs.other?.dayOfWeek, taskConfigs.other?.frequency)}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => setShowFullScheduleModal(true)}
                className="rounded-full border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold px-4 py-2 flex items-center space-x-1.5 shadow-2xs cursor-pointer transition-colors"
              >
                <Calendar className="w-3.5 h-3.5 text-[#0B3A23]" />
                <span>View Full Schedule</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer Action Buttons */}
      <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
        <button
          type="button"
          onClick={onClose}
          className="rounded-full border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs sm:text-sm font-bold px-6 py-2.5 transition-colors cursor-pointer shadow-2xs"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleInitiateSave}
          className="rounded-full bg-[#0B3A23] hover:bg-[#072717] text-white text-xs sm:text-sm font-bold px-7 py-2.5 transition-all shadow-sm flex items-center space-x-1.5 cursor-pointer active:scale-95"
        >
          <Check className="w-4 h-4 text-white" />
          <span>{scheduleRoutineMode === 'existing' ? 'Apply Routine' : 'Save Assignment'}</span>
        </button>
      </div>

      {/* View Full Schedule Timeline Modal */}
      {showFullScheduleModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-slate-200 shadow-xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <Calendar className="w-5 h-5 text-[#0B3A23]" />
                <h3 className="font-extrabold text-base sm:text-lg text-slate-900">Upcoming Schedule Timeline</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowFullScheduleModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1 custom-scrollbar">
              {selectedTaskKeys.map(key => {
                const config = taskConfigs[key];
                if (!config) return null;
                return (
                  <div key={key} className="p-3.5 rounded-2xl bg-[#F7FCF9] border border-emerald-900/10 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-xs sm:text-sm text-slate-900 capitalize">
                        {key === 'other' ? (customOtherTaskName || 'Special Care') : config.name} Schedule
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {config.frequency} {config.dayOfWeek && config.dayOfWeek !== '—' ? `(${config.dayOfWeek})` : ''} • {config.time}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] font-semibold text-emerald-800 bg-[#E2F2E9] px-2.5 py-1 rounded-full">
                        {formatSchedulePreviewDate(config.time, config.dayOfWeek, config.frequency).split('•')[0]}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
                        Ongoing Routine
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowFullScheduleModal(false)}
                className="px-5 py-2 rounded-full bg-[#0B3A23] text-white text-xs font-bold hover:bg-[#072717] cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Routine as Reusable Template or For This Animal Only Modal */}
      {showSaveTemplatePrompt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full border border-slate-200 shadow-2xl space-y-5 animate-scaleUp">
            <div className="flex items-start space-x-3.5 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-2xl bg-[#E5F5EC] text-[#0B3A23] flex items-center justify-center shrink-0 border border-emerald-900/10">
                <BookmarkCheck className="w-5 h-5 text-[#0B3A23]" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-extrabold text-lg text-slate-900 leading-snug">
                  Save Routine Configuration
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Save this routine for <span className="font-bold text-slate-800">{animal.species} – {currentAgeStage || 'Adult'}</span>:
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowSaveTemplatePrompt(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Option 1: Save as Reusable Template */}
              <div
                onClick={() => executeSaveAndApply(true)}
                className="p-4 sm:p-4.5 rounded-2xl border-2 border-[#16A34A] bg-[#F7FCF9] hover:bg-[#EAF6EE] cursor-pointer transition-all space-y-2 group shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-extrabold text-sm sm:text-base text-[#0B3A23]">Save as Reusable Template</span>
                    <span className="text-[10px] font-bold text-emerald-800 bg-[#D4EFE0] px-2 py-0.5 rounded-full">
                      Recommended
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#0B3A23] group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Save this as the standard routine template for all <span className="font-bold text-slate-800">{animal.species} ({currentAgeStage || 'Adult'})</span>. Future matching animals will automatically have it available under <strong>Use Existing Routine</strong>.
                </p>
              </div>

              {/* Option 2: This Animal Only */}
              <div
                onClick={() => executeSaveAndApply(false)}
                className="p-4 sm:p-4.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 cursor-pointer transition-all space-y-2 group shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm sm:text-base text-slate-800">For This Animal Only</span>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Apply this schedule only to <span className="font-semibold text-slate-700">{animal.name || animal.id}</span>. No reusable template will be created for other animals.
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => setShowSaveTemplatePrompt(false)}
                className="px-5 py-2 rounded-full border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer transition-colors shadow-2xs"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Custom Calendar Date Picker Modal */}
      {calendarModalTaskKey && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full border border-slate-200 shadow-2xl space-y-4 animate-scaleUp">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-[#E5F5EC] text-[#0B3A23] flex items-center justify-center shrink-0 border border-emerald-900/10">
                  <Calendar className="w-5 h-5 text-[#0B3A23]" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg text-slate-900 leading-tight">
                    Select Custom Dates
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Task: <span className="font-bold text-slate-800">{taskConfigs[calendarModalTaskKey]?.name || 'Husbandry Task'}</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCalendarModalTaskKey(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Month Navigation */}
            <div className="flex items-center justify-between px-1">
              <button
                type="button"
                onClick={() => setCalendarNavDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
                className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 cursor-pointer transition-colors shadow-2xs"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="text-center">
                <span className="font-extrabold text-sm sm:text-base text-slate-900">
                  {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][calendarNavDate.getMonth()]} {calendarNavDate.getFullYear()}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setCalendarNavDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
                className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 cursor-pointer transition-colors shadow-2xs"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="bg-[#FAF9F5] p-3 rounded-2xl border border-slate-200/80">
              {/* Weekday Labels */}
              <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                  <div key={day} className="text-[11px] font-extrabold text-slate-400 py-1">
                    {day}
                  </div>
                ))}
              </div>

              {/* Days Cells */}
              <div className="grid grid-cols-7 gap-1">
                {/* Blank offset cells */}
                {Array.from({ length: new Date(calendarNavDate.getFullYear(), calendarNavDate.getMonth(), 1).getDay() }).map((_, i) => (
                  <div key={`blank-${i}`} className="aspect-square" />
                ))}

                {/* Month Day Cells */}
                {Array.from({ length: new Date(calendarNavDate.getFullYear(), calendarNavDate.getMonth() + 1, 0).getDate() }).map((_, i) => {
                  const dayNum = i + 1;
                  const dateStr = formatYMD(calendarNavDate.getFullYear(), calendarNavDate.getMonth(), dayNum);
                  const today = new Date();
                  const todayStr = formatYMD(today.getFullYear(), today.getMonth(), today.getDate());
                  const isToday = dateStr === todayStr;
                  const isSelected = (taskConfigs[calendarModalTaskKey]?.customDates || []).includes(dateStr);

                  return (
                    <button
                      key={dateStr}
                      type="button"
                      onClick={() => handleToggleCustomDate(dateStr)}
                      className={`aspect-square rounded-xl text-xs flex flex-col items-center justify-center transition-all cursor-pointer relative ${
                        isSelected
                          ? 'bg-[#0B3A23] text-white font-extrabold shadow-xs scale-105 ring-2 ring-[#0B3A23]/30'
                          : isToday
                          ? 'border-2 border-emerald-600 bg-[#E5F5EC] text-[#0B3A23] font-bold hover:bg-emerald-100'
                          : 'text-slate-800 hover:bg-slate-200/70 font-medium'
                      }`}
                    >
                      <span>{dayNum}</span>
                      {isSelected && <span className="w-1 h-1 rounded-full bg-emerald-300 mt-0.5" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Dates Summary */}
            <div className="p-3 bg-[#F7FCF9] rounded-2xl border border-emerald-900/10 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center space-x-1.5 text-[#0B3A23]">
                  <Calendar className="w-3.5 h-3.5 text-[#0B3A23]" />
                  <span>Selected Dates ({taskConfigs[calendarModalTaskKey]?.customDates?.length || 0})</span>
                </span>
                {(taskConfigs[calendarModalTaskKey]?.customDates?.length || 0) > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      if (!calendarModalTaskKey) return;
                      setTaskConfigs(prev => ({
                        ...prev,
                        [calendarModalTaskKey]: {
                          ...prev[calendarModalTaskKey],
                          customDates: [],
                          dayOfWeek: 'Select dates'
                        }
                      }));
                    }}
                    className="text-[11px] text-rose-600 hover:text-rose-800 font-semibold cursor-pointer"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {(!taskConfigs[calendarModalTaskKey]?.customDates || taskConfigs[calendarModalTaskKey]?.customDates?.length === 0) ? (
                <p className="text-xs text-slate-400 italic">No dates selected yet. Click any day on the calendar above to pick dates.</p>
              ) : (
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto custom-scrollbar pr-1">
                  {taskConfigs[calendarModalTaskKey]?.customDates?.map(dateStr => (
                    <span
                      key={dateStr}
                      className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-white border border-emerald-300 text-xs font-bold text-[#0B3A23] shadow-2xs"
                    >
                      <span>{formatSingleDateChip(dateStr)}</span>
                      <button
                        type="button"
                        onClick={() => handleToggleCustomDate(dateStr)}
                        className="hover:text-rose-600 ml-0.5 cursor-pointer text-slate-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Footer Modal Actions */}
            <div className="flex items-center justify-end space-x-2.5 pt-1">
              <button
                type="button"
                onClick={() => setCalendarModalTaskKey(null)}
                className="px-4 py-2 rounded-full border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer transition-colors shadow-2xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const curDates = taskConfigs[calendarModalTaskKey]?.customDates || [];
                  if (curDates.length > 0) {
                    setTaskConfigs(prev => ({
                      ...prev,
                      [calendarModalTaskKey]: {
                        ...prev[calendarModalTaskKey],
                        frequency: 'Custom',
                        dayOfWeek: formatReadableCustomDates(curDates)
                      }
                    }));
                  }
                  setCalendarModalTaskKey(null);
                }}
                className="px-5 py-2 rounded-full bg-[#0B3A23] hover:bg-[#072717] text-white text-xs font-bold cursor-pointer transition-all shadow-sm flex items-center space-x-1.5"
              >
                <Check className="w-3.5 h-3.5 text-white" />
                <span>Apply Dates</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
