import 'dart:async';

import '/backend/schema/util/firestore_util.dart';
import '/backend/schema/util/schema_util.dart';

import 'index.dart';
import '/flutter_flow/flutter_flow_util.dart';

class SeedVideosRecord extends FirestoreRecord {
  SeedVideosRecord._(
    DocumentReference reference,
    Map<String, dynamic> data,
  ) : super(reference, data) {
    _initializeFields();
  }

  // "video" field.
  String? _video;
  String get video => _video ?? '';
  bool hasVideo() => _video != null;

  // "file_name" field.
  String? _fileName;
  String get fileName => _fileName ?? '';
  bool hasFileName() => _fileName != null;

  // "seed_video_id" field.
  String? _seedVideoId;
  String get seedVideoId => _seedVideoId ?? '';
  bool hasSeedVideoId() => _seedVideoId != null;

  // "timestamp" field.
  DateTime? _timestamp;
  DateTime? get timestamp => _timestamp;
  bool hasTimestamp() => _timestamp != null;

  // "user" field.
  DocumentReference? _user;
  DocumentReference? get user => _user;
  bool hasUser() => _user != null;

  void _initializeFields() {
    _video = snapshotData['video'] as String?;
    _fileName = snapshotData['file_name'] as String?;
    _seedVideoId = snapshotData['seed_video_id'] as String?;
    _timestamp = snapshotData['timestamp'] as DateTime?;
    _user = snapshotData['user'] as DocumentReference?;
  }

  static CollectionReference get collection =>
      FirebaseFirestore.instance.collection('seed_videos');

  static Stream<SeedVideosRecord> getDocument(DocumentReference ref) =>
      ref.snapshots().map((s) => SeedVideosRecord.fromSnapshot(s));

  static Future<SeedVideosRecord> getDocumentOnce(DocumentReference ref) =>
      ref.get().then((s) => SeedVideosRecord.fromSnapshot(s));

  static SeedVideosRecord fromSnapshot(DocumentSnapshot snapshot) =>
      SeedVideosRecord._(
        snapshot.reference,
        mapFromFirestore(snapshot.data() as Map<String, dynamic>),
      );

  static SeedVideosRecord getDocumentFromData(
    Map<String, dynamic> data,
    DocumentReference reference,
  ) =>
      SeedVideosRecord._(reference, mapFromFirestore(data));

  @override
  String toString() =>
      'SeedVideosRecord(reference: ${reference.path}, data: $snapshotData)';
}

Map<String, dynamic> createSeedVideosRecordData({
  String? video,
  String? fileName,
  String? seedVideoId,
  DateTime? timestamp,
  DocumentReference? user,
}) {
  final firestoreData = mapToFirestore(
    <String, dynamic>{
      'video': video,
      'file_name': fileName,
      'seed_video_id': seedVideoId,
      'timestamp': timestamp,
      'user': user,
    }.withoutNulls,
  );

  return firestoreData;
}
