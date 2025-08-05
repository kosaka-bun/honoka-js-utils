#!/bin/bash

set -e

cd $(dirname "$0")/../..
PROJECT_PATH="$(pwd)"

npm install

check_version_of_projects_out='
results.projectsPassed=false
results.dependenciesPassed=false
'

#
# 检查版本号
#
# 当grep命令未找到匹配的字符串时，将返回非0的返回值（返回值为Exit Code，不是程序的输出内容，
# 可通过“$?”得到上一行命令的返回值）。
# 文件设置了set -e，任何一行命令返回值不为0时，均会中止脚本的执行，在命令后加上“|| true”可
# 忽略单行命令的异常。
# true是一个shell命令，它的返回值始终为0，false命令的返回值始终为1。
#
projects_passed=$(echo "$check_version_of_projects_out" | grep -i 'results.projectsPassed=true') || true
dependencies_passed=$(echo "$check_version_of_projects_out" | grep -i 'results.dependenciesPassed=true') || true
# -z表示字符串为空，-n表示字符串不为空
if [ -n "$projects_passed" ] && [ -z "$dependencies_passed" ]; then
  echo 'Projects with release version contain dependencies with development version!'
  exit 10
fi

# 构建并发布到本地npm仓库
registry_name=development
is_development_version=true

if [ -z "$projects_passed" ]; then
  echo -e '\n\nUsing development registry to publish artifacts.\n'
else
  registry_name=release
  is_development_version=false
fi

echo "IS_DEVELOPMENT_VERSION=$is_development_version" >> "$GITHUB_OUTPUT"

# 将存储npm仓库文件的Git仓库clone到项目根目录下
git clone "$REMOTE_NPM_REGISTRY_URL" maven-repo
mkdir -p ~/.config/verdaccio
mkdir -p ~/.local/share/verdaccio/storage
mkdir -p maven-repo/repository/npm/$registry_name

# 还原verdaccio的环境
npm install -g verdaccio@6.1.6

cp -f maven-repo/files/verdaccio/.npmrc ./
cp -f maven-repo/files/verdaccio/htpasswd ~/.config/verdaccio/
cp -rf maven-repo/files/verdaccio/storage/. ~/.local/share/verdaccio/storage/
cp -rf maven-repo/repository/npm/$registry_name/. ~/.local/share/verdaccio/storage/

nohup verdaccio > /dev/null 2>&1 &
sleep 3s

npm publish --registry=http://localhost:4873
