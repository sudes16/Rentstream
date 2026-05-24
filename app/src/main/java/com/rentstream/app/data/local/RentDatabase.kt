package com.rentstream.app.data.local

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import com.rentstream.app.data.model.Lease
import com.rentstream.app.data.model.Payment
import com.rentstream.app.data.model.TenantMessage

@Database(
    entities = [Lease::class, Payment::class, TenantMessage::class],
    version = 1,
    exportSchema = false
)
abstract class RentDatabase : RoomDatabase() {

    abstract fun rentDao(): RentDao

    companion object {
        @Volatile
        private var INSTANCE: RentDatabase? = null

        fun getDatabase(context: Context): RentDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    RentDatabase::class.java,
                    "rent_manager_db"
                )
                .fallbackToDestructiveMigration()
                .build()
                INSTANCE = instance
                instance
            }
        }
    }
}
