#! /usr/bin/env bash

set -eo pipefail

if [ -z "$GOOGLE_APPLICATION_CREDENTIALS" ]; then
  echo 'Missing environment variable: GOOGLE_APPLICATION_CREDENTIALS'
  exit 1
fi

if [ -z "$GCLOUD_PROJECT" ]; then
  echo 'Missing environment variable: GCLOUD_PROJECT'
  exit 1
fi

if [ -z "$1" ]; then
  echo 'The first argument should be a name for the Cloud Run service'
  exit 1
fi
SERVICE="$1"

if [ -z "$2" ]; then
  echo 'The second argument should be a title for the login page'
  exit 1
fi
TITLE="$2"

set -u

if [ ! -d data ]; then
  echo 'Could not find a data/ directory'
  exit 1
fi

if [ ! -f data/index.html ]; then
  echo 'Could not find data/index.html'
  exit 1
fi

if [ ! -f Dockerfile ]; then
  echo 'Could not the Dockerfile'
  exit 1
fi

echo 'Activating your gcloud credentials...'

gcloud auth activate-service-account --key-file="$GOOGLE_APPLICATION_CREDENTIALS"
gcloud config set project "$GCLOUD_PROJECT"
gcloud config set run/region us-central1
gcloud auth configure-docker --quiet

TAG="$(find data -type f | xargs -I{} -- md5sum {} | awk '{print $1}' | md5sum - | awk '{print $1}')"
URL="us.gcr.io/$GCLOUD_PROJECT/$SERVICE"
IMAGE="$URL:$TAG"
docker build . -t "$IMAGE"
docker push "$IMAGE"

REVISION="$(gcloud run revisions list --platform=managed --service="$SERVICE" | awk '$3=="yes" {print $2}' | head -n1)"

if [ -z "$REVISION" ]; then
  PASSWORD="$(uuidgen)"
  CURRENT_IMAGE=""
else
  INFO="$(gcloud run revisions describe "$REVISION" --platform=managed)"
  PASSWORD="$(printf "$INFO" | awk '$1=="PASSWORD" {print $2}')"
  CURRENT_IMAGE="$(printf "$INFO" | awk '$1=="Image:" {print $2}')"
fi

if [ "$IMAGE" = "$CURRENT_IMAGE" ]; then
  echo 'Already up to date'
  SERVICE_URL="$(gcloud run services list --platform=managed | awk "\$2==\"$SERVICE\" {print \$4}" | head -n1)"
  echo "The URL is: $SERVICE_URL"
else
  gcloud run deploy "$SERVICE" --platform=managed --image="$IMAGE" --allow-unauthenticated \
    --set-env-vars="TITLE=$TITLE,PASSWORD=$PASSWORD"
fi

echo "The access password is: $PASSWORD"
