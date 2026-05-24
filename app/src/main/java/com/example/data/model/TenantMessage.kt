package com.example.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "tenant_messages")
data class TenantMessage(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val unitNumber: String,
    val sender: String, // "Landlord" or "Tenant"
    val timestamp: Long, // UNIX Milliseconds
    val text: String,
    val isRead: Boolean = false
)
