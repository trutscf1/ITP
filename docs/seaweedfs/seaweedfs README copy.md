
# SeaweedFS Docker Compose

Complete SeaweedFS deployment with Docker Compose, including all services and persistent named volumes.

## Services

- **Master**: Metadata and coordination server
- **Volume**: Data storage server
- **Filer**: File system abstraction and metadata
- **S3**: S3-compatible API gateway
- **WebDAV**: WebDAV access protocol
- **Admin**: Shell admin interface

## Requirements

- Docker version 29.2 or higher

## Configuration

All configuration is managed via `.env` file. Update port numbers and image versions as needed.

## Start

```bash
docker compose up -d
```

## Endpoints

- Master UI: http://localhost:9333 (einzig aufrufbare)
- Volume Server: http://localhost:8080
- Filer UI: http://localhost:8888
- S3 API: http://localhost:8333
- WebDAV: http://localhost:7333
- Admin Shell: http://localhost:23646

## Persistent Volumes

Data is automatically persisted using Docker named volumes:
- `master-data`: Master metadata storage
- `volume-data`: Volume server data storage

## S3 Configuration

To use the S3 API endpoint:
- Endpoint: `http://localhost:8333`
- Region: `us-east-1`
- forcePathStyle: `true`
- Access Key: (any value)
- Secret Key: (any value)

### Create S3 Bucket

```bash
aws --endpoint-url http://localhost:8333 s3 mb s3://your-bucket-name
```

## API Testing
 


### win aws install

```powershell
winget install --id Amazon.AWSCLI -e
```

### S3 API

```bash
# Create bucket
aws --endpoint-url http://localhost:8333 s3 mb s3://test-bucket

# Upload file
echo "Hello SeaweedFS" > test.txt
aws --endpoint-url http://localhost:8333 s3 cp test.txt s3://test-bucket/

# Download file
aws --endpoint-url http://localhost:8333 s3 cp s3://test-bucket/test.txt .

# List bucket contents
aws --endpoint-url http://localhost:8333 s3 ls s3://test-bucket/

# Delete file
aws --endpoint-url http://localhost:8333 s3 rm s3://test-bucket/test.txt
```

### Filer API

```bash
# Upload file
curl -F "file=@test.txt" http://localhost:8888/upload

# List directory
curl http://localhost:8888/api/

# Save file with custom path
curl -F "file=@test.txt" "http://localhost:8888/upload?path=/myfile.txt"

# Get file metadata
curl http://localhost:8888/api/dir?path=/
```

### Master API

```bash
# Check master status
curl http://localhost:9333/dir/status

# Get topology info
curl http://localhost:9333/dir/assign
```

### WebDAV Access

```bash
# Using a WebDAV client (e.g., cadaver)
cadaver http://localhost:7333/
```

## Stop

```bash
docker compose down
```

To remove volumes as well:

```bash
docker compose down -v
```
