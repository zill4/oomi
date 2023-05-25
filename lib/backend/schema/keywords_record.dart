import 'dart:async';

import '/backend/schema/util/firestore_util.dart';
import '/backend/schema/util/schema_util.dart';

import 'index.dart';
import '/flutter_flow/flutter_flow_util.dart';

class KeywordsRecord extends FirestoreRecord {
  KeywordsRecord._(
    DocumentReference reference,
    Map<String, dynamic> data,
  ) : super(reference, data) {
    _initializeFields();
  }

  // "keyword" field.
  String? _keyword;
  String get keyword => _keyword ?? '';
  bool hasKeyword() => _keyword != null;

  // "timestamp" field.
  DateTime? _timestamp;
  DateTime? get timestamp => _timestamp;
  bool hasTimestamp() => _timestamp != null;

  // "keyword_id" field.
  String? _keywordId;
  String get keywordId => _keywordId ?? '';
  bool hasKeywordId() => _keywordId != null;

  // "user" field.
  DocumentReference? _user;
  DocumentReference? get user => _user;
  bool hasUser() => _user != null;

  void _initializeFields() {
    _keyword = snapshotData['keyword'] as String?;
    _timestamp = snapshotData['timestamp'] as DateTime?;
    _keywordId = snapshotData['keyword_id'] as String?;
    _user = snapshotData['user'] as DocumentReference?;
  }

  static CollectionReference get collection =>
      FirebaseFirestore.instance.collection('keywords');

  static Stream<KeywordsRecord> getDocument(DocumentReference ref) =>
      ref.snapshots().map((s) => KeywordsRecord.fromSnapshot(s));

  static Future<KeywordsRecord> getDocumentOnce(DocumentReference ref) =>
      ref.get().then((s) => KeywordsRecord.fromSnapshot(s));

  static KeywordsRecord fromSnapshot(DocumentSnapshot snapshot) =>
      KeywordsRecord._(
        snapshot.reference,
        mapFromFirestore(snapshot.data() as Map<String, dynamic>),
      );

  static KeywordsRecord getDocumentFromData(
    Map<String, dynamic> data,
    DocumentReference reference,
  ) =>
      KeywordsRecord._(reference, mapFromFirestore(data));

  @override
  String toString() =>
      'KeywordsRecord(reference: ${reference.path}, data: $snapshotData)';
}

Map<String, dynamic> createKeywordsRecordData({
  String? keyword,
  DateTime? timestamp,
  String? keywordId,
  DocumentReference? user,
}) {
  final firestoreData = mapToFirestore(
    <String, dynamic>{
      'keyword': keyword,
      'timestamp': timestamp,
      'keyword_id': keywordId,
      'user': user,
    }.withoutNulls,
  );

  return firestoreData;
}
