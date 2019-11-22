            set -e

            [[ $(<package.json) =~ \"version\":\ *\"([0-9]+\.[0-9]+\.[0-9]+)\" ]];

            VERSION="${BASH_REMATCH[1]}";
            PUBLISHED_VERSION=$(npm view @ministryofjustice/fb-editor-node version);

            if [ "$VERSION" != "$PUBLISHED_VERSION" ]
            then
              echo
              echo Publishing version \"$VERSION\"
              echo
              # npm publish
            fi
