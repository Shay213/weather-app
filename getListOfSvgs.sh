search_dir=~/repos/weather-app/icons
files_count=$(ls $search_dir | wc -l)
i=1
echo '{ "svgList": [' > svgList.json
for entry in "$search_dir"/*.svg
do
  echo $i
  if [ $files_count == $i ]; then
    echo \"$entry\" >> "svgList.json"
  else
    echo \"$entry\", >> "svgList.json"
    i=$((i + 1))
  fi
done

echo ']}' >> svgList.json
   