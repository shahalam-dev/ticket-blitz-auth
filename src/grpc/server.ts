import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';
import { verifyToken } from '../utils/jwt';

// 1. Load the Proto File
const PROTO_PATH = path.join(__dirname, 'proto/auth.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const authProto = grpc.loadPackageDefinition(packageDefinition) as any;

// 2. Implement the Business Logic
const validateToken = (call: any, callback: any) => {
  const { token } = call.request;

  if (!token) {
    return callback(null, { is_valid: false, error_message: 'Token missing' });
  }

  const decoded = verifyToken(token);

  if (!decoded) {
    return callback(null, { is_valid: false, error_message: 'Invalid or expired token' });
  }

  // Success! Send back the user data
  callback(null, {
    is_valid: true,
    user_id: decoded.userId,
    role: decoded.role,
  });
};

// 3. Create and Export the Server
export const startGrpcServer = () => {
  const server = new grpc.Server();
  
  // Bind our function to the Service definition
  server.addService(authProto.auth.AuthService.service, {
    ValidateToken: validateToken,
  });

  const GRPC_PORT = '0.0.0.0:50051'; // Standard gRPC port

  server.bindAsync(GRPC_PORT, grpc.ServerCredentials.createInsecure(), (err, port) => {
    if (err) {
      console.error('❌ Failed to bind gRPC server:', err);
      return;
    }
    console.log(`🔌 gRPC Server running on port ${port}`);
    // server.start() is no longer needed in newer @grpc/grpc-js versions, 
    // but if you are on an older version you might need it. 
    // The server starts automatically on bind in v1.10+ context.
  });
};