package com.example

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.data.model.Lease
import com.example.data.model.Payment
import com.example.data.model.TenantMessage
import com.example.ui.theme.*
import com.example.ui.viewmodel.RentViewModel

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            MyApplicationTheme {
                RentManagementApp()
            }
        }
    }
}

enum class NavigationTab {
    Overview, Leases, Messages, Settings
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun RentManagementApp(
    viewModel: RentViewModel = viewModel()
) {
    var currentTab by remember { mutableStateFlowOf(NavigationTab.Overview) }
    
    val leases by viewModel.leases.collectAsStateWithLifecycle()
    val payments by viewModel.payments.collectAsStateWithLifecycle()
    val messages by viewModel.messages.collectAsStateWithLifecycle()
    val electricityRate by viewModel.electricityRate.collectAsStateWithLifecycle()

    var showAddLeaseDialog by remember { mutableStateOf(false) }
    var showMeterReadingDialog by remember { mutableStateOf<Lease?>(null) }
    var showPaymentDialog by remember { mutableStateOf<Lease?>(null) }
    var landlordProfileDialog by remember { mutableStateOf(false) }

    Scaffold(
        modifier = Modifier
            .fillMaxSize()
            .testTag("main_scaffold")
            .background(SlateBg),
        topBar = {
            TopAppBar(
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = SlateBg,
                    titleContentColor = DarkNavy
                ),
                title = {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(12.dp),
                        modifier = Modifier.padding(vertical = 4.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(40.dp)
                                .clip(CircleShape)
                                .background(WarmAccentBlue),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.HomeWork,
                                contentDescription = "Grandview Apartments",
                                tint = DarkNavy,
                                modifier = Modifier.size(20.dp)
                            )
                        }
                        Column {
                            Text(
                                text = "Grandview Apts.",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold,
                                color = DarkNavy
                            )
                            Text(
                                text = "${leases.size} Managed Units",
                                style = MaterialTheme.typography.bodySmall,
                                color = SlateSecondary
                            )
                        }
                    }
                },
                actions = {
                    IconButton(
                        onClick = { landlordProfileDialog = true },
                        modifier = Modifier
                            .testTag("profile_button")
                            .minimumInteractiveComponentSize()
                    ) {
                        Icon(
                            imageVector = Icons.Outlined.AccountCircle,
                            contentDescription = "Landlord Profile",
                            tint = DarkNavy,
                            modifier = Modifier.size(28.dp)
                        )
                    }
                }
            )
        },
        bottomBar = {
            NavigationBar(
                containerColor = PureWhite,
                tonalElevation = 0.dp,
                modifier = Modifier
                    .border(1.dp, LightBorder, RoundedCornerShape(topStart = 0.dp, topEnd = 0.dp))
                    .windowInsetsPadding(WindowInsets.navigationBars)
                    .testTag("bottom_nav")
            ) {
                NavigationBarItem(
                    selected = currentTab == NavigationTab.Overview,
                    onClick = { currentTab = NavigationTab.Overview },
                    icon = {
                        Icon(
                            imageVector = if (currentTab == NavigationTab.Overview) Icons.Filled.Dashboard else Icons.Outlined.Dashboard,
                            contentDescription = "Overview"
                        )
                    },
                    label = { Text("Overview") },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = DarkNavy,
                        selectedTextColor = DarkNavy,
                        indicatorColor = WarmAccentBlue,
                        unselectedIconColor = SlateSecondary,
                        unselectedTextColor = SlateSecondary
                    ),
                    modifier = Modifier.testTag("tab_overview")
                )
                NavigationBarItem(
                    selected = currentTab == NavigationTab.Leases,
                    onClick = { currentTab = NavigationTab.Leases },
                    icon = {
                        Icon(
                            imageVector = if (currentTab == NavigationTab.Leases) Icons.Filled.ReceiptLong else Icons.Outlined.ReceiptLong,
                            contentDescription = "Leases"
                        )
                    },
                    label = { Text("Leases") },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = DarkNavy,
                        selectedTextColor = DarkNavy,
                        indicatorColor = WarmAccentBlue,
                        unselectedIconColor = SlateSecondary,
                        unselectedTextColor = SlateSecondary
                    ),
                    modifier = Modifier.testTag("tab_leases")
                )
                NavigationBarItem(
                    selected = currentTab == NavigationTab.Messages,
                    onClick = { currentTab = NavigationTab.Messages },
                    icon = {
                        Icon(
                            imageVector = if (currentTab == NavigationTab.Messages) Icons.Filled.ChatBubble else Icons.Outlined.ChatBubble,
                            contentDescription = "Messages"
                        )
                    },
                    label = { Text("Messages") },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = DarkNavy,
                        selectedTextColor = DarkNavy,
                        indicatorColor = WarmAccentBlue,
                        unselectedIconColor = SlateSecondary,
                        unselectedTextColor = SlateSecondary
                    ),
                    modifier = Modifier.testTag("tab_messages")
                )
                NavigationBarItem(
                    selected = currentTab == NavigationTab.Settings,
                    onClick = { currentTab = NavigationTab.Settings },
                    icon = {
                        Icon(
                            imageVector = if (currentTab == NavigationTab.Settings) Icons.Filled.Settings else Icons.Outlined.Settings,
                            contentDescription = "Settings"
                        )
                    },
                    label = { Text("Settings") },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = DarkNavy,
                        selectedTextColor = DarkNavy,
                        indicatorColor = WarmAccentBlue,
                        unselectedIconColor = SlateSecondary,
                        unselectedTextColor = SlateSecondary
                    ),
                    modifier = Modifier.testTag("tab_settings")
                )
            }
        },
        floatingActionButton = {
            if (currentTab == NavigationTab.Leases || currentTab == NavigationTab.Overview) {
                FloatingActionButton(
                    onClick = { showAddLeaseDialog = true },
                    containerColor = WarmAccentBlue,
                    contentColor = DarkNavy,
                    elevation = FloatingActionButtonDefaults.elevation(defaultElevation = 6.dp),
                    shape = RoundedCornerShape(16.dp),
                    modifier = Modifier
                        .padding(bottom = 16.dp, end = 8.dp)
                        .testTag("fab_add_lease")
                ) {
                    Icon(
                        imageVector = Icons.Default.Add,
                        contentDescription = "Add Lease Unit",
                        modifier = Modifier.size(28.dp)
                    )
                }
            }
        }
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .background(SlateBg)
        ) {
            when (currentTab) {
                NavigationTab.Overview -> {
                    OverviewScreen(
                        viewModel = viewModel,
                        leases = leases,
                        payments = payments,
                        onRecordPaymentClick = { showPaymentDialog = it },
                        onUpdateMeterClick = { showMeterReadingDialog = it }
                    )
                }
                NavigationTab.Leases -> {
                    LeasesScreen(
                        viewModel = viewModel,
                        leases = leases,
                        payments = payments,
                        onUpdateMeterClick = { showMeterReadingDialog = it },
                        onRecordPaymentClick = { showPaymentDialog = it }
                    )
                }
                NavigationTab.Messages -> {
                    MessagesScreen(
                        viewModel = viewModel,
                        leases = leases,
                        messages = messages
                    )
                }
                NavigationTab.Settings -> {
                    SettingsScreen(
                        viewModel = viewModel,
                        leasesCount = leases.size,
                        paymentsCount = payments.size,
                        electricityRate = electricityRate
                    )
                }
            }
        }
    }

    // --- DIALOGS ---

    if (landlordProfileDialog) {
        AlertDialog(
            onDismissRequest = { landlordProfileDialog = false },
            confirmButton = {
                TextButton(onClick = { landlordProfileDialog = false }) {
                    Text("Close", color = DarkNavy, fontWeight = FontWeight.Bold)
                }
            },
            title = {
                Text("Landlord Profile", color = DarkNavy, fontWeight = FontWeight.Bold)
            },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(64.dp)
                                .clip(CircleShape)
                                .background(WarmAccentBlue),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = "JD",
                                fontWeight = FontWeight.Black,
                                fontSize = 24.sp,
                                color = DarkNavy
                            )
                        }
                        Column {
                            Text("John Doe", fontWeight = FontWeight.Bold, color = DarkNavy, fontSize = 18.sp)
                            Text("Premium Landlord Account", color = SlateSecondary, fontSize = 12.sp)
                        }
                    }
                    Divider(color = LightBorder)
                    Text("Property: Grandview Apartments", fontWeight = FontWeight.Medium, color = DarkNavy)
                    Text("Total Management Units: ${leases.size}", color = SlateSecondary)
                    Text("Registered Contact: admin@grandviewapts.com", color = SlateSecondary)
                }
            },
            containerColor = PureWhite,
            shape = RoundedCornerShape(24.dp)
        )
    }

    if (showAddLeaseDialog) {
        var unitVal by remember { mutableStateOf("") }
        var tenantVal by remember { mutableStateOf("") }
        var emailVal by remember { mutableStateOf("") }
        var phoneVal by remember { mutableStateOf("") }
        var rentVal by remember { mutableStateOf("") }
        var dueKeyVal by remember { mutableStateOf("") }
        var startingKwhVal by remember { mutableStateOf("") }
        var advanceVal by remember { mutableStateOf("0.0") }

        var inputError by remember { mutableStateOf("") }

        AlertDialog(
            onDismissRequest = { showAddLeaseDialog = false },
            confirmButton = {
                Button(
                    onClick = {
                        val rentDouble = rentVal.toDoubleOrNull()
                        val dueInt = dueKeyVal.toIntOrNull()
                        val startingKwhDouble = startingKwhVal.toDoubleOrNull()
                        val advanceDouble = advanceVal.toDoubleOrNull() ?: 0.0

                        if (unitVal.isBlank() || tenantVal.isBlank() || rentDouble == null || dueInt == null || startingKwhDouble == null) {
                            inputError = "Please fill in all mandatory fields correctly."
                        } else {
                            viewModel.addNewLease(
                                unit = unitVal,
                                tenant = tenantVal,
                                email = emailVal,
                                phone = phoneVal,
                                rent = rentDouble,
                                dueDateDay = dueInt,
                                startKwh = startingKwhDouble,
                                currentKwhVal = startingKwhDouble,
                                advance = advanceDouble,
                                leaseStr = "Jun 01, 2026",
                                leaseEnd = "May 31, 2027"
                            )
                            showAddLeaseDialog = false
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = DarkNavy, contentColor = PureWhite),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Text("Create Lease")
                }
            },
            dismissButton = {
                TextButton(onClick = { showAddLeaseDialog = false }) {
                    Text("Cancel", color = SlateSecondary)
                }
            },
            title = {
                Text("Add New Managed Unit", color = DarkNavy, fontWeight = FontWeight.Bold, fontSize = 20.sp)
            },
            text = {
                LazyColumn(
                    verticalArrangement = Arrangement.spacedBy(10.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    item {
                        if (inputError.isNotEmpty()) {
                            Text(inputError, color = AlertRed, fontSize = 12.sp, modifier = Modifier.padding(bottom = 4.dp))
                        }
                    }
                    item {
                        OutlinedTextField(
                            value = unitVal,
                            onValueChange = { unitVal = it },
                            label = { Text("Unit Number (e.g., A5, B1)") },
                            singleLine = true,
                            modifier = Modifier.fillMaxWidth().testTag("add_unit_num")
                        )
                    }
                    item {
                        OutlinedTextField(
                            value = tenantVal,
                            onValueChange = { tenantVal = it },
                            label = { Text("Tenant Name") },
                            singleLine = true,
                            modifier = Modifier.fillMaxWidth().testTag("add_tenant_name")
                        )
                    }
                    item {
                        OutlinedTextField(
                            value = phoneVal,
                            onValueChange = { phoneVal = it },
                            label = { Text("Tenant Phone") },
                            singleLine = true,
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
                            modifier = Modifier.fillMaxWidth()
                        )
                    }
                    item {
                        OutlinedTextField(
                            value = emailVal,
                            onValueChange = { emailVal = it },
                            label = { Text("Tenant Email") },
                            singleLine = true,
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                            modifier = Modifier.fillMaxWidth()
                        )
                    }
                    item {
                        OutlinedTextField(
                            value = rentVal,
                            onValueChange = { rentVal = it },
                            label = { Text("Base monthly rent ($)") },
                            singleLine = true,
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            modifier = Modifier.fillMaxWidth()
                        )
                    }
                    item {
                        OutlinedTextField(
                            value = dueKeyVal,
                            onValueChange = { dueKeyVal = it },
                            label = { Text("Due Date (Day of Month: 1-31)") },
                            singleLine = true,
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            modifier = Modifier.fillMaxWidth()
                        )
                    }
                    item {
                        OutlinedTextField(
                            value = startingKwhVal,
                            onValueChange = { startingKwhVal = it },
                            label = { Text("Initial Electricity Meter (kWh)") },
                            singleLine = true,
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            modifier = Modifier.fillMaxWidth()
                        )
                    }
                    item {
                        OutlinedTextField(
                            value = advanceVal,
                            onValueChange = { advanceVal = it },
                            label = { Text("Starting Advance Credit / Pre-payment ($)") },
                            singleLine = true,
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            modifier = Modifier.fillMaxWidth()
                        )
                    }
                }
            },
            containerColor = PureWhite,
            shape = RoundedCornerShape(24.dp)
        )
    }

    showMeterReadingDialog?.let { lease ->
        var readingText by remember { mutableStateOf(lease.currentKwh.toString()) }
        var mathError by remember { mutableStateOf("") }

        AlertDialog(
            onDismissRequest = { showMeterReadingDialog = null },
            confirmButton = {
                Button(
                    onClick = {
                        val newKwh = readingText.toDoubleOrNull()
                        if (newKwh == null) {
                            mathError = "Please enter a valid number."
                        } else if (newKwh < lease.startingKwh) {
                            mathError = "Reading cannot be lower than start: ${lease.startingKwh} kWh."
                        } else {
                            viewModel.updateMeterReading(lease, newKwh)
                            showMeterReadingDialog = null
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = DarkNavy, contentColor = PureWhite),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Text("Save Reading")
                }
            },
            dismissButton = {
                TextButton(onClick = { showMeterReadingDialog = null }) {
                    Text("Cancel", color = SlateSecondary)
                }
            },
            title = {
                Text("Update Meter for Unit ${lease.unitNumber}", color = DarkNavy, fontWeight = FontWeight.Bold)
            },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Text(
                        text = "Update the electricity reading for ${lease.tenantName}. This dynamically computes current utility charges.",
                        color = SlateSecondary,
                        fontSize = 13.sp
                    )
                    OutlinedTextField(
                        value = readingText,
                        onValueChange = { readingText = it },
                        label = { Text("Current reading (kWh)") },
                        singleLine = true,
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        modifier = Modifier.fillMaxWidth().testTag("meter_input_field")
                    )
                    Text(
                        text = "Current record: ${lease.currentKwh} kWh  (Starting KWh: ${lease.startingKwh} kWh)",
                        fontSize = 11.sp,
                        color = SlateSecondary
                    )
                    if (mathError.isNotEmpty()) {
                        Text(mathError, color = AlertRed, fontSize = 12.sp)
                    }
                }
            },
            containerColor = PureWhite,
            shape = RoundedCornerShape(24.dp)
        )
    }

    showPaymentDialog?.let { lease ->
        val totalDue = viewModel.calculateDueAmount(lease, payments)
        var payAmountVal by remember { mutableStateOf(totalDue.toString()) }
        var selectedType by remember { mutableStateOf("Rent") }
        var advanceAddedVal by remember { mutableStateOf("0.0") }
        var remarksVal by remember { mutableStateOf("") }
        var saveError by remember { mutableStateOf("") }

        AlertDialog(
            onDismissRequest = { showPaymentDialog = null },
            confirmButton = {
                Button(
                    onClick = {
                        val payDouble = payAmountVal.toDoubleOrNull()
                        val advanceDouble = advanceAddedVal.toDoubleOrNull() ?: 0.0
                        if (payDouble == null || payDouble <= 0) {
                            saveError = "Please enter a valid payment amount."
                        } else {
                            viewModel.addPayment(
                                unitNumber = lease.unitNumber,
                                amount = payDouble,
                                type = selectedType,
                                addAdvance = advanceDouble,
                                remarks = remarksVal
                            )
                            showPaymentDialog = null
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = DarkNavy, contentColor = PureWhite),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Text("Record Payment")
                }
            },
            dismissButton = {
                TextButton(onClick = { showPaymentDialog = null }) {
                    Text("Cancel", color = SlateSecondary)
                }
            },
            title = {
                Text("Record Payment - Unit ${lease.unitNumber}", color = DarkNavy, fontWeight = FontWeight.Bold)
            },
            text = {
                LazyColumn(
                    verticalArrangement = Arrangement.spacedBy(12.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    item {
                        Text(
                            text = "Register a direct rent/utility payment from ${lease.tenantName}.",
                            color = SlateSecondary,
                            fontSize = 13.sp
                        )
                    }
                    item {
                        Card(
                            colors = CardDefaults.cardColors(containerColor = WarmAccentBlue.copy(alpha = 0.3f)),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column(modifier = Modifier.padding(12.dp)) {
                                Text("Outstanding balance:", fontSize = 11.sp, color = SlateSecondary)
                                Text("$${String.format("%.2f", totalDue)}", fontSize = 20.sp, fontWeight = FontWeight.Black, color = DarkNavy)
                                Text("Starting electricity starts: ${lease.startingKwh} kWh • Dynamic: ${lease.currentKwh} kWh", fontSize = 11.sp, color = SlateSecondary)
                            }
                        }
                    }
                    item {
                        OutlinedTextField(
                            value = payAmountVal,
                            onValueChange = { payAmountVal = it },
                            label = { Text("Payment Amount ($)") },
                            singleLine = true,
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            modifier = Modifier.fillMaxWidth().testTag("payment_amount_input")
                        )
                    }
                    item {
                        Text("Payment Type:", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = DarkNavy)
                        Row(
                            horizontalArrangement = Arrangement.spacedBy(8.dp),
                            modifier = Modifier.padding(vertical = 4.dp)
                        ) {
                            listOf("Rent", "Utility", "Both", "Advance").forEach { type ->
                                FilterChip(
                                    selected = selectedType == type,
                                    onClick = { selectedType = type },
                                    label = { Text(type, fontSize = 11.sp) },
                                    colors = FilterChipDefaults.filterChipColors(
                                        selectedContainerColor = WarmAccentBlue,
                                        selectedLabelColor = DarkNavy
                                    )
                                )
                            }
                        }
                    }
                    item {
                        OutlinedTextField(
                            value = advanceAddedVal,
                            onValueChange = { advanceAddedVal = it },
                            label = { Text("Allocate to tenant advance pre-paid credits ($)") },
                            singleLine = true,
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            modifier = Modifier.fillMaxWidth()
                        )
                    }
                    item {
                        OutlinedTextField(
                            value = remarksVal,
                            onValueChange = { remarksVal = it },
                            label = { Text("Remarks (Optional)") },
                            singleLine = true,
                            modifier = Modifier.fillMaxWidth()
                        )
                    }
                    if (saveError.isNotEmpty()) {
                        item {
                            Text(saveError, color = AlertRed, fontSize = 12.sp)
                        }
                    }
                }
            },
            containerColor = PureWhite,
            shape = RoundedCornerShape(24.dp)
        )
    }
}

// Helper to create Mutables seamlessly
fun <T> mutableStateFlowOf(value: T): MutableState<T> = mutableStateOf(value)

// -------------------------------------------------------------
// 1. OVERVIEW SCREEN
// -------------------------------------------------------------
@OptIn(ExperimentalLayoutApi::class)
@Composable
fun OverviewScreen(
    viewModel: RentViewModel,
    leases: List<Lease>,
    payments: List<Payment>,
    onRecordPaymentClick: (Lease) -> Unit,
    onUpdateMeterClick: (Lease) -> Unit
) {
    // Math computations
    val expectedCollection = leases.fold(0.0) { acc, lease ->
        acc + viewModel.calculateTotalExpected(lease)
    }
    
    val receivedCollection = payments.sumOf { it.amountPaid }
    val pendingCollection = (expectedCollection - receivedCollection).coerceAtLeast(0.0)

    val averageConsumption = if (leases.isNotEmpty()) {
        leases.map { it.currentKwh - it.startingKwh }.average()
    } else 0.0

    val arrearsUtility = leases.fold(0.0) { acc, lease ->
        acc + (viewModel.calculateElectricityCharge(lease) - lease.advancePayment).coerceAtLeast(0.0)
    }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp)
            .testTag("overview_screen"),
        verticalArrangement = Arrangement.spacedBy(16.dp),
        contentPadding = PaddingValues(vertical = 12.dp)
    ) {
        // SUMMARY CARD (D3E3FD)
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = WarmAccentBlue),
                shape = RoundedCornerShape(28.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("summary_collection_card")
            ) {
                Column(
                    modifier = Modifier.padding(20.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.Top
                    ) {
                        Column {
                            Text(
                                text = "EXPECTED COLLECTION",
                                style = MaterialTheme.typography.labelMedium,
                                fontWeight = FontWeight.Bold,
                                color = DarkNavy.copy(alpha = 0.7f),
                                letterSpacing = 1.sp
                            )
                            Text(
                                text = "$${String.format("%,.2f", expectedCollection)}",
                                style = MaterialTheme.typography.headlineLarge,
                                fontWeight = FontWeight.Bold,
                                color = DarkNavy,
                                modifier = Modifier.padding(top = 4.dp)
                            )
                        }
                        Box(
                            modifier = Modifier
                                .background(PureWhite.copy(alpha = 0.5f), RoundedCornerShape(20.dp))
                                .padding(horizontal = 10.dp, vertical = 4.dp)
                        ) {
                            Text(
                                text = "MAY-JUN 2026",
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold,
                                color = DarkNavy
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(20.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Card(
                            colors = CardDefaults.cardColors(containerColor = PureWhite.copy(alpha = 0.4f)),
                            shape = RoundedCornerShape(16.dp),
                            modifier = Modifier.weight(1f)
                        ) {
                            Column(modifier = Modifier.padding(12.dp)) {
                                Text(
                                    text = "Received",
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = DarkNavy.copy(alpha = 0.6f)
                                )
                                Text(
                                    text = "$${String.format("%,.0f", receivedCollection)}",
                                    fontSize = 18.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = DarkNavy,
                                    modifier = Modifier.padding(top = 2.dp)
                                )
                            }
                        }
                        Card(
                            colors = CardDefaults.cardColors(containerColor = PureWhite.copy(alpha = 0.4f)),
                            shape = RoundedCornerShape(16.dp),
                            modifier = Modifier.weight(1f)
                        ) {
                            Column(modifier = Modifier.padding(12.dp)) {
                                Text(
                                    text = "Pending",
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = DarkNavy.copy(alpha = 0.6f)
                                )
                                Text(
                                    text = "$${String.format("%,.0f", pendingCollection)}",
                                    fontSize = 18.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = AlertRed,
                                    modifier = Modifier.padding(top = 2.dp)
                                )
                            }
                        }
                    }
                }
            }
        }

        // PRIORITY PAYMENTS SECTION
        item {
            Column(
                verticalArrangement = Arrangement.spacedBy(10.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                    modifier = Modifier.padding(horizontal = 4.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.NotificationImportant,
                        contentDescription = "Alerts",
                        tint = AlertRed,
                        modifier = Modifier.size(16.dp)
                    )
                    Text(
                        text = "Priority Payments & Utilities",
                        style = MaterialTheme.typography.titleSmall,
                        fontWeight = FontWeight.Bold,
                        color = DarkNavy
                    )
                }

                if (leases.isEmpty()) {
                    EmptyStateCard(message = "No leases found. Tap the button below to add your first tenant.")
                } else {
                    leases.forEach { lease ->
                        val dueAmt = viewModel.calculateDueAmount(lease, payments)
                        val isPaid = dueAmt <= 0.0

                        RentTenantRow(
                            lease = lease,
                            dueAmount = dueAmt,
                            isPaid = isPaid,
                            onRowClick = {
                                onRecordPaymentClick(lease)
                            },
                            onMeterUpdateSelected = {
                                onUpdateMeterClick(lease)
                            }
                        )
                    }
                }
            }
        }

        // UTILITY TRACKING SNAPSHOT SCREEN
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = PureWhite),
                border = BorderStroke(1.dp, LightBorder),
                shape = RoundedCornerShape(20.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "UTILITY SNAPSHOT (ELECTRICITY)",
                            style = MaterialTheme.typography.labelSmall,
                            letterSpacing = 0.8.sp,
                            fontWeight = FontWeight.Bold,
                            color = SlateSecondary
                        )
                        Icon(
                            imageVector = Icons.Default.Bolt,
                            contentDescription = "Electricity tracking widget",
                            tint = Color(0xFFF1C40F),
                            modifier = Modifier.size(20.dp)
                        )
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text("Average Reading", fontSize = 11.sp, color = SlateSecondary)
                            Text(
                                text = String.format("%.1f kWh", averageConsumption),
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Bold,
                                color = DarkNavy
                            )
                        }

                        Box(
                            modifier = Modifier
                                .height(32.dp)
                                .width(1.dp)
                                .background(LightBorder)
                        )

                        Column(
                            modifier = Modifier
                                .weight(1f)
                                .padding(start = 16.dp)
                        ) {
                            Text("Arrears Due", fontSize = 11.sp, color = SlateSecondary)
                            Text(
                                text = "$${String.format("%.2f", arrearsUtility)}",
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Bold,
                                color = DarkNavy
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun EmptyStateCard(message: String) {
    Card(
        colors = CardDefaults.cardColors(containerColor = PureWhite),
        border = BorderStroke(1.dp, LightBorder),
        shape = RoundedCornerShape(16.dp),
        modifier = Modifier
            .fillMaxWidth()
            .padding(top = 4.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Icon(
                imageVector = Icons.Outlined.HomeWork,
                contentDescription = null,
                tint = SlateSecondary.copy(alpha = 0.5f),
                modifier = Modifier.size(48.dp)
            )
            Text(
                text = message,
                fontSize = 13.sp,
                textAlign = TextAlign.Center,
                color = SlateSecondary,
                lineHeight = 18.sp
            )
        }
    }
}

@Composable
fun RentTenantRow(
    lease: Lease,
    dueAmount: Double,
    isPaid: Boolean,
    onRowClick: () -> Unit,
    onMeterUpdateSelected: () -> Unit
) {
    Card(
        colors = CardDefaults.cardColors(containerColor = PureWhite),
        border = BorderStroke(1.dp, LightBorder),
        shape = RoundedCornerShape(16.dp),
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onRowClick)
            .testTag("tenant_row_${lease.unitNumber}")
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(14.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Box(
                    modifier = Modifier
                        .size(44.dp)
                        .clip(RoundedCornerShape(12.dp))
                        .background(SlateBg),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = lease.unitNumber,
                        fontWeight = FontWeight.Bold,
                        color = DarkNavy,
                        fontSize = 15.sp
                    )
                }

                Column {
                    Text(
                        text = lease.tenantName,
                        fontWeight = FontWeight.Bold,
                        color = DarkNavy,
                        fontSize = 14.sp
                    )
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        Text(
                            text = "Due: Day ${lease.dueDate}",
                            fontSize = 11.sp,
                            color = SlateSecondary
                        )
                        Text("•", fontSize = 11.sp, color = SlateSecondary)
                        if (lease.currentKwh > lease.startingKwh) {
                            Text(
                                text = "Elec: ${String.format("%.0f", lease.currentKwh)} kWh",
                                fontSize = 11.sp,
                                color = SlateSecondary
                            )
                        } else {
                            Text(
                                text = "Elec start: ${String.format("%.0f", lease.startingKwh)} kWh",
                                fontSize = 11.sp,
                                color = SlateSecondary
                            )
                        }
                    }
                }
            }

            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Column(horizontalAlignment = Alignment.End) {
                    if (isPaid) {
                        Text(
                            text = "Paid",
                            fontWeight = FontWeight.Bold,
                            color = PaidGreen,
                            fontSize = 14.sp
                        )
                        if (lease.advancePayment > 0.0) {
                            Text(
                                text = "Incl. $${String.format("%.0f", lease.advancePayment)} Advance",
                                fontSize = 10.sp,
                                color = SlateSecondary
                            )
                        } else {
                            Text(
                                text = "Cleared",
                                fontSize = 10.sp,
                                color = SlateSecondary
                            )
                        }
                    } else {
                        Text(
                            text = "$${String.format("%.2f", dueAmount)}",
                            fontWeight = FontWeight.Bold,
                            color = AlertRed,
                            fontSize = 14.sp
                        )
                        Text(
                            text = "Base Rent",
                            fontSize = 10.sp,
                            color = SlateSecondary
                        )
                    }
                }

                IconButton(
                    onClick = onMeterUpdateSelected,
                    modifier = Modifier
                        .background(SlateBg, CircleShape)
                        .size(32.dp)
                        .testTag("meter_btn_${lease.unitNumber}")
                ) {
                    Icon(
                        imageVector = Icons.Default.Bolt,
                        contentDescription = "Quick meter updater",
                        tint = SlateSecondary,
                        modifier = Modifier.size(16.dp)
                    )
                }
            }
        }
    }
}


// -------------------------------------------------------------
// 2. LEASES SCREEN
// -------------------------------------------------------------
@Composable
fun LeasesScreen(
    viewModel: RentViewModel,
    leases: List<Lease>,
    payments: List<Payment>,
    onUpdateMeterClick: (Lease) -> Unit,
    onRecordPaymentClick: (Lease) -> Unit
) {
    var searchQuery by remember { mutableStateOf("") }
    
    val filteredLeases = leases.filter {
        it.tenantName.contains(searchQuery, ignoreCase = true) ||
                it.unitNumber.contains(searchQuery, ignoreCase = true)
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp)
            .testTag("leases_screen")
    ) {
        Spacer(modifier = Modifier.height(12.dp))

        // Search bar
        OutlinedTextField(
            value = searchQuery,
            onValueChange = { searchQuery = it },
            placeholder = { Text("Search units, tenants...") },
            leadingIcon = { Icon(Icons.Default.Search, contentDescription = null, tint = SlateSecondary) },
            singleLine = true,
            shape = RoundedCornerShape(12.dp),
            colors = OutlinedTextFieldDefaults.colors(
                focusedContainerColor = PureWhite,
                unfocusedContainerColor = PureWhite,
                focusedBorderColor = DarkNavy,
                unfocusedBorderColor = LightBorder
            ),
            modifier = Modifier
                .fillMaxWidth()
                .testTag("search_leases")
        )

        Spacer(modifier = Modifier.height(16.dp))

        if (filteredLeases.isEmpty()) {
            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "No active leases matching search.",
                    color = SlateSecondary,
                    textAlign = TextAlign.Center
                )
            }
        } else {
            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(12.dp),
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(bottom = 80.dp)
            ) {
                items(filteredLeases) { lease ->
                    LeaseDetailedCard(
                        lease = lease,
                        viewModel = viewModel,
                        payments = payments,
                        onUpdateMeter = { onUpdateMeterClick(lease) },
                        onRecordPayment = { onRecordPaymentClick(lease) },
                        onDeleteLease = { viewModel.deleteLease(lease) }
                    )
                }
            }
        }
    }
}

@Composable
fun LeaseDetailedCard(
    lease: Lease,
    viewModel: RentViewModel,
    payments: List<Payment>,
    onUpdateMeter: () -> Unit,
    onRecordPayment: () -> Unit,
    onDeleteLease: () -> Unit
) {
    val electricityBill = viewModel.calculateElectricityCharge(lease)
    val totalExpected = viewModel.calculateTotalExpected(lease)
    val dueAmount = viewModel.calculateDueAmount(lease, payments)

    Card(
        colors = CardDefaults.cardColors(containerColor = PureWhite),
        border = BorderStroke(1.dp, LightBorder),
        shape = RoundedCornerShape(20.dp),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            // Header: Unit + Active tenant
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Top
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(36.dp)
                            .clip(RoundedCornerShape(10.dp))
                            .background(WarmAccentBlue),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = lease.unitNumber,
                            fontWeight = FontWeight.Bold,
                            color = DarkNavy
                        )
                    }
                    Column {
                        Text(
                            text = lease.tenantName,
                            fontWeight = FontWeight.Bold,
                            color = DarkNavy,
                            fontSize = 16.sp
                        )
                        Text(
                            text = "Lease: ${lease.leaseStart} - ${lease.leaseEnd}",
                            fontSize = 10.sp,
                            color = SlateSecondary
                        )
                    }
                }

                IconButton(
                    onClick = onDeleteLease,
                    modifier = Modifier.size(24.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.Delete,
                        contentDescription = "Terminate Lease",
                        tint = AlertRed.copy(alpha = 0.7f),
                        modifier = Modifier.size(18.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Details Breakdown Grid
            Column(
                verticalArrangement = Arrangement.spacedBy(10.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .background(SlateBg, RoundedCornerShape(12.dp))
                    .padding(12.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text("Base Monthly Rent", fontSize = 12.sp, color = SlateSecondary)
                    Text("$${String.format("%.2f", lease.monthlyBaseRent)}", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = DarkNavy)
                }

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text("Electricity consumption start details", fontSize = 12.sp, color = SlateSecondary)
                    Text("${String.format("%.1f", lease.startingKwh)} kWh", fontSize = 12.sp, color = DarkNavy)
                }

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text("Current electricity meter", fontSize = 12.sp, color = SlateSecondary)
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text("${String.format("%.1f", lease.currentKwh)} kWh", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = DarkNavy)
                        Spacer(modifier = Modifier.width(4.dp))
                        Icon(
                            Icons.Default.Edit,
                            contentDescription = null,
                            tint = SlateSecondary,
                            modifier = Modifier
                                .size(11.dp)
                                .clickable(onClick = onUpdateMeter)
                        )
                    }
                }

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text("Electricity charges (${String.format("%.0f", lease.currentKwh - lease.startingKwh)} kWh consumed)", fontSize = 12.sp, color = SlateSecondary)
                    Text("$${String.format("%.2f", electricityBill)}", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = DarkNavy)
                }

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text("Allocated advance credits", fontSize = 12.sp, color = SlateSecondary)
                    Text("$${String.format("%.2f", lease.advancePayment)}", fontSize = 12.sp, color = PaidGreen, fontWeight = FontWeight.Bold)
                }

                Divider(color = LightBorder)

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text("Outstanding Balance Due", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = DarkNavy)
                    Text(
                        text = "$${String.format("%.2f", dueAmount)}",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Black,
                        color = if (dueAmount > 0.0) AlertRed else PaidGreen
                    )
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Action Buttons
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                OutlinedButton(
                    onClick = onUpdateMeter,
                    shape = RoundedCornerShape(12.dp),
                    border = BorderStroke(1.dp, LightBorder),
                    colors = ButtonDefaults.outlinedButtonColors(contentColor = DarkNavy),
                    modifier = Modifier.weight(1f)
                ) {
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(6.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(Icons.Default.Bolt, contentDescription = null, modifier = Modifier.size(16.dp))
                        Text("Update Meter")
                    }
                }

                Button(
                    onClick = onRecordPayment,
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = WarmAccentBlue, contentColor = DarkNavy),
                    modifier = Modifier.weight(1.02f)
                ) {
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(6.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(Icons.Default.ReceiptLong, contentDescription = null, modifier = Modifier.size(16.dp))
                        Text("Record Payment")
                    }
                }
            }
        }
    }
}


// -------------------------------------------------------------
// 3. MESSAGES (COMMUNICATION) SCREEN
// -------------------------------------------------------------
@Composable
fun MessagesScreen(
    viewModel: RentViewModel,
    leases: List<Lease>,
    messages: List<TenantMessage>
) {
    val selectedUnit by viewModel.selectedChatUnitNumber.collectAsStateWithLifecycle()

    AnimatedVisibility(
        visible = selectedUnit == null,
        enter = fadeIn(),
        exit = fadeOut()
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 16.dp)
                .testTag("inbox_layout")
        ) {
            Spacer(modifier = Modifier.height(12.dp))
            Text(
                text = "Tenant Communications",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = DarkNavy
            )
            Text(
                text = "Simulate real-time messaging updates with tenants regarding rentals and electricity status.",
                style = MaterialTheme.typography.bodySmall,
                color = SlateSecondary,
                modifier = Modifier.padding(bottom = 16.dp)
            )

            if (leases.isEmpty()) {
                EmptyStateCard(message = "Please register a lease/tenant to begin communication threads.")
            } else {
                LazyColumn(
                    verticalArrangement = Arrangement.spacedBy(10.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    items(leases) { lease ->
                        val tenantMessages = messages.filter { it.unitNumber == lease.unitNumber }
                        val lastMsg = tenantMessages.lastOrNull()?.text ?: "No message history. Initiate a chat!"

                        Card(
                            colors = CardDefaults.cardColors(containerColor = PureWhite),
                            border = BorderStroke(1.dp, LightBorder),
                            shape = RoundedCornerShape(16.dp),
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable { viewModel.selectChatUnitNumber(lease.unitNumber) }
                                .testTag("message_row_${lease.unitNumber}")
                        ) {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(14.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                                    modifier = Modifier.weight(1f)
                                ) {
                                    Box(
                                        modifier = Modifier
                                            .size(40.dp)
                                            .clip(CircleShape)
                                            .background(WarmAccentBlue),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Text(
                                            text = lease.unitNumber,
                                            fontWeight = FontWeight.Black,
                                            color = DarkNavy
                                        )
                                    }
                                    Column {
                                        Text(
                                            text = lease.tenantName,
                                            fontWeight = FontWeight.Bold,
                                            color = DarkNavy,
                                            fontSize = 14.sp
                                        )
                                        Text(
                                            text = lastMsg,
                                            maxLines = 1,
                                            fontSize = 12.sp,
                                            color = SlateSecondary
                                        )
                                    }
                                }

                                Icon(
                                    imageVector = Icons.Default.ChevronRight,
                                    contentDescription = "Open Chat",
                                    tint = SlateSecondary,
                                    modifier = Modifier.size(20.dp)
                                )
                            }
                        }
                    }
                }
            }
        }
    }

    selectedUnit?.let { unitNum ->
        val lease = leases.find { it.unitNumber == unitNum }
        val chatMessages = messages.filter { it.unitNumber == unitNum }

        if (lease != null) {
            ChatWindow(
                lease = lease,
                messages = chatMessages,
                onBack = { viewModel.selectChatUnitNumber(null) },
                onSendMessage = { text ->
                    viewModel.sendMessage(unitNum, "Landlord", text)
                }
            )
        }
    }
}

@Composable
fun ChatWindow(
    lease: Lease,
    messages: List<TenantMessage>,
    onBack: () -> Unit,
    onSendMessage: (String) -> Unit
) {
    var typedMessage by remember { mutableStateOf("") }
    val listState = rememberLazyListState()

    // Auto scroll to bottom when new messages show up
    LaunchedEffect(messages.size) {
        if (messages.isNotEmpty()) {
            listState.animateScrollToItem(messages.size - 1)
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(SlateBg)
            .testTag("chat_window_${lease.unitNumber}")
    ) {
        // Chat Header
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier
                .fillMaxWidth()
                .background(PureWhite)
                .border(BorderStroke(1.dp, LightBorder))
                .padding(horizontal = 8.dp, vertical = 10.dp),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                IconButton(onClick = onBack, modifier = Modifier.testTag("chat_back")) {
                    Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = DarkNavy)
                }

                Spacer(modifier = Modifier.width(4.dp))

                Box(
                    modifier = Modifier
                        .size(36.dp)
                        .clip(CircleShape)
                        .background(WarmAccentBlue),
                    contentAlignment = Alignment.Center
                ) {
                    Text(lease.unitNumber, fontWeight = FontWeight.Bold, color = DarkNavy)
                }

                Spacer(modifier = Modifier.width(10.dp))

                Column {
                    Text(lease.tenantName, fontWeight = FontWeight.Bold, color = DarkNavy, fontSize = 14.sp)
                    Text("Unit ${lease.unitNumber} • Online Simulator", fontSize = 10.sp, color = PaidGreen)
                }
            }
        }

        // Messages Bubble Box
        LazyColumn(
            state = listState,
            verticalArrangement = Arrangement.spacedBy(8.dp),
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 8.dp),
            contentPadding = PaddingValues(bottom = 32.dp)
        ) {
            items(messages) { msg ->
                val isLandlord = msg.sender == "Landlord"
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = if (isLandlord) Arrangement.End else Arrangement.Start
                ) {
                    Surface(
                        color = if (isLandlord) DarkNavy else WarmAccentBlue,
                        shape = RoundedCornerShape(
                            topStart = 16.dp,
                            topEnd = 16.dp,
                            bottomStart = if (isLandlord) 16.dp else 4.dp,
                            bottomEnd = if (isLandlord) 4.dp else 16.dp
                        ),
                        modifier = Modifier.widthIn(max = 280.dp)
                    ) {
                        Column(modifier = Modifier.padding(12.dp)) {
                            Text(
                                text = msg.text,
                                color = if (isLandlord) PureWhite else DarkNavy,
                                fontSize = 13.sp
                            )
                        }
                    }
                }
            }
        }

        // Send Input Box
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(PureWhite)
                .border(BorderStroke(1.dp, LightBorder))
                .navigationBarsPadding()
                .imePadding()
                .padding(8.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            OutlinedTextField(
                value = typedMessage,
                onValueChange = { typedMessage = it },
                placeholder = { Text("Type an update or reminder...") },
                singleLine = true,
                maxLines = 1,
                shape = RoundedCornerShape(20.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = DarkNavy,
                    unfocusedBorderColor = LightBorder
                ),
                modifier = Modifier
                    .weight(1f)
                    .testTag("chat_input_text")
            )

            IconButton(
                onClick = {
                    if (typedMessage.isNotBlank()) {
                        onSendMessage(typedMessage)
                        typedMessage = ""
                    }
                },
                modifier = Modifier
                    .background(DarkNavy, CircleShape)
                    .size(40.dp)
                    .testTag("chat_send_btn")
            ) {
                Icon(
                    imageVector = Icons.Default.Send,
                    contentDescription = "Send",
                    tint = PureWhite,
                    modifier = Modifier.size(16.dp)
                )
            }
        }
    }
}


// -------------------------------------------------------------
// 4. SETTINGS SCREEN
// -------------------------------------------------------------
@Composable
fun SettingsScreen(
    viewModel: RentViewModel,
    leasesCount: Int,
    paymentsCount: Int,
    electricityRate: Double
) {
    var rateText by remember { mutableStateOf(electricityRate.toString()) }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp)
            .testTag("settings_screen"),
        verticalArrangement = Arrangement.spacedBy(16.dp),
        contentPadding = PaddingValues(vertical = 12.dp)
    ) {
        item {
            Text(
                text = "Application Settings",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = DarkNavy
            )
            Text(
                text = "Manage utility charges, ledger parameters, and database states.",
                style = MaterialTheme.typography.bodySmall,
                color = SlateSecondary
            )
        }

        // Electricity Rate Box
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = PureWhite),
                border = BorderStroke(1.dp, LightBorder),
                shape = RoundedCornerShape(20.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "UTILITY SPECIFICATIONS",
                        style = MaterialTheme.typography.labelSmall,
                        letterSpacing = 0.8.sp,
                        fontWeight = FontWeight.Bold,
                        color = SlateSecondary,
                        modifier = Modifier.padding(bottom = 12.dp)
                    )

                    OutlinedTextField(
                        value = rateText,
                        onValueChange = { newValue ->
                            rateText = newValue
                            newValue.toDoubleOrNull()?.let {
                                viewModel.setElectricityRate(it)
                            }
                        },
                        label = { Text("Electricity charges per kWh ($)") },
                        singleLine = true,
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        modifier = Modifier.fillMaxWidth().testTag("settings_rate_field")
                    )

                    Text(
                        text = "Current configuration: $${String.format("%.2f", electricityRate)} per unit consumed.",
                        fontSize = 11.sp,
                        color = SlateSecondary,
                        modifier = Modifier.padding(top = 4.dp)
                    )
                }
            }
        }

        // System States Card
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = PureWhite),
                border = BorderStroke(1.dp, LightBorder),
                shape = RoundedCornerShape(20.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "LEDGER & RECORDS",
                        style = MaterialTheme.typography.labelSmall,
                        letterSpacing = 0.8.sp,
                        fontWeight = FontWeight.Bold,
                        color = SlateSecondary,
                        modifier = Modifier.padding(bottom = 12.dp)
                    )

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("Active Rent Contracts:", fontSize = 13.sp, color = DarkNavy)
                        Text("$leasesCount Units", fontWeight = FontWeight.Bold, color = DarkNavy)
                    }

                    Spacer(modifier = Modifier.height(8.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("Past historical payments logged:", fontSize = 13.sp, color = DarkNavy)
                        Text("$paymentsCount Payments", fontWeight = FontWeight.Bold, color = DarkNavy)
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    Divider(color = LightBorder)

                    Spacer(modifier = Modifier.height(12.dp))

                    Button(
                        onClick = { viewModel.clearAllData() },
                        colors = ButtonDefaults.buttonColors(containerColor = AlertRed, contentColor = PureWhite),
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("reset_mock_data_button")
                    ) {
                        Row(
                            horizontalArrangement = Arrangement.spacedBy(8.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(Icons.Default.Refresh, contentDescription = null, modifier = Modifier.size(16.dp))
                            Text("Reset & Safe Reload Mock Demo Data")
                        }
                    }

                    Text(
                        text = "Resets the database back to standard showroom listings (Marcus, Sarah, Carlos, Elena) for a flawless and populated demo visualization.",
                        fontSize = 10.sp,
                        color = SlateSecondary,
                        textAlign = TextAlign.Center,
                        modifier = Modifier.padding(top = 8.dp)
                    )
                }
            }
        }
    }
}

@Composable
fun Greeting(name: String, modifier: Modifier = Modifier) {
    Text(text = "Hello $name!", modifier = modifier)
}
