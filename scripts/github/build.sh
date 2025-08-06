#!/bin/bash

set -e

cd $(dirname "$0")/../..
PROJECT_PATH="$(pwd)"

projects_to_publish=(js-utils)

# 检查根项目版本号
root_version=$(cat package.json | grep '"version":')
echo "Root version: ($root_version)"

registry_name=development
is_development_version=true

if echo "$root_version" | grep -q 'dev'; then
  echo -e '\n\nUsing development registry to publish artifacts.\n'
else
  registry_name=release
  is_development_version=false
fi

echo "IS_DEVELOPMENT_VERSION=$is_development_version" >> "$GITHUB_OUTPUT"

#
# 带有~的路径如果被引号包围，则有时不会被解析为当前用户的home目录，而是当前目录下的“~”目录，
# 因此不建议将带~的路径用引号包围起来。
#
local_registry_path=~/.local/share/verdaccio/storage

# 将存储npm仓库文件的Git仓库clone到项目根目录下
git clone "$REMOTE_NPM_REGISTRY_URL" maven-repo
mkdir -p ~/.config/verdaccio
mkdir -p $local_registry_path
mkdir -p maven-repo/repository/npm/$registry_name

# 还原verdaccio的环境
npm install -g verdaccio@6.1.6

cp -f maven-repo/files/verdaccio/htpasswd ~/.config/verdaccio/
cp -rf maven-repo/files/verdaccio/storage/$registry_name/. $local_registry_path/
cp -rf maven-repo/repository/npm/$registry_name/. $local_registry_path/

# 移除仓库中已存在的与当前项目中的模块版本相同的包
for project in "${projects_to_publish[@]}"; do
  cd $PROJECT_PATH/$project
  npm run remove-existing-package -- $local_registry_path
done

cd $PROJECT_PATH

nohup verdaccio > /dev/null 2>&1 &
sleep 3s

# 构建并发布到本地npm仓库
local-publish() {
  if [ -z "$1" ]; then
    echo 'Must specify a project name!'
    exit 10
  fi

  cd $PROJECT_PATH/$1
  cp -f ../maven-repo/files/verdaccio/.npmrc ./

  # 检查项目版本号
  echo "Check versions of $1:"
  npm run check-versions

  check_versions_out=$(npm run check-versions)

  #
  # 当grep命令未找到匹配的字符串时，将返回非0的返回值（返回值为Exit Code，不是程序的输出内容，
  # 可通过“$?”得到上一行命令的返回值）。
  # 文件设置了set -e，任何一行命令返回值不为0时，均会中止脚本的执行，在命令后加上“|| true”可
  # 忽略单行命令的异常。
  # true是一个shell命令，它的返回值始终为0，false命令的返回值始终为1。
  #
  project_passed=$(echo "$check_versions_out" | grep -i 'results.projectPassed=true') || true
  dependencies_passed=$(echo "$check_versions_out" | grep -i 'results.dependenciesPassed=true') || true
  project_is_development_version=true
  # -z表示字符串为空，-n表示字符串不为空
  if [ -n "$project_passed" ]; then
    if [ -z "$dependencies_passed" ]; then
      echo 'Project with release version contains dependencies with development version!'
      exit 10
    fi
    project_is_development_version=false
  fi

  # 不将dev版本的包发布到release仓库
  if [ "$is_development_version" == 'false' && "$project_is_development_version" == 'true' ]; then
    echo 'Cannot publish project with development version to release registry!'
    exit 10
  fi

  npm publish --registry=http://localhost:4873
}

for project in "${projects_to_publish[@]}"; do
  local-publish $project
done
