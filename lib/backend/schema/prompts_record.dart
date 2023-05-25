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

  // "text" field.
  String? _text;
  String get text => _text ?? '';
  bool hasText() => _text != null;

  // "keywords" field.
  List<DocumentReference>? _keywords;
  List<DocumentReference> get keywords => _keywords ?? const [];
  bool hasKeywords() => _keywords != null;

  // "prompt_tags" field.
  List<DocumentReference>? _promptTags;
  List<DocumentReference> get promptTags => _promptTags ?? const [];
  bool hasPromptTags() => _promptTags != null;

  // "prompt_id" field.
  String? _promptId;
  String get promptId => _promptId ?? '';
  bool hasPromptId() => _promptId != null;

  void _initializeFields() {
    _user = snapshotData['user'] as DocumentReference?;
    _text = snapshotData['text'] as String?;
    _keywords = getDataList(snapshotData['keywords']);
    _promptTags = getDataList(snapshotData['prompt_tags']);
    _promptId = snapshotData['prompt_id'] as String?;
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
  String? text,
  String? promptId,
}) {
  final firestoreData = mapToFirestore(
    <String, dynamic>{
      'user': user,
      'text': text,
      'prompt_id': promptId,
    }.withoutNulls,
  );

  return firestoreData;
}
