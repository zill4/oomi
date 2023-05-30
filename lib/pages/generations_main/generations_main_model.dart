import '/auth/firebase_auth/auth_util.dart';
import '/backend/backend.dart';
import '/components/empty_list/empty_list_widget.dart';
import '/components/generation_preview/generation_preview_widget.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'package:flutter/material.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

class GenerationsMainModel extends FlutterFlowModel {
  ///  State fields for stateful widgets in this page.

  // Models for GenerationPreview dynamic component.
  late FlutterFlowDynamicModels<GenerationPreviewModel> generationPreviewModels;

  /// Initialization and disposal methods.

  void initState(BuildContext context) {
    generationPreviewModels =
        FlutterFlowDynamicModels(() => GenerationPreviewModel());
  }

  void dispose() {
    generationPreviewModels.dispose();
  }

  /// Additional helper methods are added here.

}
