package com.example.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "payments")
data class Payment(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val unitNumber: String,
    val amountPaid: Double,
    val paymentDate: String, // String representation format "May 24, 2026"
    val paymentType: String, // "Rent", "Electricity", "Both", "Advance"
    val fromKwh: Double = 0.0, // Utility meter reading start for this period
    val toKwh: Double = 0.0,   // Utility meter reading end for this period
    val advanceAdded: Double = 0.0, // Advance credit added during this payment
    val advanceDeducted: Double = 0.0, // Advance credit consumed during this payment
    val remarks: String = ""
)
