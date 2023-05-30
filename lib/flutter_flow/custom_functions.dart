import 'dart:convert';
import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import 'package:timeago/timeago.dart' as timeago;
import 'lat_lng.dart';
import 'place.dart';
import '/backend/backend.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '/auth/firebase_auth/auth_util.dart';

bool? hasNoGenerations(List<GenerationsRecord>? allGenerations) {
  return allGenerations?.isEmpty ?? true;
}

String? getGenerationMediaURL(String path) {
  final storage = Storage();

  // Create a signed URL with a validity period of 60 minutes
  final url = await storage.read(bucketName, path,
      expiration: const Duration(minutes: 60));

  return url;
}

String? stringURLToImagePath(String urlString) {
  return (urlString + '/frame_00012.png ');
}

String? stringURLToVideoPath(String urlString) {
  return (urlString + '/generation.mp4');
}
