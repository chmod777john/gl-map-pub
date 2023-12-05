import os
import shutil

# 源文件夹路径
source_folder = "./KML/Tiles/0/0/"
# 目标文件夹路径
destination_folder = "./dist/data/"

# 检查目标文件夹是否存在，如果不存在则创建它
if not os.path.exists(destination_folder):
    os.makedirs(destination_folder)



# 遍历源文件夹
for root, dirs, files in os.walk(source_folder):
    # 如果当前目录是xxx目录
    if os.path.basename(root).isdigit():  # 假设xxx是数字
        # 遍历目录下的所有gltf文件
        for file in files:
            if file.endswith(('.gltf', '.png', '.bin')):
                source_file_path = os.path.join(root, file)
                # 目标文件夹路径，使用os.path.join来构建目标路径
                destination_file_path = os.path.join(destination_folder, file)
                # 复制文件
                shutil.copy(source_file_path, destination_file_path)
                print(f"复制文件：{source_file_path} 到 {destination_file_path}")
