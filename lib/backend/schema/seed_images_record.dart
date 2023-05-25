import 'dart:async';

import '/backend/schema/util/firestore_util.dart';
import '/backend/schema/util/schema_util.dart';

import 'index.dart';
import '/flutter_flow/flutter_flow_util.dart';

class SeedImagesRecord extends FirestoreRecord {
  SeedImagesRecord._(
    DocumentReference reference,
    Map<String, dynamic> data,
  ) : super(reference, data) {
    _initializeFields();
  }

  // "image" field.
  String? _image;
  String get image => _image ?? '';
  bool hasImage() => _image != null;

  // "file_name" field.
  String? _fileName;
  String get fileName => _fileName ?? '';
  bool hasFileName() => _fileName != null;

  // "timestamp" field.
  DateTime? _timestamp;
  DateTime? get timestamp => _timestamp;
  bool hasTimestamp() => _timestamp != null;

  // "seed_image_id" field.
  String? _seedImageId;
  String get seedImageId => _seedImageId ?? '';
  bool hasSeedImageId() => _seedImageId != null;

  // "user" field.
  DocumentReference? _user;
  DocumentReference? get user => _user;
  bool hasUser() => _user != null;

  void _initializeFields() {
    _image = snapshotData['image'] as String?;
    _fileName = snapshotData['file_name'] as String?;
    _timestamp = snapshotData['timestamp'] as DateTime?;
    _seedImageId = snapshotData['seed_image_id'] as String?;
    _user = snapshotData['user'] as DocumentReference?;
  }

  static CollectionReference get collection =>
      FirebaseFirestore.instance.collection('seed_images');

  static Stream<SeedImagesRecord> getDocument(DocumentReference ref) =>
      ref.snapshots().map((s) => SeedImagesRecord.fromSnapshot(s));

  static Future<SeedImagesRecord> getDocumentOnce(DocumentReference ref) =>
      ref.get().then((s) => SeedImagesRecord.fromSnapshot(s));

  static SeedImagesRecord fromSnapshot(DocumentSnapshot snapshot) =>
      SeedImagesRecord._(
        snapshot.reference,
        mapFromFirestore(snapshot.data() as Map<String, dynamic>),
      );

  static SeedImagesRecord getDocumentFromData(
    Map<String, dynamic> data,
    DocumentReference reference,
  ) =>
      SeedImagesRecord._(reference, mapFromFirestore(data));

  @override
  String toString() =>
      'SeedImagesRecord(reference: ${reference.path}, data: $snapshotData)';
}

Map<String, dynamic> createSeedImagesRecordData({
  String? image,
  String? fileName,
  DateTime? timestamp,
  String? seedImageId,
  DocumentReference? user,
}) {
  final firestoreData = mapToFirestore(
    <String, dynamic>{
      'image': image,
      'file_name': fileName,
      'timestamp': timestamp,
      'seed_image_id': seedImageId,
      'user': user,
    }.withoutNulls,
  );

  return firestoreData;
}
