#!/bin/bash

set -e

cd $(dirname "$0")/../..
PROJECT_PATH="$(pwd)"

registry_name=release
commit_message='Update honoka-js-sdk'
if [ "$IS_DEVELOPMENT_VERSION" == 'true' ]; then
  registry_name=development
  commit_message="$commit_message (dev)"
fi

local_registry_path=~/.local/share/verdaccio/storage

# 将本地npm仓库复制到Git仓库中
mv -f $local_registry_path/.verdaccio-db.json maven-repo/files/verdaccio/storage/$registry_name/
cp -rf $local_registry_path/. maven-repo/repository/npm/$registry_name/

# 进入存储Maven仓库文件的Git仓库，设置提交者信息，然后提交并推送
cd $PROJECT_PATH/maven-repo

git config --global user.name 'Kosaka Bun'
git config --global user.email 'kosaka-bun@qq.com'
git add repository/npm/$registry_name
git add files/verdaccio/storage/$registry_name
git commit -m "$commit_message"
git push
