Parsing flow

Upload Flow
graph LR
    A[Frontend Upload] --> B[Backend /resumes]
    B --> C[S3 Storage PDF Only]
    B --> D[Queue Message]
    D --> E[Resume Parser Service]

Parse Flow
graph LR
    A[Resume Parser] --> B[Get PDF from S3]
    B --> C[Extract & Parse Text]
    C --> D[Structure Data]
    D --> E[Send Parsed Data]
    E --> F[Notify Backend with Data]

Notification Flow
graph LR
    A[Parser Notification] --> B[Backend Notification Controller]
    B --> C[Store in MongoDB]
    C --> D[Update Resume Status]
    D --> E[WebSocket Notification]
    E --> F[Frontend Update]