#!/bin/bash
source ~/.nvm/nvm.sh

MODE=""
SUBDOMAIN=""
DISTRIBUTION_ID=""
case "$1" in
  staging)
    MODE="staging"
    SUBDOMAIN="app.staging"
    DISTRIBUTION_ID="E282R46CFVR1IV"
    ;;
  production-br)
    MODE="production-br"
    SUBDOMAIN="app"
    DISTRIBUTION_ID="E2SG6SU94CQM35"
    ;;
  production-it)
    MODE="production-it"
    SUBDOMAIN="it-app"
    DISTRIBUTION_ID="E1BT9HTX20C9ZH"
    ;;
  *)
    echo "Use: $0 {staging|production-br|production-it}"
    exit 1
    ;;
esac

branch=$(git symbolic-ref --short HEAD)
version=$(node -p "require('./package.json').version")

echo
echo "**** Running from branch $branch version $version ****"
echo "******** MODE: $MODE ********"
echo "******** SUBDOMAIN: $SUBDOMAIN ********"
echo "******** DISTRIBUTION_ID: $DISTRIBUTION_ID ********"
echo

echo "---------------------------------------------------"
echo ">>>>>>>>>>>>>>>> Build project (nvm, yarn, build)"
nvm use
echo ">>>>>>>>>>>>>>>>>>>> Install Modules"
npm install
echo ">>>>>>>>>>>>>>>>>>>> Lint"
# npm run lint
echo ">>>>>>>>>>>>>>>>>>>> Test"
#npm test
echo ">>>>>>>>>>>>>>>>>>>> Build"
npm run build:$MODE
echo
echo

echo "---------------------------------------------------"
echo "Send to AWS S3"
aws s3 sync ./dist s3://$SUBDOMAIN.ai2c.tech/reports --profile ai2c
echo
echo

echo "---------------------------------------------------"
echo "Invalid AWS CloudFront"
aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths "/reports*" --profile ai2c --no-cli-pager
echo
echo