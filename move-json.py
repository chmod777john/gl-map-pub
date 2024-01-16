import os
import shutil

# 源文件夹路径
source_folder = "./KML/"
# 目标文件夹路径
destination_folder = "./dist/data/"

# 检查目标文件夹是否存在，如果不存在则创建它
os.makedirs(destination_folder, exist_ok=True)

# 获取源文件夹中所有JSON文件的列表
json_files = [file for file in os.listdir(source_folder) if file.endswith('.json')]

# 遍历JSON文件列表，复制文件到目标文件夹
for file in json_files:
    source_file_path = os.path.join(source_folder, file)
    destination_file_path = os.path.join(destination_folder, file)
    shutil.copy(source_file_path, destination_file_path)
    print(f"复制文件：{source_file_path} 到 {destination_file_path}")
