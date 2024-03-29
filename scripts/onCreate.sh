pnpm install --ignore-scripts && pnpm husky install

# 填入你的 private_key
cat scripts/env.sh >> ~/.bashrc

pip install geopy flask flask-cors
