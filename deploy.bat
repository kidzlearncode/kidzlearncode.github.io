git ls-files -d > deleted_files.txt
git ls-files -o  --exclude-standard > newly_created_files.txt
git add *
git ls-files -m > modified_files.txt
python make_yml.py
git add *
git commit -m $1
git push origin master
