import '/components/prompt_card/prompt_card_widget.dart';
import '/flutter_flow/flutter_flow_icon_button.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import 'package:flutter/material.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

class MyFriendsModel extends FlutterFlowModel {
  ///  State fields for stateful widgets in this page.

  // Model for PromptCard component.
  late PromptCardModel promptCardModel1;
  // Model for PromptCard component.
  late PromptCardModel promptCardModel2;

  /// Initialization and disposal methods.

  void initState(BuildContext context) {
    promptCardModel1 = createModel(context, () => PromptCardModel());
    promptCardModel2 = createModel(context, () => PromptCardModel());
  }

  void dispose() {
    promptCardModel1.dispose();
    promptCardModel2.dispose();
  }

  /// Additional helper methods are added here.

}
