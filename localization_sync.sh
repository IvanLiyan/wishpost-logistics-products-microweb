# exit when any command fails
set -e

# build packages
BUILD_NUMBER="0.0.$(date +%s)"
rm -rf /tmp/strings-build
/go/bin/strings build-packages $WP_HOME/strings.yml --output=/tmp/strings-build --build-number=$BUILD_NUMBER --rate-limit=70 --concurrency=140 --repo-name="wishpost-user-setting"

# # Upload javascript package to NPM
# cd /tmp/strings-build/javascript
# echo "registry=https://npm.infra.wish.com/" > ~/.npmrc
# echo "//npm.infra.wish.com/:_authToken=\"$GITLAB_NPM_TOKEN\"" >> ~/.npmrc
# npm publish --registry https://npm.infra.wish.com --verbose --scope=@ContextLogic
# cd $WP_HOME


JS_DIR="${WP_HOME}/translation_packages/js"
mkdir -p $JS_DIR

cp -a /tmp/strings-build/javascript/. $JS_DIR

# cd $WP_HOME/wishpost/
# yarn add --ignore-engines "@ContextLogic/wishpoststrings@${BUILD_NUMBER}"

cd $WP_HOME

BRANCH_NAME="$(date +%s)"

# commit changes to git
git add $JS_DIR/*
git commit -m "[localization] sync wishpost translations"
git checkout -b $BRANCH_NAME

push_js_strings_to_github () {
    echo 'pushing js'
    git pull --rebase origin $CI_COMMIT_REF_NAME
    git push github $BRANCH_NAME:$CI_COMMIT_REF_NAME
}

set +e
failed=1
n=0
until [ $n -ge 5 ]
do
   push_js_strings_to_github && failed=0 && break
   n=$((n+1))
   sleep 5
done
set -e

# push prometheus metric
echo 'wishpost_user_setting_string_build_from_i18n_backend' $(date -u +%s) | curl --data-binary @- http://pushgateway.infra.wish.com:9091/metrics/job/gitlab

exit $failed
