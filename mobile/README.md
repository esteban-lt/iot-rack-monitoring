# Rack monitoring: mobile app

Flutter app to check rack status, handle alarms and identify a rack by its NFC tag. It talks to ThingsBoard Cloud, like the web app.

## Features

- Login with a ThingsBoard account; the session can be kept between launches.
- Rack list with live status, search and filters.
- Rack detail with tilt, vibration, last impact, a tilt chart and the recent alarms. From there the buzzer can be silenced and the alarms acknowledged.
- Alarm list grouped by day, with swipe to acknowledge and a live badge.
- NFC scan: reading the tag stuck on a rack opens its detail.
- Device list with the connection, assigned rack, MAC, IP, firmware and WiFi signal of each node.
- Light, dark and system themes, an offline banner and a "Escanear tag" shortcut on the app icon.

Racks, thresholds and calibration are managed from the web app.

## Platforms

- **Android**: target platform, tested.
- **iOS**: supported by the code, not built or tested.
- **Web**: development only, to run the app in Chrome. The `web/` folder is not versioned and NFC is not available there.

## Setup

Requires Flutter 3.47 (stable).

```bash
flutter pub get
flutter run
```

To run it in Chrome, create the `web/` folder once:

```bash
flutter create --platforms=web .
flutter run -d chrome
```

That command also restores some template files. Discard them:

```bash
git restore .metadata
rm .gitignore test/widget_test.dart
```

The ThingsBoard URL defaults to `https://thingsboard.cloud`. To change it:

```bash
flutter run --dart-define=TB_API_URL=https://my-thingsboard.example
```

## Scripts

| Command | What it does |
|---|---|
| `dart format lib test` | Formats the code |
| `flutter analyze` | Runs the linter |
| `flutter test` | Runs the tests |
| `flutter build apk` | Builds the Android app |

NFC needs a real Android phone; the emulator and Chrome show the "no NFC" state.

## Structure

MVVM, following the Flutter architecture guide.

```
lib/
├── core/        # config, network, router, theme, utils
├── data/        # models, services, repositories
├── features/    # one folder per feature: view_models/ and views/
└── shared/      # widgets used by several features
test/            # mirrors lib/
```
