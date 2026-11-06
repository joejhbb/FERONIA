import { saveRecord } from '../lib/dbClient';

export interface TaskScheduleItem {
  key: string;
  name: string;
  frequency: string;
  dayOfWeek: string;
  time: string;
  customDates?: string[];
}

export interface ReusableRoutineTemplate {
  id: string;
  species: string;
  cleanSpecies: string;
  ageStage: string;
  taskConfigs: Record<string, TaskScheduleItem>;
  selectedTaskKeys: string[];
  createdAt: string;
  updatedAt?: string;
}

const ROUTINE_TEMPLATES_STORAGE_KEY = 'feronia_reusable_routine_templates_v1';

// Seed initial Ball Python - Adult template matching reference image
const INITIAL_TEMPLATES: ReusableRoutineTemplate[] = [
  {
    id: 'TMPL-BALL-PYTHON-ADULT',
    species: 'Ball Python',
    cleanSpecies: 'ball python',
    ageStage: 'Adult',
    taskConfigs: {
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
        dayOfWeek: '—',
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
      }
    },
    selectedTaskKeys: ['feeding', 'water', 'health'],
    createdAt: new Date().toISOString()
  }
];

export function getReusableRoutineTemplates(): ReusableRoutineTemplate[] {
  try {
    const raw = localStorage.getItem(ROUTINE_TEMPLATES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(ROUTINE_TEMPLATES_STORAGE_KEY, JSON.stringify(INITIAL_TEMPLATES));
      return INITIAL_TEMPLATES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_TEMPLATES;
  } catch (err) {
    console.error('Failed to parse routine templates:', err);
    return INITIAL_TEMPLATES;
  }
}

export function findReusableRoutineTemplate(speciesName: string, ageStageName?: string): ReusableRoutineTemplate | null {
  const cleanSpec = (speciesName || '').split('(')[0].trim().toLowerCase();
  const stage = (ageStageName || 'Adult').trim().toLowerCase();
  const templates = getReusableRoutineTemplates();

  // 1. Exact species & age stage match
  const exact = templates.find(t => 
    t.cleanSpecies === cleanSpec && 
    (t.ageStage.toLowerCase() === stage || t.ageStage.toLowerCase() === 'all ages')
  );
  if (exact) return exact;

  // 2. Partial clean species match with exact stage
  const partial = templates.find(t =>
    (t.cleanSpecies.includes(cleanSpec) || cleanSpec.includes(t.cleanSpecies)) &&
    (t.ageStage.toLowerCase() === stage || t.ageStage.toLowerCase() === 'all ages')
  );
  if (partial) return partial;

  return null;
}

export function saveReusableRoutineTemplate(
  species: string,
  ageStage: string,
  taskConfigs: Record<string, TaskScheduleItem>,
  selectedTaskKeys: string[]
): ReusableRoutineTemplate {
  const cleanSpecies = (species || '').split('(')[0].trim().toLowerCase();
  const stage = (ageStage || 'Adult').trim();
  const templates = getReusableRoutineTemplates();

  const existingIndex = templates.findIndex(t => 
    t.cleanSpecies === cleanSpecies && 
    t.ageStage.toLowerCase() === stage.toLowerCase()
  );

  const newTemplate: ReusableRoutineTemplate = {
    id: existingIndex >= 0 ? templates[existingIndex].id : `TMPL-${Date.now().toString().slice(-6)}`,
    species: species.split('(')[0].trim(),
    cleanSpecies,
    ageStage: stage,
    taskConfigs,
    selectedTaskKeys: selectedTaskKeys.length > 0 ? selectedTaskKeys : ['feeding', 'water', 'health'],
    createdAt: existingIndex >= 0 ? templates[existingIndex].createdAt : new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  let updatedList: ReusableRoutineTemplate[];
  if (existingIndex >= 0) {
    updatedList = [...templates];
    updatedList[existingIndex] = newTemplate;
  } else {
    updatedList = [newTemplate, ...templates];
  }

  try {
    localStorage.setItem(ROUTINE_TEMPLATES_STORAGE_KEY, JSON.stringify(updatedList));
    // Also sync to species_schedule_templates table
    saveRecord('species_schedule_templates', {
      id: newTemplate.id,
      species: newTemplate.species,
      cleanSpecies: newTemplate.cleanSpecies,
      ageStage: newTemplate.ageStage,
      title: `${newTemplate.species} (${newTemplate.ageStage}) Standard Routine`,
      scheduleType: 'both',
      foodItemName: '',
      feedingMethod: '',
      feedingFreq: taskConfigs.feeding?.frequency || 'Every 3 days',
      feedingQuantity: '1 portion',
      feedingTime: taskConfigs.feeding?.time || '8:00 AM',
      feedingNotes: '',
      careTaskName: taskConfigs.health?.name || 'Health Checkup',
      careFreq: taskConfigs.health?.frequency || 'Weekly',
      careTime: taskConfigs.health?.time || '10:00 AM',
      careNotes: '',
      createdAt: newTemplate.createdAt
    }).catch(() => {});
  } catch (err) {
    console.error('Failed to save reusable routine template:', err);
  }

  return newTemplate;
}
