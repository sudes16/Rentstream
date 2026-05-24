package com.rentstream.app.data.local

import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import com.rentstream.app.data.model.Lease
import com.rentstream.app.data.model.Payment
import com.rentstream.app.data.model.TenantMessage
import kotlinx.coroutines.flow.Flow

@Dao
interface RentDao {

    // --- LEASES ---
    @Query("SELECT * FROM leases WHERE isArchived = 0 ORDER BY unitNumber ASC")
    fun getAllLeases(): Flow<List<Lease>>

    @Query("SELECT * FROM leases WHERE unitNumber = :unitNumber LIMIT 1")
    suspend fun getLeaseByUnit(unitNumber: String): Lease?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertLease(lease: Lease): Long

    @Update
    suspend fun updateLease(lease: Lease)

    @Delete
    suspend fun deleteLease(lease: Lease)


    // --- PAYMENTS ---
    @Query("SELECT * FROM payments ORDER BY id DESC")
    fun getAllPayments(): Flow<List<Payment>>

    @Query("SELECT * FROM payments WHERE unitNumber = :unitNumber ORDER BY id DESC")
    fun getPaymentsForUnit(unitNumber: String): Flow<List<Payment>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertPayment(payment: Payment): Long

    @Delete
    suspend fun deletePayment(payment: Payment)


    // --- MESSAGES ---
    @Query("SELECT * FROM tenant_messages ORDER BY timestamp ASC")
    fun getAllMessages(): Flow<List<TenantMessage>>

    @Query("SELECT * FROM tenant_messages WHERE unitNumber = :unitNumber ORDER BY timestamp ASC")
    fun getMessagesForUnit(unitNumber: String): Flow<List<TenantMessage>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertMessage(message: TenantMessage): Long
}
