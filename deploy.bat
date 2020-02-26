git ls-files -d > deleted_files.txt
git add *
diff --name-only --diff-filter=A HEAD > newly_created_files.txt
git ls-files -m > modified_files.txt
git commit -m $1
git push origin master
