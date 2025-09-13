# Modern Dropship Mapping Service

A serverless AWS Lambda function that transforms product variant option values from vendor format to ElasticPath format using mapping data from ElasticPath's MDM (Master Data Management) system.

## 🚀 Features

- **Option Value Mapping**: Transforms vendor option values (e.g., "extra-small") to ElasticPath option values (e.g., "xs")
- **Bulk Processing**: Handles multiple products and variants in a single request
- **Fallback Handling**: Preserves original values when no mapping is found
- **Memory Storage**: Uses in-memory storage for ElasticPath SDK compatibility with AWS Lambda
- **TypeScript**: Full type safety and modern JavaScript features
- **Jest Testing**: Comprehensive test coverage

## 📋 Prerequisites

- Node.js 22.x
- AWS CLI configured
- Serverless Framework
- ElasticPath Commerce Cloud account

## 🛠️ Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd serverless-modern-dropship
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   Set up the following AWS SSM parameters for each stage:

   **For Development:**

   ```bash
   aws ssm put-parameter --name "/modern-dropship/dev/elasticpath/host" --value "https://your-dev-elasticpath-host.com" --type "String"
   aws ssm put-parameter --name "/modern-dropship/dev/elasticpath/client_id" --value "your-dev-client-id" --type "String"
   aws ssm put-parameter --name "/modern-dropship/dev/elasticpath/client_secret" --value "your-dev-client-secret" --type "String"
   ```

   **For Production:**

   ```bash
   aws ssm put-parameter --name "/modern-dropship/prod/elasticpath/host" --value "https://your-prod-elasticpath-host.com" --type "String"
   aws ssm put-parameter --name "/modern-dropship/prod/elasticpath/client_id" --value "your-prod-client-id" --type "String"
   aws ssm put-parameter --name "/modern-dropship/prod/elasticpath/client_secret" --value "your-prod-client-secret" --type "String"
   ```

   **Note:** The `~true` suffix in the serverless.yml allows the deployment to proceed even if SSM parameters don't exist, but the function will fail at runtime if the parameters are missing.

## 🚀 Deployment

### Development

```bash
npm run deploy
```

### Production

```bash
npm run deploy:prod
```

### Remove Deployment

```bash
npm run remove
```

## 📡 API Usage

### Endpoint

```
POST https://your-api-gateway-url/dev/api/mapping
```

### Request Format

```json
{
  "data": [
    {
      "id": "688a9e30bd881f7d608a020b",
      "title": "Striped Skirt and Top New",
      "companyId": "688398a3bd881f7d602ca525",
      "variants": [
        {
          "id": "688a9e30bd881f7d608a020c",
          "sku": "striped-skirt-and-top-new-extra-small",
          "options": [
            {
              "name": "Size",
              "value": "extra-small"
            }
          ]
        }
      ]
    }
  ]
}
```

### Response Format

```json
{
  "data": [
    {
      "id": "688a9e30bd881f7d608a020b",
      "title": "Striped Skirt and Top New",
      "companyId": "688398a3bd881f7d602ca525",
      "variants": [
        {
          "id": "688a9e30bd881f7d608a020c",
          "sku": "striped-skirt-and-top-new-extra-small",
          "options": [
            {
              "name": "Size",
              "value": "xs" // ← Transformed from "extra-small"
            }
          ]
        }
      ]
    }
  ]
}
```

## 🔄 How It Works

1. **Extract Options**: Extracts all variant option values from the product data
2. **Fetch Mappings**: Queries ElasticPath MDM for option mappings using the company ID
3. **Transform Values**: Replaces vendor option values with ElasticPath option values
4. **Return Data**: Returns the original structure with transformed option values

### Mapping Logic

- **"extra-small"** → **"xs"** (if mapping exists)
- **"small"** → **"S"** (if mapping exists)
- **"medium"** → **"medium"** (no mapping, keeps original)
- **"large"** → **"large"** (no mapping, keeps original)

## 🧪 Testing

### Run Tests

```bash
npm run test
```

### Test Coverage

- ✅ Valid product data processing
- ✅ Invalid request body handling
- ✅ Malformed JSON handling
- ✅ Option value transformation
- ✅ Fallback behavior

### Test with Sample Data

```bash
curl -X POST https://your-api-gateway-url/dev/api/mapping \
  -H "Content-Type: application/json" \
  -d @test-request.json
```

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Client        │───▶│  API Gateway     │───▶│  Lambda Function│
│                 │    │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                         │
                                                         ▼
                                               ┌─────────────────┐
                                               │ ElasticPath MDM │
                                               │ (Option Mappings)│
                                               └─────────────────┘
```

## 📁 Project Structure

```
├── src/
│   └── functions/
│       └── mapping.ts          # Main Lambda function
├── tests/
│   └── mapping.test.ts         # Jest tests
├── serverless.yml              # Serverless configuration
├── package.json                # Dependencies and scripts
├── tsconfig.json               # TypeScript configuration
└── test-request.json           # Sample request data
```

## 🔧 Configuration

### Serverless Configuration

- **Runtime**: Node.js 22.x
- **Region**: us-east-1 (configurable)
- **Memory**: Default Lambda memory allocation
- **Timeout**: Default Lambda timeout

### Environment Variables

- `ELASTICPATH_HOST`: ElasticPath API host (stage-specific)
- `ELASTICPATH_CLIENT_ID`: ElasticPath client ID (stage-specific)
- `ELASTICPATH_CLIENT_SECRET`: ElasticPath client secret (stage-specific)

**SSM Parameter Structure:**

- Development: `/modern-dropship/dev/elasticpath/*`
- Production: `/modern-dropship/prod/elasticpath/*`

## 🐛 Troubleshooting

### Common Issues

1. **localStorage Error**

   - **Solution**: The function uses `MemoryStorageFactory` to avoid localStorage issues in Lambda

2. **Mapping Not Found**

   - **Check**: Ensure mapping data exists in ElasticPath MDM for the company ID
   - **Verify**: Option values match exactly (case-sensitive)

3. **Authentication Error**
   - **Check**: Verify ElasticPath credentials in AWS SSM parameters
   - **Test**: Use ElasticPath API directly to verify credentials

## 📊 Monitoring

### CloudWatch Logs

- Function execution logs
- Error messages
- Performance metrics

### Metrics to Monitor

- Invocation count
- Duration
- Error rate
- Memory usage

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:

1. Check the troubleshooting section
2. Review CloudWatch logs
3. Create an issue in the repository
4. Contact the development team
