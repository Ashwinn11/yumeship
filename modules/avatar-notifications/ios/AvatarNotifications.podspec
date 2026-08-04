require 'json'

package = JSON.parse(File.read(File.join(__dir__, '..', '..', '..', 'package.json')))

Pod::Spec.new do |s|
  s.name           = 'AvatarNotifications'
  s.version        = '1.0.0'
  s.summary        = 'Local notifications that show the sender avatar instead of the app icon'
  s.description    = 'iOS 15 Communication Notifications for locally scheduled F/O messages.'
  s.author         = ''
  s.homepage       = 'https://github.com/expo/expo'
  s.platforms      = { :ios => '15.1', :tvos => '15.1' }
  s.source         = { git: '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'
  s.frameworks = 'Intents', 'UserNotifications'

  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
    'SWIFT_COMPILATION_MODE' => 'wholemodule'
  }

  s.source_files = "**/*.{h,m,mm,swift,hpp,cpp}"
end
