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
import 'generations_main_model.dart';
export 'generations_main_model.dart';

class GenerationsMainWidget extends StatefulWidget {
  const GenerationsMainWidget({Key? key}) : super(key: key);

  @override
  _GenerationsMainWidgetState createState() => _GenerationsMainWidgetState();
}

class _GenerationsMainWidgetState extends State<GenerationsMainWidget> {
  late GenerationsMainModel _model;

  final scaffoldKey = GlobalKey<ScaffoldState>();

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => GenerationsMainModel());

    WidgetsBinding.instance.addPostFrameCallback((_) => setState(() {}));
  }

  @override
  void dispose() {
    _model.dispose();

    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<UsersRecord>(
      stream: UsersRecord.getDocument(currentUserReference!),
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
        final generationsMainUsersRecord = snapshot.data!;
        return Scaffold(
          key: scaffoldKey,
          backgroundColor: FlutterFlowTheme.of(context).primaryBackground,
          floatingActionButton: FloatingActionButton(
            onPressed: () async {
              context.pushNamed(
                'CreateGeneration',
                extra: <String, dynamic>{
                  kTransitionInfoKey: TransitionInfo(
                    hasTransition: true,
                    transitionType: PageTransitionType.bottomToTop,
                    duration: Duration(milliseconds: 250),
                  ),
                },
              );
            },
            backgroundColor: FlutterFlowTheme.of(context).primary,
            elevation: 8.0,
            child: Icon(
              Icons.add_circle,
              color: FlutterFlowTheme.of(context).tertiary,
              size: 50.0,
            ),
          ),
          appBar: AppBar(
            backgroundColor: FlutterFlowTheme.of(context).primary,
            automaticallyImplyLeading: false,
            title: Text(
              'All Generations',
              style: FlutterFlowTheme.of(context).displaySmall.override(
                    fontFamily: 'Lexend Deca',
                    color: FlutterFlowTheme.of(context).tertiary,
                  ),
            ),
            actions: [],
            centerTitle: false,
            elevation: 4.0,
          ),
          body: SafeArea(
            top: true,
            child: StreamBuilder<List<GenerationsRecord>>(
              stream: queryGenerationsRecord(
                queryBuilder: (generationsRecord) => generationsRecord
                    .where('user',
                        isEqualTo: generationsMainUsersRecord.reference)
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
                List<GenerationsRecord> containerGenerationsRecordList =
                    snapshot.data!;
                return Container(
                  width: double.infinity,
                  height: double.infinity,
                  decoration: BoxDecoration(
                    color: Colors.transparent,
                  ),
                  child: Padding(
                    padding: EdgeInsetsDirectional.fromSTEB(0.0, 2.0, 0.0, 0.0),
                    child: Builder(
                      builder: (context) {
                        final allGenerations = containerGenerationsRecordList
                            .map((e) => e)
                            .toList();
                        if (allGenerations.isEmpty) {
                          return Center(
                            child: EmptyListWidget(),
                          );
                        }
                        return ListView.builder(
                          padding: EdgeInsets.zero,
                          shrinkWrap: true,
                          scrollDirection: Axis.vertical,
                          itemCount: allGenerations.length,
                          itemBuilder: (context, allGenerationsIndex) {
                            final allGenerationsItem =
                                allGenerations[allGenerationsIndex];
                            return InkWell(
                              splashColor: Colors.transparent,
                              focusColor: Colors.transparent,
                              hoverColor: Colors.transparent,
                              highlightColor: Colors.transparent,
                              onTap: () async {
                                context.pushNamed('VewGeneraton');
                              },
                              child: GenerationPreviewWidget(
                                key: Key(
                                    'Key4fu_${allGenerationsIndex}_of_${allGenerations.length}'),
                              ),
                            );
                          },
                        );
                      },
                    ),
                  ),
                );
              },
            ),
          ),
        );
      },
    );
  }
}
