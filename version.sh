File=$(<package.json);

[[ $File =~ \"name\":\ *\"(\@ministryofjustice\/[a-zA-Z\-]+)\" ]];
NAME="${BASH_REMATCH[1]}";

[[ $File =~ \"version\":\ *\"([0-9]+\.[0-9]+\.[0-9]+)\" ]];
VERSION="${BASH_REMATCH[1]}";

echo $NAME
echo $VERSION
