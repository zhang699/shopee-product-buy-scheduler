> git fsck --lost-found
> git fsck | grep 'dangling blob' | awk '{ system("git checkout -f " \$3) }'
