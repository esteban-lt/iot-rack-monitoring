class SessionTokens {
  const SessionTokens({required this.token, required this.refreshToken});

  factory SessionTokens.fromJson(Map<String, dynamic> json) =>
      SessionTokens(token: json['token'] as String, refreshToken: json['refreshToken'] as String);

  final String token;
  final String refreshToken;

  Map<String, dynamic> toJson() => {'token': token, 'refreshToken': refreshToken};
}
