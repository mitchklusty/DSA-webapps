<?php
/** @var UserSession $userSession */
$page = "annotations";
$config = include CONFIG_FILE;
// include_once __DIR__ . '/../_header.php';
?>
<!DOCTYPE html>

<head>
    <title>Gray-White Segmentation</title>
    <script type="text/javascript" src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
    <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.13.2/jquery-ui.min.js"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.13.2/themes/base/jquery-ui.min.css" integrity="sha512-ELV+xyi8IhEApPS/pSj66+Jiw+sOT1Mqkzlh8ExXihe4zfqbWkxPRi8wptXIO9g73FSlhmquFlUOuMSoXz5IRw==" crossorigin="anonymous" referrerpolicy="no-referrer" />
    <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/openseadragon/4.1.1/openseadragon.min.js"></script>
    <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/paper.js/0.12.17/paper-full.js"></script>
    <!-- <script type="text/javascript" src="../../paperseadragon.js"></script> -->
    <script type="module" src="/DSA-webapps/gw/app.mjs"></script>
    <link rel="stylesheet" href="/DSA-webapps/dsa/dsa.css">
    <link rel="stylesheet" href="/DSA-webapps/gw/app.css">
    <link rel="stylesheet" href="/DSA-webapps/dsa/dsauserinterface.css">
    <link rel="stylesheet" href="/DSA-webapps/apps/segmentationui.css"> 
<body>
    <div>
        <div id="viewer"></div>
    </div>
</body>
