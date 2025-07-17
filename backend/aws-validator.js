// backend/aws-validator.js
const AWS = require('aws-sdk');

const validateAWSCredentials = async (credentials) => {
  try {
    // Configurar AWS con las credenciales proporcionadas
    AWS.config.update({
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
      region: credentials.region
    });

    // Crear cliente STS para validar credenciales
    const sts = new AWS.STS();
    
    // Llamada básica para verificar que las credenciales son válidas
    const result = await sts.getCallerIdentity().promise();
    
    return {
      valid: true,
      accountId: result.Account,
      userId: result.UserId,
      arn: result.Arn
    };
  } catch (error) {
    return {
      valid: false,
      error: error.message
    };
  }
};

const testServiceAccess = async (credentials, serviceType) => {
  try {
    AWS.config.update({
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
      region: credentials.region
    });

    switch (serviceType) {
      case 's3':
        const s3 = new AWS.S3();
        await s3.listBuckets().promise();
        return { success: true, message: 'S3 access confirmed' };
        
      case 'ec2':
        const ec2 = new AWS.EC2();
        await ec2.describeInstances().promise();
        return { success: true, message: 'EC2 access confirmed' };
        
      case 'lambda':
        const lambda = new AWS.Lambda();
        await lambda.listFunctions().promise();
        return { success: true, message: 'Lambda access confirmed' };
        
      default:
        return { success: false, message: 'Service type not supported' };
    }
  } catch (error) {
    return { 
      success: false, 
      message: `Error accessing ${serviceType}: ${error.message}` 
    };
  }
};

module.exports = {
  validateAWSCredentials,
  testServiceAccess
};
