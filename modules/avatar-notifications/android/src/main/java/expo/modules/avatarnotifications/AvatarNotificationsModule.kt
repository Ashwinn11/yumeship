package expo.modules.avatarnotifications

import android.app.AlarmManager
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.net.Uri
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.core.app.Person
import androidx.core.graphics.drawable.IconCompat
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.io.File
import kotlin.math.abs

private const val CHANNEL_ID = "fo_messages"
private const val CHANNEL_NAME = "F/O messages"

/**
 * Notifications whose large icon is the sender's avatar rather than the app
 * icon, using NotificationCompat.MessagingStyle + the Person API.
 *
 * Android always keeps the app's small icon in the status bar — that is not
 * removable — but MessagingStyle promotes the avatar to the dominant circular
 * image, which is the same treatment messaging apps get.
 */
class AvatarNotificationsModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("AvatarNotifications")

    Function("isSupported") {
      // Person-based avatar rendering only behaves correctly from Android 9
      Build.VERSION.SDK_INT >= Build.VERSION_CODES.P
    }

    AsyncFunction("scheduleAsync") {
        senderName: String,
        body: String,
        avatarUri: String,
        seconds: Int,
        conversationId: String ->
      val context = appContext.reactContext ?: return@AsyncFunction null
      ensureChannel(context)

      val id = abs((conversationId + System.currentTimeMillis()).hashCode())
      val intent = Intent(context, AvatarNotificationReceiver::class.java).apply {
        putExtra("senderName", senderName)
        putExtra("body", body)
        putExtra("avatarUri", avatarUri)
        putExtra("conversationId", conversationId)
        putExtra("notificationId", id)
      }
      val pending = PendingIntent.getBroadcast(
        context,
        id,
        intent,
        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
      )

      val triggerAt = System.currentTimeMillis() + seconds.coerceAtLeast(1) * 1000L
      val alarms = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
      // setExact needs a permission from Android 12 up that this app does not
      // request; set() is close enough for a message that is already "sometime
      // around now", and never throws SecurityException.
      alarms.set(AlarmManager.RTC_WAKEUP, triggerAt, pending)

      id.toString()
    }

    AsyncFunction("cancelAsync") { id: String ->
      val context = appContext.reactContext ?: return@AsyncFunction
      val numeric = id.toIntOrNull() ?: return@AsyncFunction
      val intent = Intent(context, AvatarNotificationReceiver::class.java)
      val pending = PendingIntent.getBroadcast(
        context,
        numeric,
        intent,
        PendingIntent.FLAG_NO_CREATE or PendingIntent.FLAG_IMMUTABLE
      )
      if (pending != null) {
        (context.getSystemService(Context.ALARM_SERVICE) as AlarmManager).cancel(pending)
        pending.cancel()
      }
      NotificationManagerCompat.from(context).cancel(numeric)
    }
  }

  private fun ensureChannel(context: Context) {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
    val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
    if (manager.getNotificationChannel(CHANNEL_ID) != null) return
    manager.createNotificationChannel(
      NotificationChannel(CHANNEL_ID, CHANNEL_NAME, NotificationManager.IMPORTANCE_DEFAULT)
    )
  }
}

/** Builds and posts the MessagingStyle notification when the alarm fires. */
class AvatarNotificationReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent) {
    val senderName = intent.getStringExtra("senderName") ?: return
    val body = intent.getStringExtra("body") ?: ""
    val avatarUri = intent.getStringExtra("avatarUri") ?: ""
    val notificationId = intent.getIntExtra("notificationId", 0)

    val personBuilder = Person.Builder().setName(senderName).setKey(senderName)
    loadBitmap(avatarUri)?.let { personBuilder.setIcon(IconCompat.createWithBitmap(it)) }
    val sender = personBuilder.build()

    val style = NotificationCompat.MessagingStyle(sender)
      .addMessage(body, System.currentTimeMillis(), sender)

    val notification = NotificationCompat.Builder(context, CHANNEL_ID)
      // the small icon is mandatory and always shows in the status bar; the
      // avatar from MessagingStyle is what dominates the expanded notification
      .setSmallIcon(context.applicationInfo.icon)
      .setStyle(style)
      .setAutoCancel(true)
      .setContentIntent(launchIntent(context))
      .build()

    if (NotificationManagerCompat.from(context).areNotificationsEnabled()) {
      try {
        NotificationManagerCompat.from(context).notify(notificationId, notification)
      } catch (_: SecurityException) {
        // POST_NOTIFICATIONS revoked between scheduling and delivery
      }
    }
  }

  private fun launchIntent(context: Context): PendingIntent? {
    val launch = context.packageManager.getLaunchIntentForPackage(context.packageName)
      ?: return null
    return PendingIntent.getActivity(
      context,
      0,
      launch,
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
    )
  }

  /** Handles both file:// uris and bare paths, mirroring the iOS loader. */
  private fun loadBitmap(uri: String): Bitmap? {
    if (uri.isEmpty()) return null
    return try {
      val path = when {
        uri.startsWith("file://") -> Uri.parse(uri).path
        uri.startsWith("/") -> uri
        else -> null
      } ?: return null
      val file = File(path)
      if (!file.exists()) return null
      BitmapFactory.decodeFile(path)
    } catch (_: Exception) {
      null
    }
  }
}
