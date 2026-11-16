class User {
  const User({required this.name, required this.email});

  factory User.fromJson(Map<String, dynamic> json) {
    final email = json['email'] as String;
    final name = [json['firstName'], json['lastName']].whereType<String>().join(' ').trim();

    return User(name: name.isEmpty ? email : name, email: email);
  }

  final String name;
  final String email;

  String get initials => name.split(RegExp(r'\s+')).take(2).map((word) => word[0]).join().toUpperCase();
}
