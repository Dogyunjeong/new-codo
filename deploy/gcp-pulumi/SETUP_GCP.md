# How to setup gcp

## pre requisite

`gcloud`

## Deploy

1. run `pulumi up`

- grant any required permissions

2. first time it would be failed due to secret manager has no version
3. go to secret manager and add version into secrets
4. run `pulumi up` again

## Set up CI/CD github

### Ref

google auth github action set up example

- https://github.com/google-github-actions/auth#setup

### Set up workloade identity federation

Configure with OIDC for github

- https://cloud.google.com/iam/docs/workload-identity-federation-with-other-providers#gcloud

1. set up project Id

```
export PROJECT_ID="base-project"
```

2. create new service account

```
gcloud iam service-accounts create "ci-cd-deployment" \
  --project "${PROJECT_ID}"
```

3. Enable Iam credential

```
gcloud services enable iamcredentials.googleapis.com \
  --project "${PROJECT_ID}"
```

4. Create workload identity federation pool

```
gcloud iam workload-identity-pools create ci-cd \
    --project="${PROJECT_ID}" \
    --location="global" \
    --description="ci cd pipeline pool" \
    --display-name="CI/CD"
```

5. create workload-identity-pool provider

```
gcloud iam workload-identity-pools providers create-oidc github-actions \
  --project="${PROJECT_ID}" \
  --location="global" \
  --workload-identity-pool="ci-cd" \
  --issuer-uri="https://token.actions.githubusercontent.com" \
  --display-name="github provider" \
  --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository"
```

6. Get the pool id

```
gcloud iam workload-identity-pools describe "ci-cd" \
  --project="${PROJECT_ID}" \
  --location="global" \
  --format="value(name)"
```

save above value

```
export WORKLOAD_IDENTITY_POOL_ID="..." # value from above

e.g export WORKLOAD_IDENTITY_POOL_ID="projects/756459715652/locations/global/workloadIdentityPools/ci-cd"
```

7. Create a Workload Identity Provider in that pool:

```
gcloud iam workload-identity-pools providers create-oidc "my-provider" \
  --project="${PROJECT_ID}" \
  --location="global" \
  --workload-identity-pool="ci-cd" \
  --display-name="github provider" \
  --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository" \
  --issuer-uri="https://token.actions.githubusercontent.com"
```

8. Allow authentications from the Workload Identity Provider originating from your repository to impersonate the Service Account created above:

```
export REPO="base-project"
```

```
gcloud iam service-accounts add-iam-policy-binding "ci-cd-deployment@${PROJECT_ID}.iam.gserviceaccount.com" \
  --project="${PROJECT_ID}" \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/${WORKLOAD_IDENTITY_POOL_ID}/attribute.repository/${REPO}"
```

9. Extract the Workload Identity Provider resource name:

```
gcloud iam workload-identity-pools providers describe "github-actions" \
  --project="${PROJECT_ID}" \
  --location="global" \
  --workload-identity-pool="ci-cd" \
  --format="value(name)"
```

## SETUP_GCP

(check)[./DEPLOY.md]

1. Enable all the related gcp products on gcp console or with cli command
   1. e.g `artifact registry, cloud run, secret manager and etc`

2. Authenticate artifact registry to upload docker image
   `gcloud auth configure-docker us-central1-docker.pkg.dev`
