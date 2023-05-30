import '/components/prompt_card/prompt_card_widget.dart';
import '/flutter_flow/flutter_flow_icon_button.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_video_player.dart';
import '/flutter_flow/custom_functions.dart' as functions;
import 'package:flutter/material.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

class VewGeneratonModel extends FlutterFlowModel {
  ///  State fields for stateful widgets in this page.

  // Model for PromptCard component.
  late PromptCardModel promptCardModel;

  /// Initialization and disposal methods.

  void initState(BuildContext context) {
    promptCardModel = createModel(context, () => PromptCardModel());
  }

  void dispose() {
    promptCardModel.dispose();
  }

  /// Additional helper methods are added here.

}
