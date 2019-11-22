set -e

VERSION=$(node -p "require('./package.json').version")
PUBLISHED_VERSION=$(npm view @ministryofjustice/fb-editor-node version);

if [ "$VERSION" != "$PUBLISHED_VERSION" ]
then
  # npm publish
fi
