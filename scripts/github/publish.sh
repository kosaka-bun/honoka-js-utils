#!/bin/bash

set -e

cd $(dirname "$0")/../..
PROJECT_PATH="$(pwd)"

# 将本地npm仓库复制到Git仓库中
cd ~/.local/share/verdaccio/storage
mv -f .verdaccio-db.json $PROJECT_PATH/maven-repo/files/verdaccio/storage/
cp -rf ./. $PROJECT_PATH/maven-repo/repository/npm/$registry_name/

# 进入存储Maven仓库文件的Git仓库，设置提交者信息，然后提交并推送
cd $PROJECT_PATH/maven-repo

commit_message='Update honoka-js-sdk'
if [ "$IS_DEVELOPMENT_VERSION" == 'true' ]; then
  commit_message="$commit_message (dev)"
fi

git config --global user.name 'Kosaka Bun'
git config --global user.email 'kosaka-bun@qq.com'
git add repository/npm
git add files/verdaccio
git commit -m "$commit_message"
git push
