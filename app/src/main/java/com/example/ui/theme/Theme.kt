package com.example.ui.theme

import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.platform.LocalContext

private val DarkColorScheme =
  darkColorScheme(
    primary = WarmAccentBlue,
    onPrimary = DarkNavy,
    primaryContainer = SlateSecondary,
    onPrimaryContainer = PureWhite,
    secondary = SlateSecondary,
    background = DarkNavy,
    surface = DarkNavy,
    onBackground = PureWhite,
    onSurface = PureWhite
  )

private val LightColorScheme =
  lightColorScheme(
    primary = DarkNavy,
    onPrimary = PureWhite,
    primaryContainer = WarmAccentBlue,
    onPrimaryContainer = DarkNavy,
    secondary = SlateSecondary,
    onSecondary = PureWhite,
    background = SlateBg,
    onBackground = DarkNavy,
    surface = PureWhite,
    onSurface = DarkNavy,
    outline = LightBorder,
    error = AlertRed
  )

@Composable
fun MyApplicationTheme(
  darkTheme: Boolean = isSystemInDarkTheme(),
  // Force use our clean minimalist custom design instead of random dynamic colors
  dynamicColor: Boolean = false,
  content: @Composable () -> Unit,
) {
  val colorScheme =
    when {
      darkTheme -> DarkColorScheme
      else -> LightColorScheme
    }

  MaterialTheme(colorScheme = colorScheme, typography = Typography, content = content)
}
