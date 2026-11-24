
# SeaweedFS Docker Compose

Complete SeaweedFS deployment with Docker Compose, including persistent named volumes.

## Services

- **Master**: Metadata and coordination server
- **Volume**: Data storage server
- **Filer**: File metadata and filesystem abstraction
- **S3**: S3-compatible API gateway
- **WebDAV**: WebDAV access
- **Admin**: Admin shell interface

## Requirements

- Docker version 29.2 or higher

## Configuration

All configuration is managed via `.env`. Adjust image and ports there if needed.

## Start

```bash
docker compose up -d
```

## Endpoints

- Master UI: <http://localhost:9333>
- Volume Server: <http://localhost:8990>
- Filer UI: <http://localhost:8888>
- S3 API: <http://localhost:18333>
- WebDAV: <http://localhost:7333>
- Admin Shell: <http://localhost:23646>

## Persistent Volumes

Docker named volumes are used for persistence:

- `master-data`: master metadata
- `volume-data`: volume data files
- `filer-data`: filer metadata

## Create S3 Bucket and User

Use `docker exec` to open `weed shell` inside the running master container, then provision a bucket and user in one step.

### Interactive shell

```bash
docker compose exec master weed shell -master=master:9333
```

oder

```bash
docker compose exec -it master ash
weed shell -master=master:9333
```

Inside the shell:

```text
s3.bucket.create -name portfolio
s3.user.provision -name schauby -bucket portfolio -role readwrite
```

The `s3.user.provision` command creates the IAM policy, creates the user with auto-generated credentials, and binds the policy — all at once. The access and secret keys are printed to the shell output.

e.g

``` (examples)
Access Key: Z0LFRP1XBB6WUHA5I0CD0
Secret Key: 9NAco4lgLwb5ipnSjwTcpP2KyTnFIFiFTDm2VlbcOs
```

### Non-interactive (scripted)

```bash
# Create bucket
echo "s3.bucket.create -name portfolio" | docker compose exec -T master weed shell -master=master:9333

# Provision user and print credentials
echo "s3.user.provision -name schauby -bucket portfolio -role readwrite" | docker compose exec -T master weed shell -master=master:9333
```

Both commands in one pipe:

```bash
printf "s3.bucket.create -name portfolio\ns3.user.provision -name schauby -bucket portfolio -role readwrite\n" \
  | docker compose exec -T master weed shell -master=master:9333
```

### Available roles

| Role | Object actions | Bucket actions |
|------|----------------|----------------|
| `readonly` | `s3:GetObject` | `s3:ListBucket` |
| `readwrite` | `s3:GetObject`, `s3:PutObject`, `s3:DeleteObject` | `s3:ListBucket` |
| `admin` | `s3:*` | `s3:*` |

Only the specified bucket is exposed — nothing else in the cluster is accessible to that user.

### Add more users later

```bash
printf "s3.user.provision -name bob -bucket portfolio -role readonly\n" \
  | docker compose exec -T master weed shell -master=master:9333
```

### Anonymous (public) access

Grant read-only public access to a bucket:

```bash
echo "s3.anonymous.set -bucket portfolio -access Read,List" | docker compose exec -T master weed shell -master=master:9333
```

Revoke it:

```bash
echo "s3.anonymous.set -bucket portfolio -access none" | docker compose exec -T master weed shell -master=master:9333
```

> After the first IAM user is created, the S3 gateway switches from "allow all" to authenticated mode — unauthenticated requests are rejected unless anonymous access is explicitly granted.

## API Testing

### S3 bucket management (weed shell)

```bash
# List all buckets
echo "s3.bucket.list" | docker compose exec -T master weed shell -master=master:9333

# List all IAM users
echo "s3.user.list" | docker compose exec -T master weed shell -master=master:9333

# Delete a bucket
echo "s3.bucket.delete -name portfolio" | docker compose exec -T master weed shell -master=master:9333
```

### S3 file operations (curl)

File operations go directly to the S3 REST API on port 18333. Anonymous access must be enabled first (see above) to skip auth signatures:

```bash
# Enable write + read anonymous access
echo "s3.anonymous.set -bucket portfolio -access Read,Write,List" \
  | docker compose exec -T master weed shell -master=master:9333

# Upload a file
curl -X PUT -T test.txt http://localhost:18333/portfolio/test.txt

# List objects in bucket (returns XML)
curl http://localhost:18333/portfolio/

# Download a file
curl http://localhost:18333/portfolio/test.txt -o downloaded.txt

# Delete a file
curl -X DELETE http://localhost:18333/portfolio/test.txt
```

### Filer file operations (weed shell)

Run these inside the interactive shell (`docker compose exec master weed shell -master=master:9333`).
S3 buckets are stored under `/buckets/` in the filer:

```text
fs.ls /buckets/
fs.ls /buckets/portfolio/
fs.cat /buckets/portfolio/test.txt
fs.rm /buckets/portfolio/test.txt
```

### Filer API

```bash
# Upload file
curl -F "file=@test.txt" http://localhost:8888/path/test.txt

# List root directory metadata
curl "http://localhost:8888/?pretty=y"

# Read uploaded file
curl http://localhost:8888/path/test.txt
```

### Master API

```bash
# Cluster status
curl http://localhost:9333/cluster/status

# Volume status
curl http://localhost:9333/dir/status
```

### WebDAV

Use any WebDAV client against:

```text
http://localhost:7333
```

## Stop

```bash
docker compose down
```

Remove containers and named volumes:

```bash
docker compose down -v
```
