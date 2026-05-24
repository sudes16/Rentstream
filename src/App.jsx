import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Receipt, 
  MessageSquare, 
  Settings, 
  Plus, 
  Zap, 
  CreditCard, 
  Trash2, 
  ChevronRight, 
  Search, 
  Check, 
  AlertCircle, 
  Clock, 
  User, 
  Send,
  UserCheck,
  Building,
  ArrowRight,
  Mail,
  Phone,
  Calendar,
  DollarSign
} from 'lucide-react';

// Default constants matching Android project
const DEFAULT_RATE = 0.15; // $0.15 / kWh

const MOCK_LEASES = [
  {
    id: 1,
    unitNumber: "A4",
    tenantName: "Marcus Chen",
    tenantEmail: "marcus.chen@example.com",
    tenantPhone: "555-0144",
    monthlyBaseRent: 1250.0,
    dueDate: 5,
    startingKwh: 14200.0,
    currentKwh: 14510.0, // 310 kWh consumed
    advancePayment: 0.0,
    leaseStart: "2026-01-01",
    leaseEnd: "2026-12-31",
    numOccupants: 1,
    isArchived: false
  },
  {
    id: 2,
    unitNumber: "B2",
    tenantName: "Sarah Jenkins",
    tenantEmail: "sarah.j@example.com",
    tenantPhone: "555-0199",
    monthlyBaseRent: 1400.0,
    dueDate: 15,
    startingKwh: 14204.0,
    currentKwh: 14204.0,
    advancePayment: 200.0, // Has some pre-paid credit
    leaseStart: "2026-02-15",
    leaseEnd: "2027-02-14",
    numOccupants: 2,
    isArchived: false
  },
  {
    id: 3,
    unitNumber: "C1",
    tenantName: "Carlos Ruiz",
    tenantEmail: "carlos.ruiz@example.com",
    tenantPhone: "555-0122",
    monthlyBaseRent: 1100.0,
    dueDate: 10,
    startingKwh: 8900.0,
    currentKwh: 9180.0, // 280 kWh consumed
    advancePayment: 50.0,
    leaseStart: "2026-03-01",
    leaseEnd: "2027-02-28",
    numOccupants: 1,
    isArchived: false
  },
  {
    id: 4,
    unitNumber: "D3",
    tenantName: "Elena Rostova",
    tenantEmail: "elena.r@example.com",
    tenantPhone: "555-0187",
    monthlyBaseRent: 1650.0,
    dueDate: 1,
    startingKwh: 11200.0,
    currentKwh: 11620.0, // 420 kWh consumed
    advancePayment: 0.0,
    leaseStart: "2026-01-15",
    leaseEnd: "2027-01-14",
    numOccupants: 3,
    isArchived: false
  }
];

const MOCK_PAYMENTS = [
  {
    id: 1,
    unitNumber: "B2",
    amountPaid: 1400.0,
    paymentDate: "May 24, 2026",
    paymentType: "Rent",
    fromKwh: 14204.0,
    toKwh: 14204.0,
    advanceAdded: 200.0,
    remarks: "Paid rent on time with extra $200 advance for electricity."
  },
  {
    id: 2,
    unitNumber: "C1",
    amountPaid: 1150.0,
    paymentDate: "May 23, 2026",
    paymentType: "Both",
    fromKwh: 8900.0,
    toKwh: 9000.0,
    advanceAdded: 50.0,
    remarks: "Paid base rent + partially cleared meter"
  }
];

const MOCK_MESSAGES = [
  {
    id: 1,
    unitNumber: "A4",
    sender: "Tenant",
    timestamp: Date.now() - 172800000, // 2 days ago
    text: "Hi, I will be a couple of days late with this month's rent due to a bank transfer issue.",
    isRead: false
  },
  {
    id: 2,
    unitNumber: "A4",
    sender: "Landlord",
    timestamp: Date.now() - 86400000, // 1 day ago
    text: "Thank you for letting me know, Marcus. Please maintain the status update here.",
    isRead: true
  },
  {
    id: 3,
    unitNumber: "B2",
    sender: "Tenant",
    timestamp: Date.now() - 10800000, // 3 hours ago
    text: "Hello! I updated the electrical start reading, is it correct?",
    isRead: false
  },
  {
    id: 4,
    unitNumber: "B2",
    sender: "Landlord",
    timestamp: Date.now() - 3600000, // 1 hour ago
    text: "Yes Sarah, looks perfect. I've credited $200 advance utility towards your ledger.",
    isRead: true
  }
];

const safeGetItem = (key, fallback) => {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return fallback;
    const parsed = JSON.parse(saved);
    if (Array.isArray(fallback) && !Array.isArray(parsed)) {
      console.warn("localStorage type mismatch, using fallback for key:", key);
      return fallback;
    }
    return parsed;
  } catch (e) {
    console.warn("localStorage parsing/access is restricted or failed:", e);
    return fallback;
  }
};

const safeSetItem = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    // ignore
  }
};

export default function App() {
  const [leases, setLeases] = useState(() => {
    const data = safeGetItem('rm_leases', MOCK_LEASES);
    return Array.isArray(data) ? data : MOCK_LEASES;
  });
  const [payments, setPayments] = useState(() => {
    const data = safeGetItem('rm_payments', MOCK_PAYMENTS);
    return Array.isArray(data) ? data : MOCK_PAYMENTS;
  });
  const [messages, setMessages] = useState(() => {
    const data = safeGetItem('rm_messages', MOCK_MESSAGES);
    return Array.isArray(data) ? data : MOCK_MESSAGES;
  });
  const [electricityRate, setElectricityRate] = useState(() => {
    try {
      const saved = localStorage.getItem('rm_rate');
      if (saved) {
        const parsed = parseFloat(saved);
        if (!isNaN(parsed)) return parsed;
      }
      return DEFAULT_RATE;
    } catch {
      return DEFAULT_RATE;
    }
  });

  const [currentTab, setCurrentTab] = useState('overview'); // overview, leases, messages, settings
  const [selectedChatUnit, setSelectedChatUnit] = useState('A4');
  const [newMessageText, setNewMessageText] = useState('');

  // Modals & Forms
  const [showAddLeaseModal, setShowAddLeaseModal] = useState(false);
  const [showMeterModal, setShowMeterModal] = useState(null); // holds lease object
  const [showPaymentModal, setShowPaymentModal] = useState(null); // holds lease object
  const [showLandlordProfile, setShowLandlordProfile] = useState(false);

  // States for new lease form
  const [newUnit, setNewUnit] = useState('');
  const [newTenant, setNewTenant] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRent, setNewRent] = useState('');
  const [newDueDate, setNewDueDate] = useState('5');
  const [newStartKwh, setNewStartKwh] = useState('');
  const [newAdvance, setNewAdvance] = useState('0');
  const [newLeaseStart, setNewLeaseStart] = useState('');
  const [newLeaseEnd, setNewLeaseEnd] = useState('');

  // States for updating meter Modal
  const [updatedKwh, setUpdatedKwh] = useState('');

  // States for recording payment Modal
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentType, setPaymentType] = useState('Rent'); // Rent, Electricity, Both, Advance
  const [paymentRemarks, setPaymentRemarks] = useState('');
  const [addAdvanceAmount, setAddAdvanceAmount] = useState('0');

  // Persistence Syncs
  useEffect(() => {
    safeSetItem('rm_leases', leases);
  }, [leases]);

  useEffect(() => {
    safeSetItem('rm_payments', payments);
  }, [payments]);

  useEffect(() => {
    safeSetItem('rm_messages', messages);
  }, [messages]);

  useEffect(() => {
    try {
      localStorage.setItem('rm_rate', electricityRate.toString());
    } catch (e) {}
  }, [electricityRate]);

  // Calculations
  const calculateElectricityCharge = (lease) => {
    const unitsUsed = Math.max(0, lease.currentKwh - lease.startingKwh);
    return unitsUsed * electricityRate;
  };

  const calculateTotalExpected = (lease) => {
    return lease.monthlyBaseRent + calculateElectricityCharge(lease);
  };

  const calculateDueAmount = (lease) => {
    const expected = calculateTotalExpected(lease);
    // filter payments for this lease
    const paidSum = payments
      .filter(p => p.unitNumber === lease.unitNumber)
      .reduce((sum, p) => sum + p.amountPaid, 0);

    const due = expected - paidSum - lease.advancePayment;
    return Math.max(0, due);
  };

  // Aggregated Statistics
  const activeLeases = leases.filter(l => !l.isArchived);
  const totalExpectedAll = activeLeases.reduce((sum, l) => sum + calculateTotalExpected(l), 0);
  const totalPaidAll = payments.reduce((sum, p) => sum + p.amountPaid, 0);
  const totalDuesAll = activeLeases.reduce((sum, l) => sum + calculateDueAmount(l), 0);
  const totalAdvanceAll = activeLeases.reduce((sum, l) => sum + l.advancePayment, 0);

  const occupancyRate = activeLeases.length > 0 ? Math.round((activeLeases.length / 6) * 100) : 0; // assuming 6 units total
  const collectionRate = totalExpectedAll > 0 ? Math.round(((totalExpectedAll - totalDuesAll) / totalExpectedAll) * 100) : 0;

  // Add Lease handler
  const handleAddLease = (e) => {
    e.preventDefault();
    if (!newUnit || !newTenant || !newRent || !newStartKwh) {
      alert("Please fill in unit number, tenant name, monthly rent, and start kWh.");
      return;
    }

    const startVal = parseFloat(newStartKwh);
    const newLeaseObj = {
      id: Date.now(),
      unitNumber: newUnit.toUpperCase(),
      tenantName: newTenant,
      tenantEmail: newEmail || "tenant@example.com",
      tenantPhone: newPhone || "555-0100",
      monthlyBaseRent: parseFloat(newRent),
      dueDate: parseInt(newDueDate) || 5,
      startingKwh: startVal,
      currentKwh: startVal,
      advancePayment: parseFloat(newAdvance) || 0,
      leaseStart: newLeaseStart || new Date().toISOString().split('T')[0],
      leaseEnd: newLeaseEnd || new Date(Date.now() + 31536000000).toISOString().split('T')[0],
      numOccupants: 1,
      isArchived: false
    };

    setLeases([...leases, newLeaseObj]);
    setShowAddLeaseModal(false);

    // reset inputs
    setNewUnit('');
    setNewTenant('');
    setNewEmail('');
    setNewPhone('');
    setNewRent('');
    setNewDueDate('5');
    setNewStartKwh('');
    setNewAdvance('0');
    setNewLeaseStart('');
    setNewLeaseEnd('');
  };

  // Delete Lease
  const handleDeleteLease = (id) => {
    if (confirm("Are you sure you want to remove this lease contract?")) {
      setLeases(leases.filter(l => l.id !== id));
    }
  };

  // Update meter handler
  const handleUpdateMeter = (e) => {
    e.preventDefault();
    if (!updatedKwh || isNaN(updatedKwh)) {
      alert("Please input a valid meter value.");
      return;
    }
    const val = parseFloat(updatedKwh);
    if (val < showMeterModal.currentKwh) {
      alert(`New meter reading (${val} kWh) cannot be lower than previous reading (${showMeterModal.currentKwh} kWh).`);
      return;
    }

    setLeases(leases.map(l => {
      if (l.id === showMeterModal.id) {
        return { ...l, currentKwh: val };
      }
      return l;
    }));
    setShowMeterModal(null);
    setUpdatedKwh('');
  };

  // Record payment handler
  const handleRecordPayment = (e) => {
    e.preventDefault();
    if (!paymentAmount || isNaN(paymentAmount)) {
      alert("Please enter a valid amount.");
      return;
    }

    const amountVal = parseFloat(paymentAmount);
    const advVal = parseFloat(addAdvanceAmount) || 0;

    const newPaymentObj = {
      id: Date.now(),
      unitNumber: showPaymentModal.unitNumber,
      amountPaid: amountVal,
      paymentDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      paymentType: paymentType,
      fromKwh: showPaymentModal.startingKwh,
      toKwh: showPaymentModal.currentKwh,
      advanceAdded: advVal,
      remarks: paymentRemarks || `Recorded ${paymentType} payment.`
    };

    setPayments([newPaymentObj, ...payments]);

    // Update lease values if there is any advanceAdded
    setLeases(leases.map(l => {
      if (l.unitNumber === showPaymentModal.unitNumber) {
        return {
          ...l,
          advancePayment: l.advancePayment + advVal
        };
      }
      return l;
    }));

    setShowPaymentModal(null);
    setPaymentAmount('');
    setPaymentType('Rent');
    setPaymentRemarks('');
    setAddAdvanceAmount('0');
  };

  // Send Landlord message
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessageText.trim()) return;

    const outgoing = {
      id: Date.now(),
      unitNumber: selectedChatUnit,
      sender: 'Landlord',
      timestamp: Date.now(),
      text: newMessageText,
      isRead: true
    };

    setMessages([...messages, outgoing]);
    setNewMessageText('');

    // Delightful Auto-reply simulation from Tenant
    setTimeout(() => {
      const responses = [
        "Received, thank you for checking in!",
        "Thanks landlord, I'll pay the balance tonight.",
        "Understood. I will upload our electrical reading soon.",
        "Perfect, have a wonderful week!",
        "Alright, sounds good to me!"
      ];
      const randomMsg = responses[Math.floor(Math.random() * responses.length)];
      const reply = {
        id: Date.now() + 1,
        unitNumber: selectedChatUnit,
        sender: 'Tenant',
        timestamp: Date.now(),
        text: randomMsg,
        isRead: false
      };
      setMessages(prev => [...prev, reply]);
    }, 1500);
  };

  // Reset db to default mocks
  const resetToDefault = () => {
    if (confirm("Reset current data back to standard demo leases and payments?")) {
      setLeases(MOCK_LEASES);
      setPayments(MOCK_PAYMENTS);
      setMessages(MOCK_MESSAGES);
      setElectricityRate(DEFAULT_RATE);
    }
  };

  // Group messages
  const activeChatMessages = messages
    .filter(m => m.unitNumber === selectedChatUnit)
    .sort((a,b) => a.timestamp - b.timestamp);

  // Mark all unread as read when clicking chat unit
  useEffect(() => {
    setMessages(prev => prev.map(m => {
      if (m.unitNumber === selectedChatUnit && m.sender === 'Tenant' && !m.isRead) {
        return { ...m, isRead: true };
      }
      return m;
    }));
  }, [selectedChatUnit, messages.length]);

  return (
    <div className="flex flex-col h-screen bg-slateBg max-w-md mx-auto relative overflow-hidden shadow-2xl border-x border-lightBorder">
      
      {/* Top Header App Bar */}
      <header className="bg-pureWhite py-3 px-4 border-b border-lightBorder flex items-center justify-between shadow-sm shrink-0">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-accentBlue flex items-center justify-center">
            <Building className="w-5 h-5 text-navy" />
          </div>
          <div>
            <h1 className="text-base font-bold text-navy tracking-tight leading-none">Grandview Apts</h1>
            <p className="text-[11px] text-slateSecondary">{activeLeases.length} Managed Units</p>
          </div>
        </div>
        
        <button 
          onClick={() => setShowLandlordProfile(true)}
          className="w-9 h-9 rounded-full hover:bg-slateBg flex items-center justify-center transition-colors select-none"
        >
          <User className="w-6 h-6 text-navy" />
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-20 px-4 pt-4 whitespace-normal">
        
        {/* TAB 1: OVERVIEW DASHBOARD */}
        {currentTab === 'overview' && (
          <div className="space-y-4 animate-fade-in">
            {/* Real Stats Cards Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-pureWhite p-3 rounded-2xl border border-lightBorder shadow-xs">
                <div className="flex items-center space-x-2 text-slateSecondary mb-1">
                  <UserCheck className="w-4 h-4" />
                  <span className="text-[11px] font-medium uppercase tracking-wider">Occupancy</span>
                </div>
                <div className="text-lg font-bold text-navy">{occupancyRate}%</div>
                <div className="text-[10px] text-slateSecondary">{activeLeases.length} / 6 units filled</div>
              </div>
              
              <div className="bg-pureWhite p-3 rounded-2xl border border-lightBorder shadow-xs">
                <div className="flex items-center space-x-2 text-slateSecondary mb-1">
                  <CreditCard className="w-4 h-4" />
                  <span className="text-[11px] font-medium uppercase tracking-wider">Collection</span>
                </div>
                <div className="text-lg font-bold text-navy">{collectionRate}%</div>
                <div className="text-[10px] text-slateSecondary">expected rate ratio</div>
              </div>
            </div>

            {/* Financial Overview Card */}
            <div className="bg-navy text-pureWhite p-4 rounded-3xl space-y-3 shadow-md relative overflow-hidden">
              <div className="absolute right-[-20px] bottom-[-20px] opacity-10">
                <DollarSign className="w-32 h-32" />
              </div>
              <div>
                <p className="text-xs text-accentBlue opacity-80 font-medium">Net Month Outstanding Dues</p>
                <h3 className="text-3xl font-extrabold tracking-tight mt-0.5">${totalDuesAll.toFixed(2)}</h3>
              </div>
              <div className="h-[1px] bg-pureWhite/10 my-1" />
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="opacity-70 block">Monthly Target:</span>
                  <span className="font-semibold text-accentBlue">${totalExpectedAll.toFixed(2)}</span>
                </div>
                <div>
                  <span className="opacity-70 block">Advance Pool:</span>
                  <span className="font-semibold text-accentBlue">${totalAdvanceAll.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Quick Multi-Action Buttons */}
            <div className="flex gap-2">
              <button 
                onClick={() => setShowAddLeaseModal(true)}
                className="flex-1 bg-pureWhite hover:bg-slateBg text-navy text-xs font-semibold py-2.5 px-3 rounded-xl border border-lightBorder shadow-2xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-navy" />
                Add Lease
              </button>
              <button 
                onClick={() => {
                  if (activeLeases.length > 0) {
                    setShowMeterModal(activeLeases[0]);
                  } else {
                    alert("No active leases. Please add one first.");
                  }
                }}
                className="flex-1 bg-pureWhite hover:bg-slateBg text-navy text-xs font-semibold py-2.5 px-3 rounded-xl border border-lightBorder shadow-2xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                Log Meter
              </button>
              <button 
                onClick={() => {
                  if (activeLeases.length > 0) {
                    setShowPaymentModal(activeLeases[0]);
                  } else {
                    alert("No active leases. Please add one first.");
                  }
                }}
                className="flex-1 bg-pureWhite hover:bg-slateBg text-navy text-xs font-semibold py-2.5 px-3 rounded-xl border border-lightBorder shadow-2xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                Pay Rent
              </button>
            </div>

            {/* Quick Units list */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slateSecondary uppercase tracking-wider">Unit Balances Status</h4>
                <span className="text-[10px] bg-accentBlue text-navy font-semibold px-2 py-0.5 rounded-full">Electricity: ${electricityRate}/kWh</span>
              </div>
              
              <div className="space-y-2.5">
                {activeLeases.map(lease => {
                  const dueAmt = calculateDueAmount(lease);
                  const isPaid = dueAmt <= 0;
                  return (
                    <div 
                      key={lease.id}
                      onClick={() => {
                        setSelectedChatUnit(lease.unitNumber);
                        setCurrentTab('leases');
                      }}
                      className="bg-pureWhite p-3.5 rounded-2xl border border-lightBorder hover:border-slateSecondary/30 shadow-3xs flex items-center justify-between cursor-pointer transition-all hover:translate-x-0.5"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-slateBg font-bold text-navy flex items-center justify-center">
                          {lease.unitNumber}
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-navy">{lease.tenantName}</h5>
                          <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slateSecondary">
                            <span>Base: ${lease.monthlyBaseRent}</span>
                            <span>•</span>
                            <span>Meter: {lease.currentKwh}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        {isPaid ? (
                          <div className="flex items-center text-emerald-600 text-[11px] font-bold gap-0.5">
                            <Check className="w-3 h-3" /> Paid
                          </div>
                        ) : (
                          <div className="text-darkRed text-xs font-bold">${dueAmt.toFixed(2)} due</div>
                        )}
                        <p className="text-[10px] text-slateSecondary mt-0.5">due on index {lease.dueDate}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: LEASES LIST & FORM */}
        {currentTab === 'leases' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slateSecondary uppercase tracking-wider">Active Rental Contracts</h3>
              <button 
                onClick={() => setShowAddLeaseModal(true)}
                className="bg-navy text-pureWhite text-xs font-bold py-1.5 px-3 rounded-lg flex items-center gap-1 hover:bg-navy/90"
              >
                <Plus className="w-3.5 h-3.5" /> Unit
              </button>
            </div>

            <div className="space-y-3">
              {activeLeases.map(lease => {
                const eleCharge = calculateElectricityCharge(lease);
                const dueAmt = calculateDueAmount(lease);
                const totalExpected = calculateTotalExpected(lease);

                return (
                  <div key={lease.id} className="bg-pureWhite rounded-2xl border border-lightBorder shadow-xs overflow-hidden">
                    {/* Collapsible Head */}
                    <div className="bg-slateBg/40 px-3.5 py-3 flex items-center justify-between border-b border-lightBorder/50">
                      <div className="flex items-center space-x-2">
                        <span className="bg-navy text-pureWhite text-xs font-bold px-2 py-0.5 rounded-lg">{lease.unitNumber}</span>
                        <h4 className="text-xs font-bold text-navy">{lease.tenantName}</h4>
                      </div>
                      
                      <button 
                        onClick={() => handleDeleteLease(lease.id)}
                        className="text-slateSecondary hover:text-darkRed p-1 transition-colors"
                        title="Delete contract"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Lease Details info */}
                    <div className="p-3.5 space-y-3 text-xs">
                      {/* Contact Info */}
                      <div className="grid grid-cols-2 gap-2 text-[10px] text-slateSecondary border-b border-lightBorder/30 pb-2">
                        <div className="flex items-center gap-1">
                          <Mail className="w-3 h-3 shrink-0" />
                          <span className="truncate">{lease.tenantEmail}</span>
                        </div>
                        <div className="flex items-center gap-1 justify-end">
                          <Phone className="w-3 h-3 shrink-0" />
                          <span>{lease.tenantPhone}</span>
                        </div>
                      </div>

                      {/* Calculations Details grid */}
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                        <div>
                          <span className="text-[10px] text-slateSecondary block">Base Monthly Rent</span>
                          <span className="font-bold text-navy">${lease.monthlyBaseRent.toFixed(2)}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slateSecondary block">Pre-paid / Advance Credits</span>
                          <span className="font-bold text-emerald-600">${lease.advancePayment.toFixed(2)}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slateSecondary block">Electricity Units Used</span>
                          <span className="font-medium text-navy text-[11px]">
                            {lease.currentKwh} - {lease.startingKwh} = <strong className="text-amber-600 font-bold">{(lease.currentKwh - lease.startingKwh).toFixed(1)} kWh</strong>
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slateSecondary block">Utility Fees (at ${electricityRate})</span>
                          <span className="font-bold text-navy">${eleCharge.toFixed(2)}</span>
                        </div>
                      </div>

                      <div className="bg-slateBg/50 p-2.5 rounded-xl flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slateSecondary block">Total cycle expected balance:</span>
                          <span className="font-bold text-navy">${totalExpected.toFixed(2)}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slateSecondary block">Current Due Day {lease.dueDate}:</span>
                          {dueAmt <= 0 ? (
                            <span className="text-emerald-600 font-bold">No Dues (Paid)</span>
                          ) : (
                            <span className="text-darkRed font-extrabold text-sm">${dueAmt.toFixed(2)}</span>
                          )}
                        </div>
                      </div>

                      {/* Operational buttons */}
                      <div className="flex gap-2 pt-1 border-t border-lightBorder/30">
                        <button 
                          onClick={() => setShowMeterModal(lease)}
                          className="flex-1 bg-accentBlue text-navy text-[11px] font-bold py-1.5 rounded-lg flex items-center justify-center gap-1 border border-navy/10"
                        >
                          <Zap className="w-3 h-3 text-amber-500 font-bold" /> Update Reading
                        </button>
                        <button 
                          onClick={() => setShowPaymentModal(lease)}
                          className="flex-1 bg-emerald-50 text-emerald-800 text-[11px] font-bold py-1.5 rounded-lg flex items-center justify-center gap-1 border border-emerald-300"
                        >
                          <CreditCard className="w-3 h-3 text-emerald-600" /> Pay Ledger
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: TENANT CHAT & MESSAGES */}
        {currentTab === 'messages' && (
          <div className="flex flex-col h-[calc(100vh-140dp)] animate-fade-in space-y-3">
            {/* Horizontal Unit Selector badge strip */}
            <div className="flex gap-2 overflow-x-auto pb-1 select-none whitespace-nowrap">
              {activeLeases.map(l => {
                const unreadCount = messages.filter(m => m.unitNumber === l.unitNumber && m.sender === 'Tenant' && !m.isRead).length;
                return (
                  <button
                    key={l.id}
                    onClick={() => setSelectedChatUnit(l.unitNumber)}
                    className={`inline-flex items-center space-x-1 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                      selectedChatUnit === l.unitNumber 
                        ? 'bg-navy text-pureWhite' 
                        : 'bg-pureWhite text-slateSecondary border border-lightBorder'
                    }`}
                  >
                    <span>Unit {l.unitNumber}</span>
                    {unreadCount > 0 && (
                      <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Chat Thread card dialog */}
            <div className="bg-pureWhite rounded-2xl border border-lightBorder flex-1 flex flex-col overflow-hidden min-h-[350px] shadow-sm">
              {/* Header */}
              <div className="bg-slateBg/40 px-3.5 py-2.5 border-b border-lightBorder/50 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-navy">Unit {selectedChatUnit} Resident Portal</h4>
                  <p className="text-[10px] text-slateSecondary">Active lease chat log</p>
                </div>
                <button 
                  onClick={() => {
                    // Trigger dynamic dummy reply from tenant
                    const dummyMsgs = [
                      "Hi! I just sent the rent through bank transfer. Let me know if you got it.",
                      "Is our current water meter reading fine? Let me know.",
                      "Could we change our start kWh log? We noticed a tiny issue on day one.",
                      "Can you send the payment receipt?"
                    ];
                    const rand = dummyMsgs[Math.floor(Math.random() * dummyMsgs.length)];
                    setMessages(prev => [...prev, {
                      id: Date.now(),
                      unitNumber: selectedChatUnit,
                      sender: 'Tenant',
                      timestamp: Date.now(),
                      text: rand,
                      isRead: false
                    }]);
                  }}
                  className="bg-accentBlue text-navy text-[10px] font-semibold py-1 px-2.5 rounded-full hover:bg-navy/10"
                >
                  Simulate Tenant Reply
                </button>
              </div>

              {/* Message scroll viewport */}
              <div className="flex-1 p-3 overflow-y-auto space-y-3 flex flex-col">
                {activeChatMessages.length === 0 ? (
                  <div className="text-center py-12 text-[11px] text-slateSecondary flex flex-col items-center justify-center space-y-1">
                    <MessageSquare className="w-8 h-8 opacity-30 text-navy" />
                    <p>No messages with Unit {selectedChatUnit} yet.</p>
                  </div>
                ) : (
                  activeChatMessages.map(msg => {
                    const isLandlord = msg.sender === 'Landlord';
                    return (
                      <div 
                        key={msg.id}
                        className={`flex flex-col max-w-[80%] ${isLandlord ? 'self-end items-end' : 'self-start items-start'}`}
                      >
                        <div className={`p-2.5 rounded-2xl text-xs leading-relaxed ${
                          isLandlord 
                            ? 'bg-navy text-pureWhite rounded-tr-none' 
                            : 'bg-slateBg text-navy rounded-tl-none'
                        }`}>
                          {msg.text}
                        </div>
                        <span className="text-[9px] text-slateSecondary mt-1 px-1">
                          {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Bottom Send Action bar */}
              <form onSubmit={handleSendMessage} className="p-2 border-t border-lightBorder/50 flex gap-2">
                <input 
                  type="text" 
                  value={newMessageText}
                  onChange={(e) => setNewMessageText(e.target.value)}
                  placeholder={`Send message to Unit ${selectedChatUnit}...`}
                  className="flex-1 text-xs px-3 py-2 bg-slateBg rounded-xl border border-lightBorder/50 focus:outline-none focus:border-navy"
                />
                <button 
                  type="submit"
                  className="w-9 h-9 bg-navy hover:bg-navy/90 text-pureWhite rounded-xl flex items-center justify-center shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 4: SETTINGS */}
        {currentTab === 'settings' && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="text-sm font-bold text-navy uppercase tracking-wider mb-2">Global Utility Config</h3>
            
            <div className="bg-pureWhite p-4 rounded-2xl border border-lightBorder space-y-4 shadow-3xs">
              <div>
                <label className="text-xs font-semibold text-slateSecondary block mb-1">Electricity Charge Rate ($/kWh)</label>
                <div className="flex gap-2">
                  <input 
                    type="number" 
                    step="0.01"
                    value={electricityRate}
                    onChange={(e) => setElectricityRate(parseFloat(e.target.value) || 0)}
                    className="flex-1 text-xs font-bold px-3 py-2 border border-lightBorder rounded-xl focus:outline-none focus:border-navy"
                  />
                  <div className="bg-slateBg text-navy text-xs font-bold px-4 py-2 rounded-xl flex items-center">
                    $/kWh
                  </div>
                </div>
                <p className="text-[10px] text-slateSecondary mt-1">
                  Changing this rate will immediately re-calculate cycle dues across all non-settled contracts dynamically.
                </p>
              </div>

              <div className="h-[1px] bg-lightBorder/50" />

              <div>
                <h4 className="text-xs font-bold text-navy">Rate Preset Quick Pick:</h4>
                <div className="flex gap-2 mt-2">
                  {[0.12, 0.15, 0.18, 0.22].map(r => (
                    <button
                      key={r}
                      onClick={() => setElectricityRate(r)}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
                        electricityRate === r 
                          ? 'bg-navy text-pureWhite' 
                          : 'bg-slateBg text-navy hover:bg-slateBg/80'
                      }`}
                    >
                      ${r}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Platform Settings */}
            <div className="bg-pureWhite p-4 rounded-2xl border border-lightBorder space-y-3 shadow-3xs">
              <h4 className="text-xs font-bold text-navy">Developer Sandbox Tools</h4>
              <p className="text-[11px] text-slateSecondary">
                Restore sample mock configurations to test layout limits and operations without typing out manual parameters.
              </p>
              <button 
                onClick={resetToDefault}
                className="w-full bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold py-2.5 rounded-xl border border-rose-200 transition-colors"
              >
                Reset Database to Demo Mocks
              </button>
            </div>
          </div>
        )}

      </main>

      {/* Bottom Navigation Tabs Panel */}
      <nav className="absolute bottom-0 left-0 right-0 bg-pureWhite border-t border-lightBorder grid grid-cols-4 py-1.5 px-2 shadow-[0_-4px_12px_rgba(0,0,0,0.03)] z-20">
        <button 
          onClick={() => setCurrentTab('overview')}
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all ${
            currentTab === 'overview' ? 'text-navy scale-105' : 'text-slateSecondary opacity-70'
          }`}
        >
          <Home className="w-[18px] h-[18px]" />
          <span className="text-[9px] font-bold mt-1">Overview</span>
        </button>
        
        <button 
          onClick={() => setCurrentTab('leases')}
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all ${
            currentTab === 'leases' ? 'text-navy scale-105' : 'text-slateSecondary opacity-70'
          }`}
        >
          <Receipt className="w-[18px] h-[18px]" />
          <span className="text-[9px] font-bold mt-1">Leases</span>
        </button>
        
        <button 
          onClick={() => setCurrentTab('messages')}
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all ${
            currentTab === 'messages' ? 'text-navy scale-105' : 'text-slateSecondary opacity-70'
          }`}
        >
          <div className="relative">
            <MessageSquare className="w-[18px] h-[18px]" />
            {messages.some(m => !m.isRead && m.sender === 'Tenant') && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            )}
          </div>
          <span className="text-[9px] font-bold mt-1">Messages</span>
        </button>
        
        <button 
          onClick={() => setCurrentTab('settings')}
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all ${
            currentTab === 'settings' ? 'text-navy scale-105' : 'text-slateSecondary opacity-70'
          }`}
        >
          <Settings className="w-[18px] h-[18px]" />
          <span className="text-[9px] font-bold mt-1">Settings</span>
        </button>
      </nav>

      {/* ================= MODALS & FORMS OVERLAYS ================= */}

      {/* MODAL 1: ADD LEASE CONTRACT */}
      {showAddLeaseModal && (
        <div className="absolute inset-0 bg-navy/60 backdrop-blur-xs flex items-end justify-center z-50 animate-fade-in">
          <div className="bg-pureWhite w-full rounded-t-3xl max-h-[90%] overflow-y-auto p-4 space-y-4 shadow-2xl pb-10">
            <div className="flex items-center justify-between border-b border-lightBorder pb-2">
              <h3 className="text-sm font-bold text-navy">Assign New Rental Lease</h3>
              <button 
                onClick={() => setShowAddLeaseModal(false)}
                className="text-slateSecondary text-xs px-2.5 py-1 bg-slateBg rounded-lg"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleAddLease} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slateSecondary block mb-1">Unit Tag *</label>
                  <input 
                    type="text" 
                    placeholder="e.g. A4, B2" 
                    value={newUnit} 
                    onChange={e => setNewUnit(e.target.value)}
                    className="w-full px-3 py-2 border border-lightBorder rounded-xl focus:border-navy"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slateSecondary block mb-1">Base Monthly Rent ($) *</label>
                  <input 
                    type="number" 
                    placeholder="1200" 
                    value={newRent} 
                    onChange={e => setNewRent(e.target.value)}
                    className="w-full px-3 py-2 border border-lightBorder rounded-xl focus:border-navy"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slateSecondary block mb-1">Resident Full Name *</label>
                <input 
                  type="text" 
                  placeholder="Marcus Chen" 
                  value={newTenant} 
                  onChange={e => setNewTenant(e.target.value)}
                  className="w-full px-3 py-2 border border-lightBorder rounded-xl focus:border-navy"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slateSecondary block mb-1">Email</label>
                  <input 
                    type="email" 
                    placeholder="email@example.com" 
                    value={newEmail} 
                    onChange={e => setNewEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-lightBorder rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slateSecondary block mb-1">Phone</label>
                  <input 
                    type="text" 
                    placeholder="555-0144" 
                    value={newPhone} 
                    onChange={e => setNewPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-lightBorder rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slateSecondary block mb-1">Starting kWh *</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 14200" 
                    value={newStartKwh} 
                    onChange={e => setNewStartKwh(e.target.value)}
                    className="w-full px-3 py-2 border border-lightBorder rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slateSecondary block mb-1">Initial Advance Balance ($)</label>
                  <input 
                    type="number" 
                    placeholder="0" 
                    value={newAdvance} 
                    onChange={e => setNewAdvance(e.target.value)}
                    className="w-full px-3 py-2 border border-lightBorder rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slateSecondary block mb-1">Monthly Due Day (1-28)</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="28" 
                    value={newDueDate} 
                    onChange={e => setNewDueDate(e.target.value)}
                    className="w-full px-3 py-2 border border-lightBorder rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slateSecondary block mb-1">Lease Term Period Start</label>
                  <input 
                    type="date" 
                    value={newLeaseStart} 
                    onChange={e => setNewLeaseStart(e.target.value)}
                    className="w-full px-3 py-2 border border-lightBorder rounded-xl text-slateSecondary"
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-navy hover:bg-navy/90 text-pureWhite text-xs font-semibold py-2.5 rounded-xl mt-2 transition-all"
              >
                Register Contract
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: UPDATE METER READING */}
      {showMeterModal && (
        <div className="absolute inset-0 bg-navy/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-pureWhite w-full rounded-2xl max-w-sm p-4 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b pb-2">
              <div>
                <h4 className="text-xs font-bold text-navy">Log Electric Consumption</h4>
                <p className="text-[9px] text-slateSecondary">Updating Unit {showMeterModal.unitNumber}</p>
              </div>
              <button 
                onClick={() => setShowMeterModal(null)}
                className="text-[11px] bg-slateBg px-2 py-1 rounded-lg"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleUpdateMeter} className="space-y-3.5 text-xs">
              <div className="bg-slateBg/50 p-2.5 rounded-xl space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slateSecondary">Previous Meter Level:</span>
                  <span className="font-bold text-navy">{showMeterModal.currentKwh} kWh</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slateSecondary">Starting Meter level:</span>
                  <span className="font-medium text-navy">{showMeterModal.startingKwh} kWh</span>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slateSecondary block mb-1">Current/New Reading Level (kWh)</label>
                <input 
                  type="number" 
                  step="0.01"
                  placeholder={`Greater than ${showMeterModal.currentKwh}`}
                  value={updatedKwh}
                  onChange={e => setUpdatedKwh(e.target.value)}
                  className="w-full px-3 py-2 border border-lightBorder rounded-xl font-bold text-navy"
                  required
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-navy hover:bg-navy/90 text-pureWhite font-bold py-2.5 rounded-xl text-xs transition-colors"
              >
                Commit Meter Value
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: RECORD PAYMENT */}
      {showPaymentModal && (
        <div className="absolute inset-0 bg-navy/60 backdrop-blur-xs flex items-end justify-center z-50 animate-fade-in">
          <div className="bg-pureWhite w-full rounded-t-3xl max-h-[90%] overflow-y-auto p-4 space-y-4 shadow-2xl pb-10">
            <div className="flex items-center justify-between border-b border-lightBorder pb-2">
              <div>
                <h4 className="text-sm font-bold text-navy">Record Tenant Payment</h4>
                <p className="text-[9px] text-slateSecondary">Unit {showPaymentModal.unitNumber} ledger</p>
              </div>
              <button 
                onClick={() => setShowPaymentModal(null)}
                className="text-xs px-2.5 py-1 bg-slateBg rounded-lg"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slateBg/50 p-3 rounded-xl text-[11px]">
                <div>
                  <span className="text-slateSecondary block">Current Due Cycle</span>
                  <strong className="text-darkRed">${calculateDueAmount(showPaymentModal).toFixed(2)}</strong>
                </div>
                <div>
                  <span className="text-slateSecondary block">Saved Advance Credit</span>
                  <strong className="text-emerald-600">${showPaymentModal.advancePayment.toFixed(2)}</strong>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slateSecondary block mb-1">Amount Paid ($) *</label>
                  <input 
                    type="number" 
                    step="0.01"
                    placeholder="e.g. 1400"
                    value={paymentAmount}
                    onChange={e => setPaymentAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-lightBorder rounded-xl font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slateSecondary block mb-1">Target Account</label>
                  <select 
                    value={paymentType}
                    onChange={e => setPaymentType(e.target.value)}
                    className="w-full px-2 py-2 border border-lightBorder rounded-xl font-semibold text-navy bg-pureWhite"
                  >
                    <option value="Rent">Rent Only</option>
                    <option value="Electricity">Electricity Only</option>
                    <option value="Both">Both accounts</option>
                    <option value="Advance">Utility Advance Fund</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slateSecondary block mb-1">Load Advance Credit to dynamic wallet ($)</label>
                <input 
                  type="number" 
                  value={addAdvanceAmount}
                  onChange={e => setAddAdvanceAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-lightBorder rounded-xl text-emerald-600 font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slateSecondary block mb-1">Remarks / Note</label>
                <input 
                  type="text" 
                  value={paymentRemarks}
                  onChange={e => setPaymentRemarks(e.target.value)}
                  placeholder="e.g. Paid via Instant transfer"
                  className="w-full px-3 py-2 border border-lightBorder rounded-xl"
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-navy hover:bg-navy/90 text-pureWhite font-bold py-2.5 rounded-xl transition-all text-xs"
              >
                Log Receipt Payment
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: LANDLORD PROFILE */}
      {showLandlordProfile && (
        <div className="absolute inset-0 bg-navy/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-pureWhite w-full rounded-2xl max-w-sm p-4 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b pb-2">
              <h4 className="text-xs font-bold text-navy uppercase tracking-wider">Landlord Ledger Account</h4>
              <button 
                onClick={() => setShowLandlordProfile(false)}
                className="text-[11px] bg-slateBg px-2 py-1 rounded-lg"
              >
                Close
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="flex items-center space-x-3.5">
                <div className="w-12 h-12 rounded-xl bg-accentBlue text-navy font-bold flex items-center justify-center text-lg">
                  L
                </div>
                <div>
                  <h5 className="font-bold text-navy text-sm">Grandview Landlord Portal</h5>
                  <p className="text-[10px] text-slateSecondary">Sudesh • sudes16@gmail.com</p>
                </div>
              </div>

              <div className="bg-slateBg/50 p-3 rounded-xl space-y-2 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slateSecondary">Total Active Units:</span>
                  <span className="font-bold text-navy">{activeLeases.length} units</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slateSecondary">Total Expected Collection:</span>
                  <span className="font-bold text-navy">${totalExpectedAll.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slateSecondary">Dynamic Electricity Rate:</span>
                  <span className="font-bold text-navy">${electricityRate}/kWh</span>
                </div>
              </div>

              <p className="text-[10px] text-slateSecondary leading-relaxed text-center">
                This is a fully sandboxed mock environment representing real-time client-side transactions, synced to device storage.
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
