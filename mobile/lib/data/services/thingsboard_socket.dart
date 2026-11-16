import 'dart:async';
import 'dart:convert';
import 'dart:math';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:rack_monitoring/core/config/env.dart';
import 'package:rack_monitoring/core/network/session_refresher.dart';
import 'package:rack_monitoring/data/services/session_storage.dart';
import 'package:web_socket_channel/web_socket_channel.dart';

final thingsboardSocketProvider = Provider<ThingsboardSocket>((ref) {
  final socket = ThingsboardSocket(ref.watch(sessionStorageProvider), ref.watch(sessionRefresherProvider));
  ref.onDispose(socket.close);
  return socket;
});

typedef SocketMessage = Map<String, dynamic>;
typedef SocketCommand = Map<String, dynamic>;
typedef _Subscription = ({SocketCommand command, StreamController<SocketMessage> messages});

bool tokenExpiresSoon(String token, DateTime now) {
  final payload = utf8.decode(base64Url.decode(base64Url.normalize(token.split('.')[1])));
  final expiresAt = DateTime.fromMillisecondsSinceEpoch(((jsonDecode(payload) as Map)['exp'] as int) * 1000);
  return expiresAt.difference(now) < const Duration(minutes: 1);
}

// One connection shared by every subscription; it reconnects and subscribes again by itself
class ThingsboardSocket {
  ThingsboardSocket(this._session, this._refresher);

  static final _url = Uri.parse('${Env.apiUrl.replaceFirst('http', 'ws')}/api/ws');
  static const _maxReconnectDelay = Duration(seconds: 30);

  final SessionStorage _session;
  final SessionRefresher _refresher;
  final _subscriptions = <int, _Subscription>{};
  WebSocketChannel? _channel;
  Timer? _reconnectTimer;
  bool _isConnecting = false;
  int _nextCommandId = 1;
  int _reconnectAttempts = 0;

  Stream<SocketMessage> subscribe(SocketCommand command) {
    final commandId = _nextCommandId++;
    final messages = StreamController<SocketMessage>();

    messages.onListen = () {
      _subscriptions[commandId] = (command: command, messages: messages);
      if (_channel == null) {
        _connect();
      } else {
        _send([_withId(commandId, command)]);
      }
    };

    messages.onCancel = () {
      _subscriptions.remove(commandId);
      _send([
        {'type': '${command['type']}_UNSUBSCRIBE', 'cmdId': commandId},
      ]);
      if (_subscriptions.isEmpty) close();
    };

    return messages.stream;
  }

  void close() {
    _reconnectTimer?.cancel();
    _channel?.sink.close();
    _channel = null;
  }

  Future<void> _connect() async {
    if (_channel != null || _isConnecting || _subscriptions.isEmpty || !_session.hasSession) return;
    _isConnecting = true;

    try {
      if (tokenExpiresSoon(_session.tokens!.token, DateTime.now())) await _refresher.refresh();

      final channel = WebSocketChannel.connect(_url);
      await channel.ready;

      _channel = channel;
      _reconnectAttempts = 0;
      channel.stream.listen(_onMessage, onDone: () => _onClosed(channel), onError: (_) {});
      channel.sink.add(
        jsonEncode({
          'authCmd': {'cmdId': 0, 'token': _session.tokens?.token},
          'cmds': [for (final MapEntry(:key, :value) in _subscriptions.entries) _withId(key, value.command)],
        }),
      );
    } on Exception {
      _scheduleReconnect();
    } finally {
      _isConnecting = false;
    }

    if (_subscriptions.isEmpty) close();
  }

  void _onMessage(Object? data) {
    final message = jsonDecode(data as String) as SocketMessage;
    _subscriptions[message['cmdId']]?.messages.add(message);
  }

  void _onClosed(WebSocketChannel channel) {
    if (!identical(channel, _channel)) return;

    _channel = null;
    _scheduleReconnect();
  }

  void _scheduleReconnect() {
    if (_subscriptions.isEmpty) return;

    final delay = Duration(seconds: pow(2, _reconnectAttempts++).toInt());
    _reconnectTimer = Timer(delay < _maxReconnectDelay ? delay : _maxReconnectDelay, _connect);
  }

  void _send(List<SocketCommand> commands) => _channel?.sink.add(jsonEncode({'cmds': commands}));

  SocketCommand _withId(int commandId, SocketCommand command) => {...command, 'cmdId': commandId};
}
