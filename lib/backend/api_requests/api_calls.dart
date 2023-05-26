import 'dart:convert';
import 'dart:typed_data';

import '../../flutter_flow/flutter_flow_util.dart';

import 'api_manager.dart';

export 'api_manager.dart' show ApiCallResponse;

const _kPrivateApiFunctionName = 'ffPrivateApiCall';

class GenerateVideoCall {
  static Future<ApiCallResponse> call({
    String? userId = '',
    String? generationTitle = '',
    String? prompt1 = '',
    String? prompt2 = '',
    String? prompt3 = '',
    String? authToken = '',
  }) {
    final body = '''
{
  "userId": "${userId}",
  "generationTitle": "${generationTitle}",
  "prompt_1": "${prompt1}",
  "prompt_2": "${prompt2}",
  "prompt_3": "${prompt3}"
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'GenerateVideo',
      apiUrl: 'https://stable-diffusion-engine-ryv6rhclvq-uc.a.run.app',
      callType: ApiCallType.POST,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ${authToken}',
      },
      params: {},
      body: body,
      bodyType: BodyType.JSON,
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
    );
  }
}

class ApiPagingParams {
  int nextPageNumber = 0;
  int numItems = 0;
  dynamic lastResponse;

  ApiPagingParams({
    required this.nextPageNumber,
    required this.numItems,
    required this.lastResponse,
  });

  @override
  String toString() =>
      'PagingParams(nextPageNumber: $nextPageNumber, numItems: $numItems, lastResponse: $lastResponse,)';
}

String _serializeList(List? list) {
  list ??= <String>[];
  try {
    return json.encode(list);
  } catch (_) {
    return '[]';
  }
}

String _serializeJson(dynamic jsonVar) {
  jsonVar ??= {};
  try {
    return json.encode(jsonVar);
  } catch (_) {
    return '{}';
  }
}
