import React, { useMemo } from 'react';
import {
  PawPrint,
  Plus,
  Leaf,
  Search,
  Camera,
  Edit2,
  Trash2,
  ChevronRight,
  Stethoscope,
  Eye,
  Shield,
  AlertTriangle,
  X,
  ArrowLeft,
  Clock,
  Thermometer,
  Flame,
  Sun,
  FolderArchive
} from 'lucide-react';
import { Animal, Enclosure, Appointment, StaffMember, Task, getTaskComputedStatus, getAppointmentRequesterInfo, resolveVeterinarianName } from '../../types';

export const isAnimalNeedingAttention = (
  animal: Animal,
  appointments: Appointment[] = [],
  tasks: Task[] = [],
  systemDate?: string
): boolean => {
  if (animal.isArchived) return false;
  // 1. Health status is not Healthy
  const isUnhealthy = !!(animal.healthStatus && animal.healthStatus !== 'Healthy');
  // 2. Pending or reschedule-requested appointments for this animal
  const hasPendingAppt = appointments.some(a => 
    a.animalId === animal.id && 
    (a.status === 'Pending Approval' || a.status === 'Pending' || a.status === 'Reschedule Requested')
  );
  // 3. Overdue tasks for this animal
  const hasOverdueTask = tasks.some(t => 
    t.animalId === animal.id && 
    (t.status === 'Overdue' || (getTaskComputedStatus ? getTaskComputedStatus(t, systemDate || '') === 'Overdue' : false))
  );
  return isUnhealthy || hasPendingAppt || hasOverdueTask;
};

interface AdminAnimalsViewProps {
  animals: Animal[];
  enclosures: Enclosure[];
  appointments: Appointment[];
  staffMembers: StaffMember[];
  tasks?: Task[];
  systemDate?: string;
  isDarkMode: boolean;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  speciesFilter: string;
  setSpeciesFilter: (val: string) => void;
  sexFilter: string;
  setSexFilter: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  selectedAnimal: Animal | null;
  onSelectAnimal: (animal: Animal, initialTab: 'overview' | 'medical') => void;
  onOpenAddModal: () => void;
  onOpenEditModal: (animal: Animal) => void;
  onOpenDeleteModal: (animal: Animal) => void;
  onNavigateToArchive?: () => void;
  onDeleteAppointment?: (id: string) => void;
  onUpdateAppointmentStatus?: (id: string, status: Appointment['status']) => void;
  onBackToDashboard?: () => void;
  onBack?: () => void;
}

export const AdminAnimalsView: React.FC<AdminAnimalsViewProps> = ({
  animals,
  enclosures,
  appointments,
  staffMembers,
  tasks = [],
  systemDate,
  isDarkMode,
  searchQuery,
  setSearchQuery,
  speciesFilter,
  setSpeciesFilter,
  sexFilter,
  setSexFilter,
  statusFilter,
  setStatusFilter,
  selectedAnimal,
  onSelectAnimal,
  onOpenAddModal,
  onOpenEditModal,
  onOpenDeleteModal,
  onNavigateToArchive,
  onDeleteAppointment,
  onUpdateAppointmentStatus,
  onBackToDashboard,
  onBack
}) => {
  const handleBack = onBack || onBackToDashboard;
  const activeAnimals = animals.filter(a => !a.isArchived);

  const uniqueSpecies = Array.from(new Set(activeAnimals.map(a => a.species))).sort();

  const totalAnimalsCount = activeAnimals.length;
  const maleCount = activeAnimals.filter(a => a.sex === 'Male').length;
  const femaleCount = activeAnimals.filter(a => a.sex === 'Female').length;
  const uniqueSpeciesCount = uniqueSpecies.length;

  const needsAttentionCount = useMemo(() => {
    return activeAnimals.filter(a => isAnimalNeedingAttention(a, appointments, tasks, systemDate)).length;
  }, [activeAnimals, appointments, tasks, systemDate]);

  const pendingApprovalsCount = appointments.filter(a => a.status === 'Pending Approval' || a.status === 'Pending').length;
  const pendingClimateCount = activeAnimals.filter(animal => {
    if (!animal.enclosureId) return false;
    const enc = enclosures.find(e => e.id === animal.enclosureId || e.name === animal.enclosureId);
    return enc?.climateProfile?.status === 'Pending Setup' || enc?.climateProfile?.status === 'Pending Approval';
  }).length;

  const filteredAnimals = activeAnimals.filter(animal => {
    const q = (searchQuery || '').toLowerCase();
    const matchesQuery = 
      (animal.name || '').toLowerCase().includes(q) ||
      (animal.species || '').toLowerCase().includes(q) ||
      (animal.id || '').toLowerCase().includes(q) ||
      (animal.morph || '').toLowerCase().includes(q);

    const matchesSpecies = speciesFilter === 'All' || animal.species === speciesFilter;
    const matchesSex = sexFilter === 'All' || animal.sex === sexFilter;
    
    let matchesStatus = true;
    if (statusFilter === 'Needs Attention') {
      matchesStatus = isAnimalNeedingAttention(animal, appointments, tasks, systemDate);
    } else if (statusFilter === 'Pending Request') {
      const hasPending = appointments.some(a => 
        (a.status === 'Pending Approval' || a.status === 'Pending' || a.status === 'Reschedule Requested') &&
        a.animalId === animal.id &&
        a.requestedByRole !== 'admin' &&
        !a.requestedBy?.toLowerCase().includes('admin') &&
        !a.id?.startsWith('APT-ADM-')
      );
      matchesStatus = hasPending;
    } else if (statusFilter === 'Pending Climate') {
      if (!animal.enclosureId) {
        matchesStatus = false;
      } else {
        const enc = enclosures.find(e => e.id === animal.enclosureId || e.name === animal.enclosureId);
        matchesStatus = !!(enc?.climateProfile?.status === 'Pending Setup' || enc?.climateProfile?.status === 'Pending Approval');
      }
    } else if (statusFilter !== 'All') {
      matchesStatus = animal.healthStatus === statusFilter;
    }

    return matchesQuery && matchesSpecies && matchesSex && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* 1. Header with Mountain Landscape Backdrop & Tag */}
      <div className="relative rounded-3xl p-6 sm:p-7 overflow-hidden bg-gradient-to-r from-[#F5F8F6] via-[#FAF9F5] to-[#EEF5F1] border border-slate-200/70 shadow-2xs">
        {/* Soaring Birds & Mountain Silhouette in background (Right side) */}
        <div className="absolute right-0 top-0 bottom-0 w-full sm:w-2/3 pointer-events-none overflow-hidden select-none opacity-85">
          <svg className="absolute right-0 bottom-0 h-full w-auto text-[#0E4F30]/15" viewBox="0 0 650 160" fill="currentColor" preserveAspectRatio="none">
            {/* Distant mountain ridges */}
            <path d="M 0 160 L 60 115 L 140 140 L 220 95 L 310 130 L 400 80 L 490 120 L 580 70 L 650 100 L 650 160 Z" opacity="0.4" />
            {/* Mid-range pine mountain ridge */}
            <path d="M 120 160 L 180 125 L 260 145 L 340 105 L 430 135 L 520 88 L 600 120 L 650 95 L 650 160 Z" opacity="0.6" />
            {/* Dense pine forest silhouettes */}
            <path d="M 380 160 L 390 130 L 400 160 L 410 125 L 420 160 L 435 115 L 450 160 L 470 120 L 485 160 L 505 110 L 525 160 L 550 105 L 575 160 L 600 115 L 620 160 L 640 125 L 650 160 Z" opacity="0.9" />
          </svg>
          {/* Subtle flock of birds soaring in flight */}
          <svg className="absolute right-12 sm:right-32 top-4 w-44 h-16 text-[#0E4F30]/40 pointer-events-none" viewBox="0 0 160 50" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M 20 22 Q 26 15 32 22 Q 38 15 44 22" />
            <path d="M 60 12 Q 65 7 70 12 Q 75 7 80 12" />
            <path d="M 95 28 Q 99 24 103 28 Q 107 24 111 28" />
            <path d="M 125 16 Q 130 10 135 16 Q 140 10 145 16" />
          </svg>
        </div>

        {/* Content */}
        <div className="relative z-10">
          <span className="inline-block px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-[#E6F7ED] text-[#1E6B47] mb-3 shadow-2xs border border-[#CDEEDB]/60">
            SANCTUARY MANAGEMENT
          </span>

          <div className="flex items-center space-x-3.5">
            {handleBack && (
              <button
                type="button"
                onClick={handleBack}
                className="w-10 h-10 rounded-full bg-white hover:bg-slate-50 text-slate-800 border border-slate-200/90 shadow-2xs flex items-center justify-center transition-all cursor-pointer shrink-0 active:scale-95"
                title="Go Back"
              >
                <ArrowLeft className="w-5 h-5 text-slate-700" />
              </button>
            )}
            <div>
              <h1 className="text-3xl sm:text-[34px] font-black text-slate-900 tracking-tight leading-none">
                Animals
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1.5 leading-snug">
                Manage, track, and monitor all registered animals.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Stat Cards Grid (Matching 4-card reference layout) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: TOTAL ANIMALS */}
        <div 
          onClick={() => {
            setStatusFilter('All');
            setSpeciesFilter('All');
            setSexFilter('All');
            setSearchQuery('');
          }}
          className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-100 shadow-2xs flex items-center justify-between cursor-pointer transition-all hover:shadow-xs group hover:-translate-y-0.5"
        >
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-full bg-[#E5F5EC] text-[#14532D] flex items-center justify-center shrink-0">
              <PawPrint className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block font-sans">TOTAL ANIMALS</span>
              <span className="text-3xl font-extrabold text-slate-900 leading-none mt-1.5 block">{totalAnimalsCount}</span>
            </div>
          </div>
          <div className="w-7 h-7 rounded-full bg-[#EAF8F0] text-[#166534] flex items-center justify-center shrink-0 transition-colors group-hover:bg-[#166534] group-hover:text-white">
            <ChevronRight className="w-4 h-4 stroke-[2.5]" />
          </div>
        </div>

        {/* Card 2: MALE */}
        <div 
          onClick={() => setSexFilter(sexFilter === 'Male' ? 'All' : 'Male')}
          className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-100 shadow-2xs flex items-center justify-between cursor-pointer transition-all hover:shadow-xs group hover:-translate-y-0.5"
        >
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-full bg-[#EBF3FF] text-[#2563EB] flex items-center justify-center shrink-0 font-extrabold text-2xl">
              ♂
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block font-sans">MALE</span>
              <span className="text-3xl font-extrabold text-slate-900 leading-none mt-1.5 block">{maleCount}</span>
            </div>
          </div>
          <div className="w-7 h-7 rounded-full bg-[#EFF6FF] text-[#3B82F6] flex items-center justify-center shrink-0 transition-colors group-hover:bg-[#2563EB] group-hover:text-white">
            <ChevronRight className="w-4 h-4 stroke-[2.5]" />
          </div>
        </div>

        {/* Card 3: FEMALE */}
        <div 
          onClick={() => setSexFilter(sexFilter === 'Female' ? 'All' : 'Female')}
          className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-100 shadow-2xs flex items-center justify-between cursor-pointer transition-all hover:shadow-xs group hover:-translate-y-0.5"
        >
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-full bg-[#FDF2F4] text-[#E11D48] flex items-center justify-center shrink-0 font-extrabold text-2xl">
              ♀
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block font-sans">FEMALE</span>
              <span className="text-3xl font-extrabold text-slate-900 leading-none mt-1.5 block">{femaleCount}</span>
            </div>
          </div>
          <div className="w-7 h-7 rounded-full bg-[#FFF1F2] text-[#FB7185] flex items-center justify-center shrink-0 transition-colors group-hover:bg-[#E11D48] group-hover:text-white">
            <ChevronRight className="w-4 h-4 stroke-[2.5]" />
          </div>
        </div>

        {/* Card 4: SPECIES */}
        <div 
          onClick={() => {
            setSpeciesFilter('All');
            setStatusFilter('All');
          }}
          className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-100 shadow-2xs flex items-center justify-between cursor-pointer transition-all hover:shadow-xs group hover:-translate-y-0.5"
        >
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-full bg-[#E6F7EF] text-[#15803D] flex items-center justify-center shrink-0">
              <Leaf className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block font-sans">SPECIES</span>
              <span className="text-3xl font-extrabold text-slate-900 leading-none mt-1.5 block">{uniqueSpeciesCount}</span>
            </div>
          </div>
          <div className="w-7 h-7 rounded-full bg-[#E6F7EF] text-[#15803D] flex items-center justify-center shrink-0 transition-colors group-hover:bg-[#15803D] group-hover:text-white">
            <ChevronRight className="w-4 h-4 stroke-[2.5]" />
          </div>
        </div>
      </div>

      {/* 3. Main Animal Catalog Container */}
      <div className="p-5 sm:p-6 lg:p-7 rounded-3xl bg-white border border-slate-100 shadow-2xs space-y-5">
        {/* Catalog Header with Archive & Add New Animal buttons on the right */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
          <div className="flex items-center space-x-2.5">
            <span className="w-1.5 h-6 bg-[#0B5C37] rounded-full inline-block" />
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Animal Catalog</h2>
          </div>

          <div className="flex items-center space-x-3">
            {onNavigateToArchive && (
              <button
                type="button"
                onClick={onNavigateToArchive}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer shadow-2xs"
                title="View Archived Animals & Records"
              >
                <FolderArchive className="w-4 h-4 text-emerald-700" />
                <span>Archive ({animals.filter(a => a.isArchived).length})</span>
              </button>
            )}
            <button
              type="button"
              onClick={onOpenAddModal}
              className="px-5 py-2.5 bg-[#0B3B24] hover:bg-[#072B1A] text-white text-xs font-bold rounded-full shadow-xs hover:shadow transition-all flex items-center space-x-2 cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add New Animal</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:flex-1 max-w-xl">
            <Search className="w-4 h-4 absolute left-4 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, species, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-full border border-slate-200 bg-white text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0B3B24] transition-all shadow-2xs"
            />
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end flex-wrap">
            <select
              value={speciesFilter}
              onChange={(e) => setSpeciesFilter(e.target.value)}
              className="text-xs font-bold px-4 py-2 rounded-full border border-slate-200 bg-white text-slate-700 outline-none cursor-pointer focus:border-[#0B3B24] shadow-2xs"
            >
              <option value="All">Species: All</option>
              {uniqueSpecies.map(sp => (
                <option key={sp} value={sp}>{sp}</option>
              ))}
            </select>

            <select
              value={sexFilter}
              onChange={(e) => setSexFilter(e.target.value)}
              className="text-xs font-bold px-4 py-2 rounded-full border border-slate-200 bg-white text-slate-700 outline-none cursor-pointer focus:border-[#0B3B24] shadow-2xs"
            >
              <option value="All">Sex: All</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs font-bold px-4 py-2 rounded-full border border-slate-200 bg-white text-slate-700 outline-none cursor-pointer focus:border-[#0B3B24] shadow-2xs"
            >
              <option value="All">Status: All</option>
              {needsAttentionCount > 0 && (
                <option value="Needs Attention">⚠️ Needs Attention ({needsAttentionCount})</option>
              )}
              {pendingApprovalsCount > 0 && (
                <option value="Pending Request">📋 Has Pending Request ({pendingApprovalsCount})</option>
              )}
              {pendingClimateCount > 0 && (
                <option value="Pending Climate">🌡️ Climate / Temp Request ({pendingClimateCount})</option>
              )}
              <option value="Healthy">Healthy</option>
              <option value="Quarantine">Quarantine</option>
              <option value="Under Treatment">Under Treatment</option>
              <option value="Under Observation">Under Observation</option>
              <option value="Injured">Injured</option>
            </select>

            <span className="px-3.5 py-1.5 rounded-full bg-[#E6F7ED] text-[#166534] font-bold text-xs shrink-0 whitespace-nowrap shadow-2xs">
              {filteredAnimals.length} animals
            </span>

            {(statusFilter !== 'All' || speciesFilter !== 'All' || sexFilter !== 'All' || searchQuery) && (
              <button
                type="button"
                onClick={() => {
                  setStatusFilter('All');
                  setSpeciesFilter('All');
                  setSexFilter('All');
                  setSearchQuery('');
                }}
                className="px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 border border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700 shadow-2xs"
                title="Reset all filters"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Warning Banners */}
        {statusFilter === 'Needs Attention' && (
          <div className="p-3.5 rounded-2xl border border-amber-200 bg-amber-50 text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                Showing <strong>{filteredAnimals.length}</strong> of <strong>{totalAnimalsCount}</strong> animals requiring attention.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setStatusFilter('All')}
              className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition-colors cursor-pointer shrink-0"
            >
              Show All Animals
            </button>
          </div>
        )}

        {statusFilter === 'Pending Request' && (
          <div className="p-3.5 rounded-2xl border border-amber-200 bg-amber-50 text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                Showing <strong>{filteredAnimals.length}</strong> of <strong>{totalAnimalsCount}</strong> animals with pending authorization requests.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setStatusFilter('All')}
              className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition-colors cursor-pointer shrink-0"
            >
              Show All Animals
            </button>
          </div>
        )}

        {statusFilter === 'Pending Climate' && (
          <div className="p-3.5 rounded-2xl border border-cyan-200 bg-cyan-50 text-cyan-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2">
              <Thermometer className="w-4 h-4 text-cyan-600 shrink-0 animate-pulse" />
              <span>
                Showing <strong>{filteredAnimals.length}</strong> of <strong>{totalAnimalsCount}</strong> animals with active vivarium temperature or breeding climate setup requests.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setStatusFilter('All')}
              className="px-3 py-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs transition-colors cursor-pointer shrink-0"
            >
              Show All Animals
            </button>
          </div>
        )}

        {/* Animals List or Empty State */}
        {filteredAnimals.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <svg className="w-32 h-28 text-slate-300 mb-2" viewBox="0 0 160 120" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M 30 100 V 60 A 50 50 0 0 1 130 60 V 100" />
              <line x1="15" y1="100" x2="145" y2="100" />
              <path d="M 55 100 V 65 A 25 25 0 0 1 105 65 V 100" />
              <g fill="currentColor" stroke="none">
                <ellipse cx="80" cy="78" rx="8" ry="6" />
                <circle cx="71" cy="67" r="2.8" />
                <circle cx="77" cy="63" r="2.8" />
                <circle cx="83" cy="63" r="2.8" />
                <circle cx="89" cy="67" r="2.8" />
              </g>
            </svg>

            <h3 className="text-base font-extrabold text-slate-900 mt-2">No animals added yet.</h3>
            <p className="text-xs text-slate-400 font-medium max-w-sm mt-1.5 leading-relaxed">
              Start by adding your first animal to manage its information, care, and health records.
            </p>

            <button
              onClick={onOpenAddModal}
              className="mt-5 px-5 py-2.5 bg-[#0B3B24] hover:bg-[#072B1A] text-white text-xs font-bold rounded-full shadow-xs hover:shadow transition-all flex items-center space-x-2 cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add New Animal</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAnimals.map(animal => {
              const animalEnclosure = animal.enclosureId ? enclosures.find(e => e.id === animal.enclosureId || e.name === animal.enclosureId) : undefined;
              const isSelected = selectedAnimal?.id === animal.id;

              const isAptFromAdmin = (a: Appointment) => 
                a.requestedByRole === 'admin' || 
                a.requestedBy?.toLowerCase().includes('admin') || 
                a.id?.startsWith('APT-ADM-');

              const animalPendingAppointments = appointments.filter(a => {
                if (a.status !== 'Pending Approval' && a.status !== 'Pending' && a.status !== 'Reschedule Requested') return false;
                if (isAptFromAdmin(a)) return false;
                return a.animalId === animal.id;
              });

              const primaryReq = animalPendingAppointments[0];
              const requesterInfo = primaryReq ? getAppointmentRequesterInfo(primaryReq, staffMembers) : null;
              const isReschedReq = primaryReq?.status === 'Reschedule Requested';
              const isVetReq = isReschedReq || requesterInfo?.role === 'vet';
              const isKeeperReq = requesterInfo?.role === 'keeper';

              const hasPendingRequest = animalPendingAppointments.length > 0;

              // Climate & Temperature Setup / Breeding Request State
              const climateProfile = animalEnclosure?.climateProfile;
              const isClimateForThisAnimal = !!(climateProfile && (!climateProfile.targetAnimalId || climateProfile.targetAnimalId === animal.id || (climateProfile.targetSpecies || '').toLowerCase() === (animal.species || '').toLowerCase()));
              const hasClimatePendingSetup = isClimateForThisAnimal && climateProfile?.status === 'Pending Setup';
              const hasClimatePendingApproval = isClimateForThisAnimal && climateProfile?.status === 'Pending Approval';
              const hasClimateAlert = hasClimatePendingSetup || hasClimatePendingApproval;

              // Any active alert that triggers the reference cyan highlight ring and pill
              const hasActiveAlert = hasClimateAlert || hasPendingRequest;

              return (
                <div
                  key={animal.id}
                  onClick={() => onSelectAnimal(animal, hasPendingRequest ? 'medical' : 'overview')}
                  className={`p-3.5 sm:p-4 rounded-2xl transition-all duration-200 cursor-pointer flex items-center justify-between group relative ${
                    isSelected
                      ? 'bg-[#EBF7F0] border-2 border-[#0D3823]/50 shadow-xs'
                      : hasActiveAlert
                      ? 'border-2 border-cyan-400 bg-white ring-1 ring-cyan-200/50 shadow-xs'
                      : 'bg-white border border-slate-200/80 hover:border-slate-300 shadow-2xs hover:shadow-xs'
                  }`}
                >
                  {/* Left Column: Image Thumbnail + Identification info */}
                  <div className="flex items-center space-x-3.5 sm:space-x-4 min-w-0">
                    <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl overflow-hidden border border-slate-200/60 shrink-0 shadow-2xs bg-[#0A2016] flex items-center justify-center group-hover:scale-102 transition-all duration-300">
                      {animal.image ? (
                        <img src={animal.image} alt={animal.name || animal.species} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-emerald-400/70">
                          <Camera className="w-5 h-5 text-emerald-400" />
                          <span className="text-[7px] font-bold uppercase tracking-wider text-emerald-200 mt-0.5">No Photo</span>
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      {/* ID and Sex symbol */}
                      <div className="flex items-center space-x-1.5">
                        <span className="text-xs font-semibold text-slate-500 font-mono tracking-wide">
                          {animal.id}
                        </span>
                        <span className={`inline-flex items-center justify-center text-sm font-extrabold ${
                          animal.sex === 'Male' ? 'text-[#2563EB]' : 'text-[#E11D48]'
                        }`}>
                          {animal.sex === 'Male' ? '♂' : '♀'}
                        </span>
                      </div>

                      {/* Animal Name */}
                      <h3 className="font-bold text-base sm:text-lg text-slate-900 leading-tight truncate mt-0.5">
                        {animal.name || animal.species}
                      </h3>

                      {/* Animal Species */}
                      <p className="text-xs font-medium text-slate-500 truncate mt-0.5">
                        {animal.species}
                      </p>
                    </div>
                  </div>

                  {/* Middle Column: Red / Coral Alert Pill (Matching Mocha reference in image) */}
                  <div className="hidden lg:flex items-center justify-center flex-1 max-w-[260px] px-2">
                    {hasActiveAlert ? (
                      <div 
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectAnimal(animal, hasPendingRequest ? 'medical' : 'overview');
                        }}
                        className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 text-[#DC2626] rounded-full px-3 py-1.5 flex items-center space-x-2 text-xs font-bold hover:bg-red-100 transition-colors shadow-2xs cursor-pointer shrink-0"
                        title="Click to view alert details"
                      >
                        <span className="w-5 h-5 rounded-full bg-[#EF4444] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                          !
                        </span>
                        {hasClimateAlert ? (
                          <Thermometer className="w-3.5 h-3.5 text-red-500 shrink-0" />
                        ) : isVetReq ? (
                          <Stethoscope className="w-3.5 h-3.5 text-red-500 shrink-0" />
                        ) : (
                          <Eye className="w-3.5 h-3.5 text-red-500 shrink-0" />
                        )}
                        <span className="whitespace-nowrap">
                          {hasClimateAlert 
                            ? 'Temp Change Request'
                            : isReschedReq
                            ? 'Reschedule Request'
                            : isVetReq
                            ? 'Clinical Checkup'
                            : 'Observation Request'}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      </div>
                    ) : (
                      <div className="w-full" />
                    )}
                  </div>

                  {/* Right Columns: Enclosure + Health Status + Action Buttons */}
                  <div className="flex items-center space-x-4 sm:space-x-6 shrink-0">
                    {/* Enclosure column */}
                    <div className="hidden sm:block min-w-[130px] lg:min-w-[150px] text-left shrink-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-sans">
                        ENCLOSURE
                      </span>
                      <span className="font-bold text-sm text-slate-900 block mt-0.5 leading-snug truncate">
                        {animalEnclosure ? (animalEnclosure.name || animalEnclosure.id) : (animal.enclosureId || 'None')}
                      </span>
                      <span className="text-xs text-slate-500 font-medium block mt-0.5 truncate">
                        {animalEnclosure ? animalEnclosure.facility : 'Unassigned'}
                      </span>
                    </div>

                    {/* Health Status pill */}
                    <div className="shrink-0">
                      <span className={`inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-xs font-bold shadow-2xs ${
                        (animal.healthStatus || '').toLowerCase().includes('quarantine')
                          ? 'bg-[#FEE2E2] text-[#DC2626]'
                          : animal.healthStatus === 'Healthy' || !animal.healthStatus
                          ? 'bg-[#E6F7ED] text-[#166534]'
                          : animal.healthStatus === 'Under Treatment' || animal.healthStatus === 'Under Observation'
                          ? 'bg-[#FEF3C7] text-[#D97706]'
                          : 'bg-[#FEE2E2] text-[#DC2626]'
                      }`}>
                        <span className={`w-2 h-2 rounded-full shrink-0 ${
                          (animal.healthStatus || '').toLowerCase().includes('quarantine')
                            ? 'bg-[#DC2626]'
                            : animal.healthStatus === 'Healthy' || !animal.healthStatus
                            ? 'bg-[#16A34A]'
                            : animal.healthStatus === 'Under Treatment' || animal.healthStatus === 'Under Observation'
                            ? 'bg-[#D97706]'
                            : 'bg-[#DC2626]'
                        }`} />
                        <span>{animal.healthStatus || 'Healthy'}</span>
                      </span>
                    </div>

                    {/* Quick Action buttons */}
                    <div className="flex items-center space-x-2 shrink-0 pl-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenEditModal(animal);
                        }}
                        className="w-9 h-9 rounded-xl bg-[#F0FDF4] hover:bg-[#DCFCE7] text-[#16A34A] border border-[#DCFCE7] flex items-center justify-center transition-all cursor-pointer shadow-2xs active:scale-95"
                        title="Edit Animal Profile"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenDeleteModal(animal);
                        }}
                        className="w-9 h-9 rounded-xl bg-[#FEF2F2] hover:bg-[#FEE2E2] text-[#EF4444] border border-[#FEE2E2] flex items-center justify-center transition-all cursor-pointer shadow-2xs active:scale-95"
                        title="Remove or Archive Animal"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-all ml-0.5" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
export default AdminAnimalsView;
