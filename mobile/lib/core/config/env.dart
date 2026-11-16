abstract final class Env {
  // Set with --dart-define=TB_API_URL=...
  static const apiUrl = String.fromEnvironment('TB_API_URL', defaultValue: 'https://thingsboard.cloud');
}
