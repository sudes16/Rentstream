import React, { useState, useEffect, useRef } from 'react';
import { 
  Building2, 
  User, 
  CreditCard, 
  MessageSquare, 
  Settings, 
  Plus, 
  Bolt, 
  TrendingUp, 
  Trash2, 
  Search, 
  ChevronRight, 
  Send, 
  ArrowLeft, 
  RefreshCw, 
  FileText,
  DollarSign3,
  Mail,
  Phone,
  Calendar,
  Layers,
  Sparkles,
  Award
} from 'lucide-react';

// Initial Showroom Database for Demonstration
const MOCK_LEASES = [
  {
    id: '1',
    unitNumber: '101',
    tenantName: 'Marcus Aurelius',
    tenantPhone: '+1 (555) 120-1111',
    tenantEmail: 'marcus@rome.org',
    monthlyBaseRent: 1200.0,
    dueDateDay: 5,
    startingKwh: 10250.0,
    currentKwh: 10420.0,
    advancePayment: 50.0,
    leaseStart: 'Jun 01, 2026',
    leaseEnd: 'May 31, 2027'
  },
  {
    id: '2',
    unitNumber: '202',
    tenantName: 'Sarah Jenkins',
    tenantPhone: '+1 (555) 349-2020',
    tenantEmail: 'sarah.j@jenkins.com',
    monthlyBaseRent: 950.0,
    dueDateDay: 10,
    startingKwh: 8400.0,
    currentKwh: 8595.0,
    advancePayment: 0.0,
    leaseStart: 'Jun 01, 2026',
    leaseEnd: 'May 31, 2027'
  },
  {
    id: '3',
    unitNumber: '303',
    tenantName: 'Carlos Santana',
    tenantPhone: '+1 (555) 834-3030',
    tenantEmail: 'carlos@guitar.io',
    monthlyBaseRent: 1100.0,
    dueDateDay: 1,
    startingKwh: 5600.0,
    currentKwh: 5600.0,
    advancePayment: 120.0,
    leaseStart: 'Jun 01, 2026',
    leaseEnd: 'May 31, 2027'
  },
  {
    id: '4',
    unitNumber: '404',
    tenantName: 'Elena Rostova',
    tenantPhone: '+1 (555) 441-4040',
    tenantEmail: 'elena.r@rostova.org',
    monthlyBaseRent: 1350.0,
    dueDateDay: 15,
    startingKwh: 12100.0,
    currentKwh: 12380.0,
    advancePayment: 0.0,
    leaseStart: 'Jun 01, 2026',
    leaseEnd: 'May 31, 2027'
  }
];

const MOCK_PAYMENTS = [
  { id: 'p1', unitNumber: '101', amountPaid: 1200.0, paymentType: 'Rent', remarks: 'Paid base rent via transfer', timestamp: 'May 18, 2026' },
  { id: 'p2', unitNumber: '303', amountPaid: 1100.0, paymentType: 'Both', remarks: 'Advance rent credited', timestamp: 'May 20, 2026' },
  { id: 'p3', unitNumber: '202', amountPaid: 400.0, paymentType: 'Rent', remarks: 'Partial payment', timestamp: 'May 22, 2026' }
];

const MOCK_MESSAGES = [
  { id: 'm1', unitNumber: '101', sender: 'Landlord', text: 'Hi Marcus, electricity meter was updated to 10420. Balance due is computed.', timestamp: '10:15 AM' },
  { id: 'm2', unitNumber: '101', sender: 'Tenant', text: 'Thanks John. Recorded and paid the base rent!', timestamp: '10:18 AM' },
  { id: 'm3', unitNumber: '202', sender: 'Tenant', text: 'Hi John, I made a partial payment of $400 for this month. Will clear the rest on Friday.', timestamp: 'Yesterday' },
  { id: 'm4', unitNumber: '202', sender: 'Landlord', text: 'Thanks Sarah, noted. Please remember to update the water utility once you can.', timestamp: 'Yesterday' },
  { id: 'm5', unitNumber: '303', sender: 'Tenant', text: 'Hello! Ready for the new cycle.', timestamp: '2 days ago' },
  { id: 'm6', unitNumber: '404', sender: 'Tenant', text: 'Can you double check my starting meter reading? I think it was lower.', timestamp: '3 days ago' },
  { id: 'm7', unitNumber: '404', sender: 'Landlord', text: 'Sure Elena, let me verify the start logs.', timestamp: '3 days ago' }
];

const AUTO_REPLY_TEMPLATES = {
  '101': ["Sounds perfect, thank you constant updates!", "Payment has been sent, please check the slip.", "Got it. Let me check my app updates.", "Perfect, appreciate the quick service!"],
  '202': ["Great! I will update you by Friday.", "Sent payment confirmation.", "Sorry for the delay, was traveling.", "Thank you, that is very helpful."],
  '303': ["All set! Ready.", "Sent the utility readings, thanks.", "Excellent landlord service, thanks John!", "Sure, see you tomorrow."],
  '404': ["Thank you! Let me know when resolved.", "Great, appreciate your help John.", "Perfect! Signed up for autopay.", "Awesome! Received the breakdown."]
};

const DEFAULT_RATE = 0.15; // $0.15 / kWh

export default function App() {
  // Persistence Loading
  const [leases, setLeases] = useState(() => {
    const saved = localStorage.getItem('rm_leases');
    return saved ? JSON.parse(saved) : MOCK_LEASES;
  });

  const [payments, setPayments] = useState(() => {
    const saved = localStorage.getItem('rm_payments');
    return saved ? JSON.parse(saved) : MOCK_PAYMENTS;
  });

  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('rm_messages');
    return saved ? JSON.parse(saved) : MOCK_MESSAGES;
  });

  const [electricityRate, setElectricityRate] = useState(() => {
    const saved = localStorage.getItem('rm_rate');
    return saved ? parseFloat(saved) : DEFAULT_RATE;
  });

  const [currentTab, setCurrentTab] = useState('Overview');
  const [selectedChatUnit, setSelectedChatUnit] = useState(null);

  // Dialog / Modal States
  const [showAddLeaseModal, setShowAddLeaseModal] = useState(false);
  const [showMeterUpdateModal, setShowMeterUpdateModal] = useState(null); // holds Lease object
  const [showPaymentModal, setShowPaymentModal] = useState(null); // holds Lease object
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Quick State triggers for local storage syncing
  useEffect(() => {
    localStorage.setItem('rm_leases', JSON.stringify(leases));
  }, [leases]);

  useEffect(() => {
    localStorage.setItem('rm_payments', JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem('rm_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('rm_rate', electricityRate.toString());
  }, [electricityRate]);

  // Calculations Helpers
  const calculateElectricityCharge = (lease) => {
    const consumed = Math.max(0, lease.currentKwh - lease.startingKwh);
    return consumed * electricityRate;
  };

  const calculateTotalExpected = (lease) => {
    return lease.monthlyBaseRent + calculateElectricityCharge(lease);
  };

  const calculateDueAmount = (lease, paymentsList = payments) => {
    const totalExpected = calculateTotalExpected(lease);
    const totalPaid = paymentsList
      .filter(p => p.unitNumber === lease.unitNumber)
      .reduce((sum, p) => sum + p.amountPaid, 0);
    
    // Subsidize by advance credits
    const netDue = totalExpected - totalPaid - lease.advancePayment;
    return Math.max(0, netDue);
  };

  // State Updates
  const handleAddLease = (newLease) => {
    setLeases([...leases, {
      id: Date.now().toString(),
      ...newLease,
      startingKwh: parseFloat(newLease.startingKwh),
      currentKwh: parseFloat(newLease.startingKwh), // initially equal
      monthlyBaseRent: parseFloat(newLease.monthlyBaseRent),
      dueDateDay: parseInt(newLease.dueDateDay, 10),
      advancePayment: parseFloat(newLease.advancePayment || 0),
      leaseStart: 'Jun 01, 2026',
      leaseEnd: 'May 31, 2027'
    }]);
    setShowAddLeaseModal(false);
  };

  const handleUpdateMeter = (unitNumber, newReading) => {
    setLeases(leases.map(l => {
      if (l.unitNumber === unitNumber) {
        return { ...l, currentKwh: parseFloat(newReading) };
      }
      return l;
    }));
    setShowMeterUpdateModal(null);
  };

  const handleDeleteLease = (id) => {
    if (confirm("Are you sure you want to terminate this contract?")) {
      setLeases(leases.filter(l => l.id !== id));
    }
  };

  const handleRecordPayment = (paymentData) => {
    const newPayment = {
      id: 'p_' + Date.now(),
      unitNumber: paymentData.unitNumber,
      amountPaid: parseFloat(paymentData.amountPaid),
      paymentType: paymentData.paymentType,
      remarks: paymentData.remarks || 'Standard Transaction',
      timestamp: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };

    setPayments([...payments, newPayment]);

    // If there is additional advance allocated
    if (parseFloat(paymentData.addAdvance) > 0) {
      setLeases(leases.map(l => {
        if (l.unitNumber === paymentData.unitNumber) {
          return { ...l, advancePayment: l.advancePayment + parseFloat(paymentData.addAdvance) };
        }
        return l;
      }));
    }

    setShowPaymentModal(null);
  };

  const handleSendMessage = (unitNumber, text) => {
    if (!text.trim()) return;
    const newMsg = {
      id: 'm_' + Date.now(),
      unitNumber,
      sender: 'Landlord',
      text,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };

    const updatedMessages = [...messages, newMsg];
    setMessages(updatedMessages);

    // Dynamic showroom Auto-reply simulation
    setTimeout(() => {
      const templates = AUTO_REPLY_TEMPLATES[unitNumber] || ["Sounds great, thank you John!", "Understood, message received.", "Let me check and update.", "Perfect, thanks!"];
      const randomText = templates[Math.floor(Math.random() * templates.length)];
      const replyMsg = {
        id: 'reply_' + Date.now(),
        unitNumber,
        sender: 'Tenant',
        text: randomText,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, replyMsg]);
    }, 1200);
  };

  const handleResetData = () => {
    if(confirm("This will safely reset all databases to standard showroom listings (Marcus, Sarah, Carlos, Elena) with full pre-calculated demonstration parameters.")) {
      setLeases(MOCK_LEASES);
      setPayments(MOCK_PAYMENTS);
      setMessages(MOCK_MESSAGES);
      setElectricityRate(DEFAULT_RATE);
      setSelectedChatUnit(null);
      setCurrentTab('Overview');
    }
  };

  return (
    <div className="flex justify-center items-center w-full h-full bg-[#E5E9F0] p-0 md:p-6 overflow-hidden">
      
      {/* Simulation Device Frame Container — simulates real streaming emulator frame view */}
      <div className="relative flex flex-col w-full max-w-[440px] h-full max-h-[900px] bg-[#FAFBFD] shadow-2xl rounded-none md:rounded-[40px] border-0 md:border-[12px] border-slate-900 overflow-hidden">
        
        {/* Device Header Status Bar */}
        <div className="flex justify-between items-center bg-[#FAFBFD] px-6 pt-3 pb-1 text-[11px] font-bold text-slate-700 tracking-wide select-none">
          <span>{new Date().toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit', hour12: false})}</span>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-2.5 border border-slate-800 rounded-sm relative flex items-center pr-0.5"><span className="bg-slate-800 h-full w-2.5 block"></span><span className="bg-slate-800 w-0.5 h-1 rounded-r-sm absolute -right-1"></span></span>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1 border border-emerald-300 rounded-sm">5G LTE</span>
          </div>
        </div>

        {/* Brand App Bar */}
        <header className="flex justify-between items-center bg-[#FAFBFD] px-5 py-3 border-b border-rose-100/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#D3E3FD] rounded-full flex items-center justify-center text-[#1E293B]">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-black text-slate-900 tracking-tight">Grandview Apts.</h1>
              <span className="text-[10px] font-bold text-slate-500 bg-slate-100/80 px-1.5 py-0.5 rounded-full">{leases.length} Managed Units</span>
            </div>
          </div>
          
          <button 
            onClick={() => setShowProfileModal(true)}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center font-black text-slate-700 text-xs">
              JD
            </div>
          </button>
        </header>

        {/* Core Screen View Port */}
        <main className="flex-1 overflow-y-auto px-4 py-4 scrollbar-thin">
          {currentTab === 'Overview' && (
            <OverviewScreen 
              leases={leases} 
              payments={payments} 
              electricityRate={electricityRate}
              calculateElectricityCharge={calculateElectricityCharge}
              calculateTotalExpected={calculateTotalExpected}
              calculateDueAmount={calculateDueAmount}
              onRecordPayment={(l) => setShowPaymentModal(l)}
              onUpdateMeter={(l) => setShowMeterUpdateModal(l)}
              onAddLease={() => setShowAddLeaseModal(true)}
            />
          )}

          {currentTab === 'Leases' && (
            <LeasesScreen 
              leases={leases} 
              payments={payments}
              calculateElectricityCharge={calculateElectricityCharge}
              calculateDueAmount={calculateDueAmount}
              onRecordPayment={(l) => setShowPaymentModal(l)}
              onUpdateMeter={(l) => setShowMeterUpdateModal(l)}
              onDelete={handleDeleteLease}
            />
          )}

          {currentTab === 'Messages' && (
            <MessagesScreen 
              leases={leases}
              messages={messages}
              selectedChatUnit={selectedChatUnit}
              setSelectedChatUnit={setSelectedChatUnit}
              onSendMessage={handleSendMessage}
            />
          )}

          {currentTab === 'Settings' && (
            <SettingsScreen 
              electricityRate={electricityRate}
              setElectricityRate={setElectricityRate}
              leasesCount={leases.length}
              paymentsCount={payments.length}
              onReset={handleResetData}
            />
          )}
        </main>

        {/* Dynamic Action Floating Trigger */}
        {currentTab === 'Overview' && !selectedChatUnit && (
          <button 
            onClick={() => setShowAddLeaseModal(true)}
            className="absolute bottom-20 right-6 w-14 h-14 bg-[#D3E3FD] hover:bg-[#b0cffc] active:scale-95 text-slate-900 rounded-2xl flex items-center justify-center shadow-lg transition-all"
          >
            <Plus className="w-7 h-7 stroke-[2.5]" />
          </button>
        )}

        {/* Sleek Bottom Navigation Bar */}
        {!selectedChatUnit && (
          <nav className="flex justify-around items-center bg-white border-t border-slate-100 pb-5 pt-3 select-none z-10">
            <button 
              onClick={() => setCurrentTab('Overview')}
              className={`flex flex-col items-center gap-1 text-[11px] font-bold w-16 transition-colors ${currentTab === 'Overview' ? 'text-[#1E293B]' : 'text-slate-400'}`}
            >
              <div className={`p-1.5 rounded-full ${currentTab === 'Overview' ? 'bg-[#D3E3FD]' : 'bg-transparent'}`}>
                <Building2 className="w-[18px] h-[18px]" />
              </div>
              Overview
            </button>
            <button 
              onClick={() => setCurrentTab('Leases')}
              className={`flex flex-col items-center gap-1 text-[11px] font-bold w-16 transition-colors ${currentTab === 'Leases' ? 'text-[#1E293B]' : 'text-slate-400'}`}
            >
              <div className={`p-1.5 rounded-full ${currentTab === 'Leases' ? 'bg-[#D3E3FD]' : 'bg-transparent'}`}>
                <FileText className="w-[18px] h-[18px]" />
              </div>
              Leases
            </button>
            <button 
              onClick={() => setCurrentTab('Messages')}
              className={`flex flex-col items-center gap-1 text-[11px] font-bold w-16 transition-colors ${currentTab === 'Messages' ? 'text-[#1E293B]' : 'text-slate-400'}`}
            >
              <div className={`p-1.5 rounded-full ${currentTab === 'Messages' ? 'bg-[#D3E3FD]' : 'bg-transparent'}`}>
                <MessageSquare className="w-[18px] h-[18px]" />
              </div>
              Messages
            </button>
            <button 
              onClick={() => setCurrentTab('Settings')}
              className={`flex flex-col items-center gap-1 text-[11px] font-bold w-16 transition-colors ${currentTab === 'Settings' ? 'text-[#1E293B]' : 'text-slate-400'}`}
            >
              <div className={`p-1.5 rounded-full ${currentTab === 'Settings' ? 'bg-[#D3E3FD]' : 'bg-transparent'}`}>
                <Settings className="w-[18px] h-[18px]" />
              </div>
              Settings
            </button>
          </nav>
        )}

        {/* --- MODAL DIALOGS AND FORMS --- */}

        {/* Add Lease Modal */}
        {showAddLeaseModal && (
          <AddLeaseModal 
            onClose={() => setShowAddLeaseModal(false)}
            onSave={handleAddLease}
          />
        )}

        {/* Update Meter Modal */}
        {showMeterUpdateModal && (
          <MeterUpdateModal 
            lease={showMeterUpdateModal}
            onClose={() => setShowMeterUpdateModal(null)}
            onSave={handleUpdateMeter}
          />
        )}

        {/* Record Payment Modal */}
        {showPaymentModal && (
          <PaymentModal 
            lease={showPaymentModal}
            totalDue={calculateDueAmount(showPaymentModal)}
            onClose={() => setShowPaymentModal(null)}
            onSave={handleRecordPayment}
          />
        )}

        {/* Profile Modal */}
        {showProfileModal && (
          <ProfileModal 
            leasesCount={leases.length}
            onClose={() => setShowProfileModal(false)}
          />
        )}

      </div>
    </div>
  );
}

// -------------------------------------------------------------
// OVERVIEW TAB SUB-COMPONENT
// -------------------------------------------------------------
function OverviewScreen({ 
  leases, 
  payments, 
  electricityRate, 
  calculateElectricityCharge, 
  calculateTotalExpected, 
  calculateDueAmount,
  onRecordPayment,
  onUpdateMeter,
  onAddLease
}) {
  const totalExpected = leases.reduce((sum, l) => sum + calculateTotalExpected(l), 0);
  const totalReceived = payments.reduce((sum, p) => sum + p.amountPaid, 0);
  const totalPending = Math.max(0, totalExpected - totalReceived);

  // Stats averages
  const averageConsum = leases.length 
    ? leases.reduce((sum, l) => sum + (l.currentKwh - l.startingKwh), 0) / leases.length 
    : 0;

  const totalUtilityArrears = leases.reduce((sum, l) => {
    const charge = calculateElectricityCharge(l);
    return sum + Math.max(0, charge - l.advancePayment);
  }, 0);

  return (
    <div className="flex flex-col gap-4 animate-fadeIn">
      
      {/* Superb Highlight Summary Card */}
      <div className="bg-[#D3E3FD] shadow-md rounded-[28px] p-5 text-[#0F172A] relative overflow-hidden">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-[10px] font-black tracking-wider uppercase opacity-80">Expected Collection</span>
            <h2 className="text-3xl font-black mt-1 text-slate-900">${totalExpected.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits:2})}</h2>
          </div>
          <span className="text-[9px] font-black bg-white/70 text-slate-800 px-2 py-1 rounded-lg">MAY-JUN 2026</span>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-6">
          <div className="bg-white/40 rounded-xl p-3 backdrop-blur-sm">
            <span className="text-[9px] font-bold text-slate-700 block gap-1">Received</span>
            <span className="text-lg font-black text-emerald-800">${totalReceived.toLocaleString('en-US', {maximumFractionDigits:0})}</span>
          </div>
          <div className="bg-white/40 rounded-xl p-3 backdrop-blur-sm">
            <span className="text-[9px] font-bold text-slate-700 block">Pending</span>
            <span className="text-lg font-black text-rose-800">${totalPending.toLocaleString('en-US', {maximumFractionDigits:0})}</span>
          </div>
        </div>
      </div>

      {/* Priority Action Lists (Tenants status) */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center gap-1.5 px-1 py-0.5">
          <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Priority Payments & Utilities</h3>
        </div>

        {leases.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 text-center border border-slate-150 flex flex-col items-center justify-center gap-2">
            <Building2 className="w-10 h-10 text-slate-300" />
            <p className="text-xs text-slate-500 font-bold leading-relaxed">No leases configured yet. Tap the button below to add your first tenant contract.</p>
            <button onClick={onAddLease} className="text-xs font-bold text-[#3B82F6] hover:underline mt-1">Add Unit Contract</button>
          </div>
        ) : (
          leases.map((lease) => {
            const dueAmt = calculateDueAmount(lease);
            const isCleared = dueAmt <= 0;

            return (
              <div 
                key={lease.id}
                onClick={() => onRecordPayment(lease)} 
                className="bg-white hover:bg-slate-50 border border-slate-100 p-3.5 rounded-2xl flex justify-between items-center transition-all cursor-pointer hover:shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-[#F4F6F9] text-slate-800 font-extrabold text-[15px] rounded-xl flex items-center justify-center border border-slate-100">
                    {lease.unitNumber}
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900">{lease.tenantName}</h4>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5 font-bold">
                      <span>Due: Day {lease.dueDateDay}</span>
                      <span>•</span>
                      <span>Elec: {Math.round(lease.currentKwh)} kWh</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    {isCleared ? (
                      <div>
                        <span className="text-xs font-black text-emerald-600">Cleared</span>
                        {lease.advancePayment > 0 && (
                          <span className="block text-[8px] font-bold text-slate-400">Incl. ${lease.advancePayment} Adv</span>
                        )}
                      </div>
                    ) : (
                      <div>
                        <span className="text-xs font-black text-rose-600">${dueAmt.toFixed(2)}</span>
                        <span className="block text-[8px] font-bold text-slate-400">Base + Utility</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Quick update meter indicator */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdateMeter(lease);
                    }}
                    className="w-7 h-7 rounded-lg bg-teal-50 hover:bg-teal-100 border border-teal-100 text-teal-700 flex items-center justify-center transition-colors"
                  >
                    <Bolt className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Utility Snapshot summary */}
      <div className="bg-white border border-slate-150/60 p-4 rounded-3xl flex justify-between items-center">
        <div>
          <span className="text-[9px] font-bold text-slate-400 tracking-wider block uppercase">Average Cons consumed</span>
          <span className="text-base font-black text-slate-900">{averageConsum.toFixed(1)} kWh / unit</span>
        </div>
        
        <div className="h-8 w-px bg-slate-100"></div>

        <div>
          <span className="text-[9px] font-bold text-slate-400 tracking-wider block uppercase">Utility Arrears</span>
          <span className="text-base font-black text-slate-900">${totalUtilityArrears.toFixed(2)}</span>
        </div>

        <div className="h-8 w-px bg-slate-100"></div>

        <div className="w-9 h-9 rounded-full bg-amber-50 flex items-center justify-center text-amber-500">
          <Bolt className="w-4 h-4 fill-amber-500 stroke-[1.5]" />
        </div>
      </div>

    </div>
  );
}

// -------------------------------------------------------------
// LEASES TAB SUB-COMPONENT
// -------------------------------------------------------------
function LeasesScreen({ leases, payments, calculateElectricityCharge, calculateDueAmount, onRecordPayment, onUpdateMeter, onDelete }) {
  const [search, setSearch] = useState('');

  const filtered = leases.filter(l => 
    l.tenantName.toLowerCase().includes(search.toLowerCase()) || 
    l.unitNumber.includes(search)
  );

  return (
    <div className="flex flex-col gap-4 animate-fadeIn">
      
      {/* Minimal Search input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-3 w-4.5 h-4.5 text-slate-400 pointer-events-none" />
        <input 
          type="text" 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tenant or apartment unit..." 
          className="w-full pl-10 pr-3.5 py-2.5 text-xs font-bold leading-normal bg-white border border-slate-150 rounded-2xl outline-none focus:border-slate-300 placeholder-slate-400"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-10 text-slate-400 text-xs font-bold bg-white rounded-2xl border border-slate-100">
          No matches found for "{search}"
        </div>
      ) : (
        <div className="flex flex-col gap-4.5 pb-20">
          {filtered.map(lease => {
            const electricityCost = calculateElectricityCharge(lease);
            const dueAmount = calculateDueAmount(lease);

            return (
              <div key={lease.id} className="bg-white border border-slate-150/80 rounded-3xl p-4 shadow-sm flex flex-col gap-3.5">
                
                {/* Contract Card Header */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#D3E3FD] text-[#0F172A] rounded-xl flex items-center justify-center font-black">
                      {lease.unitNumber}
                    </div>
                    <div>
                      <h3 className="text-xs font-black text-slate-900">{lease.tenantName}</h3>
                      <span className="text-[8.5px] font-bold text-slate-400 block mt-0.5">Lease: {lease.leaseStart} - {lease.leaseEnd}</span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => onDelete(lease.id)}
                    className="p-1 text-slate-300 hover:text-rose-500 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Ledger dynamic detail grid */}
                <div className="bg-[#FAFBFD] rounded-2xl p-3 border border-slate-100 flex flex-col gap-2 Text-[11px] text-slate-600 font-medium">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Monthly Base Rent</span>
                    <span className="font-bold text-slate-800">${lease.monthlyBaseRent.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Electricity readings</span>
                    <span className="font-bold text-slate-800">{lease.startingKwh.toFixed(0)} to {lease.currentKwh.toFixed(0)} kWh</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Utility charges (Electricity)</span>
                    <span className="font-bold text-slate-800">${electricityCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Allocated credits (Advance)</span>
                    <span className="font-extrabold text-emerald-600">-${lease.advancePayment.toFixed(2)}</span>
                  </div>
                  
                  <div className="h-px bg-slate-100/90 my-1"></div>

                  <div className="flex justify-between text-xs font-black">
                    <span className="text-slate-900">Total Outstanding Balance</span>
                    <span className={dueAmount > 0 ? 'text-rose-600' : 'text-emerald-600'}>
                      ${dueAmount.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Card Action Controls */}
                <div className="grid grid-cols-2 gap-2 mt-0.5">
                  <button 
                    onClick={() => onUpdateMeter(lease)}
                    className="py-2 px-3 text-[10px] font-black border border-slate-150 hover:bg-slate-50 text-slate-900 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Bolt className="w-3.5 h-3.5" />
                    Update Meter
                  </button>
                  <button 
                    onClick={() => onRecordPayment(lease)}
                    className="py-2 px-3 text-[10px] font-black bg-[#D3E3FD] hove:bg-blue-150 text-[#0F172A] rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    Record Payment
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}

// -------------------------------------------------------------
// MESSAGES TAB SUB-COMPONENT (INBOX + CHAT WINDOW WINDOWS)
// -------------------------------------------------------------
function MessagesScreen({ leases, messages, selectedChatUnit, setSelectedChatUnit, onSendMessage }) {
  const [typedMsg, setTypedMsg] = useState('');
  const chatScrollRef = useRef(null);

  // Auto-scroll logic helper
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, selectedChatUnit]);

  // If chat is open for a specific unit
  if (selectedChatUnit) {
    const lease = leases.find(l => l.unitNumber === selectedChatUnit);
    const chatMsgs = messages.filter(m => m.unitNumber === selectedChatUnit);

    return (
      <div className="absolute inset-x-0 top-0 bottom-0 bg-[#F4F6F9] z-25 flex flex-col animate-slideIn">
        
        {/* Chat Window Header */}
        <header className="flex justify-between items-center bg-white border-b border-slate-150 px-3 py-2">
          <div className="flex items-center gap-1.5">
            <button 
              onClick={() => setSelectedChatUnit(null)}
              className="p-1.5 rounded-full hover:bg-slate-100 text-slate-700"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            <div className="w-9 h-9 bg-[#D3E3FD] text-slate-800 rounded-full flex items-center justify-center font-black">
              {lease?.unitNumber}
            </div>

            <div className="pl-1">
              <h3 className="text-xs font-black text-slate-900">{lease?.tenantName}</h3>
              <span className="text-[8.5px] text-emerald-600 font-bold block">Online Simulator</span>
            </div>
          </div>
        </header>

        {/* Messaging Box Panel */}
        <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 scrollbar-none pb-24">
          {chatMsgs.length === 0 ? (
            <div className="text-center text-slate-400 text-[10px] font-bold py-10">
              No previous threads. Send an update to Marcus or Sarah regarding rent cycles.
            </div>
          ) : (
            chatMsgs.map(msg => {
              const fromLandlord = msg.sender === 'Landlord';
              return (
                <div 
                  key={msg.id} 
                  className={`flex ${fromLandlord ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`p-3 max-w-[2700%] rounded-2xl text-xs font-medium leading-relaxed ${
                    fromLandlord 
                      ? 'bg-gradient-to-tr from-[#1E293B] to-slate-800 text-white rounded-tr-none' 
                      : 'bg-white border border-slate-150 text-slate-800 rounded-tl-none'
                  }`}>
                    <p>{msg.text}</p>
                    <span className={`block text-[7.5px] mt-1 font-bold ${fromLandlord ? 'text-slate-300' : 'text-slate-400'} text-right`}>
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Messaging input footer */}
        <div className="absolute bottom-0 inset-x-0 bg-white border-t border-slate-150 p-2.5 flex items-center gap-2">
          <input 
            type="text"
            value={typedMsg}
            onChange={(e) => setTypedMsg(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onSendMessage(selectedChatUnit, typedMsg);
                setTypedMsg('');
              }
            }}
            placeholder="Type rent update or notification..."
            className="flex-1 bg-slate-55 pl-4 pr-3 py-2 text-xs font-bold bg-slate-50 border border-slate-150 rounded-xl outline-none focus:border-slate-300"
          />
          <button 
            onClick={() => {
              onSendMessage(selectedChatUnit, typedMsg);
              setTypedMsg('');
            }}
            className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center transition-transform active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 animate-fadeIn">
      
      <div>
        <h2 className="text-sm font-black text-slate-900">Tenant Communications</h2>
        <p className="text-[10px] font-bold text-slate-400 mt-0.5">Simulate notification threads regarding rentals or smart utility bill computations.</p>
      </div>

      <div className="flex flex-col gap-3 pb-20">
        {leases.map(lease => {
          const personalMsgs = messages.filter(m => m.unitNumber === lease.unitNumber);
          const lastText = personalMsgs.length ? personalMsgs[personalMsgs.length - 1].text : "No chat history. Initiate conversation!";

          return (
            <div 
              key={lease.id}
              onClick={() => setSelectedChatUnit(lease.unitNumber)}
              className="bg-white hover:bg-slate-50 border border-slate-100 p-3 rounded-2xl flex justify-between items-center cursor-pointer transition-shadow hover:shadow-sm"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-full bg-[#D3E3FD] text-slate-700 flex items-center justify-center font-black">
                  {lease.unitNumber}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-black text-slate-900">{lease.tenantName}</h4>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5 font-medium">{lastText}</p>
                </div>
              </div>

              <ChevronRight className="w-4 h-4 text-slate-300 ml-2" />
            </div>
          );
        })}
      </div>

    </div>
  );
}

// -------------------------------------------------------------
// SETTINGS TAB SUB-COMPONENT
// -------------------------------------------------------------
function SettingsScreen({ electricityRate, setElectricityRate, leasesCount, paymentsCount, onReset }) {
  const [rateInput, setRateInput] = useState(electricityRate.toString());

  return (
    <div className="flex flex-col gap-4 animate-fadeIn">
      
      <div>
        <h2 className="text-sm font-black text-slate-900">Application Settings</h2>
        <p className="text-[10px] font-bold text-slate-400 mt-0.5">Manage utility parameters and safe database states.</p>
      </div>

      {/* Electricity Rate settings Card */}
      <div className="bg-white border border-slate-150/80 rounded-3xl p-4 flex flex-col gap-3 shadow-none">
        <h3 className="text-[9.5px] font-black tracking-wider uppercase text-slate-400">Utility Specifications</h3>
        
        <div>
          <label className="text-[10px] text-slate-400 font-bold block mb-1">Electricity Charge per kWh ($)</label>
          <div className="flex gap-2">
            <input 
              type="number"
              step="0.01"
              value={rateInput}
              onChange={(e) => {
                setRateInput(e.target.value);
                const floatVal = parseFloat(e.target.value);
                if (!isNaN(floatVal) && floatVal > 0) {
                  setElectricityRate(floatVal);
                }
              }}
              className="pl-3.5 pr-2 py-2 text-xs font-extrabold w-32 border border-slate-150 bg-slate-50 rounded-xl outline-none focus:border-slate-300"
            />
            <span className="text-xs flex items-center text-slate-500 font-medium">per unit consumed.</span>
          </div>
        </div>
      </div>

      {/* Database stats */}
      <div className="bg-white border border-slate-150/80 rounded-3xl p-4 flex flex-col gap-2 shadow-none text-xs text-slate-600 font-medium">
        <h3 className="text-[9.5px] font-black tracking-wider uppercase text-slate-400 mb-1.5">Ledger & Records</h3>
        <div className="flex justify-between">
          <span>Active Rent Contracts</span>
          <span className="font-bold text-slate-900">{leasesCount} Units</span>
        </div>
        <div className="flex justify-between mt-1">
          <span>Past historical payments logged</span>
          <span className="font-bold text-slate-900">{paymentsCount} Payments</span>
        </div>
        
        <div className="h-px bg-slate-100 my-2"></div>

        <button 
          onClick={onReset}
          className="w-full bg-rose-50 hover:bg-rose-100/75 border border-rose-100 text-rose-700 py-3 rounded-xl font-black text-[11px] flex items-center justify-center gap-2 mt-1.5 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Reset & Safe Reload Demo Data
        </button>

        <p className="text-[8.5px] leading-relaxed text-slate-400 mt-1 text-center font-bold px-2">
          Resets the database back to standard showroom listings (Marcus, Sarah, Carlos, Elena) for full populated live preview experience.
        </p>
      </div>

    </div>
  );
}

// -------------------------------------------------------------
// DIALOG COMPONENT MODALS (STATE WRAPPING)
// -------------------------------------------------------------

function AddLeaseModal({ onClose, onSave }) {
  const [form, setForm] = useState({
    unitNumber: '',
    tenantName: '',
    tenantPhone: '',
    tenantEmail: '',
    monthlyBaseRent: '',
    dueDateDay: '',
    startingKwh: '',
    advancePayment: '0'
  });
  const [err, setErr] = useState('');

  const submit = () => {
    if (!form.unitNumber || !form.tenantName || !form.monthlyBaseRent || !form.dueDateDay || !form.startingKwh) {
      setErr("Please fill in all mandatory fields correctly.");
      return;
    }
    onSave(form);
  };

  return (
    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-30 flex items-end justify-center">
      <div className="bg-white w-full rounded-t-[36px] max-h-[90%] overflow-y-auto p-6 flex flex-col gap-4 animate-[#D3E3FD]_slideUp select-none shadow-2xl">
        <header className="flex justify-between items-center pr-1">
          <h3 className="text-sm font-black text-slate-900">Add New Managed Unit</h3>
          <button onClick={onClose} className="text-slate-400 font-bold hover:text-slate-700 text-xs">Cancel</button>
        </header>

        {err && <div className="text-[10px] font-bold text-rose-500">{err}</div>}

        <div className="flex flex-col gap-3 py-1">
          <div>
            <label className="text-[10px] text-slate-400 font-extrabold block mb-1">Unit Number (Mandatory)</label>
            <input 
              type="text" 
              placeholder="e.g. A5, B10"
              value={form.unitNumber}
              onChange={(e) => setForm({...form, unitNumber: e.target.value})}
              className="w-full pl-3.5 pr-2 py-2 text-xs font-bold bg-slate-50 border border-slate-150 rounded-xl outline-none focus:border-slate-300"
            />
          </div>

          <div>
            <label className="text-[10px] text-slate-400 font-extrabold block mb-1">Tenant Name (Mandatory)</label>
            <input 
              type="text" 
              placeholder="Full Name"
              value={form.tenantName}
              onChange={(e) => setForm({...form, tenantName: e.target.value})}
              className="w-full pl-3.5 pr-2 py-2 text-xs font-bold bg-slate-50 border border-slate-150 rounded-xl outline-none focus:border-slate-300"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-slate-400 font-extrabold block mb-1">Phone</label>
              <input 
                type="text" 
                placeholder="+1 (555) 120-0000"
                value={form.tenantPhone}
                onChange={(e) => setForm({...form, tenantPhone: e.target.value})}
                className="w-full pl-3.5 pr-2 py-2 text-xs font-bold bg-slate-50 border border-slate-150 rounded-xl outline-none focus:border-slate-300"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 font-extrabold block mb-1">Email</label>
              <input 
                type="text" 
                placeholder="tenant@email.com"
                value={form.tenantEmail}
                onChange={(e) => setForm({...form, tenantEmail: e.target.value})}
                className="w-full pl-3.5 pr-2 py-2 text-xs font-bold bg-slate-50 border border-slate-150 rounded-xl outline-none focus:border-slate-300"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-slate-400 font-extrabold block mb-1">Monthly Base Rent ($)</label>
              <input 
                type="number" 
                placeholder="0.00"
                value={form.monthlyBaseRent}
                onChange={(e) => setForm({...form, monthlyBaseRent: e.target.value})}
                className="w-full pl-3.5 pr-2 py-2 text-xs font-bold bg-slate-50 border border-slate-150 rounded-xl outline-none focus:border-slate-300"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 font-extrabold block mb-1">Due Date Day (1-31)</label>
              <input 
                type="number" 
                placeholder="5"
                value={form.dueDateDay}
                onChange={(e) => setForm({...form, dueDateDay: e.target.value})}
                className="w-full pl-3.5 pr-2 py-2 text-xs font-bold bg-slate-50 border border-slate-150 rounded-xl outline-none focus:border-slate-300"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-slate-400 font-extrabold block mb-1">Initial Meter (kWh)</label>
              <input 
                type="number" 
                placeholder="1000.00"
                value={form.startingKwh}
                onChange={(e) => setForm({...form, startingKwh: e.target.value})}
                className="w-full pl-3.5 pr-2 py-2 text-xs font-bold bg-slate-50 border border-slate-150 rounded-xl outline-none focus:border-slate-300"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 font-extrabold block mb-1">Starting Advance Pay ($)</label>
              <input 
                type="number" 
                placeholder="0.00"
                value={form.advancePayment}
                onChange={(e) => setForm({...form, advancePayment: e.target.value})}
                className="w-full pl-3.5 pr-2 py-2 text-xs font-bold bg-slate-50 border border-slate-150 rounded-xl outline-none focus:border-slate-300"
              />
            </div>
          </div>
        </div>

        <button 
          onClick={submit}
          className="w-full bg-[#1E293B] hover:bg-slate-800 text-white font-black py-3 rounded-2xl text-xs mt-2 select-none active:scale-95 transition-transform"
        >
          Create Rent Contract
        </button>
      </div>
    </div>
  );
}

function MeterUpdateModal({ lease, onClose, onSave }) {
  const [reading, setReading] = useState(lease.currentKwh.toString());
  const [err, setErr] = useState('');

  const submit = () => {
    const floatVal = parseFloat(reading);
    if (isNaN(floatVal)) {
      setErr("Please enter a valid amount.");
      return;
    }
    if (floatVal < lease.startingKwh) {
      setErr(`Reading cannot be lower than starting meter: ${lease.startingKwh} kWh`);
      return;
    }
    onSave(lease.unitNumber, floatVal);
  };

  return (
    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-30 flex items-center justify-center p-4">
      <div className="bg-white w-full rounded-3xl p-5 flex flex-col gap-4 max-w-[360px] shadow-2xl">
        <h3 className="text-xs font-black text-slate-900 leading-snug">Update Meter: Unit {lease.unitNumber}</h3>
        <p className="text-[10px] font-bold text-slate-400 -mt-2">Update Sarah or Marcus's electricity readings to dynamically compute utility changes.</p>

        {err && <div className="text-[9.5px] font-bold text-rose-500">{err}</div>}

        <div>
          <label className="text-[10px] text-slate-400 font-bold block mb-1">Current reading (kWh)</label>
          <input 
            type="number" 
            value={reading}
            onChange={(e) => setReading(e.target.value)}
            className="w-full pl-3 pr-2 py-2.5 text-xs font-black border border-slate-150 bg-slate-50 rounded-xl outline-none focus:border-slate-300"
          />
          <span className="block text-[8.5px] font-bold mt-1 text-slate-400">Recorded: {lease.currentKwh} kWh (Start: {lease.startingKwh} kWh)</span>
        </div>

        <div className="flex gap-2.5 mt-1">
          <button 
            onClick={onClose} 
            className="flex-1 py-2.5 border border-slate-150 hover:bg-slate-50 text-slate-700 rounded-xl text-[10.5px] font-black transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={submit} 
            className="flex-1 py-2.5 bg-slate-900 text-white rounded-xl text-[10.5px] font-black active:scale-95 transition-transform"
          >
            Save Reading
          </button>
        </div>
      </div>
    </div>
  );
}

function PaymentModal({ lease, totalDue, onClose, onSave }) {
  const [amount, setAmount] = useState(totalDue.toFixed(2));
  const [type, setType] = useState('Rent');
  const [advance, setAdvance] = useState('0.0');
  const [remarks, setRemarks] = useState('');
  const [err, setErr] = useState('');

  const submit = () => {
    const floatVal = parseFloat(amount);
    if (isNaN(floatVal) || floatVal <= 0) {
      setErr("Please specify a valid payment amount.");
      return;
    }
    onSave({
      unitNumber: lease.unitNumber,
      amountPaid: floatVal,
      paymentType: type,
      remarks,
      addAdvance: parseFloat(advance || 0)
    });
  };

  return (
    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-30 flex items-end justify-center select-none">
      <div className="bg-white w-full rounded-t-[36px] max-h-[95%] overflow-y-auto p-6 flex flex-col gap-4 shadow-2xl">
        <header className="flex justify-between items-center">
          <h3 className="text-sm font-black text-slate-900">Record Payment - Unit {lease.unitNumber}</h3>
          <button onClick={onClose} className="text-slate-400 font-bold hover:text-slate-700 text-xs">Cancel</button>
        </header>

        {err && <div className="text-[10px] font-bold text-rose-500">{err}</div>}

        <div className="bg-[#D3E3FD]/30 rounded-2xl p-3 flex justify-between items-center">
          <div>
            <span className="text-[9px] font-black tracking-wide text-slate-400">OUTSTANDING BALANCE DUE</span>
            <span className="block text-xl font-black text-[#1E293B] mt-0.5">${totalDue.toFixed(2)}</span>
          </div>
          <div className="text-right text-[9px] font-bold text-slate-500 leading-normal">
            <span>Base rent details configured.</span>
          </div>
        </div>

        <div className="flex flex-col gap-3 py-1">
          <div>
            <label className="text-[10px] text-slate-400 font-bold block mb-1">Payment Amount ($)</label>
            <input 
              type="number" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full pl-3.5 pr-2 py-2 text-xs font-black bg-slate-50 border border-slate-150 rounded-xl outline-none focus:border-slate-300"
            />
          </div>

          <div>
            <label className="text-[10px] text-slate-400 font-bold block mb-1">Payment Type</label>
            <div className="flex gap-2">
              {['Rent', 'Utility', 'Both', 'Advance'].map(t => (
                <button 
                  key={t}
                  onClick={() => setType(t)}
                  className={`px-3 py-1 text-[10px] font-black rounded-lg border transition-colors ${
                    type === t 
                      ? 'bg-[#D3E3FD] border-blue-200 text-[#0F172A]' 
                      : 'border-slate-150 bg-slate-50 text-slate-500'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] text-slate-400 font-bold block mb-1">Allocate additional advance credit ($)</label>
            <input 
              type="number" 
              value={advance}
              onChange={(e) => setAdvance(e.target.value)}
              className="w-full pl-3.5 pr-2 py-2 text-xs font-bold bg-slate-50 border border-slate-150 rounded-xl outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] text-slate-400 font-bold block mb-1">Remarks</label>
            <input 
              type="text" 
              placeholder="e.g. Paid in full"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full pl-3.5 pr-2 py-2 text-xs font-bold bg-slate-50 border border-slate-150 rounded-xl outline-none"
            />
          </div>
        </div>

        <button 
          onClick={submit}
          className="w-full bg-slate-900 text-white font-black py-3 rounded-2xl text-xs active:scale-95 transition-transform mt-1"
        >
          Confirm Ledger Entry
        </button>

      </div>
    </div>
  );
}

function ProfileModal({ leasesCount, onClose }) {
  return (
    <div className="absolute inset-0 bg-[#0F172A]/40 backdrop-blur-sm z-30 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-5 border border-slate-150 flex flex-col gap-4 text-center max-w-[280px] shadow-2xl relative select-none uppercase">
        <Award className="w-8 h-8 text-amber-500 fill-amber-500 mx-auto" />
        <div>
          <h2 className="text-sm font-black text-slate-900 tracking-wider">John Doe</h2>
          <span className="text-[8.5px] font-black text-slate-400 block tracking-widest mt-0.5">Premium Landlord</span>
        </div>

        <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-2xl text-[10px] font-bold text-slate-500 normal-case">
          <p>Contact: admin@grandviewapts.com</p>
          <p className="mt-1">Active lease count: {leasesCount}</p>
        </div>

        <button 
          onClick={onClose}
          className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[10px] font-black transition-transform active:scale-95"
        >
          Close Profile
        </button>
      </div>
    </div>
  );
}
