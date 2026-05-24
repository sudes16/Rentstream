package com.example.data.repository

import com.example.data.local.RentDao
import com.example.data.model.Lease
import com.example.data.model.Payment
import com.example.data.model.TenantMessage
import kotlinx.coroutines.flow.Flow

class RentRepository(private val rentDao: RentDao) {

    val allLeases: Flow<List<Lease>> = rentDao.getAllLeases()
    val allPayments: Flow<List<Payment>> = rentDao.getAllPayments()
    val allMessages: Flow<List<TenantMessage>> = rentDao.getAllMessages()

    fun getPaymentsForUnit(unitNumber: String): Flow<List<Payment>> =
        rentDao.getPaymentsForUnit(unitNumber)

    fun getMessagesForUnit(unitNumber: String): Flow<List<TenantMessage>> =
        rentDao.getMessagesForUnit(unitNumber)

    suspend fun getLeaseByUnit(unitNumber: String): Lease? =
        rentDao.getLeaseByUnit(unitNumber)

    suspend fun insertLease(lease: Lease) {
        rentDao.insertLease(lease)
    }

    suspend fun updateLease(lease: Lease) {
        rentDao.updateLease(lease)
    }

    suspend fun deleteLease(lease: Lease) {
        rentDao.deleteLease(lease)
    }

    suspend fun insertPayment(payment: Payment) {
        rentDao.insertPayment(payment)
    }

    suspend fun deletePayment(payment: Payment) {
        rentDao.deletePayment(payment)
    }

    suspend fun insertMessage(message: TenantMessage) {
        rentDao.insertMessage(message)
    }
}
