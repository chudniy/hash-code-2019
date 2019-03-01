<?php
$dataPhotos = [];
$currentPhotoId = 0;

if ($file = fopen("a_example.txt", "r")) {
    while(!feof($file)) {
        $line = fgets($file);

        $lineArr = explode(' ', trim($line));
        if (count($lineArr) > 1) {
            $photoItem = [
                'orient' => $lineArr[0],
                'countTags' => $lineArr[1],
                'tags' => array_slice($lineArr, 2),
            ];

            $dataPhotos[$currentPhotoId] = $photoItem;
            $currentPhotoId++;
        }
    }
    fclose($file);
}


$tags = [];
foreach ($dataPhotos as $index => $photo) {
    foreach ($photo['tags'] as $tag) {
        if (isset($tags[$tag])) {
            array_push($tags[$tag], $index);
        } else {
            $tags[$tag] = [$index];
        }
    }
}

var_dump($tags);