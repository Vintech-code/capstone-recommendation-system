<?php

$archive = new PharData(__DIR__.'/riasec-report1.zip');
echo $archive['word/document.xml']->getContent();
