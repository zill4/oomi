import '/auth/firebase_auth/auth_util.dart';
import '/backend/api_requests/api_calls.dart';
import '/backend/backend.dart';
import '/components/prompt_card/prompt_card_widget.dart';
import '/flutter_flow/flutter_flow_icon_button.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import 'package:flutter/material.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

class CreateGenerationModel extends FlutterFlowModel {
  ///  Local state fields for this page.

  String? generationTitle;

  String? promptPart1;

  String? promptPart2;

  String? promptPart3;

  ///  State fields for stateful widgets in this page.

  // State field(s) for TextField widget.
  TextEditingController? textController;
  String? Function(BuildContext, String?)? textControllerValidator;
  // Models for PromptCard dynamic component.
  late FlutterFlowDynamicModels<PromptCardModel> promptCardModels;
  // Stores action output result for [Backend Call - API (GenerateVideo)] action in Button widget.
  ApiCallResponse? apiResultzpq;

  /// Initialization and disposal methods.

  void initState(BuildContext context) {
    promptCardModels = FlutterFlowDynamicModels(() => PromptCardModel());
  }

  void dispose() {
    textController?.dispose();
    promptCardModels.dispose();
  }

  /// Additional helper methods are added here.

}
