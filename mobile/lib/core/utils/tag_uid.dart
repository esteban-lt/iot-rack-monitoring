// Uppercase hex without separators, the same format the node reports
String formatTagUid(List<int> bytes) =>
    bytes.map((byte) => byte.toRadixString(16).padLeft(2, '0')).join().toUpperCase();
