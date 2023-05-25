import 'dart:async';

import '/backend/schema/util/firestore_util.dart';
import '/backend/schema/util/schema_util.dart';

import 'index.dart';
import '/flutter_flow/flutter_flow_util.dart';

class PromptTagsRecord extends FirestoreRecord {
  PromptTagsRecord._(
    DocumentReference reference,
    Map<String, dynamic> data,
  ) : super(reference, data) {
    _initializeFields();
  }

  // "tag" field.
  String? _tag;
  String get tag => _tag ?? '';
  bool hasTag() => _tag != null;

  // "timestamp" field.
  DateTime? _timestamp;
  DateTime? get timestamp => _timestamp;
  bool hasTimestamp() => _timestamp != null;

  // "tag_id" field.
  String? _tagId;
  String get tagId => _tagId ?? '';
  bool hasTagId() => _tagId != null;

  // "user" field.
  DocumentReference? _user;
  DocumentReference? get user => _user;
  bool hasUser() => _user != null;

  void _initializeFields() {
    _tag = snapshotData['tag'] as String?;
    _timestamp = snapshotData['timestamp'] as DateTime?;
    _tagId = snapshotData['tag_id'] as String?;
    _user = snapshotData['user'] as DocumentReference?;
  }

  static CollectionReference get collection =>
      FirebaseFirestore.instance.collection('prompt_tags');

  static Stream<PromptTagsRecord> getDocument(DocumentReference ref) =>
      ref.snapshots().map((s) => PromptTagsRecord.fromSnapshot(s));

  static Future<PromptTagsRecord> getDocumentOnce(DocumentReference ref) =>
      ref.get().then((s) => PromptTagsRecord.fromSnapshot(s));

  static PromptTagsRecord fromSnapshot(DocumentSnapshot snapshot) =>
      PromptTagsRecord._(
        snapshot.reference,
        mapFromFirestore(snapshot.data() as Map<String, dynamic>),
      );

  static PromptTagsRecord getDocumentFromData(
    Map<String, dynamic> data,
    DocumentReference reference,
  ) =>
      PromptTagsRecord._(reference, mapFromFirestore(data));

  @override
  String toString() =>
      'PromptTagsRecord(reference: ${reference.path}, data: $snapshotData)';
}

Map<String, dynamic> createPromptTagsRecordData({
  String? tag,
  DateTime? timestamp,
  String? tagId,
  DocumentReference? user,
}) {
  final firestoreData = mapToFirestore(
    <String, dynamic>{
      'tag': tag,
      'timestamp': timestamp,
      'tag_id': tagId,
      'user': user,
    }.withoutNulls,
  );

  return firestoreData;
}
