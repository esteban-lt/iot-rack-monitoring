# Rack monitoring: mobile app

Flutter app to check rack status, handle alarms and identify a rack by its NFC tag. It talks to ThingsBoard Cloud, like the web app.

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
