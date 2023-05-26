import 'dart:async';

import '/backend/schema/util/firestore_util.dart';
import '/backend/schema/util/schema_util.dart';

import 'index.dart';
import '/flutter_flow/flutter_flow_util.dart';

class PromptsRecord extends FirestoreRecord {
  PromptsRecord._(
    DocumentReference reference,
    Map<String, dynamic> data,
  ) : super(reference, data) {
    _initializeFields();
  }

  // "user" field.
  DocumentReference? _user;
  DocumentReference? get user => _user;
  bool hasUser() => _user != null;

  // "prompt_id" field.
  String? _promptId;
  String get promptId => _promptId ?? '';
  bool hasPromptId() => _promptId != null;

  // "prompt_1" field.
  String? _prompt1;
  String get prompt1 => _prompt1 ?? '';
  bool hasPrompt1() => _prompt1 != null;

  // "prompt_2" field.
  String? _prompt2;
  String get prompt2 => _prompt2 ?? '';
  bool hasPrompt2() => _prompt2 != null;

  // "prompt_3" field.
  String? _prompt3;
  String get prompt3 => _prompt3 ?? '';
  bool hasPrompt3() => _prompt3 != null;

  // "prompt_title" field.
  String? _promptTitle;
  String get promptTitle => _promptTitle ?? '';
  bool hasPromptTitle() => _promptTitle != null;

  // "timestamp" field.
  DateTime? _timestamp;
  DateTime? get timestamp => _timestamp;
  bool hasTimestamp() => _timestamp != null;

  void _initializeFields() {
    _user = snapshotData['user'] as DocumentReference?;
    _promptId = snapshotData['prompt_id'] as String?;
    _prompt1 = snapshotData['prompt_1'] as String?;
    _prompt2 = snapshotData['prompt_2'] as String?;
    _prompt3 = snapshotData['prompt_3'] as String?;
    _promptTitle = snapshotData['prompt_title'] as String?;
    _timestamp = snapshotData['timestamp'] as DateTime?;
  }

  static CollectionReference get collection =>
      FirebaseFirestore.instance.collection('prompts');

  static Stream<PromptsRecord> getDocument(DocumentReference ref) =>
      ref.snapshots().map((s) => PromptsRecord.fromSnapshot(s));

  static Future<PromptsRecord> getDocumentOnce(DocumentReference ref) =>
      ref.get().then((s) => PromptsRecord.fromSnapshot(s));

  static PromptsRecord fromSnapshot(DocumentSnapshot snapshot) =>
      PromptsRecord._(
        snapshot.reference,
        mapFromFirestore(snapshot.data() as Map<String, dynamic>),
      );

  static PromptsRecord getDocumentFromData(
    Map<String, dynamic> data,
    DocumentReference reference,
  ) =>
      PromptsRecord._(reference, mapFromFirestore(data));

  @override
  String toString() =>
      'PromptsRecord(reference: ${reference.path}, data: $snapshotData)';
}

Map<String, dynamic> createPromptsRecordData({
  DocumentReference? user,
  String? promptId,
  String? prompt1,
  String? prompt2,
  String? prompt3,
  String? promptTitle,
  DateTime? timestamp,
}) {
  final firestoreData = mapToFirestore(
    <String, dynamic>{
      'user': user,
      'prompt_id': promptId,
      'prompt_1': prompt1,
      'prompt_2': prompt2,
      'prompt_3': prompt3,
      'prompt_title': promptTitle,
      'timestamp': timestamp,
    }.withoutNulls,
  );

  return firestoreData;
}
