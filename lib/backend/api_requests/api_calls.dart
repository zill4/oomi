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
        'Authorization':
            'Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IjJkOWE1ZWY1YjEyNjIzYzkxNjcxYTcwOTNjYjMyMzMzM2NkMDdkMDkiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJhY2NvdW50cy5nb29nbGUuY29tIiwiYXpwIjoiNjE4MTA0NzA4MDU0LTlyOXMxYzRhbGczNmVybGl1Y2hvOXQ1Mm4zMm42ZGdxLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwiYXVkIjoiNjE4MTA0NzA4MDU0LTlyOXMxYzRhbGczNmVybGl1Y2hvOXQ1Mm4zMm42ZGdxLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwic3ViIjoiMTA3NDM0NDc3MDMyNTEwMzEzNDM2IiwiaGQiOiJjcmlzcGNvZGUuaW8iLCJlbWFpbCI6Imp1c3RpbkBjcmlzcGNvZGUuaW8iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiYXRfaGFzaCI6ImJWZzdFaTF5dWU4M0owQkNSN282UlEiLCJpYXQiOjE2ODUxMDE2NTksImV4cCI6MTY4NTEwNTI1OSwianRpIjoiZjUwNmJmNGEzMDQ2NGQ4ZDE3ZTIxMmQzNWQ4NjVkMGJiY2Q2YWI2NCJ9.yYr5oD6FdFyMFCcBFH0HC79sch97ff9jAo3PflE5VIQZsl_WXnI_RG_f-5x3MTADk7No6pWX8ibSEsuKlRHcW4DPHpugWjgAOg10ZU5-hkCmWhPw3el7LM2x9AnLXpxej8LlZPsuTFWlyIjpajn5DpEXvqR2MPNG5gN2YngZgsyG2F8bs9eJ8txzcjSwQfDyisph1q0MpGCZSsxpEpT_U-3fAwplFt03xK2F8ZLyKa3d-_kpoGzeInkgPj50i0WCRvM7Ym0xhldt42amRXyEslkngc5gcjG-WC249Wfguwqfpd3nfltF5d1wUI2nKdmUSuPcgaYeOiTanwmmpV-34A',
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
