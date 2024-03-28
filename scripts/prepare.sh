chmod 600 private_key

git submodule sync
git submodule init

GIT_SSH_COMMAND="ssh -i private_key" git submodule update

echo "你需要确保上面 submodule update 指令正确完成，然后手动执行 mv private_key ~/.ssh/id_rsa"

wget https://iu6ritl3nvvqa6ez.s3.us-west-2.amazonaws.com/KML.zip