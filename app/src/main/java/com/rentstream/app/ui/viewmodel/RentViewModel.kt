package com.rentstream.app.ui.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.rentstream.app.data.local.RentDatabase
import com.rentstream.app.data.model.Lease
import com.rentstream.app.data.model.Payment
import com.rentstream.app.data.model.TenantMessage
import com.rentstream.app.data.repository.RentRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class RentViewModel(application: Application) : AndroidViewModel(application) {

    private val repository: RentRepository
    val leases: StateFlow<List<Lease>>
    val payments: StateFlow<List<Payment>>
    val messages: StateFlow<List<TenantMessage>>

    // Local configuration metrics
    private val _electricityRate = MutableStateFlow(0.15) // $0.15 per kWh
    val electricityRate = _electricityRate.asStateFlow()

    // Screen State variables
    private val _selectedLeaseForPayment = MutableStateFlow<Lease?>(null)
    val selectedLeaseForPayment = _selectedLeaseForPayment.asStateFlow()

    private val _selectedChatUnitNumber = MutableStateFlow<String?>(null)
    val selectedChatUnitNumber = _selectedChatUnitNumber.asStateFlow()

    init {
        val database = RentDatabase.getDatabase(application)
        repository = RentRepository(database.rentDao())

        leases = repository.allLeases.stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = emptyList()
        )

        payments = repository.allPayments.stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = emptyList()
        )

        messages = repository.allMessages.stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = emptyList()
        )

        // Pre-populate if db is empty
        viewModelScope.launch {
            val list = repository.allLeases.first()
            if (list.isEmpty()) {
                prepopulateDatabase()
            }
        }
    }

    private suspend fun prepopulateDatabase() {
        val defaultLeases = listOf(
            Lease(
                unitNumber = "A4",
                tenantName = "Marcus Chen",
                tenantEmail = "marcus.chen@example.com",
                tenantPhone = "555-0144",
                monthlyBaseRent = 1250.0,
                dueDate = 5,
                startingKwh = 14200.0,
                currentKwh = 14510.0, // 310 kWh consumed
                advancePayment = 0.0,
                leaseStart = "Jan 01, 2026",
                leaseEnd = "Dec 31, 2026"
            ),
            Lease(
                unitNumber = "B2",
                tenantName = "Sarah Jenkins",
                tenantEmail = "sarah.j@example.com",
                tenantPhone = "555-0199",
                monthlyBaseRent = 1400.0,
                dueDate = 15,
                startingKwh = 14204.0,
                currentKwh = 14204.0,
                advancePayment = 200.0, // Has some advance/pre-paid
                leaseStart = "Feb 15, 2026",
                leaseEnd = "Feb 14, 2027"
            ),
            Lease(
                unitNumber = "C1",
                tenantName = "Carlos Ruiz",
                tenantEmail = "carlos.ruiz@example.com",
                tenantPhone = "555-0122",
                monthlyBaseRent = 1100.0,
                dueDate = 10,
                startingKwh = 8900.0,
                currentKwh = 9180.0, // 280 kWh consumed
                advancePayment = 50.0,
                leaseStart = "Mar 01, 2026",
                leaseEnd = "Feb 28, 2027"
            ),
            Lease(
                unitNumber = "D3",
                tenantName = "Elena Rostova",
                tenantEmail = "elena.r@example.com",
                tenantPhone = "555-0187",
                monthlyBaseRent = 1650.0,
                dueDate = 1,
                startingKwh = 11200.0,
                currentKwh = 11620.0, // 420 kWh consumed
                advancePayment = 0.0,
                leaseStart = "Jan 15, 2026",
                leaseEnd = "Jan 14, 2027"
            )
        )

        for (lease in defaultLeases) {
            repository.insertLease(lease)
        }

        val now = SimpleDateFormat("MMM dd, yyyy", Locale.getDefault()).format(Date())

        // Add some pre-populated payments
        val defaultPayments = listOf(
            Payment(
                unitNumber = "B2",
                amountPaid = 1400.0,
                paymentDate = now,
                paymentType = "Rent",
                fromKwh = 14204.0,
                toKwh = 14204.0,
                advanceAdded = 200.0,
                remarks = "Paid rent on time with extra $200 advance for electricity."
            ),
            Payment(
                unitNumber = "C1",
                amountPaid = 1150.0,
                paymentDate = now,
                paymentType = "Both",
                fromKwh = 8900.0,
                toKwh = 9000.0, // partial payment tracking
                advanceAdded = 50.0,
                remarks = "Paid base rent + partially cleared meter"
            )
        )

        for (payment in defaultPayments) {
            repository.insertPayment(payment)
        }

        // Add some messages
        val timestamp = System.currentTimeMillis()
        val defaultMessages = listOf(
            TenantMessage(
                unitNumber = "A4",
                sender = "Tenant",
                timestamp = timestamp - 86400000 * 2,
                text = "Hi, I will be a couple of days late with this month's rent due to a bank transfer issue."
            ),
            TenantMessage(
                unitNumber = "A4",
                sender = "Landlord",
                timestamp = timestamp - 86400000,
                text = "Thank you for letting me know, Marcus. Please maintain the status update here."
            ),
            TenantMessage(
                unitNumber = "B2",
                sender = "Tenant",
                timestamp = timestamp - 3600000 * 3,
                text = "Hello! I updated the electrical start reading, is it correct?"
            ),
            TenantMessage(
                unitNumber = "B2",
                sender = "Landlord",
                timestamp = timestamp - 3600000,
                text = "Yes Sarah, looks perfect. I've credited $200 advance utility towards your ledger."
            )
        )

        for (msg in defaultMessages) {
            repository.insertMessage(msg)
        }
    }

    // Rate updater
    fun setElectricityRate(rate: Double) {
        _electricityRate.value = rate
    }

    fun selectLeaseForPayment(lease: Lease?) {
        _selectedLeaseForPayment.value = lease
    }

    fun selectChatUnitNumber(unit: String?) {
        _selectedChatUnitNumber.value = unit
    }

    // Calculation helper for single Lease:
    fun calculateElectricityCharge(lease: Lease): Double {
        val unitsUsed = (lease.currentKwh - lease.startingKwh).coerceAtLeast(0.0)
        return unitsUsed * _electricityRate.value
    }

    // Total expected for this lease (Base Rent + Electricity Charges)
    fun calculateTotalExpected(lease: Lease): Double {
        return lease.monthlyBaseRent + calculateElectricityCharge(lease)
    }

    // Net Outstanding / Due Amount for a lease
    fun calculateDueAmount(lease: Lease, paymentsList: List<Payment>): Double {
        val totalExpected = calculateTotalExpected(lease)
        // Aggregrate payments made for this unit in current cycle (approximate current payment log matching)
        // For precision, sum up all "Rent" / "Both" / "Electricity" payments made in the period, minus advance credits.
        val sumOfPayments = paymentsList
            .filter { it.unitNumber == lease.unitNumber }
            .sumOf { it.amountPaid }

        val outstanding = totalExpected - sumOfPayments - lease.advancePayment
        return outstanding.coerceAtLeast(0.0)
    }

    // Landlord Actions
    fun addNewLease(
        unit: String,
        tenant: String,
        email: String,
        phone: String,
        rent: Double,
        dueDateDay: Int,
        startKwh: Double,
        currentKwhVal: Double,
        advance: Double,
        leaseStr: String,
        leaseEnd: String
    ) {
        viewModelScope.launch {
            val newLease = Lease(
                unitNumber = unit,
                tenantName = tenant,
                tenantEmail = email,
                tenantPhone = phone,
                monthlyBaseRent = rent,
                dueDate = dueDateDay,
                startingKwh = startKwh,
                currentKwh = currentKwhVal,
                advancePayment = advance,
                leaseStart = leaseStr,
                leaseEnd = leaseEnd
            )
            repository.insertLease(newLease)
        }
    }

    fun deleteLease(lease: Lease) {
        viewModelScope.launch {
            repository.deleteLease(lease)
        }
    }

    fun updateMeterReading(lease: Lease, newKwh: Double) {
        viewModelScope.launch {
            val updated = lease.copy(currentKwh = newKwh)
            repository.updateLease(updated)
        }
    }

    fun addPayment(
        unitNumber: String,
        amount: Double,
        type: String, // Rent, Electricity, Both, Advance
        addAdvance: Double = 0.0,
        remarks: String = ""
    ) {
        viewModelScope.launch {
            val lease = repository.getLeaseByUnit(unitNumber)
            if (lease != null) {
                val now = SimpleDateFormat("MMM dd, yyyy", Locale.getDefault()).format(Date())
                val newPayment = Payment(
                    unitNumber = unitNumber,
                    amountPaid = amount,
                    paymentDate = now,
                    paymentType = type,
                    fromKwh = lease.startingKwh,
                    toKwh = lease.currentKwh,
                    advanceAdded = addAdvance,
                    remarks = remarks
                )
                repository.insertPayment(newPayment)

                // Update Lease values dynamically:
                // If they paid extra advance, increment advance payment credits
                val currentAdvance = lease.advancePayment + addAdvance
                val updatedLease = lease.copy(
                    advancePayment = currentAdvance
                )
                repository.updateLease(updatedLease)
            }
        }
    }

    fun sendMessage(unitNumber: String, sender: String, text: String) {
        viewModelScope.launch {
            val timestamp = System.currentTimeMillis()
            val newMsg = TenantMessage(
                unitNumber = unitNumber,
                sender = sender,
                timestamp = timestamp,
                text = text
            )
            repository.insertMessage(newMsg)

            // Trigger simulated responder script
            if (sender == "Landlord") {
                simulateTenantReply(unitNumber, text)
            }
        }
    }

    private fun simulateTenantReply(unitNumber: String, landlordText: String) {
        viewModelScope.launch {
            kotlinx.coroutines.delay(1200) // Simulated typing delay for a real, living feel

            val replyText = when {
                landlordText.contains("rent", ignoreCase = true) || landlordText.contains("due", ignoreCase = true) -> {
                    listOf(
                        "Hi! I just sent the rent over. Let me know if you got it.",
                        "Hello, I will transfer it by tomorrow morning! Apologies for the delay.",
                        "Thanks for the reminder. Just completed the transaction. Have a good evening!"
                    ).random()
                }
                landlordText.contains("meter", ignoreCase = true) || landlordText.contains("electricity", ignoreCase = true) || landlordText.contains("kwh", ignoreCase = true) -> {
                    listOf(
                        "I check my meter this morning; I'll send you the picture of it now.",
                        "I've written it down: it is currently at exactly the number I sent in the chat.",
                        "Perfect! Electricity bills are quite reasonable this month."
                    ).random()
                }
                landlordText.contains("repair", ignoreCase = true) || landlordText.contains("leak", ignoreCase = true) || landlordText.contains("issue", ignoreCase = true) -> {
                    "Thanks for scheduling the repair. Let me know what time they are arriving!"
                }
                else -> {
                    listOf(
                        "Acknowledged, thanks for the update!",
                        "Sure! Let me know if there's anything else required.",
                        "Awesome, appreciate your response!"
                    ).random()
                }
            }

            val tenantMsg = TenantMessage(
                unitNumber = unitNumber,
                sender = "Tenant",
                timestamp = System.currentTimeMillis(),
                text = replyText
            )
            repository.insertMessage(tenantMsg)
        }
    }

    fun clearAllData() {
        viewModelScope.launch {
            // Drop tables or delete individually
            val allCurrentLeases = leases.value
            for (l in allCurrentLeases) {
                repository.deleteLease(l)
            }
            val paymentsList = payments.value
            for (p in paymentsList) {
                repository.deletePayment(p)
            }
            // Trigger pre-population back to return to the beautiful clean slate
            prepopulateDatabase()
        }
    }
}
