# Look
Look is an experimental search engine with its own web crawler.

## Why are you doing this?
I want to test whether I can build a better google by ignoring some robots.txt files, and not shoving AI and stupid advertisement cringe down everyone's throats.

## What's working, what's NOT working, and what needs to improve?
### Crawler
- Indexing: For now only URLs are indexed, I think it would be useful to also save the page title and meta tags with descriptions if available, or text snippets from the page.
- Robots.txt: For now they're completely ignored, the idea here is to follow robots.txt but ignore stupid rules like Reddit asking not to be indexed unless you're Google.
- Page filtering: For now everything is indexed, including stuff like wp-admin and such, I think it'd be optimal to add some sort of URL filtering to prevent making requests to potentially sensitive sites that could get us in trouble.

### Front end
- Search: Works with basic queries, more investigation is needed on this front as we depend on ElasticSearch for this, not sure what the full extent of the capabilities of ES are.
- Styling: This needs a lot of improvement, for now the app is just ONE page, with a search field, and a results div, no styling at all.

### Docker
A basic Dockerimage is available and the crawler works inside it, but the docker-compose.yml needs to be revised and the configuration of the Crawler adapted to work with the dockerised Elasticsearch instance, the frontend is also not being served properly.

# Contributing
Feel free to open any issues with feature requests or pull requests addressing any of the points above. No real rules for creating PRs or Issues, just try to be nice and don't call me a stupid fuck right off the bat, I know I am, I don't need you to remind me xd
