wget https://iu6ritl3nvvqa6ez.s3.us-west-2.amazonaws.com/private_key.txt
chmod 600 private_key.txt
mv private_key.txt ~/.ssh/id_rsa

git submodule sync
git submodule init

git submodule update --recursive
cd ./3dcitydb-client
git checkout master
cd ../

# 注意这里的 URL 随时会失效，因为使用 AWS 存储桶，有一些权限控制的问题，什么存储桶拥有者、对象编写者、ACL IAM 等等。这些我都没搞懂
# 我最好使用 aws cli
# 检查本地是否已存在 KML.zip 文件

# 进入资源目录
mkdir resources
cd ./resources

declare -A files_to_download

# 定义文件和对应的 URL
files_to_download=(
  ["KML.zip"]="https://iu6ritl3nvvqa6ez.s3.us-west-2.amazonaws.com/KML.zip"
  ["Berlin_Centre.zip"]="https://iu6ritl3nvvqa6ez.s3.us-west-2.amazonaws.com/Berlin_Centre.zip"
  # 添加更多的文件和 URL...
)


# 遍历关联数组中的每个文件和 URL
for file in "${!files_to_download[@]}"; do
  if [ -f "$file" ]; then
    echo "本地已存在 $file 文件，无需下载。"
  else
    url="${files_to_download[$file]}"
    wget -P ./ "$url"
  fi
done
