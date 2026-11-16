import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:rack_monitoring/data/models/session_tokens.dart';

// Loaded before the app starts and overridden in main
final sessionStorageProvider = Provider<SessionStorage>((ref) => throw UnimplementedError());

// Notifies when the session starts or ends, not on token refreshes
class SessionStorage extends ChangeNotifier {
  SessionStorage([this._storage = const FlutterSecureStorage()]);

  static const _key = 'session_tokens';

  final FlutterSecureStorage _storage;
  SessionTokens? _tokens;
  bool _keepSession = false;

  SessionTokens? get tokens => _tokens;
  bool get hasSession => _tokens != null;

  Future<void> load() async {
    final stored = await _storage.read(key: _key);
    if (stored == null) return;

    _tokens = SessionTokens.fromJson(jsonDecode(stored) as Map<String, dynamic>);
    _keepSession = true;
  }

  // Without keepSession the tokens only live in memory
  Future<void> start(SessionTokens tokens, {required bool keepSession}) async {
    _keepSession = keepSession;
    await update(tokens);
    notifyListeners();
  }

  Future<void> update(SessionTokens tokens) async {
    _tokens = tokens;
    if (_keepSession) await _storage.write(key: _key, value: jsonEncode(tokens.toJson()));
  }

  Future<void> clear() async {
    if (!hasSession) return;

    _tokens = null;
    await _storage.delete(key: _key);
    notifyListeners();
  }
}
