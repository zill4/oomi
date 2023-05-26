import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'package:flutter/material.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'prompt_card_model.dart';
export 'prompt_card_model.dart';

class PromptCardWidget extends StatefulWidget {
  const PromptCardWidget({
    Key? key,
    this.promptTitle,
    this.promptPart1,
    this.promptPart2,
    this.promptPart3,
  }) : super(key: key);

  final String? promptTitle;
  final String? promptPart1;
  final String? promptPart2;
  final String? promptPart3;

  @override
  _PromptCardWidgetState createState() => _PromptCardWidgetState();
}

class _PromptCardWidgetState extends State<PromptCardWidget> {
  late PromptCardModel _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => PromptCardModel());

    WidgetsBinding.instance.addPostFrameCallback((_) => setState(() {}));
  }

  @override
  void dispose() {
    _model.maybeDispose();

    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    context.watch<FFAppState>();

    return Padding(
      padding: EdgeInsetsDirectional.fromSTEB(16.0, 0.0, 16.0, 0.0),
      child: Container(
        width: double.infinity,
        decoration: BoxDecoration(
          color: FlutterFlowTheme.of(context).secondaryBackground,
          boxShadow: [
            BoxShadow(
              blurRadius: 7.0,
              color: Color(0x2F1D2429),
              offset: Offset(0.0, 3.0),
            )
          ],
          borderRadius: BorderRadius.circular(8.0),
        ),
        child: Padding(
          padding: EdgeInsetsDirectional.fromSTEB(16.0, 12.0, 16.0, 12.0),
          child: Column(
            mainAxisSize: MainAxisSize.max,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Padding(
                padding: EdgeInsetsDirectional.fromSTEB(0.0, 10.0, 0.0, 0.0),
                child: Text(
                  widget.promptTitle!,
                  style: FlutterFlowTheme.of(context).bodyMedium.override(
                        fontFamily: 'Lexend Deca',
                        color: FlutterFlowTheme.of(context).primaryText,
                        fontSize: 21.0,
                      ),
                ),
              ),
              Divider(
                height: 16.0,
                thickness: 2.0,
                color: FlutterFlowTheme.of(context).primaryBackground,
              ),
              Padding(
                padding: EdgeInsetsDirectional.fromSTEB(0.0, 4.0, 0.0, 0.0),
                child: Text(
                  'Part 1',
                  style: FlutterFlowTheme.of(context).labelMedium,
                ),
              ),
              Text(
                widget.promptPart1!,
                style: FlutterFlowTheme.of(context).bodyMedium,
              ),
              Divider(
                height: 16.0,
                thickness: 2.0,
                color: FlutterFlowTheme.of(context).primaryBackground,
              ),
              Padding(
                padding: EdgeInsetsDirectional.fromSTEB(0.0, 4.0, 0.0, 0.0),
                child: Text(
                  'Part 2',
                  style: FlutterFlowTheme.of(context).labelMedium,
                ),
              ),
              Text(
                widget.promptPart2!,
                style: FlutterFlowTheme.of(context).bodyMedium,
              ),
              Divider(
                height: 16.0,
                thickness: 2.0,
                color: FlutterFlowTheme.of(context).primaryBackground,
              ),
              Padding(
                padding: EdgeInsetsDirectional.fromSTEB(0.0, 4.0, 0.0, 0.0),
                child: Text(
                  'Part 3',
                  style: FlutterFlowTheme.of(context).labelMedium,
                ),
              ),
              Text(
                widget.promptPart3!,
                style: FlutterFlowTheme.of(context).bodyMedium,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
