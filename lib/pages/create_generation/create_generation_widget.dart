import '/auth/firebase_auth/auth_util.dart';
import '/backend/api_requests/api_calls.dart';
import '/backend/backend.dart';
import '/components/prompt_card/prompt_card_widget.dart';
import '/flutter_flow/flutter_flow_icon_button.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import '/flutter_flow/random_data_util.dart' as random_data;
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'create_generation_model.dart';
export 'create_generation_model.dart';

class CreateGenerationWidget extends StatefulWidget {
  const CreateGenerationWidget({Key? key}) : super(key: key);

  @override
  _CreateGenerationWidgetState createState() => _CreateGenerationWidgetState();
}

class _CreateGenerationWidgetState extends State<CreateGenerationWidget> {
  late CreateGenerationModel _model;

  final scaffoldKey = GlobalKey<ScaffoldState>();

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => CreateGenerationModel());

    _model.textController ??=
        TextEditingController(text: _model.generationTitle);
    WidgetsBinding.instance.addPostFrameCallback((_) => setState(() {}));
  }

  @override
  void dispose() {
    _model.dispose();

    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    context.watch<FFAppState>();

    return Scaffold(
      key: scaffoldKey,
      backgroundColor: FlutterFlowTheme.of(context).primaryBackground,
      appBar: AppBar(
        backgroundColor: FlutterFlowTheme.of(context).tertiaryOld,
        automaticallyImplyLeading: false,
        title: Text(
          'Create a Generaton',
          style: FlutterFlowTheme.of(context).displaySmall.override(
                fontFamily: 'Lexend Deca',
                color: FlutterFlowTheme.of(context).primaryText,
              ),
        ),
        actions: [
          Padding(
            padding: EdgeInsetsDirectional.fromSTEB(0.0, 0.0, 16.0, 0.0),
            child: FlutterFlowIconButton(
              borderColor: Colors.transparent,
              borderRadius: 30.0,
              buttonSize: 48.0,
              icon: Icon(
                Icons.close_rounded,
                color: FlutterFlowTheme.of(context).tertiary,
                size: 30.0,
              ),
              onPressed: () async {
                context.pop();
              },
            ),
          ),
        ],
        centerTitle: false,
        elevation: 2.0,
      ),
      body: Column(
        mainAxisSize: MainAxisSize.max,
        children: [
          Column(
            mainAxisSize: MainAxisSize.max,
            children: [
              Padding(
                padding: EdgeInsetsDirectional.fromSTEB(0.0, 20.0, 0.0, 0.0),
                child: Row(
                  mainAxisSize: MainAxisSize.max,
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Padding(
                      padding:
                          EdgeInsetsDirectional.fromSTEB(20.0, 0.0, 0.0, 0.0),
                      child: Text(
                        'Generation Title',
                        textAlign: TextAlign.start,
                        style: FlutterFlowTheme.of(context).bodyMedium.override(
                              fontFamily: 'Lexend Deca',
                              fontSize: 24.0,
                            ),
                      ),
                    ),
                  ],
                ),
              ),
              Row(
                mainAxisSize: MainAxisSize.max,
                children: [
                  Expanded(
                    child: Padding(
                      padding:
                          EdgeInsetsDirectional.fromSTEB(20.0, 16.0, 20.0, 0.0),
                      child: TextFormField(
                        controller: _model.textController,
                        obscureText: false,
                        decoration: InputDecoration(
                          hintText: 'Generation title here...',
                          hintStyle: FlutterFlowTheme.of(context).bodyMedium,
                          enabledBorder: OutlineInputBorder(
                            borderSide: BorderSide(
                              color: FlutterFlowTheme.of(context).primary,
                              width: 2.0,
                            ),
                            borderRadius: BorderRadius.circular(8.0),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderSide: BorderSide(
                              color: FlutterFlowTheme.of(context).primary,
                              width: 2.0,
                            ),
                            borderRadius: BorderRadius.circular(8.0),
                          ),
                          errorBorder: OutlineInputBorder(
                            borderSide: BorderSide(
                              color: FlutterFlowTheme.of(context).error,
                              width: 2.0,
                            ),
                            borderRadius: BorderRadius.circular(8.0),
                          ),
                          focusedErrorBorder: OutlineInputBorder(
                            borderSide: BorderSide(
                              color: FlutterFlowTheme.of(context).error,
                              width: 2.0,
                            ),
                            borderRadius: BorderRadius.circular(8.0),
                          ),
                          filled: true,
                          fillColor:
                              FlutterFlowTheme.of(context).secondaryBackground,
                        ),
                        style: FlutterFlowTheme.of(context).bodyMedium,
                        validator:
                            _model.textControllerValidator.asValidator(context),
                      ),
                    ),
                  ),
                ],
              ),
              Padding(
                padding: EdgeInsetsDirectional.fromSTEB(0.0, 20.0, 0.0, 0.0),
                child: Row(
                  mainAxisSize: MainAxisSize.max,
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Padding(
                      padding:
                          EdgeInsetsDirectional.fromSTEB(20.0, 0.0, 0.0, 0.0),
                      child: Text(
                        'Prompt',
                        textAlign: TextAlign.start,
                        style: FlutterFlowTheme.of(context).bodyMedium.override(
                              fontFamily: 'Lexend Deca',
                              fontSize: 24.0,
                            ),
                      ),
                    ),
                    Padding(
                      padding:
                          EdgeInsetsDirectional.fromSTEB(0.0, 0.0, 20.0, 0.0),
                      child: FlutterFlowIconButton(
                        borderColor:
                            FlutterFlowTheme.of(context).primaryBackground,
                        borderRadius: 20.0,
                        borderWidth: 1.0,
                        buttonSize: 40.0,
                        fillColor: FlutterFlowTheme.of(context).tertiaryOld,
                        icon: Icon(
                          Icons.add,
                          color: FlutterFlowTheme.of(context).primaryText,
                          size: 24.0,
                        ),
                        onPressed: () async {
                          context.pushNamed('CreatePrompt');
                        },
                      ),
                    ),
                  ],
                ),
              ),
              Align(
                alignment: AlignmentDirectional(0.0, -0.6),
                child: Padding(
                  padding: EdgeInsetsDirectional.fromSTEB(0.0, 20.0, 0.0, 20.0),
                  child: StreamBuilder<List<PromptsRecord>>(
                    stream: queryPromptsRecord(
                      queryBuilder: (promptsRecord) => promptsRecord
                          .where('user', isEqualTo: currentUserReference)
                          .orderBy('timestamp', descending: true),
                    ),
                    builder: (context, snapshot) {
                      // Customize what your widget looks like when it's loading.
                      if (!snapshot.hasData) {
                        return Center(
                          child: SizedBox(
                            width: 50.0,
                            height: 50.0,
                            child: SpinKitRipple(
                              color: Color(0xFF77DEFF),
                              size: 50.0,
                            ),
                          ),
                        );
                      }
                      List<PromptsRecord> listViewPromptsRecordList =
                          snapshot.data!;
                      return ListView.builder(
                        padding: EdgeInsets.zero,
                        shrinkWrap: true,
                        scrollDirection: Axis.vertical,
                        itemCount: listViewPromptsRecordList.length,
                        itemBuilder: (context, listViewIndex) {
                          final listViewPromptsRecord =
                              listViewPromptsRecordList[listViewIndex];
                          return InkWell(
                            splashColor: Colors.transparent,
                            focusColor: Colors.transparent,
                            hoverColor: Colors.transparent,
                            highlightColor: Colors.transparent,
                            onTap: () async {
                              setState(() {
                                _model.promptPart1 =
                                    listViewPromptsRecord.prompt1;
                                _model.promptPart2 =
                                    listViewPromptsRecord.prompt2;
                                _model.promptPart3 =
                                    listViewPromptsRecord.prompt3;
                              });
                            },
                            child: wrapWithModel(
                              model: _model.promptCardModels.getModel(
                                listViewPromptsRecord.timestamp!.toString(),
                                listViewIndex,
                              ),
                              updateCallback: () => setState(() {}),
                              child: PromptCardWidget(
                                key: Key(
                                  'Keyt8i_${listViewPromptsRecord.timestamp!.toString()}',
                                ),
                                promptTitle: listViewPromptsRecord.promptTitle,
                                promptPart1: listViewPromptsRecord.prompt1,
                                promptPart2: listViewPromptsRecord.prompt2,
                                promptPart3: listViewPromptsRecord.prompt3,
                              ),
                            ),
                          );
                        },
                      );
                    },
                  ),
                ),
              ),
              Row(
                mainAxisSize: MainAxisSize.max,
                children: [
                  FFButtonWidget(
                    onPressed: () async {
                      _model.apiResultzpq = await GenerateVideoCall.call(
                        userId: currentUserUid,
                        generationTitle: _model.generationTitle,
                        prompt1: _model.promptPart1,
                        prompt2: _model.promptPart2,
                        prompt3: _model.promptPart3,
                      );
                      if ((_model.apiResultzpq?.succeeded ?? true)) {
                        await Future.delayed(
                            const Duration(milliseconds: 1000));
                      } else {
                        await Future.delayed(
                            const Duration(milliseconds: 1000));
                      }

                      final generationsCreateData = {
                        ...createGenerationsRecordData(
                          user: currentUserReference,
                          generatedVideo: (_model.apiResultzpq?.jsonBody ?? ''),
                          generationId: random_data.randomString(
                            6,
                            6,
                            true,
                            false,
                            true,
                          ),
                        ),
                        'timestamp': FieldValue.serverTimestamp(),
                      };
                      await GenerationsRecord.collection
                          .doc()
                          .set(generationsCreateData);

                      context.pushNamed('generationsMain');

                      setState(() {});
                    },
                    text: 'Generate Video',
                    options: FFButtonOptions(
                      height: 40.0,
                      padding:
                          EdgeInsetsDirectional.fromSTEB(24.0, 0.0, 24.0, 0.0),
                      iconPadding:
                          EdgeInsetsDirectional.fromSTEB(0.0, 0.0, 0.0, 0.0),
                      color: FlutterFlowTheme.of(context).primary,
                      textStyle:
                          FlutterFlowTheme.of(context).titleSmall.override(
                                fontFamily: 'Lexend Deca',
                                color: Colors.white,
                              ),
                      elevation: 3.0,
                      borderSide: BorderSide(
                        color: Colors.transparent,
                        width: 1.0,
                      ),
                      borderRadius: BorderRadius.circular(8.0),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }
}
