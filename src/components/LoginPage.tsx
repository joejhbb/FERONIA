import React from 'react';
import {
  ShieldCheck,
  UserCheck,
  Stethoscope,
  ArrowLeft,
  ChevronRight
} from 'lucide-react';
import { Role } from '../types';

type LoginRole = 'admin' | 'vet' | 'keeper';

interface DemoAccountConfig {
  role: LoginRole;
  id: string;
  label: string;
  title: string;
  name: string;
  email: string;
  phone: string;
  bio: string;
  permissions: string;
}

const ROLE_DEMO_ACCOUNTS: Record<LoginRole, DemoAccountConfig> = {
  admin: {
    role: 'admin',
    id: 'STF-ADM-001',
    label: 'Admin',
    title: 'Facility Admin',
    name: 'Justin Admin',
    email: 'admin@feronia.com',
    phone: '+63 919 345 6789',
    bio: 'Facility administrator overseeing sanctuary operations, records, staff, and analytics.',
    permissions: 'Animals, enclosures, breeding, tasks, inventory, staff, approvals & reports'
  },
  vet: {
    role: 'vet',
    id: 'STF-VET-001',
    label: 'Veterinarian',
    title: 'Chief Veterinarian',
    name: 'Dr. Vicente Reyes',
    email: 'vet@feronia.com',
    phone: '+63 917 456 7890',
    bio: 'Chief veterinary medical director supervising exotic animal clinical care and rehabilitation.',
    permissions: 'Clinical dashboard, medical records, treatments, appointments & health reports'
  },
  keeper: {
    role: 'keeper',
    id: 'STF-KP-001',
    label: 'Keeper',
    title: 'Wildlife Keeper',
    name: 'Jason Lee',
    email: 'keeper@feronia.com',
    phone: '+63 918 234 5678',
    bio: 'Primary keeper specializing in daily feeding schedules, enclosure climate checks, and husbandry care.',
    permissions: 'Daily tasks, feeding routines, enclosure climate, breeding, inventory & QR scanner'
  }
};

const ROLE_ORDER: LoginRole[] = ['admin', 'vet', 'keeper'];

interface LoginPageProps {
  onLoginSuccess: (role: Role) => void;
  onBackClick: () => void;
  onOpenSupabaseConfig?: () => void;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
}

export default function LoginPage({
  onLoginSuccess,
  onBackClick,
  isDarkMode
}: LoginPageProps) {
  const completeRoleLogin = (role: LoginRole) => {
    // Clear stale cross-role override keys so each account initializes independently
    localStorage.removeItem('feronia_last_created_keeper_id');
    localStorage.removeItem('feronia_last_created_vet_id');

    const demo = ROLE_DEMO_ACCOUNTS[role];
    localStorage.setItem('feronia_current_user_name', demo.name);
    localStorage.setItem('feronia_current_user_email', demo.email);
    localStorage.setItem('feronia_current_user_phone', demo.phone);
    localStorage.setItem('feronia_current_user_role', demo.role);
    localStorage.setItem('feronia_current_user_id', demo.id);

    if (role === 'vet') {
      localStorage.setItem('feronia_vet_name', demo.name);
      localStorage.setItem('feronia_vet_email', demo.email);
      localStorage.setItem('feronia_vet_phone', demo.phone);
      localStorage.setItem('feronia_vet_bio', demo.bio);
    } else if (role === 'keeper') {
      localStorage.setItem('feronia_keeper_name', demo.name);
      localStorage.setItem('feronia_keeper_email', demo.email);
      localStorage.setItem('feronia_keeper_phone', demo.phone);
      localStorage.setItem('feronia_keeper_bio', demo.bio);
    }

    onLoginSuccess(role);
  };

  const getRoleIcon = (role: LoginRole) => {
    if (role === 'admin') return <ShieldCheck className="w-5 h-5" />;
    if (role === 'vet') return <Stethoscope className="w-5 h-5" />;
    return <UserCheck className="w-5 h-5" />;
  };

  return (
    <div
      className={`min-h-screen flex flex-col justify-center items-center py-10 px-4 sm:px-6 lg:px-8 font-sans relative transition-colors duration-300 ${
        isDarkMode ? 'bg-[#05160E]' : 'bg-[#F4F7F5]'
      }`}
    >
      {/* Back to Home Button */}
      <button
        type="button"
        onClick={onBackClick}
        className={`absolute top-6 left-6 flex items-center space-x-2 font-medium text-sm transition-colors cursor-pointer z-10 ${
          isDarkMode ? 'text-emerald-400 hover:text-emerald-300' : 'text-slate-500 hover:text-[#113C24]'
        }`}
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </button>

      {/* Main Role Selection Card */}
      <div
        className={`w-full max-w-[460px] rounded-3xl border shadow-2xl p-7 sm:p-8 space-y-6 transition-colors duration-300 ${
          isDarkMode
            ? 'bg-[#06180F] border-emerald-950 text-white shadow-black/60'
            : 'bg-white border-slate-200 text-slate-800 shadow-emerald-950/10'
        }`}
      >
        {/* Header */}
        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 mb-2 shadow-inner">
            <span className="text-2xl">🌿</span>
          </div>
          <h2 className={`text-2xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-[#113C24]'}`}>
            Feronia Wildlife MIS
          </h2>
          <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Sanctuary Management & Husbandry Portal
          </p>
        </div>

        {/* Role Selection Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-emerald-400/90' : 'text-[#113C24]'}`}>
              Select Role
            </span>
            <span className={`text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Click a role to open dashboard
            </span>
          </div>

          <div className="space-y-3">
            {ROLE_ORDER.map((roleKey) => {
              const account = ROLE_DEMO_ACCOUNTS[roleKey];
              return (
                <button
                  key={roleKey}
                  type="button"
                  onClick={() => completeRoleLogin(account.role)}
                  className={`group w-full text-left p-4 rounded-2xl border transition-all duration-200 flex items-center gap-3.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                    isDarkMode
                      ? 'bg-[#0A2215] border-emerald-900/70 hover:border-emerald-500 hover:bg-emerald-950/60 shadow-sm'
                      : 'bg-slate-50/70 border-slate-200 hover:border-[#113C24] hover:bg-emerald-50/50 hover:shadow-md hover:shadow-emerald-950/5'
                  }`}
                >
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                      isDarkMode
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 group-hover:bg-emerald-600 group-hover:text-white'
                        : 'bg-[#113C24]/10 text-[#113C24] border border-[#113C24]/15 group-hover:bg-[#113C24] group-hover:text-white'
                    }`}
                  >
                    {getRoleIcon(roleKey)}
                  </div>

                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-[#113C24]'}`}>
                        {account.label}
                      </span>
                      <span
                        className={`text-[11px] font-medium truncate ${
                          isDarkMode ? 'text-emerald-400/80' : 'text-emerald-800/75'
                        }`}
                      >
                        · {account.name}
                      </span>
                    </div>
                    <p
                      className={`text-[11px] leading-snug line-clamp-2 ${
                        isDarkMode ? 'text-slate-400' : 'text-slate-600'
                      }`}
                    >
                      {account.permissions}
                    </p>
                  </div>

                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 ${
                      isDarkMode
                        ? 'text-emerald-400/80 group-hover:text-emerald-300'
                        : 'text-slate-400 group-hover:text-[#113C24]'
                    }`}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
