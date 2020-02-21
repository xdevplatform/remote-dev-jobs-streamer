
# Remote Developer Jobs Streaming App

<p>
  <img alt="Version" src="https://img.shields.io/badge/version-1.0.0-blue.svg?cacheSeconds=2592000" />
  <a href="https://github.com/twitterdev/remote-dev-jobs-streamer" target="_blank">
    <img alt="Documentation" src="https://img.shields.io/badge/documentation-yes-brightgreen.svg" />
  </a>
  <a href="https://twitter.com/tonyv00" target="_blank">
    <img alt="Twitter: tonyv00" src="https://img.shields.io/twitter/follow/tonyv00.svg?style=social" />
  </a>
</p>

Stream remote developer jobs in realtime using the Twitter API and Tweet Annotations. This web app uses the [Filtered Stream endpoints](https://developer.twitter.com/en/docs/labs/filtered-stream/overview) in [Twitter Developer Labs](https://developer.twitter.com/en/labs) to listen for and display Tweets containing remote developer job postings.

## Install

From the project root directory run the following

```sh
npm install
cd client/
npm install
```

## Environment setup

Go into the details section of the appropriate app from your [Twiter apps dashboard](https://developer.twitter.com/en/apps) and under the "Keys and tokens" tab insert your consumer API keys below.
```sh
export TWITTER_CONSUMER_KEY=<YOUR API KEY HERE>
export TWITTER_CONSUMER_SECRET=<YOUR API SECRET KEY HERE>
```

## Usage

From the project root directory run the following

```sh
yarn dev
```

## Author

👤 **Tony Vu**

* Website: https://twitter.com/tonyv00
* Twitter: [@tonyv00](https://twitter.com/tonyv00)


## Support

Create a [new issue](https://github.com/twitterdev/search-tweets-python-in-r/issues) on GitHub.

## Contributing

We feel that a welcoming community is important and we ask that you follow Twitter's
[Open Source Code of Conduct](https://github.com/twitter/code-of-conduct/blob/master/code-of-conduct.md)
in all interactions with the community.

## License

Copyright 2020 Twitter, Inc.

Licensed under the Apache License, Version 2.0: https://www.apache.org/licenses/LICENSE-2.0