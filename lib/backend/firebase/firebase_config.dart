import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/foundation.dart';

Future initFirebase() async {
  if (kIsWeb) {
    await Firebase.initializeApp(
        options: FirebaseOptions(
            apiKey: "AIzaSyAO19d-L3_Y3WtYIBmHbT176UfaARmo_Vo",
            authDomain: "cx-terminal.firebaseapp.com",
            projectId: "cx-terminal",
            storageBucket: "cx-terminal.appspot.com",
            messagingSenderId: "342813196805",
            appId: "1:342813196805:web:1b879714de8e0ba57d926c",
            measurementId: "G-5MB5RY7E2L"));
  } else {
    await Firebase.initializeApp();
  }
}
