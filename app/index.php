<?php
require __DIR__ . '/vendor/autoload.php';

use Elastic\Elasticsearch\ClientBuilder;
use Elastic\Elasticsearch\Helper\Iterators\SearchResponseIterator;
use Elastic\Elasticsearch\Helper\Iterators\SearchHitIterator;

$client = ClientBuilder::create()
    ->setHosts(['http://localhost:9200'])
    ->build();

$isQueryActive = isset($_GET['q']);
$isPageActive = isset($_GET['p']);

if ($isQueryActive) {
    $query = [
        'size' => 20,
        'from' => $isPageActive ? ($_GET['p'] - 1) * 20 : 0,
        'index' => 'urls',
        'body' => [
            'query' => [
                'match' => [
                    'id' => $_GET['q']
                ]
            ]
        ]
    ];

    $results = $client->search($query);
    $hits = $results->asArray()['hits']['hits'];
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Look</title>
</head>
<body>
    What are you looking for?

    <form action="">
        <input type="text" name="q" value="<?= $isQueryActive ? $_GET['q'] : '' ?>" placeholder="Cute cats">
        <button>Search!</button>
    </form>

    <?php if ($isQueryActive) { ?>
        <div class="results">
            <?php foreach ($hits as $hit) { ?>
                <div style="display: block;"> 
                    <a target="_blank" href="<?= $hit['_source']['id'] ?>"><?= $hit['_source']['id'] ?></a>  
                </div>
            <?php } ?>
        </div>
    <?php } ?>
</body>
</html>