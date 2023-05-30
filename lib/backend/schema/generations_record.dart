import 'dart:async';

import '/backend/schema/util/firestore_util.dart';
import '/backend/schema/util/schema_util.dart';

import 'index.dart';
import '/flutter_flow/flutter_flow_util.dart';

class GenerationsRecord extends FirestoreRecord {
  GenerationsRecord._(
    DocumentReference reference,
    Map<String, dynamic> data,
  ) : super(reference, data) {
    _initializeFields();
  }

  // "user" field.
  DocumentReference? _user;
  DocumentReference? get user => _user;
  bool hasUser() => _user != null;

  // "timestamp" field.
  DateTime? _timestamp;
  DateTime? get timestamp => _timestamp;
  bool hasTimestamp() => _timestamp != null;

  // "generated_video" field.
  String? _generatedVideo;
  String get generatedVideo => _generatedVideo ?? '';
  bool hasGeneratedVideo() => _generatedVideo != null;

  // "description" field.
  String? _description;
  String get description => _description ?? '';
  bool hasDescription() => _description != null;

  // "generation_id" field.
  String? _generationId;
  String get generationId => _generationId ?? '';
  bool hasGenerationId() => _generationId != null;

  // "generation_title" field.
  String? _generationTitle;
  String get generationTitle => _generationTitle ?? '';
  bool hasGenerationTitle() => _generationTitle != null;

  // "status" field.
  String? _status;
  String get status => _status ?? '';
  bool hasStatus() => _status != null;

  void _initializeFields() {
    _user = snapshotData['user'] as DocumentReference?;
    _timestamp = snapshotData['timestamp'] as DateTime?;
    _generatedVideo = snapshotData['generated_video'] as String?;
    _description = snapshotData['description'] as String?;
    _generationId = snapshotData['generation_id'] as String?;
    _generationTitle = snapshotData['generation_title'] as String?;
    _status = snapshotData['status'] as String?;
  }

  static CollectionReference get collection =>
      FirebaseFirestore.instance.collection('generations');

  static Stream<GenerationsRecord> getDocument(DocumentReference ref) =>
      ref.snapshots().map((s) => GenerationsRecord.fromSnapshot(s));

  static Future<GenerationsRecord> getDocumentOnce(DocumentReference ref) =>
      ref.get().then((s) => GenerationsRecord.fromSnapshot(s));

  static GenerationsRecord fromSnapshot(DocumentSnapshot snapshot) =>
      GenerationsRecord._(
        snapshot.reference,
        mapFromFirestore(snapshot.data() as Map<String, dynamic>),
      );

  static GenerationsRecord getDocumentFromData(
    Map<String, dynamic> data,
    DocumentReference reference,
  ) =>
      GenerationsRecord._(reference, mapFromFirestore(data));

  @override
  String toString() =>
      'GenerationsRecord(reference: ${reference.path}, data: $snapshotData)';
}

Map<String, dynamic> createGenerationsRecordData({
  DocumentReference? user,
  DateTime? timestamp,
  String? generatedVideo,
  String? description,
  String? generationId,
  String? generationTitle,
  String? status,
}) {
  final firestoreData = mapToFirestore(
    <String, dynamic>{
      'user': user,
      'timestamp': timestamp,
      'generated_video': generatedVideo,
      'description': description,
      'generation_id': generationId,
      'generation_title': generationTitle,
      'status': status,
    }.withoutNulls,
  );

  return firestoreData;
}
