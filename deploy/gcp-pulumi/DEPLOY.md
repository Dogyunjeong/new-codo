## SET UP

- Enable all the related gcp products on gcp console or with cli command

  - e.g `artifact registry, cloud run, secret manager and etc`

- Authenticate artifact registry to upload docker image
  `gcloud auth configure-docker us-central1-docker.pkg.dev`

- First, deploy without nextjs images.
  Nextjs needs backend and NEXT_PUBLIC related environment to build. Therefore, deploy other services and secrets first then, deploy nextjs related images

## Deploy on local

```
GOOGLE_APPLICATION_CREDENTIALS="../keys/gcp-prod-key.json" pulumi up
```
