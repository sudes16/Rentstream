package com.rentstream.app.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "leases")
data class Lease(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val unitNumber: String,
    val tenantName: String,
    val tenantEmail: String = "",
    val tenantPhone: String = "",
    val monthlyBaseRent: Double,
    val dueDate: Int, // Day of month (e.g., 5)
    val startingKwh: Double, // Initial electricity reading
    val currentKwh: Double,  // Most recent electricity reading
    val advancePayment: Double = 0.0, // Pre-paid dynamic advance credits
    val leaseStart: String,
    val leaseEnd: String,
    val numOccupants: Int = 1,
    val isArchived: Boolean = false
)
