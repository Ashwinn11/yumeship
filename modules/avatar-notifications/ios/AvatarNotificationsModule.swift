import ExpoModulesCore
import Intents
import UserNotifications
import UIKit

/**
 * Schedules local notifications that show the sender's avatar *instead of* the
 * app icon, via iOS 15 Communication Notifications.
 *
 * A UNNotificationAttachment cannot do this — it only adds a thumbnail on the
 * trailing edge and leaves the app icon alone. The icon is only replaced when
 * the notification content is derived from a donated INSendMessageIntent, which
 * is what this does. Because these are *local* notifications we can donate and
 * schedule in one pass; a Notification Service Extension is only needed to
 * rewrite notifications arriving from a server.
 *
 * Requires the Communication Notifications capability and an
 * NSUserActivityTypes entry for INSendMessageIntent — both added by
 * plugins/withAvatarNotifications.js.
 */
public class AvatarNotificationsModule: Module {
  public func definition() -> ModuleDefinition {
    Name("AvatarNotifications")

    Function("isSupported") { () -> Bool in
      if #available(iOS 15.0, *) { return true }
      return false
    }

    AsyncFunction("scheduleAsync") {
      (
        senderName: String,
        body: String,
        avatarUri: String,
        seconds: Int,
        conversationId: String,
        promise: Promise
      ) in
      guard #available(iOS 15.0, *) else {
        promise.resolve(nil)
        return
      }

      let identifier = UUID().uuidString
      let content = UNMutableNotificationContent()
      content.title = senderName
      content.body = body

      // Fired on a background queue: donating an intent does disk I/O, and the
      // avatar has to be read and decoded before the content can be built.
      DispatchQueue.global(qos: .userInitiated).async {
        let finalContent: UNNotificationContent
        if let communicationContent = Self.communicationContent(
          from: content,
          senderName: senderName,
          avatarUri: avatarUri,
          conversationId: conversationId
        ) {
          finalContent = communicationContent
        } else {
          // no avatar, or the intent could not be built — still deliver, just
          // as an ordinary notification with the app icon
          finalContent = content
        }

        let trigger = UNTimeIntervalNotificationTrigger(
          timeInterval: TimeInterval(max(1, seconds)),
          repeats: false
        )
        let request = UNNotificationRequest(
          identifier: identifier,
          content: finalContent,
          trigger: trigger
        )
        UNUserNotificationCenter.current().add(request) { error in
          if let error = error {
            promise.reject("ERR_AVATAR_NOTIFICATION", error.localizedDescription)
          } else {
            promise.resolve(identifier)
          }
        }
      }
    }

    AsyncFunction("cancelAsync") { (id: String) in
      UNUserNotificationCenter.current()
        .removePendingNotificationRequests(withIdentifiers: [id])
    }
  }

  /// Builds the INSendMessageIntent, donates it, and returns content updated
  /// from it. Returns nil when there is no usable avatar, so the caller can
  /// fall back rather than shipping a broken-looking notification.
  @available(iOS 15.0, *)
  private static func communicationContent(
    from content: UNMutableNotificationContent,
    senderName: String,
    avatarUri: String,
    conversationId: String
  ) -> UNNotificationContent? {
    guard let avatar = loadImage(from: avatarUri) else { return nil }

    let handle = INPersonHandle(value: conversationId, type: .unknown)
    let sender = INPerson(
      personHandle: handle,
      nameComponents: nil,
      displayName: senderName,
      image: avatar,
      contactIdentifier: nil,
      customIdentifier: conversationId
    )

    let intent = INSendMessageIntent(
      recipients: nil,
      outgoingMessageType: .outgoingMessageText,
      content: content.body,
      speakableGroupName: nil,
      conversationIdentifier: conversationId,
      serviceName: nil,
      sender: sender,
      attachments: nil
    )
    intent.setImage(avatar, forParameterNamed: \.sender)

    let interaction = INInteraction(intent: intent, response: nil)
    // must be .incoming — an outgoing interaction is treated as a message the
    // user sent, and iOS will not show the avatar for it
    interaction.direction = .incoming
    interaction.donate(completion: nil)

    return try? content.updating(from: intent)
  }

  /// Accepts file:// URLs and bare paths alike, since callers pass whatever the
  /// image picker or local store handed them.
  private static func loadImage(from uri: String) -> INImage? {
    guard !uri.isEmpty else { return nil }

    let path: String
    if uri.hasPrefix("file://"), let url = URL(string: uri) {
      path = url.path
    } else if uri.hasPrefix("/") {
      path = uri
    } else {
      return nil
    }

    guard
      FileManager.default.fileExists(atPath: path),
      let data = FileManager.default.contents(atPath: path),
      UIImage(data: data) != nil
    else {
      return nil
    }
    return INImage(imageData: data)
  }
}
